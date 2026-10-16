# CarbonIQ — Carbon Footprint Intelligence Platform

CarbonIQ is a sustainability dashboard with an activity-based emissions calculator, organisation workspaces, saved report analytics, and scenario tools. It is designed to help teams organise user-entered sustainability data; it does not connect to meters or verify source records.

---

## 🌟 Key Features

### 1. Dashboard and organisation workspaces
- The dashboard summarises saved reports, buildings, and tracked actions for the currently selected organisation the signed-in member is authorised to access.
- Organisation records are stored by the backend in SQLite and protected by membership checks. Buildings, actions, and reports are not seeded with sample organisation data.
- Local calculator mode remains available when signed out; it is not shared with an organisation until saved.

### 3. Multimodal Emissions Calculator
- Enter electricity, commuting, and waste activity, select from the factors available in the calculator, and review the calculated category totals.
- The calculator requires complete category inputs before saving an organisation report. Saving creates a snapshot with its reporting period and category emissions.
- Calculation outputs are estimates based on entered activity and selected factors; the application does not independently validate activity records.

### 4. Saved report analytics and export
- Analytics displays saved report history and category breakdowns for the selected authorised organisation. It does not interpolate missing reports into a historical trend.
- Export the organisation's saved report snapshots as CSV or JSON, or use **Print / Save PDF** to print the analytics page.
- Exports contain report title, period, save time, and saved category emissions. The current report format does **not** retain underlying activity inputs, emission-factor selections, or source documents.

### 5. Recommendations and scenario exploration
- Recommendations use deterministic rules and available calculator or saved-report category values; they are not AI-generated findings.
- Scenario results are exploratory estimates based on user-selected assumptions, not measured or guaranteed reductions, financial payback, or forecasts.

### 6. Methodology
- The methodology page describes the calculator's formulas, factor references, and limitations. Factor applicability and source data should be independently checked for formal reporting.

---

## 🛠️ Technology Stack

- **Frontend:** React 18 + Vite (JavaScript), located in `frontend/`
- **Backend:** Node.js + Express API with SQLite persistence, password-based member accounts, and organisation-scoped authorization, located in `backend/`
- **Styling:** Modern responsive CSS with custom design tokens, glassmorphism, and accessibility (`prefers-reduced-motion`)
- **Visuals:** Custom Isometric 2.5D SVG graphics with CSS keyframe animation systems
- **Charts:** High-performance responsive SVG chart system (Donut, Comparative Bars, 12-Month Area Trend)
- **Icons:** Lucide React
- **Celebration Effects:** Canvas-Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22.5 or higher (the backend uses the built-in `node:sqlite` module)
- npm (v9 or higher)

### Installation
```bash
# From the repository root, install frontend dependencies
cd frontend
npm install
```

```bash
# From the repository root, install backend dependencies
cd backend
npm install
```

### Running Locally
Start the frontend and backend in separate terminals:

```bash
# Terminal 1, from the frontend directory
cd frontend
npm run dev
```

```bash
# Terminal 2, from the backend directory
cd backend
npm run dev
```

Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).
The frontend proxies `/api` requests to the backend at `http://localhost:3001`.

### Organisation workspace setup

The backend creates a persistent SQLite database automatically on first start. By default it is saved at
`backend/data/carbonvision.sqlite` when the backend is started from its directory. The database file and its
write-ahead log files are excluded from Git.

Optional backend environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Port used by the Express API |
| `DATABASE_PATH` | `data/carbonvision.sqlite` relative to the backend working directory | SQLite database file path; set an absolute path for predictable deployment |
| `NODE_ENV` | unset | Set to `production` to mark the session cookie `Secure` |

No frontend secrets or third-party database credentials are required. A new user can register from **Organisations**.
An organisation owner can add existing registered accounts as members. Owners and admins can edit organisation
details; members can view and manage scoped facility records, actions, and carbon report snapshots. Each API request
checks the signed-in session and organisation membership on the server.

SQLite is appropriate for local development and a single application instance with persistent disk. Production
deployments must use HTTPS, retain the SQLite file and its WAL files across restarts, and back up the database.
Do not put the database on an unreliable network share or run multiple app instances against a local SQLite file.
Multi-instance deployments should migrate to a server database such as PostgreSQL; PostgreSQL support is not
implemented in this project yet. Configure `NODE_ENV=production` only when the API is served over HTTPS.

When signed in, the **Buildings** page and **Action Tracker** use the currently selected authorised organisation
and persist records on the server. The selected organisation is remembered in this browser; the backend still
validates membership for every operation. When signed out, those two pages retain their legacy browser-local mode.
Organisation details also provide the same scoped buildings and actions, plus carbon report snapshots.

### Production Build
```bash
# From the frontend directory, build the optimized static production bundle
cd frontend
npm run build

# Preview the production build locally
npm run preview
```

### Installable web app
The production frontend is a Progressive Web App. On a supported browser, open the site over HTTPS
(or `localhost` during development) and use **Install CarbonVision app** in the profile menu when
the browser offers installation. On iOS, use Safari's **Add to Home Screen** action.

The service worker caches only the application shell and same-origin static assets to support opening
the app offline after it has been loaded online. `/api/` requests and organisation data are never
cached; signing in, loading records, and saving changes still require a network connection.

### Windows desktop installer
From the repository root, install the frontend and backend dependencies if they are not already installed:

```powershell
Set-Location frontend
npm install
Set-Location ..\backend
npm install
Set-Location ..\frontend
npm run desktop:build
```

The Windows x64 installer is created at `frontend\release\CarbonVision AI Setup <version>.exe`.
Run the installer and keep **Create a desktop shortcut** selected to launch CarbonVision from the Desktop.
The desktop app runs the existing API locally and stores its SQLite database in the current Windows
user's application data directory. The app is single-user/local by default; sharing organisations with
other computers still requires deploying the backend and database to a secured server.

## 📁 Project Structure

```text
frontend/  React application and Vite configuration
backend/   Express API
```

---

## Typical workflow

1. Register or sign in under **Organisations**, then create an organisation or select one you belong to.
2. Enter activity in the **Calculator** and save a complete calculation to the selected organisation.
3. Review saved snapshots in the dashboard and **Analytics**. Export CSV/JSON or print the analytics page to PDF.
4. Explore recommendations and scenario tools as estimates, checking their assumptions before using them in planning.
5. Read **Methodology** and retain source records separately: organisation report snapshots currently store category totals, not calculation inputs or evidence.
