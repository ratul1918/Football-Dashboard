# ⚽ Elite Pitch — Football League Management Dashboard

> A premium, dark-themed football league management dashboard built with React, Supabase, and Vite.
> All stats are **100 % computed live** from your match data. No manual table editing — just log results and watch the standings update in real time.

--- 
 
## Table of Contents 
 
1. [Live Demo & Preview](#1-live-demo--preview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview) 
4. [Project Structure](#4-project-structure) 
5. [Data Model](#5-data-model) 
6. [Local Development](#6-local-development)
7. [Supabase Backend Setup](#7-supabase-backend-setup)
8. [Deploying to Vercel](#8-deploying-to-vercel)
9. [Dynamic Usage — Admin Guide](#9-dynamic-usage--admin-guide)
10. [REST API Reference](#10-rest-api-reference)
11. [Tournament Rules & Configuration](#11-tournament-rules--configuration)
12. [Export & Reporting](#12-export--reporting)
13. [Database Schema & KV Keys](#13-database-schema--kv-keys)
14. [Schema Versioning & Migrations](#14-schema-versioning--migrations)
15. [Environment Variables](#15-environment-variables)
16. [Troubleshooting](#16-troubleshooting)
17. [Roadmap](#17-roadmap)

---

## 1. Live Demo & Preview

| Page | Description |
|---|---|
| **Dashboard** | KPI cards, top-5 chart, live ticker, recent results |
| **Teams** | Add / edit / remove players, view per-player stats |
| **Matches** | Submit results, edit scores, delete fixtures |
| **Standings** | Auto-computed table with form badges & zone colours |
| **Settings** | Tournament rules editor, data export, danger-zone reset |

The app is a **Single-Page Application (SPA)** — all routes are handled client-side via React Router.  
Data is persisted in **Supabase** (KV store + Edge Function backend). Nothing is stored in the browser.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18 + TypeScript |
| **Routing** | React Router 7 (Data Mode, `createBrowserRouter`) |
| **Styling** | Tailwind CSS v4 + inline styles (glassmorphism theme) |
| **Build tool** | Vite 6 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Animation** | Motion (formerly Framer Motion) |
| **Image export** | html-to-image |
| **Backend runtime** | Supabase Edge Functions (Deno) |
| **Backend framework** | Hono |
| **Database** | Supabase KV Store (key-value, PostgreSQL under the hood) |
| **Deployment** | Vercel (frontend) + Supabase (backend, always-on) |
| **Font** | Lexend (Google Fonts) |

---

## 3. Architecture Overview

```
Browser (React SPA)
       │
       │  HTTPS  ·  Bearer <ANON_KEY>
       ▼
Supabase Edge Function  ──────────────────────────────────────┐
  /make-server-7950e5fa/*                                      │
  (Hono router, Deno runtime)                                  │
       │                                                       │
       │  kv.get / kv.set                                      │
       ▼                                                       │
Supabase KV Store  (PostgreSQL kv_store_7950e5fa table)       │
  ep_teams            JSON array of Team objects              │
  ep_matches          JSON array of Match objects             │
  ep_rules            JSON TournamentRules object             │
  ep_schema_version   Migration version string                 │
                                                               │
  All other Supabase services (Auth, Storage) reserved for    │
  future use ──────────────────────────────────────────────────┘
```

### Key design choices

- **No custom Postgres tables.** All data lives in the single `kv_store_7950e5fa` table via the `kv` utility. No DDL migrations needed.
- **Stats are computed, never stored.** `computeAllStats(teams, matches)` runs in the browser on every render. Editing or deleting any match instantly recalculates every row in the standings.
- **Schema-version migrations.** A `SCHEMA_VERSION` constant in the edge function auto-wipes stale data when bumped — safe, idempotent, zero-downtime.
- **Supabase anon key is public-safe.** It grants only what the Edge Function allows. The `SERVICE_ROLE_KEY` never reaches the frontend.

---

## 4. Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Root: mounts RouterProvider
│   │   ├── routes.tsx                 # createBrowserRouter config
│   │   ├── config/
│   │   │   └── supabase.ts            # API_BASE, API_HEADERS (public)
│   │   ├── context/
│   │   │   ├── LeagueContext.tsx      # Teams, matches, standings — Supabase-backed
│   │   │   └── TournamentRulesContext.tsx  # Rules editor state — Supabase-backed
│   │   ├── data/
│   │   │   └── leagueData.ts          # Types, computeAllStats(), empty initial arrays
│   │   ├── components/
│   │   │   ├── Layout.tsx             # Sidebar + DBLoader + context providers
│   │   │   ├── Sidebar.tsx            # Navigation (desktop + mobile bottom bar)
│   │   │   ├── Header.tsx             # Page header (title, search, notifications, profile)
│   │   │   ├── DBLoader.tsx           # Loading / error gate before rendering children
│   │   │   ├── ExportModal.tsx        # PNG + CSV export dialog
│   │   │   ├── EditMatchModal.tsx     # Edit existing match result
│   │   │   ├── PlayerFormModal.tsx    # Add / edit player (team)
│   │   │   ├── ConfirmModal.tsx       # Generic confirm dialog
│   │   │   ├── Modal.tsx              # Base modal wrapper
│   │   │   ├── ResultsExportCard.tsx  # Off-screen card rendered for PNG export
│   │   │   └── TournamentRulesEditor.tsx  # Full rules editor widget
│   │   └── pages/
│   │       ├── Dashboard.tsx
│   │       ├── Teams.tsx
│   │       ├── Matches.tsx
│   │       ├── Standings.tsx
│   │       └── Settings.tsx
│   └── styles/
│       ├── fonts.css                  # Google Fonts import (Lexend)
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css                  # CSS custom properties / design tokens
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx              # Hono app — all REST routes
│           └── kv_store.tsx           # KV utility (get, set, del, …)
├── utils/
│   └── supabase/
│       └── info.tsx                   # AUTOGENERATED — projectId + publicAnonKey
├── vercel.json                        # SPA rewrite + asset cache headers
├── vite.config.ts
└── package.json
```

---

## 5. Data Model

### `Team`

```typescript
interface Team {
  id: string;          // Auto-generated: "t_<timestamp>"
  name: string;        // Username / Tag  e.g. "GOAT_FC"
  shortName: string;   // ≤ 6 chars shown in table  e.g. "GOAT"
  realName: string;    // Player's real / display name
  color: string;       // Hex colour  e.g. "#3B82F6"
  badge: string;       // Emoji badge  e.g. "🦁"
}
```

### `Match`

```typescript
interface Match {
  id: string;                                   // "m_<timestamp>"
  homeTeamId: string;                           // references Team.id
  awayTeamId: string;                           // references Team.id
  homeScore: number;
  awayScore: number;
  date: string;                                 // ISO date "YYYY-MM-DD"
  status: 'completed' | 'upcoming' | 'live';
  minute?: number;                              // live minute (optional)
}
```

### `TeamWithStats` (computed, never stored)

```typescript
type TeamWithStats = Team & {
  mp: number;   // matches played
  w: number;    // wins
  d: number;    // draws
  l: number;    // losses
  gf: number;   // goals for
  ga: number;   // goals against
  gd: number;   // goal difference
  pts: number;  // points
  form: ('W' | 'D' | 'L')[];  // last 5 results
  rank: number;
}
```

### `TournamentRules`

```typescript
interface TournamentRules {
  system: 'league' | 'ucl' | 'worldcup' | 'double-rr' | 'swiss' | 'custom';
  tournamentName: string;
  season: string;
  format: 'single-rr' | 'double-rr' | 'group-knockout' | 'swiss';
  legs: 1 | 2;
  numGroups: number;
  teamsPerGroup: number;
  points: {
    win: number; draw: number; loss: number;
    bonusGoal: boolean; cleanSheetBonus: boolean;
  };
  tiebreakers: TiebreakerKey[];   // ordered priority list
  zones: {
    champion: number; knockout: number;
    playoff: number;  relegation: number;
  };
  awayGoalsRule: boolean;
  extraTimeEnabled: boolean;
  penaltiesEnabled: boolean;
  maxPlayers: number;
}
```

---

## 6. Local Development

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18 + |
| pnpm | 9 + |
| Supabase CLI | 2 + (for local edge functions — optional) |

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-org/elite-pitch.git
cd elite-pitch

# 2. Install dependencies  (pnpm is required — the project uses pnpm workspaces)
pnpm install

# 3. Start the dev server
pnpm dev
# → http://localhost:5173
```

> **The app connects to the production Supabase instance immediately** — no extra environment variables needed for local development. `src/app/config/supabase.ts` holds the public credentials.

### Optional: Run Supabase Edge Functions locally

```bash
# Requires Docker + Supabase CLI
supabase start
supabase functions serve make-server-7950e5fa --env-file .env.local

# Create .env.local with:
# SUPABASE_URL=http://localhost:54321
# SUPABASE_ANON_KEY=<your-local-anon-key>
# SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>
```

Then point the frontend at `http://localhost:54321` by updating `SUPABASE_PROJECT_ID` and `SUPABASE_ANON_KEY` in `src/app/config/supabase.ts`.

---

## 7. Supabase Backend Setup

The Supabase project is already configured. These steps are only needed if you fork the project or set up a fresh Supabase instance.

### 7.1 Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** (Settings → API)

### 7.2 Update credentials

Edit `src/app/config/supabase.ts`:

```typescript
export const SUPABASE_PROJECT_ID = "YOUR_PROJECT_ID";
export const SUPABASE_ANON_KEY   = "YOUR_ANON_KEY";
```

Also update `utils/supabase/info.tsx` (auto-generated; safe to edit):

```typescript
export const projectId    = "YOUR_PROJECT_ID";
export const publicAnonKey = "YOUR_ANON_KEY";
```

### 7.3 Deploy the Edge Function

```bash
supabase functions deploy make-server-7950e5fa
```

The function is located at `supabase/functions/server/index.tsx`.  
All Supabase secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are automatically injected by Supabase — no manual secret configuration needed.

### 7.4 Verify the deployment

```bash
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-7950e5fa/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
# → {"status":"ok","schema":"v3-clean"}
```

### 7.5 Run the first migration

The migration runs automatically when the app boots. You can also trigger it manually:

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-7950e5fa/migrate \
  -H "Authorization: Bearer YOUR_ANON_KEY"
# → {"migrated":true,"version":"v3-clean","message":"Database wiped and migrated to clean state."}
# (or {"migrated":false,...} if already up to date)
```

---

## 8. Deploying to Vercel

### 8.1 One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/elite-pitch)

### 8.2 Manual deploy

```bash
# Install Vercel CLI
npm i -g vercel

# From the project root
vercel

# Follow the prompts:
#   Set Up and Deploy? → Yes
#   Which scope? → your team
#   Link to existing project? → No (first deploy)
#   What's your project's name? → elite-pitch
#   In which directory is your code located? → ./
#   Want to override the settings? → No
```

### 8.3 Build settings (auto-detected)

| Setting | Value |
|---|---|
| Framework preset | Vite |
| Build command | `vite build` |
| Output directory | `dist` |
| Install command | `pnpm install` |

### 8.4 SPA routing

The `vercel.json` file handles SPA routing so that refreshing `/teams`, `/matches`, etc. always returns `index.html` instead of a 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

> **No Vercel environment variables are required.** The public Supabase credentials are baked into the frontend bundle.

---

## 9. Dynamic Usage — Admin Guide

The dashboard starts **empty** on first boot. Everything is added through the UI. No SQL, no config files.

---

### 9.1 Adding Players (Teams)

Navigate to **Teams** → click **+ Add Player**.

| Field | Notes |
|---|---|
| **Name** (username/tag) | Displayed everywhere, e.g. `GOAT_FC` |
| **Short Name** | ≤ 6 chars used in the standings table, e.g. `GOAT` |
| **Real Name** | Player's full display name |
| **Colour** | Hex colour used for the player's accent chip |
| **Badge** | Any emoji — shows next to the name |

- You can add as many players as you like.
- Deleting a player automatically removes all matches involving them from the database and recalculates the standings.

---

### 9.2 Submitting Match Results

Navigate to **Matches** → use the **Submit Match Result** form.

1. Select **Player 1 (Home)** from the dropdown
2. Select **Player 2 (Away)** from the dropdown
3. Enter the score for each side (0 or above)
4. Set the **Date** of the match
5. Click **Submit Result**

The standings table updates **instantly** on submission — no page refresh needed.

> **Upcoming fixtures:** You can submit a match without a score by setting both scores to `0` and leaving the status as `upcoming`. Edit it later when the result is known.

---

### 9.3 Editing a Match Result

On the **Matches** page, hover over any match card to reveal the **✏️ Edit** and **🗑️ Delete** buttons.

- Clicking **Edit** opens a modal where you can update both scores, the date, and the status (`completed / upcoming`).
- All standings are immediately recalculated on save.

---

### 9.4 Editing a Player

On the **Teams** page, hover over any player card → click **✏️**. You can update any field. Player IDs are immutable — all historical matches remain linked.

---

### 9.5 Standings Auto-calculation

The standings are **never stored in the database**. They are recomputed from scratch every time the `matches` array changes:

```
computeAllStats(teams, matches)
  → for each completed match, update both teams' W/D/L/GF/GA
  → sort by: pts → gd → gf
  → assign rank 1…N
```

Editing a single score therefore instantly corrects every affected row in the table.

---

### 9.6 Configuring Tournament Rules

Navigate to **Settings** → **Tournament** tab.

Choose a **System Preset** (Premier League, UCL, World Cup, Double Round-Robin, Swiss, or Custom) to auto-fill all fields, then fine-tune:

| Section | Options |
|---|---|
| **Tournament Name & Season** | Free text |
| **Format** | Single Round-Robin, Double Round-Robin, Group+Knockout, Swiss |
| **Points system** | Win / Draw / Loss points; optional Bonus Goal & Clean Sheet bonus |
| **Tiebreakers** | Drag to reorder: Points → GD → GF → H2H → Wins → Away Goals → Alpha |
| **Qualification Zones** | How many spots per zone (Champion, Knockout, Playoff, Relegation) |
| **Extra rules** | Away Goals Rule, Extra Time, Penalty Shootout |

Click **Save Settings** to persist to Supabase.

---

### 9.7 Resetting All Data

> ⚠️ **This is irreversible.**

Navigate to **Settings** → **Data & Export** → scroll to **Danger Zone** → click **Reset Tournament Data**.

- First click shows a red **Confirm Reset** warning button.
- Second click wipes all teams and matches from Supabase and clears local state.
- Tournament rules are **not** deleted.

---

## 10. REST API Reference

**Base URL:** `https://obldzzvthstaxsntblpq.supabase.co/functions/v1/make-server-7950e5fa`  
**Auth:** `Authorization: Bearer <ANON_KEY>` (required on every request)  
**Content-Type:** `application/json`

---

### Health

```
GET /health
→ { "status": "ok", "schema": "v3-clean" }
```

---

### Migration (idempotent)

```
POST /migrate
→ { "migrated": boolean, "version": string, "message": string }
```

Compares `ep_schema_version` in KV against the constant `SCHEMA_VERSION` in the server code. If they differ, wipes `ep_teams` and `ep_matches` and updates the version. **Safe to call on every app boot.**

---

### Reset (destructive)

```
POST /reset
→ { "reset": true, "message": "All tournament data has been cleared." }
```

Immediately empties `ep_teams` and `ep_matches`. Does **not** reset `ep_rules` or `ep_schema_version`.

---

### Teams

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/teams` | — | `Team[]` |
| `POST` | `/teams` | `Omit<Team, "id">` | `Team` (201) |
| `PUT` | `/teams/:id` | `Partial<Team>` | `Team` |
| `DELETE` | `/teams/:id` | — | `{ deleted: id }` — also deletes associated matches |

**Example — create a player:**

```bash
curl -X POST $BASE/teams \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GOAT_FC",
    "shortName": "GOAT",
    "realName": "Mohamed Ali",
    "color": "#3B82F6",
    "badge": "🦁"
  }'
```

---

### Matches

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/matches` | — | `Match[]` |
| `POST` | `/matches` | `Omit<Match, "id">` | `Match` (201) |
| `PUT` | `/matches/:id` | `Partial<Match>` | `Match` |
| `DELETE` | `/matches/:id` | — | `{ deleted: id }` |

**Example — submit a result:**

```bash
curl -X POST $BASE/matches \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeamId": "t_1746490000000",
    "awayTeamId": "t_1746490001234",
    "homeScore": 3,
    "awayScore": 1,
    "date": "2026-05-06",
    "status": "completed"
  }'
```

**Example — schedule an upcoming fixture:**

```bash
curl -X POST $BASE/matches \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeamId": "t_1746490000000",
    "awayTeamId": "t_1746490001234",
    "homeScore": 0,
    "awayScore": 0,
    "date": "2026-06-15",
    "status": "upcoming"
  }'
```

---

### Tournament Rules

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/rules` | — | `TournamentRules \| null` |
| `PUT` | `/rules` | `TournamentRules` | `TournamentRules` |

---

### Seeding (programmatic bulk insert)

```
POST /seed
Body: { "teams": Team[], "matches": Match[] }
→ { "seeded": true,  "teamCount": N, "matchCount": M }   (if DB was empty)
→ { "seeded": false, "message": "Data already exists" }  (if DB already had teams)
```

Use this endpoint to bulk-import an existing tournament from another system. The seed is **idempotent** — it only runs if the teams array is currently empty.

**Example bulk seed:**

```bash
curl -X POST $BASE/seed \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      { "id": "t1", "name": "GOAT_FC", "shortName": "GOAT", "realName": "Mohamed Ali",   "color": "#3B82F6", "badge": "🦁" },
      { "id": "t2", "name": "KING_11", "shortName": "KING", "realName": "Ahmed Hassan",  "color": "#22C55E", "badge": "👑" },
      { "id": "t3", "name": "WOLF_CF", "shortName": "WOLF", "realName": "Omar Khalid",   "color": "#8b5cf6", "badge": "🐺" }
    ],
    "matches": [
      { "id": "m1", "homeTeamId": "t1", "awayTeamId": "t2", "homeScore": 2, "awayScore": 1, "date": "2026-05-01", "status": "completed" },
      { "id": "m2", "homeTeamId": "t3", "awayTeamId": "t1", "homeScore": 0, "awayScore": 0, "date": "2026-05-03", "status": "completed" }
    ]
  }'
```

---

## 11. Tournament Rules & Configuration

### Preset Systems

| Preset | Format | Points (W/D/L) | Tiebreakers |
|---|---|---|---|
| **Premier League** | Single Round-Robin | 3 / 1 / 0 | PTS → GD → GF → H2H → Wins → Alpha |
| **UCL Group Stage** | Group + Knockout | 3 / 1 / 0 | PTS → GD → GF → H2H → Away Goals → Alpha |
| **World Cup Groups** | Group + Knockout | 3 / 1 / 0 | PTS → GD → GF → H2H → Wins → Alpha |
| **Double Round-Robin** | Double Round-Robin, 2 legs | 3 / 1 / 0 | PTS → GD → GF → H2H → Wins → Alpha |
| **Swiss System** | Swiss | 1 / 0.5 / 0 | PTS → H2H → GD → Wins → Alpha |
| **Custom** | Your choice | Your choice | Your choice |

### Qualification Zone Colours

| Zone | Colour | Meaning |
|---|---|---|
| 🥇 Champion | Amber `#f59e0b` | Tournament winner / title spot |
| 🔵 Knockout / UCL | Blue `#3B82F6` | Advance to knockout round |
| 🟢 Playoff / Europa | Green `#22C55E` | Playoff qualifier |
| 🔴 Relegation | Red `#ef4444` | Eliminated / relegated |

Zone widths in the preview bar are proportional to the number of spots assigned.

---

## 12. Export & Reporting

Access via **Settings → Data & Export → Open Export Tool**.

### PNG — Full Tournament Report

- Renders a full-width card containing standings + all match results off-screen
- Exported at **2× pixel ratio** (≈ 1800 px wide) for crisp sharing on WhatsApp, Instagram, or printing
- Uses `html-to-image` → double-render strategy (first pass pre-loads fonts/images)
- Downloads as `{tournament-name}-{season}.png`

### CSV — Standings

Columns: `Rank, Player, Full Name, MP, W, D, L, GF, GA, GD, PTS`  
Downloads as `{tournament-name}-{season}-standings.csv`

### CSV — Full Match History

Columns: `Date, Matchday, Home Player, Home Name, Home Score, Away Score, Away Name, Away Player, Status, Winner`  
Matchday numbers are auto-assigned by chronological date order.  
Downloads as `{tournament-name}-{season}-matches.csv`

Both CSVs are UTF-8 encoded and open correctly in Excel, Google Sheets, and Numbers.

---

## 13. Database Schema & KV Keys

All data is stored in a single PostgreSQL table managed by the Supabase KV utility:

| KV Key | Type | Description |
|---|---|---|
| `ep_teams` | `string` (JSON array) | All `Team` objects |
| `ep_matches` | `string` (JSON array) | All `Match` objects |
| `ep_rules` | `string` (JSON object) | `TournamentRules` |
| `ep_schema_version` | `string` | Migration version (e.g. `"v3-clean"`) |

The keys are prefixed with `ep_` (Elite Pitch) to avoid collision with any other apps sharing the same Supabase project.

---

## 14. Schema Versioning & Migrations

### How it works

In `supabase/functions/server/index.tsx`:

```typescript
const SCHEMA_VERSION = "v3-clean";
```

On every app boot, the frontend calls `POST /migrate`:

1. Server reads `ep_schema_version` from KV
2. If `ep_schema_version !== SCHEMA_VERSION` → wipe `ep_teams` + `ep_matches`, then set `ep_schema_version = SCHEMA_VERSION`
3. If they match → do nothing (no-op)

### When to bump the version

Bump `SCHEMA_VERSION` any time you need to force-wipe all existing data (e.g. end of a tournament season, switching to a new competition). Redeploy the Edge Function after the change.

```typescript
// supabase/functions/server/index.tsx
const SCHEMA_VERSION = "v4-season-2";  // ← bump this
```

Then redeploy:

```bash
supabase functions deploy make-server-7950e5fa
```

The next time any user opens the app, the migration runs and the database is wiped cleanly.

### Manual wipe (without a version bump)

Use the **Danger Zone** reset button in Settings, or call the API directly:

```bash
curl -X POST $BASE/reset \
  -H "Authorization: Bearer $ANON_KEY"
```

---

## 15. Environment Variables

### Frontend

No `.env` file is required. Credentials are in `src/app/config/supabase.ts`:

```typescript
export const SUPABASE_PROJECT_ID = "obldzzvthstaxsntblpq";
export const SUPABASE_ANON_KEY   = "eyJ...";
```

The `SUPABASE_ANON_KEY` is the **public anon key** — safe to commit and expose in the browser bundle.

### Supabase Edge Function (server-side only)

These are injected automatically by Supabase; you never set them manually:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Project REST URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key — **never exposed to frontend** |
| `SUPABASE_DB_URL` | Direct Postgres connection string |
| `SUPABASE_JWKS` | JWT verification keys |

### Vercel

No environment variables are needed in the Vercel dashboard. The build is purely static; all runtime calls go to Supabase directly from the browser.

---

## 16. Troubleshooting

### App shows "Database Connection Error"

**Cause:** The Supabase Edge Function is not reachable, or returned a non-OK response.

```bash
# Check health
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-7950e5fa/health \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

- If you get a `401` → wrong anon key
- If you get a `404` → function not deployed → run `supabase functions deploy make-server-7950e5fa`
- If you get a `500` → check the Edge Function logs in the Supabase dashboard

---

### Standings show old dummy data

**Cause:** An old version of the app seeded dummy teams/matches into Supabase before the migration system existed.

**Fix:** Bump `SCHEMA_VERSION` in the server and redeploy, or use the **Danger Zone Reset** button in Settings.

---

### PNG export is blurry / fonts not loading

**Cause:** `html-to-image` can't inline cross-origin fonts in the first render pass.

**Fix (already implemented):** The export function calls `toPng()` twice — the first call pre-warms the font cache; the second call captures at 2× resolution with the fonts already in memory.

---

### "Importing a module script failed" error

**Cause:** A generic arrow function `<T extends ...>` in a `.tsx` file is parsed as JSX.

**Fix (already applied):** All such functions have been rewritten as named function declarations:

```typescript
// ❌ TSX parser reads <K as an opening JSX tag
const set = <K extends keyof TournamentRules>(key: K, val: TournamentRules[K]) => { ... }

// ✅ Named function — no ambiguity
function set<K extends keyof TournamentRules>(key: K, val: TournamentRules[K]) { ... }
```

---

### `React is not defined` TypeScript error in the IDE

**Cause:** `React.CSSProperties` used in a file that only imports named React exports.

**Fix (already applied):** All such usages now import `CSSProperties` directly:

```typescript
import { useState, CSSProperties } from 'react';
const myStyle: CSSProperties = { ... };
```

---

### Match results not saving

Check the browser console for the error message. Common causes:

| Symptom | Likely cause |
|---|---|
| `Failed to create match: HTTP 401` | Anon key is wrong or expired |
| `Failed to create match: HTTP 500` | Edge Function runtime error — check Supabase logs |
| Form submits but standings don't change | Match `status` was not set to `"completed"` |

---

### Resetting the entire database via CLI

```bash
# Option 1: via the API
curl -X POST $BASE/reset -H "Authorization: Bearer $ANON_KEY"

# Option 2: via the app
Settings → Data & Export → Danger Zone → Reset Tournament Data (confirm twice)

# Option 3: bump the schema version + redeploy
# (wipes on next app boot, works for all users simultaneously)
```

---

## 17. Roadmap

| Feature | Status |
|---|---|
| Live match minute ticker | 🔜 Planned |
| Bracket / knockout draw visualiser | 🔜 Planned |
| Player-level goal & assist tracking | 🔜 Planned |
| Multi-tournament / seasons support | 🔜 Planned |
| WhatsApp / Telegram push notifications on result | 🔜 Planned |
| Supabase Auth — multi-admin login | 🔜 Planned |
| Public read-only view (no login required) | 🔜 Planned |
| Mobile PWA with offline score entry | 🔜 Planned |
| Dark / light theme toggle | 💡 Under consideration |

---

## License

MIT — free to use, fork, and modify for any personal or commercial football tournament.

---

> Built with ⚽ using React, Supabase, Vite, and Tailwind CSS.  
> Designed for speed, clarity, and zero manual table management.
