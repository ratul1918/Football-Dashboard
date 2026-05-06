import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Schema version — bump this to auto-wipe stale/dummy data on next boot ─────
const SCHEMA_VERSION = "v3-clean";

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getTeams(): Promise<any[]> {
  const raw = await kv.get("ep_teams");
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}
async function saveTeams(teams: any[]) {
  await kv.set("ep_teams", JSON.stringify(teams));
}
async function getMatches(): Promise<any[]> {
  const raw = await kv.get("ep_matches");
  if (!raw) return [];
  try { return JSON.parse(raw as string); } catch { return []; }
}
async function saveMatches(matches: any[]) {
  await kv.set("ep_matches", JSON.stringify(matches));
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/make-server-7950e5fa/health", (c) => c.json({ status: "ok", schema: SCHEMA_VERSION }));

// ── Migrate: run once per schema version, wipes stale data ───────────────────
// Called by the frontend on every bootstrap — safe to call repeatedly.
app.post("/make-server-7950e5fa/migrate", async (c) => {
  try {
    const stored = await kv.get("ep_schema_version");
    if (stored === SCHEMA_VERSION) {
      return c.json({ migrated: false, version: SCHEMA_VERSION, message: "Already up to date." });
    }
    // Clear all legacy/dummy data
    await saveTeams([]);
    await saveMatches([]);
    await kv.set("ep_schema_version", SCHEMA_VERSION);
    console.log(`Migration complete: wiped stale data, set version=${SCHEMA_VERSION}`);
    return c.json({ migrated: true, version: SCHEMA_VERSION, message: "Database wiped and migrated to clean state." });
  } catch (err) {
    console.log("Migrate error:", err);
    return c.json({ error: `Migration failed: ${err}` }, 500);
  }
});

// ── Reset: wipe all tournament data (called from Settings Danger Zone) ────────
app.post("/make-server-7950e5fa/reset", async (c) => {
  try {
    await saveTeams([]);
    await saveMatches([]);
    console.log("Tournament data reset to empty.");
    return c.json({ reset: true, message: "All tournament data has been cleared." });
  } catch (err) {
    console.log("Reset error:", err);
    return c.json({ error: `Reset failed: ${err}` }, 500);
  }
});

// ── Seed endpoint (idempotent — only seeds if DB is empty) ────────────────────
app.post("/make-server-7950e5fa/seed", async (c) => {
  try {
    const existing = await getTeams();
    if (existing.length > 0) {
      return c.json({ seeded: false, message: "Data already exists — skipping seed." });
    }
    const { teams, matches } = await c.req.json();
    await saveTeams(teams);
    await saveMatches(matches);
    return c.json({ seeded: true, teamCount: teams.length, matchCount: matches.length });
  } catch (err) {
    console.log("Seed error:", err);
    return c.json({ error: `Seed failed: ${err}` }, 500);
  }
});

// ── Teams ─────────────────────────────────────────────────────────────────────
app.get("/make-server-7950e5fa/teams", async (c) => {
  try {
    const teams = await getTeams();
    return c.json(teams);
  } catch (err) {
    console.log("GET /teams error:", err);
    return c.json({ error: `Failed to fetch teams: ${err}` }, 500);
  }
});

app.post("/make-server-7950e5fa/teams", async (c) => {
  try {
    const body = await c.req.json();
    const teams = await getTeams();
    const newTeam = { ...body, id: `t_${Date.now()}` };
    teams.push(newTeam);
    await saveTeams(teams);
    return c.json(newTeam, 201);
  } catch (err) {
    console.log("POST /teams error:", err);
    return c.json({ error: `Failed to create team: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/teams/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const teams = await getTeams();
    const idx = teams.findIndex((t: any) => t.id === id);
    if (idx === -1) return c.json({ error: "Team not found" }, 404);
    teams[idx] = { ...teams[idx], ...updates, id };
    await saveTeams(teams);
    return c.json(teams[idx]);
  } catch (err) {
    console.log("PUT /teams/:id error:", err);
    return c.json({ error: `Failed to update team: ${err}` }, 500);
  }
});

app.delete("/make-server-7950e5fa/teams/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let teams = await getTeams();
    teams = teams.filter((t: any) => t.id !== id);
    await saveTeams(teams);
    // Also remove all matches involving this team
    let matches = await getMatches();
    matches = matches.filter((m: any) => m.homeTeamId !== id && m.awayTeamId !== id);
    await saveMatches(matches);
    return c.json({ deleted: id });
  } catch (err) {
    console.log("DELETE /teams/:id error:", err);
    return c.json({ error: `Failed to delete team: ${err}` }, 500);
  }
});

// ── Matches ───────────────────────────────────────────────────────────────────
app.get("/make-server-7950e5fa/matches", async (c) => {
  try {
    const matches = await getMatches();
    return c.json(matches);
  } catch (err) {
    console.log("GET /matches error:", err);
    return c.json({ error: `Failed to fetch matches: ${err}` }, 500);
  }
});

app.post("/make-server-7950e5fa/matches", async (c) => {
  try {
    const body = await c.req.json();
    const matches = await getMatches();
    const newMatch = { ...body, id: `m_${Date.now()}` };
    matches.unshift(newMatch);
    await saveMatches(matches);
    return c.json(newMatch, 201);
  } catch (err) {
    console.log("POST /matches error:", err);
    return c.json({ error: `Failed to create match: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/matches/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();
    const matches = await getMatches();
    const idx = matches.findIndex((m: any) => m.id === id);
    if (idx === -1) return c.json({ error: "Match not found" }, 404);
    matches[idx] = { ...matches[idx], ...updates, id };
    await saveMatches(matches);
    return c.json(matches[idx]);
  } catch (err) {
    console.log("PUT /matches/:id error:", err);
    return c.json({ error: `Failed to update match: ${err}` }, 500);
  }
});

app.delete("/make-server-7950e5fa/matches/:id", async (c) => {
  try {
    const id = c.req.param("id");
    let matches = await getMatches();
    matches = matches.filter((m: any) => m.id !== id);
    await saveMatches(matches);
    return c.json({ deleted: id });
  } catch (err) {
    console.log("DELETE /matches/:id error:", err);
    return c.json({ error: `Failed to delete match: ${err}` }, 500);
  }
});

// ── Tournament Rules ──────────────��───────────────────────────────────────────
app.get("/make-server-7950e5fa/rules", async (c) => {
  try {
    const raw = await kv.get("ep_rules");
    if (!raw) return c.json(null);
    return c.json(JSON.parse(raw as string));
  } catch (err) {
    console.log("GET /rules error:", err);
    return c.json({ error: `Failed to fetch rules: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/rules", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("ep_rules", JSON.stringify(body));
    return c.json(body);
  } catch (err) {
    console.log("PUT /rules error:", err);
    return c.json({ error: `Failed to save rules: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);
