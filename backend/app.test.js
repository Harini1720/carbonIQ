import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from './app.js';
import { createDatabase } from './db.js';

async function startTestServer(databasePath = ':memory:', { staticDirectory } = {}) {
  const database = createDatabase(databasePath);
  const app = createApp({ database, staticDirectory });
  const server = await new Promise(resolve => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    app,
    baseUrl,
    close: () => new Promise((resolve, reject) => {
      server.close(error => {
        database.close();
        if (error) reject(error);
        else resolve();
      });
    })
  };
}

test('desktop static hosting serves the app shell without intercepting API routes', async () => {
  const staticDirectory = mkdtempSync(path.join(os.tmpdir(), 'carbonvision-desktop-shell-'));
  writeFileSync(path.join(staticDirectory, 'index.html'), '<!doctype html><title>CarbonVision Desktop</title>');
  writeFileSync(path.join(staticDirectory, 'app.js'), 'console.log("CarbonVision");');
  const service = await startTestServer(':memory:', { staticDirectory });
  try {
    const shell = await fetch(`${service.baseUrl}/`);
    assert.equal(shell.status, 200);
    assert.match(await shell.text(), /CarbonVision Desktop/);

    const script = await fetch(`${service.baseUrl}/app.js`);
    assert.equal(script.status, 200);
    assert.match(await script.text(), /console\.log/);

    const health = await fetch(`${service.baseUrl}/api/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, 'ok');
  } finally {
    await service.close();
    rmSync(staticDirectory, { recursive: true, force: true });
  }
});

async function request(baseUrl, path, { method = 'GET', body, cookie } = {}) {
  const hasBody = body !== undefined && !['GET', 'HEAD'].includes(method);
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {})
    },
    ...(hasBody ? { body: JSON.stringify(body) } : {})
  });
  return {
    response,
    body: await response.json(),
    cookie: response.headers.get('set-cookie')?.split(';')[0] || cookie
  };
}

function assertNoCredentialFields(value) {
  if (Array.isArray(value)) {
    value.forEach(assertNoCredentialFields);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nestedValue] of Object.entries(value)) {
    assert.doesNotMatch(key, /password|token|secret|credential|session/i, `response field "${key}" must not expose credentials`);
    assertNoCredentialFields(nestedValue);
  }
}

async function register(baseUrl, { name = 'Test Member', email = 'test@example.com', password = 'correct horse battery' } = {}) {
  return request(baseUrl, '/api/auth/register', {
    method: 'POST',
    body: { name, email, password }
  });
}

test('registration validates input, stores a password hash, and creates an HttpOnly session', async () => {
  const service = await startTestServer();
  try {
    const invalid = await register(service.baseUrl, { password: 'short' });
    assert.equal(invalid.response.status, 400);
    assert.match(invalid.body.error, /12 and 128/);

    const result = await register(service.baseUrl);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.user.email, 'test@example.com');
    assertNoCredentialFields(result.body);
    assert.match(result.response.headers.get('set-cookie'), /HttpOnly/);
    assert.match(result.response.headers.get('set-cookie'), /SameSite=Strict/);

    const stored = service.app.locals.database.prepare('SELECT password_hash AS passwordHash FROM users WHERE email = ?').get('test@example.com');
    assert.match(stored.passwordHash, /^scrypt\$16384\$8\$1\$/);
    assert.notEqual(stored.passwordHash, 'correct horse battery');
    const session = await request(service.baseUrl, '/api/auth/me', { cookie: result.cookie });
    assert.equal(session.body.user.id, result.body.user.id);
    assertNoCredentialFields(session.body);

    const duplicate = await register(service.baseUrl);
    assert.equal(duplicate.response.status, 409);
  } finally {
    await service.close();
  }
});

test('login and logout issue and revoke authenticated sessions', async () => {
  const service = await startTestServer();
  try {
    await register(service.baseUrl);
    const badPassword = await request(service.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'incorrect password' }
    });
    assert.equal(badPassword.response.status, 401);

    const login = await request(service.baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { email: 'test@example.com', password: 'correct horse battery' }
    });
    assert.equal(login.response.status, 200);
    assertNoCredentialFields(login.body);

    const logout = await request(service.baseUrl, '/api/auth/logout', { method: 'POST', cookie: login.cookie });
    assert.equal(logout.response.status, 200);
    const privateRequest = await request(service.baseUrl, '/api/organizations', { cookie: login.cookie });
    assert.equal(privateRequest.response.status, 401);
  } finally {
    await service.close();
  }
});

test('all private organization endpoints reject requests without a valid session', async () => {
  const service = await startTestServer();
  try {
    const organizationId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const recordId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const userId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const requests = [
      ['/api/auth/logout', 'POST'],
      ['/api/organizations', 'GET'],
      ['/api/organizations', 'POST'],
      [`/api/organizations/${organizationId}`, 'GET'],
      [`/api/organizations/${organizationId}`, 'PATCH'],
      [`/api/organizations/${organizationId}/members`, 'GET'],
      [`/api/organizations/${organizationId}/members`, 'POST'],
      [`/api/organizations/${organizationId}/members/${userId}`, 'DELETE'],
      [`/api/organizations/${organizationId}/buildings`, 'GET'],
      [`/api/organizations/${organizationId}/buildings`, 'POST'],
      [`/api/organizations/${organizationId}/buildings/${recordId}`, 'PATCH'],
      [`/api/organizations/${organizationId}/buildings/${recordId}`, 'DELETE'],
      [`/api/organizations/${organizationId}/actions`, 'GET'],
      [`/api/organizations/${organizationId}/actions`, 'POST'],
      [`/api/organizations/${organizationId}/actions/${recordId}`, 'PATCH'],
      [`/api/organizations/${organizationId}/actions/${recordId}`, 'DELETE'],
      [`/api/organizations/${organizationId}/reports`, 'GET'],
      [`/api/organizations/${organizationId}/reports`, 'POST']
    ];

    for (const [path, method] of requests) {
      const unauthenticated = await request(service.baseUrl, path, { method, body: {} });
      assert.equal(unauthenticated.response.status, 401, `${method} ${path} must require authentication`);
      const invalidSession = await request(service.baseUrl, path, { method, body: {}, cookie: 'carbonvision_session=not-a-valid-token' });
      assert.equal(invalidSession.response.status, 401, `${method} ${path} must reject invalid sessions`);
    }
  } finally {
    await service.close();
  }
});

test('organisation records and buildings are restricted to memberships', async () => {
  const service = await startTestServer();
  try {
    const owner = await register(service.baseUrl);
    const extraField = await request(service.baseUrl, '/api/organizations', {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Unauthorised Role', type: 'Education', ownerId: 'someone-else' }
    });
    assert.equal(extraField.response.status, 400);
    const created = await request(service.baseUrl, '/api/organizations', {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Green Campus', type: 'Education' }
    });
    assert.equal(created.response.status, 201);
    assertNoCredentialFields(created.body);
    assert.equal(created.body.organization.role, 'owner');
    assert.equal(created.body.organization.buildingCount, 0);

    const organizationId = created.body.organization.id;
    const building = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'North Hall', type: 'Academic', address: '12 Campus Road' }
    });
    assert.equal(building.response.status, 201);

    const listed = await request(service.baseUrl, '/api/organizations', { cookie: owner.cookie });
    assert.equal(listed.body.organizations.length, 1);
    assert.equal(listed.body.organizations[0].buildingCount, 1);
    const details = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings`, { cookie: owner.cookie });
    assert.equal(details.body.buildings[0].name, 'North Hall');

    const other = await register(service.baseUrl, {
      name: 'Other Member',
      email: 'other@example.com',
      password: 'another correct horse'
    });
    const hiddenList = await request(service.baseUrl, '/api/organizations', { cookie: other.cookie });
    const forbiddenOrganization = await request(service.baseUrl, `/api/organizations/${organizationId}`, { cookie: other.cookie });
    const forbiddenBuildings = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings`, { cookie: other.cookie });
    assert.equal(hiddenList.body.organizations.length, 0);
    assert.equal(forbiddenOrganization.response.status, 404);
    assert.equal(forbiddenBuildings.response.status, 404);
  } finally {
    await service.close();
  }
});

test('cross-organisation IDs cannot read, create, update, or delete organisation records', async () => {
  const service = await startTestServer();
  try {
    const ownerA = await register(service.baseUrl, {
      name: 'Workspace A Owner',
      email: 'workspace-a@example.com'
    });
    const ownerB = await register(service.baseUrl, {
      name: 'Workspace B Owner',
      email: 'workspace-b@example.com',
      password: 'another correct horse battery'
    });

    const createOrganization = async (cookie, name) => {
      const result = await request(service.baseUrl, '/api/organizations', {
        method: 'POST',
        cookie,
        body: { name, type: 'Test' }
      });
      assert.equal(result.response.status, 201);
      return result.body.organization;
    };
    const organizationA = await createOrganization(ownerA.cookie, 'Private Workspace A');
    const organizationB = await createOrganization(ownerB.cookie, 'Private Workspace B');

    const buildingA = await request(service.baseUrl, `/api/organizations/${organizationA.id}/buildings`, {
      method: 'POST',
      cookie: ownerA.cookie,
      body: { name: 'Private Building A' }
    });
    const actionA = await request(service.baseUrl, `/api/organizations/${organizationA.id}/actions`, {
      method: 'POST',
      cookie: ownerA.cookie,
      body: { name: 'Private Action A' }
    });
    const reportA = await request(service.baseUrl, `/api/organizations/${organizationA.id}/reports`, {
      method: 'POST',
      cookie: ownerA.cookie,
      body: {
        title: 'Private Report A',
        reportingPeriod: 'monthly',
        payload: { electricityKg: 1, transportKg: 2, wasteKg: 3 }
      }
    });
    assert.equal(buildingA.response.status, 201);
    assert.equal(actionA.response.status, 201);
    assert.equal(reportA.response.status, 201);
    assertNoCredentialFields(buildingA.body);
    assertNoCredentialFields(actionA.body);
    assertNoCredentialFields(reportA.body);

    const foreignOrgRoutes = [
      [`/api/organizations/${organizationA.id}`, 'GET'],
      [`/api/organizations/${organizationA.id}`, 'PATCH'],
      [`/api/organizations/${organizationA.id}/members`, 'GET'],
      [`/api/organizations/${organizationA.id}/members`, 'POST'],
      [`/api/organizations/${organizationA.id}/members/${ownerA.body.user.id}`, 'DELETE'],
      [`/api/organizations/${organizationA.id}/buildings`, 'GET'],
      [`/api/organizations/${organizationA.id}/buildings`, 'POST'],
      [`/api/organizations/${organizationA.id}/actions`, 'GET'],
      [`/api/organizations/${organizationA.id}/actions`, 'POST'],
      [`/api/organizations/${organizationA.id}/reports`, 'GET'],
      [`/api/organizations/${organizationA.id}/reports`, 'POST']
    ];
    for (const [path, method] of foreignOrgRoutes) {
      const result = await request(service.baseUrl, path, {
        method,
        cookie: ownerB.cookie,
        body: method === 'PATCH' ? { name: 'Attempted change' } : {}
      });
      assert.equal(result.response.status, 404, `${method} ${path} must hide another organisation`);
    }

    for (const [route, recordId] of [
      ['buildings', buildingA.body.building.id],
      ['actions', actionA.body.action.id]
    ]) {
      const path = `/api/organizations/${organizationB.id}/${route}/${recordId}`;
      for (const method of ['PATCH', 'DELETE']) {
        const result = await request(service.baseUrl, path, {
          method,
          cookie: ownerB.cookie,
          body: { name: 'Attempted cross-organisation update' }
        });
        assert.equal(result.response.status, 404, `${method} ${path} must not access a record from another organisation`);
      }
    }

    const organizationsB = await request(service.baseUrl, '/api/organizations', { cookie: ownerB.cookie });
    assert.deepEqual(organizationsB.body.organizations.map(organization => organization.id), [organizationB.id]);
    assertNoCredentialFields(organizationsB.body);
    const unchangedBuilding = await request(service.baseUrl, `/api/organizations/${organizationA.id}/buildings`, { cookie: ownerA.cookie });
    const unchangedAction = await request(service.baseUrl, `/api/organizations/${organizationA.id}/actions`, { cookie: ownerA.cookie });
    const unchangedReport = await request(service.baseUrl, `/api/organizations/${organizationA.id}/reports`, { cookie: ownerA.cookie });
    assert.equal(unchangedBuilding.body.buildings[0].name, 'Private Building A');
    assert.equal(unchangedAction.body.actions[0].name, 'Private Action A');
    assert.equal(unchangedReport.body.reports[0].title, 'Private Report A');
  } finally {
    await service.close();
  }
});

test('organisation and building updates validate fields and scope the building id', async () => {
  const service = await startTestServer();
  try {
    const owner = await register(service.baseUrl);
    const created = await request(service.baseUrl, '/api/organizations', {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Facilities Group', type: 'Company' }
    });
    const organizationId = created.body.organization.id;
    const building = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Old Name' }
    });
    const buildingId = building.body.building.id;

    const updatedOrganization = await request(service.baseUrl, `/api/organizations/${organizationId}`, {
      method: 'PATCH',
      cookie: owner.cookie,
      body: { name: 'Updated Group' }
    });
    assert.equal(updatedOrganization.body.organization.name, 'Updated Group');

    const updatedBuilding = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings/${buildingId}`, {
      method: 'PATCH',
      cookie: owner.cookie,
      body: { name: 'North Building' }
    });
    assert.equal(updatedBuilding.body.building.name, 'North Building');

    const invalid = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'x'.repeat(121) }
    });
    assert.equal(invalid.response.status, 400);
    const invalidDate = await request(service.baseUrl, `/api/organizations/${organizationId}/actions`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Audit action', dueDate: '2026-02-30' }
    });
    assert.equal(invalidDate.response.status, 400);

    const other = await register(service.baseUrl, {
      name: 'Different Member',
      email: 'different@example.com',
      password: 'different safe password'
    });
    const wrongOrganizationId = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings/${buildingId}`, {
      method: 'DELETE',
      cookie: other.cookie
    });
    assert.equal(wrongOrganizationId.response.status, 404);
    const removed = await request(service.baseUrl, `/api/organizations/${organizationId}/buildings/${buildingId}`, {
      method: 'DELETE',
      cookie: owner.cookie
    });
    assert.equal(removed.response.status, 200);
  } finally {
    await service.close();
  }
});

test('organisation members can access scoped records but cannot change owner-only settings', async () => {
  const service = await startTestServer();
  try {
    const owner = await register(service.baseUrl);
    const organizationResult = await request(service.baseUrl, '/api/organizations', {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Shared Campus', type: 'Education' }
    });
    const organizationId = organizationResult.body.organization.id;
    const member = await register(service.baseUrl, {
      name: 'Team Member',
      email: 'member@example.com',
      password: 'a different secure password'
    });
    const invitation = await request(service.baseUrl, `/api/organizations/${organizationId}/members`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { email: 'member@example.com', role: 'member' }
    });
    assert.equal(invitation.response.status, 201);

    const visible = await request(service.baseUrl, '/api/organizations', { cookie: member.cookie });
    assert.equal(visible.body.organizations.length, 1);
    assert.equal(visible.body.organizations[0].role, 'member');
    const forbiddenEdit = await request(service.baseUrl, `/api/organizations/${organizationId}`, {
      method: 'PATCH',
      cookie: member.cookie,
      body: { name: 'Unauthorized change' }
    });
    assert.equal(forbiddenEdit.response.status, 403);

    const action = await request(service.baseUrl, `/api/organizations/${organizationId}/actions`, {
      method: 'POST',
      cookie: member.cookie,
      body: { name: 'Replace lighting', status: 'Planned', progress: 0, injected: 'ignored' }
    });
    assert.equal(action.response.status, 400);
    const validAction = await request(service.baseUrl, `/api/organizations/${organizationId}/actions`, {
      method: 'POST',
      cookie: member.cookie,
      body: { name: 'Replace lighting', status: 'Planned', progress: 0 }
    });
    const completedAction = await request(service.baseUrl, `/api/organizations/${organizationId}/actions/${validAction.body.action.id}`, {
      method: 'PATCH',
      cookie: member.cookie,
      body: { status: 'Completed' }
    });
    assert.equal(completedAction.body.action.progress, 100);
    const reopenedAction = await request(service.baseUrl, `/api/organizations/${organizationId}/actions/${validAction.body.action.id}`, {
      method: 'PATCH',
      cookie: member.cookie,
      body: { status: 'Planned' }
    });
    assert.equal(reopenedAction.body.action.progress, 0);

    const invalidReport = await request(service.baseUrl, `/api/organizations/${organizationId}/reports`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { title: 'Bad report', reportingPeriod: 'monthly', payload: { electricityKg: -1, transportKg: 2, wasteKg: 3 } }
    });
    assert.equal(invalidReport.response.status, 400);
    const report = await request(service.baseUrl, `/api/organizations/${organizationId}/reports`, {
      method: 'POST',
      cookie: owner.cookie,
      body: { title: 'March report', reportingPeriod: 'monthly', payload: { electricityKg: 10, transportKg: 5, wasteKg: 2 } }
    });
    assert.equal(report.response.status, 201);
    assert.equal(report.body.report.payload.totalKg, 17);
    const memberReports = await request(service.baseUrl, `/api/organizations/${organizationId}/reports`, { cookie: member.cookie });
    assert.equal(memberReports.body.reports.length, 1);

    const removed = await request(service.baseUrl, `/api/organizations/${organizationId}/members/${member.body.user.id}`, {
      method: 'DELETE',
      cookie: owner.cookie
    });
    assert.equal(removed.response.status, 200);
    const revoked = await request(service.baseUrl, `/api/organizations/${organizationId}`, { cookie: member.cookie });
    assert.equal(revoked.response.status, 404);
  } finally {
    await service.close();
  }
});

test('accounts, sessions, and organisation records persist when the server restarts', async () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'carbonvision-test-'));
  const databasePath = path.join(directory, 'workspace.sqlite');
  try {
    const firstServer = await startTestServer(databasePath);
    const owner = await register(firstServer.baseUrl);
    const created = await request(firstServer.baseUrl, '/api/organizations', {
      method: 'POST',
      cookie: owner.cookie,
      body: { name: 'Persistent Campus', type: 'Research' }
    });
    await firstServer.close();

    const restartedServer = await startTestServer(databasePath);
    try {
      const session = await request(restartedServer.baseUrl, '/api/auth/me', { cookie: owner.cookie });
      const organizations = await request(restartedServer.baseUrl, '/api/organizations', { cookie: owner.cookie });
      assert.equal(session.body.user.email, 'test@example.com');
      assert.equal(organizations.body.organizations[0].id, created.body.organization.id);
    } finally {
      await restartedServer.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
