import express from 'express';
import path from 'node:path';
import { randomBytes, randomUUID, scrypt as callbackScrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { createDatabase } from './db.js';

const scrypt = promisify(callbackScrypt);
const SESSION_COOKIE = 'carbonvision_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_REPORTING_PERIODS = new Set(['monthly', 'quarterly', 'annual']);
const VALID_ACTION_STATUSES = new Set(['Planned', 'In progress', 'Completed']);

function boundedText(value, field, maxLength, { required = true } = {}) {
  if (typeof value !== 'string') return { error: `${field} must be text.` };
  const normalized = value.trim();
  if (required && normalized.length === 0) return { error: `${field} is required.` };
  if (normalized.length > maxLength) return { error: `${field} must be ${maxLength} characters or fewer.` };
  return { value: normalized };
}

function hasOnlyKeys(value, allowedKeys) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(key => allowedKeys.includes(key));
}

function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function validId(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return ['', ''];
    return [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  }).filter(([name]) => name));
}

function attachSessionCookie(response, token, production) {
  const secure = production ? ' Secure;' : '';
  response.append('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS};${secure}`);
}

function clearSessionCookie(response, production) {
  const secure = production ? ' Secure;' : '';
  response.append('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0;${secure}`);
}

function createRateLimiter({ limit = 30, windowMs = 15 * 60 * 1000 } = {}) {
  const clients = new Map();
  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || 'unknown';
    const current = clients.get(key);
    if (!current || current.resetAt <= now) {
      clients.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= limit) {
      response.status(429).json({ error: 'Too many authentication attempts. Try again later.' });
      return;
    }
    current.count += 1;
    next();
  };
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt$16384$8$1$${salt.toString('hex')}$${Buffer.from(derived).toString('hex')}`;
}

async function verifyPassword(password, serialized) {
  const [algorithm, n, r, p, saltHex, hashHex] = serialized.split('$');
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = Buffer.from(await scrypt(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024
  }));
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

const DUMMY_PASSWORD_HASH = hashPassword('dummy-login-password');

function sendValidationError(response, message) {
  response.status(400).json({ error: message });
}

function setOrganizationRow(database, organizationId, userId) {
  return database.prepare(`
    SELECT organizations.id, organizations.name, organizations.type,
      organizations.created_at AS createdAt, organizations.updated_at AS updatedAt,
      organization_members.role,
      (SELECT COUNT(*) FROM buildings WHERE buildings.organization_id = organizations.id) AS buildingCount
    FROM organizations
    JOIN organization_members ON organization_members.organization_id = organizations.id
    WHERE organizations.id = ? AND organization_members.user_id = ?
  `).get(organizationId, userId);
}

export function createApp({
  database = createDatabase(),
  production = process.env.NODE_ENV === 'production',
  staticDirectory
} = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'same-origin');
    response.setHeader('Cache-Control', 'no-store');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.get('origin');
      if (origin) {
        try {
          if (new URL(origin).host !== request.get('host')) {
            response.status(403).json({ error: 'Request origin is not allowed.' });
            return;
          }
        } catch {
          response.status(403).json({ error: 'Request origin is not allowed.' });
          return;
        }
      }
    }
    next();
  });

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', database: 'connected' });
  });

  app.get('/api/auth/me', (request, response) => {
    const token = parseCookies(request.get('cookie'))[SESSION_COOKIE];
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      response.json({ user: null });
      return;
    }
    const row = database.prepare(`
      SELECT users.id, users.name, users.email, sessions.expires_at AS expiresAt
      FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
    `).get(hashToken(token));
    if (!row || row.expiresAt <= Date.now()) {
      if (row) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
      clearSessionCookie(response, production);
      response.json({ user: null });
      return;
    }
    response.json({ user: { id: row.id, name: row.name, email: row.email } });
  });

  const authRateLimiter = createRateLimiter({ limit: 20 });
  const authenticate = (request, response, next) => {
    const token = parseCookies(request.get('cookie'))[SESSION_COOKIE];
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      response.status(401).json({ error: 'Sign in is required.' });
      return;
    }
    const row = database.prepare(`
      SELECT users.id, users.name, users.email, sessions.expires_at AS expiresAt
      FROM sessions JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ?
    `).get(hashToken(token));
    if (!row || row.expiresAt <= Date.now()) {
      database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
      clearSessionCookie(response, production);
      response.status(401).json({ error: 'Your session has expired. Sign in again.' });
      return;
    }
    request.user = { id: row.id, name: row.name, email: row.email };
    request.sessionTokenHash = hashToken(token);
    next();
  };

  const issueSession = (user, response) => {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
    database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
    database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
      hashToken(token), user.id, expiresAt
    );
    attachSessionCookie(response, token, production);
    response.json({ user });
  };

  app.post('/api/auth/register', authRateLimiter, async (request, response, next) => {
    if (!hasOnlyKeys(request.body, ['name', 'email', 'password'])) return sendValidationError(response, 'Provide only name, email, and password.');
    const name = boundedText(request.body?.name, 'Name', 100);
    const email = boundedText(request.body?.email, 'Email', 254);
    const password = request.body?.password;
    if (name.error) return sendValidationError(response, name.error);
    if (email.error) return sendValidationError(response, email.error);
    if (!EMAIL_PATTERN.test(email.value)) return sendValidationError(response, 'Enter a valid email address.');
    if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return sendValidationError(response, 'Password must be between 12 and 128 characters.');
    }
    try {
      const passwordHash = await hashPassword(password);
      const user = { id: randomUUID(), name: name.value, email: email.value.toLowerCase() };
      database.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(
        user.id, user.name, user.email, passwordHash
      );
      issueSession(user, response);
    } catch (error) {
      if (error.errcode === 2067) {
        response.status(409).json({ error: 'An account with this email already exists.' });
        return;
      }
      next(error);
    }
  });

  app.post('/api/auth/login', authRateLimiter, async (request, response, next) => {
    if (!hasOnlyKeys(request.body, ['email', 'password'])) return sendValidationError(response, 'Provide only email and password.');
    const email = boundedText(request.body?.email, 'Email', 254);
    const password = request.body?.password;
    if (email.error) return sendValidationError(response, email.error);
    if (!EMAIL_PATTERN.test(email.value) || typeof password !== 'string' || password.length > 128) {
      response.status(401).json({ error: 'Email or password is incorrect.' });
      return;
    }
    try {
      const row = database.prepare('SELECT id, name, email, password_hash AS passwordHash FROM users WHERE email = ? COLLATE NOCASE').get(email.value);
      const passwordHash = row ? row.passwordHash : await DUMMY_PASSWORD_HASH;
      const matches = await verifyPassword(password, passwordHash);
      if (!row || !matches) {
        response.status(401).json({ error: 'Email or password is incorrect.' });
        return;
      }
      issueSession({ id: row.id, name: row.name, email: row.email }, response);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', authenticate, (request, response) => {
    database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(request.sessionTokenHash);
    clearSessionCookie(response, production);
    response.json({ success: true });
  });

  app.get('/api/organizations', authenticate, (request, response) => {
    const rows = database.prepare(`
      SELECT organizations.id, organizations.name, organizations.type,
        organizations.created_at AS createdAt, organizations.updated_at AS updatedAt,
        organization_members.role,
        (SELECT COUNT(*) FROM buildings WHERE buildings.organization_id = organizations.id) AS buildingCount
      FROM organizations
      JOIN organization_members ON organization_members.organization_id = organizations.id
      WHERE organization_members.user_id = ?
      ORDER BY organizations.name COLLATE NOCASE
    `).all(request.user.id);
    response.json({ organizations: rows });
  });

  app.post('/api/organizations', authenticate, (request, response) => {
    if (!hasOnlyKeys(request.body, ['name', 'type'])) return sendValidationError(response, 'Provide only an organisation name and type.');
    const name = boundedText(request.body?.name, 'Organisation name', 120);
    const type = boundedText(request.body?.type, 'Organisation type', 80);
    if (name.error) return sendValidationError(response, name.error);
    if (type.error) return sendValidationError(response, type.error);
    const id = randomUUID();
    database.exec('BEGIN IMMEDIATE');
    try {
      database.prepare('INSERT INTO organizations (id, name, type) VALUES (?, ?, ?)').run(id, name.value, type.value);
      database.prepare('INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)').run(id, request.user.id, 'owner');
      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
    response.status(201).json({ organization: setOrganizationRow(database, id, request.user.id) });
  });

  app.get('/api/organizations/:organizationId', authenticate, (request, response) => {
    if (!validId(request.params.organizationId)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const organization = setOrganizationRow(database, request.params.organizationId, request.user.id);
    if (!organization) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    response.json({ organization });
  });

  app.patch('/api/organizations/:organizationId', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const membership = database.prepare('SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?').get(organizationId, request.user.id);
    if (!membership) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    if (!['owner', 'admin'].includes(membership.role)) {
      response.status(403).json({ error: 'You do not have permission to edit this organisation.' });
      return;
    }
    const keys = Object.keys(request.body || {});
    if (keys.length === 0 || keys.some(key => !['name', 'type'].includes(key))) {
      return sendValidationError(response, 'Provide only an organisation name and/or type.');
    }
    const values = {};
    if (Object.hasOwn(request.body, 'name')) {
      const name = boundedText(request.body.name, 'Organisation name', 120);
      if (name.error) return sendValidationError(response, name.error);
      values.name = name.value;
    }
    if (Object.hasOwn(request.body, 'type')) {
      const type = boundedText(request.body.type, 'Organisation type', 80);
      if (type.error) return sendValidationError(response, type.error);
      values.type = type.value;
    }
    const updates = Object.keys(values).map(key => `${key} = ?`);
    database.prepare(`UPDATE organizations SET ${updates.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`)
      .run(...Object.values(values), organizationId);
    response.json({ organization: setOrganizationRow(database, organizationId, request.user.id) });
  });

  app.get('/api/organizations/:organizationId/members', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const members = database.prepare(`
      SELECT users.id, users.name, users.email, organization_members.role,
        organization_members.created_at AS joinedAt
      FROM organization_members
      JOIN users ON users.id = organization_members.user_id
      WHERE organization_members.organization_id = ?
      ORDER BY CASE organization_members.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, users.name COLLATE NOCASE
    `).all(organizationId);
    response.json({ members });
  });

  app.post('/api/organizations/:organizationId/members', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const membership = database.prepare('SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?').get(organizationId, request.user.id);
    if (membership.role !== 'owner') {
      response.status(403).json({ error: 'Only an organisation owner can add members.' });
      return;
    }
    if (!hasOnlyKeys(request.body, ['email', 'role'])) return sendValidationError(response, 'Provide only a member email and role.');
    const email = boundedText(request.body?.email, 'Member email', 254);
    const role = request.body?.role ?? 'member';
    if (email.error) return sendValidationError(response, email.error);
    if (!EMAIL_PATTERN.test(email.value)) return sendValidationError(response, 'Enter a valid member email address.');
    if (!['admin', 'member'].includes(role)) return sendValidationError(response, 'Member role must be admin or member.');
    const user = database.prepare('SELECT id, name, email FROM users WHERE email = ? COLLATE NOCASE').get(email.value);
    if (!user) {
      response.status(404).json({ error: 'No account exists for that email yet. Ask the person to register first.' });
      return;
    }
    try {
      database.prepare('INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)').run(organizationId, user.id, role);
    } catch (error) {
      if (error.errcode === 1555 || error.errcode === 2067) {
        response.status(409).json({ error: 'That account is already an organisation member.' });
        return;
      }
      throw error;
    }
    response.status(201).json({ member: { ...user, role } });
  });

  app.delete('/api/organizations/:organizationId/members/:userId', authenticate, (request, response) => {
    const { organizationId, userId } = request.params;
    if (!validId(organizationId) || !validId(userId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation member not found.' });
      return;
    }
    const membership = database.prepare('SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?').get(organizationId, request.user.id);
    const target = database.prepare('SELECT role FROM organization_members WHERE organization_id = ? AND user_id = ?').get(organizationId, userId);
    if (!target) {
      response.status(404).json({ error: 'Organisation member not found.' });
      return;
    }
    if (membership.role !== 'owner' || target.role === 'owner') {
      response.status(403).json({ error: 'Only an organisation owner can remove non-owner members.' });
      return;
    }
    database.prepare('DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?').run(organizationId, userId);
    response.json({ success: true });
  });

  app.get('/api/organizations/:organizationId/buildings', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const buildings = database.prepare(`
      SELECT id, organization_id AS organizationId, name, type, address,
        created_at AS createdAt, updated_at AS updatedAt
      FROM buildings WHERE organization_id = ? ORDER BY name COLLATE NOCASE
    `).all(organizationId);
    response.json({ buildings });
  });

  app.post('/api/organizations/:organizationId/buildings', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    if (!hasOnlyKeys(request.body, ['name', 'type', 'address'])) return sendValidationError(response, 'Provide only a building name, type, and address.');
    const name = boundedText(request.body?.name, 'Building name', 120);
    const type = boundedText(request.body?.type ?? '', 'Building type', 80, { required: false });
    const address = boundedText(request.body?.address ?? '', 'Address', 250, { required: false });
    if (name.error) return sendValidationError(response, name.error);
    if (type.error) return sendValidationError(response, type.error);
    if (address.error) return sendValidationError(response, address.error);
    const id = randomUUID();
    database.prepare('INSERT INTO buildings (id, organization_id, name, type, address) VALUES (?, ?, ?, ?, ?)').run(
      id, organizationId, name.value, type.value, address.value
    );
    const building = database.prepare(`
      SELECT id, organization_id AS organizationId, name, type, address,
        created_at AS createdAt, updated_at AS updatedAt
      FROM buildings WHERE id = ? AND organization_id = ?
    `).get(id, organizationId);
    response.status(201).json({ building });
  });

  app.patch('/api/organizations/:organizationId/buildings/:buildingId', authenticate, (request, response) => {
    const { organizationId, buildingId } = request.params;
    if (!validId(organizationId) || !validId(buildingId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Building not found.' });
      return;
    }
    const building = database.prepare('SELECT id FROM buildings WHERE id = ? AND organization_id = ?').get(buildingId, organizationId);
    if (!building) {
      response.status(404).json({ error: 'Building not found.' });
      return;
    }
    const keys = Object.keys(request.body || {});
    if (keys.length === 0 || keys.some(key => !['name', 'type', 'address'].includes(key))) {
      return sendValidationError(response, 'Provide a building name, type, and/or address.');
    }
    const values = {};
    for (const [key, label, maxLength, required] of [
      ['name', 'Building name', 120, true],
      ['type', 'Building type', 80, false],
      ['address', 'Address', 250, false]
    ]) {
      if (Object.hasOwn(request.body, key)) {
        const result = boundedText(request.body[key], label, maxLength, { required });
        if (result.error) return sendValidationError(response, result.error);
        values[key] = result.value;
      }
    }
    const updates = Object.keys(values).map(key => `${key} = ?`);
    database.prepare(`UPDATE buildings SET ${updates.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND organization_id = ?`)
      .run(...Object.values(values), buildingId, organizationId);
    const updated = database.prepare(`
      SELECT id, organization_id AS organizationId, name, type, address,
        created_at AS createdAt, updated_at AS updatedAt
      FROM buildings WHERE id = ? AND organization_id = ?
    `).get(buildingId, organizationId);
    response.json({ building: updated });
  });

  app.delete('/api/organizations/:organizationId/buildings/:buildingId', authenticate, (request, response) => {
    const { organizationId, buildingId } = request.params;
    if (!validId(organizationId) || !validId(buildingId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Building not found.' });
      return;
    }
    const result = database.prepare('DELETE FROM buildings WHERE id = ? AND organization_id = ?').run(buildingId, organizationId);
    if (result.changes === 0) {
      response.status(404).json({ error: 'Building not found.' });
      return;
    }
    response.json({ success: true });
  });

  app.get('/api/organizations/:organizationId/actions', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const actions = database.prepare(`
      SELECT id, organization_id AS organizationId, name, owner, due_date AS dueDate, status,
        progress, created_by AS createdBy, created_at AS createdAt, updated_at AS updatedAt
      FROM organization_actions WHERE organization_id = ? ORDER BY created_at DESC
    `).all(organizationId);
    response.json({ actions });
  });

  app.post('/api/organizations/:organizationId/actions', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    if (!hasOnlyKeys(request.body, ['name', 'owner', 'dueDate', 'status', 'progress'])) return sendValidationError(response, 'Provide only supported action fields.');
    const name = boundedText(request.body?.name, 'Action name', 140);
    const owner = boundedText(request.body?.owner ?? '', 'Owner', 100, { required: false });
    const dueDate = request.body?.dueDate ?? '';
    const status = request.body?.status ?? 'Planned';
    const progress = request.body?.progress ?? 0;
    if (name.error) return sendValidationError(response, name.error);
    if (owner.error) return sendValidationError(response, owner.error);
    if (typeof dueDate !== 'string' || (dueDate && !isDateOnly(dueDate))) return sendValidationError(response, 'Due date must be a valid date in YYYY-MM-DD format.');
    if (!VALID_ACTION_STATUSES.has(status)) return sendValidationError(response, 'Choose Planned, In progress, or Completed.');
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) return sendValidationError(response, 'Progress must be an integer from 0 to 100.');
    const id = randomUUID();
    const normalizedStatus = status === 'Completed' || progress === 100
      ? 'Completed'
      : progress > 0 && status === 'Planned' ? 'In progress' : status;
    const normalizedProgress = normalizedStatus === 'Completed' ? 100 : progress;
    database.prepare('INSERT INTO organization_actions (id, organization_id, name, owner, due_date, status, progress, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, organizationId, name.value, owner.value, dueDate, normalizedStatus, normalizedProgress, request.user.id);
    const action = database.prepare(`
      SELECT id, organization_id AS organizationId, name, owner, due_date AS dueDate, status,
        progress, created_by AS createdBy, created_at AS createdAt, updated_at AS updatedAt
      FROM organization_actions WHERE id = ? AND organization_id = ?
    `).get(id, organizationId);
    response.status(201).json({ action });
  });

  app.patch('/api/organizations/:organizationId/actions/:actionId', authenticate, (request, response) => {
    const { organizationId, actionId } = request.params;
    if (!validId(organizationId) || !validId(actionId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Action not found.' });
      return;
    }
    const existing = database.prepare('SELECT id, progress FROM organization_actions WHERE id = ? AND organization_id = ?').get(actionId, organizationId);
    if (!existing) {
      response.status(404).json({ error: 'Action not found.' });
      return;
    }
    const allowed = ['name', 'owner', 'dueDate', 'status', 'progress'];
    const keys = Object.keys(request.body || {});
    if (!keys.length || keys.some(key => !allowed.includes(key))) return sendValidationError(response, 'Action update contains unsupported fields.');
    const values = {};
    for (const [key, label, maxLength, required] of [
      ['name', 'Action name', 140, true],
      ['owner', 'Owner', 100, false]
    ]) {
      if (Object.hasOwn(request.body, key)) {
        const value = boundedText(request.body[key], label, maxLength, { required });
        if (value.error) return sendValidationError(response, value.error);
        values[key] = value.value;
      }
    }
    if (Object.hasOwn(request.body, 'dueDate')) {
      const dueDate = request.body.dueDate;
      if (typeof dueDate !== 'string' || (dueDate && !isDateOnly(dueDate))) return sendValidationError(response, 'Due date must be a valid date in YYYY-MM-DD format.');
      values.due_date = dueDate;
    }
    if (Object.hasOwn(request.body, 'status')) {
      if (!VALID_ACTION_STATUSES.has(request.body.status)) return sendValidationError(response, 'Choose Planned, In progress, or Completed.');
      values.status = request.body.status;
      if (values.status === 'Completed') values.progress = 100;
    }
    if (Object.hasOwn(request.body, 'progress')) {
      if (!Number.isInteger(request.body.progress) || request.body.progress < 0 || request.body.progress > 100) return sendValidationError(response, 'Progress must be an integer from 0 to 100.');
      values.progress = request.body.progress;
      if (values.progress === 100) values.status = 'Completed';
      else if (values.status === 'Completed') return sendValidationError(response, 'Completed actions must have 100% progress.');
      else if (values.status === undefined) values.status = values.progress > 0 ? 'In progress' : 'Planned';
      else if (values.status === 'Planned' && values.progress > 0) values.status = 'In progress';
    }
    if (values.status === 'Completed') values.progress = 100;
    else if (values.status === 'Planned') values.progress = 0;
    else if (values.status === 'In progress' && existing.progress === 100 && !Object.hasOwn(request.body, 'progress')) values.progress = 0;
    const updates = Object.keys(values).map(key => `${key} = ?`);
    database.prepare(`UPDATE organization_actions SET ${updates.join(', ')}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND organization_id = ?`)
      .run(...Object.values(values), actionId, organizationId);
    const action = database.prepare(`
      SELECT id, organization_id AS organizationId, name, owner, due_date AS dueDate, status,
        progress, created_by AS createdBy, created_at AS createdAt, updated_at AS updatedAt
      FROM organization_actions WHERE id = ? AND organization_id = ?
    `).get(actionId, organizationId);
    response.json({ action });
  });

  app.delete('/api/organizations/:organizationId/actions/:actionId', authenticate, (request, response) => {
    const { organizationId, actionId } = request.params;
    if (!validId(organizationId) || !validId(actionId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Action not found.' });
      return;
    }
    const result = database.prepare('DELETE FROM organization_actions WHERE id = ? AND organization_id = ?').run(actionId, organizationId);
    if (result.changes === 0) {
      response.status(404).json({ error: 'Action not found.' });
      return;
    }
    response.json({ success: true });
  });

  app.get('/api/organizations/:organizationId/reports', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    const rows = database.prepare(`
      SELECT id, organization_id AS organizationId, title, reporting_period AS reportingPeriod,
        payload_json AS payloadJson, created_by AS createdBy, created_at AS createdAt
      FROM carbon_reports WHERE organization_id = ? ORDER BY created_at DESC
    `).all(organizationId);
    response.json({ reports: rows.map(row => ({ ...row, payload: JSON.parse(row.payloadJson) })) });
  });

  app.post('/api/organizations/:organizationId/reports', authenticate, (request, response) => {
    const { organizationId } = request.params;
    if (!validId(organizationId) || !setOrganizationRow(database, organizationId, request.user.id)) {
      response.status(404).json({ error: 'Organisation not found.' });
      return;
    }
    if (!hasOnlyKeys(request.body, ['title', 'reportingPeriod', 'payload'])) return sendValidationError(response, 'Provide only a title, reporting period, and report payload.');
    const title = boundedText(request.body?.title, 'Report title', 140);
    const reportingPeriod = request.body?.reportingPeriod;
    const payload = request.body?.payload;
    if (title.error) return sendValidationError(response, title.error);
    if (!VALID_REPORTING_PERIODS.has(reportingPeriod)) return sendValidationError(response, 'Reporting period must be monthly, quarterly, or annual.');
    const components = ['electricityKg', 'transportKg', 'wasteKg'];
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
      || Object.keys(payload).length !== components.length
      || components.some(key => !Number.isFinite(payload[key]) || payload[key] < 0)) {
      return sendValidationError(response, 'Provide non-negative electricity, transport, and waste emissions in kg CO2e.');
    }
    const reportPayload = {
      electricityKg: payload.electricityKg,
      transportKg: payload.transportKg,
      wasteKg: payload.wasteKg,
      totalKg: payload.electricityKg + payload.transportKg + payload.wasteKg
    };
    const id = randomUUID();
    database.prepare('INSERT INTO carbon_reports (id, organization_id, title, reporting_period, payload_json, created_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, organizationId, title.value, reportingPeriod, JSON.stringify(reportPayload), request.user.id);
    response.status(201).json({
      report: {
        id,
        organizationId,
        title: title.value,
        reportingPeriod,
        payload: reportPayload,
        createdBy: request.user.id
      }
    });
  });

  if (staticDirectory) {
    app.use(express.static(staticDirectory, { index: false }));
    app.get('*', (request, response, next) => {
      if (request.path.startsWith('/api/')) {
        next();
        return;
      }
      response.sendFile(path.join(staticDirectory, 'index.html'));
    });
  }

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      response.status(400).json({ error: 'Request body must contain valid JSON.' });
      return;
    }
    if (error.type === 'entity.too.large') {
      response.status(413).json({ error: 'Request body is too large.' });
      return;
    }
    console.error('Unhandled API error:', error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  app.locals.database = database;
  return app;
}
