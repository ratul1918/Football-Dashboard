import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Schema version — bump this to auto-wipe stale data on next boot ───────────
const SCHEMA_VERSION = "v3-clean";

// ── KV helpers — robust against both stored-as-string and stored-as-object ───
// Supabase JSONB can return an already-parsed object OR a raw string depending
// on how the value was originally written. Both cases are handled here.

function parseArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function parseObject(raw: any): Record<string, any> | null {
  if (!raw) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return null; }
  }
  return null;
}

async function getTeams(): Promise<any[]> {
  try {
    const raw = await kv.get("ep_teams");
    return parseArray(raw);
  } catch (err) {
    console.log("getTeams KV error:", err);
    return [];
  }
}
async function saveTeams(teams: any[]) {
  // Store as a native JSONB array — no JSON.stringify needed
  await kv.set("ep_teams", teams);
}

async function getMatches(): Promise<any[]> {
  try {
    const raw = await kv.get("ep_matches");
    return parseArray(raw);
  } catch (err) {
    console.log("getMatches KV error:", err);
    return [];
  }
}
async function saveMatches(matches: any[]) {
  await kv.set("ep_matches", matches);
}

// ── Health ─────────────────────────────────────────────────────────────────
app.get("/make-server-7950e5fa/health", async (c) => {
  try {
    const [teams, matches] = await Promise.all([getTeams(), getMatches()]);
    return c.json({
      status: "ok",
      schema: SCHEMA_VERSION,
      stats: {
        teams: teams.length,
        matches: matches.length,
        completedMatches: matches.filter((m: any) => m.status === "completed").length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.log("Health check error:", err);
    return c.json({ status: "ok", schema: SCHEMA_VERSION, timestamp: new Date().toISOString() });
  }
});

// ── Migrate: idempotent — only wipes data when schema version changes ─────────
app.post("/make-server-7950e5fa/migrate", async (c) => {
  try {
    const stored = await kv.get("ep_schema_version");
    // Compare stored value robustly (may be string or already a JS string from JSONB)
    const storedVersion = typeof stored === "string" ? stored : String(stored ?? "");
    if (storedVersion === SCHEMA_VERSION) {
      return c.json({ migrated: false, version: SCHEMA_VERSION, message: "Already up to date." });
    }
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

// ── Reset: wipe all tournament data ──────────────────────────────────────────
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

// ── Seed: idempotent bulk import — only runs if DB is currently empty ─────────
app.post("/make-server-7950e5fa/seed", async (c) => {
  try {
    const existing = await getTeams();
    if (existing.length > 0) {
      return c.json({ seeded: false, message: "Data already exists — skipping seed." });
    }
    const body = await c.req.json().catch(() => null);
    if (!body || !Array.isArray(body.teams)) {
      return c.json({ error: "Request body must contain a 'teams' array." }, 400);
    }
    const teams = body.teams as any[];
    const matches = Array.isArray(body.matches) ? (body.matches as any[]) : [];
    await saveTeams(teams);
    await saveMatches(matches);
    console.log(`Seeded ${teams.length} teams and ${matches.length} matches.`);
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
    const body = await c.req.json().catch(() => null);
    if (!body || !body.name || !body.shortName || !body.realName) {
      return c.json({ error: "Missing required fields: name, shortName, realName." }, 400);
    }
    const teams = await getTeams();
    const newTeam = { ...body, id: `t_${Date.now()}` };
    teams.push(newTeam);
    await saveTeams(teams);
    console.log(`Created team: ${newTeam.id} (${newTeam.name})`);
    return c.json(newTeam, 201);
  } catch (err) {
    console.log("POST /teams error:", err);
    return c.json({ error: `Failed to create team: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/teams/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json().catch(() => null);
    if (!updates) return c.json({ error: "Invalid request body." }, 400);
    const teams = await getTeams();
    const idx = teams.findIndex((t: any) => t.id === id);
    if (idx === -1) return c.json({ error: `Team not found: ${id}` }, 404);
    teams[idx] = { ...teams[idx], ...updates, id };
    await saveTeams(teams);
    console.log(`Updated team: ${id}`);
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
    const before = teams.length;
    teams = teams.filter((t: any) => t.id !== id);
    if (teams.length === before) return c.json({ error: `Team not found: ${id}` }, 404);
    await saveTeams(teams);

    // Cascade: remove all matches that involved this team
    let matches = await getMatches();
    const matchesBefore = matches.length;
    matches = matches.filter((m: any) => m.homeTeamId !== id && m.awayTeamId !== id);
    await saveMatches(matches);

    const removedMatches = matchesBefore - matches.length;
    console.log(`Deleted team: ${id} — also removed ${removedMatches} associated match(es).`);
    return c.json({ deleted: id, removedMatches });
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
    const body = await c.req.json().catch(() => null);
    if (!body || !body.homeTeamId || !body.awayTeamId) {
      return c.json({ error: "Missing required fields: homeTeamId, awayTeamId." }, 400);
    }
    if (body.homeTeamId === body.awayTeamId) {
      return c.json({ error: "Home and away teams must be different." }, 400);
    }
    const matches = await getMatches();
    const newMatch = {
      ...body,
      homeScore: body.homeScore ?? 0,
      awayScore: body.awayScore ?? 0,
      status: body.status ?? "completed",
      id: `m_${Date.now()}`,
    };
    matches.unshift(newMatch);
    await saveMatches(matches);
    console.log(`Created match: ${newMatch.id} (${newMatch.homeTeamId} vs ${newMatch.awayTeamId})`);
    return c.json(newMatch, 201);
  } catch (err) {
    console.log("POST /matches error:", err);
    return c.json({ error: `Failed to create match: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/matches/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json().catch(() => null);
    if (!updates) return c.json({ error: "Invalid request body." }, 400);
    const matches = await getMatches();
    const idx = matches.findIndex((m: any) => m.id === id);
    if (idx === -1) return c.json({ error: `Match not found: ${id}` }, 404);
    matches[idx] = { ...matches[idx], ...updates, id };
    await saveMatches(matches);
    console.log(`Updated match: ${id}`);
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
    const before = matches.length;
    matches = matches.filter((m: any) => m.id !== id);
    if (matches.length === before) return c.json({ error: `Match not found: ${id}` }, 404);
    await saveMatches(matches);
    console.log(`Deleted match: ${id}`);
    return c.json({ deleted: id });
  } catch (err) {
    console.log("DELETE /matches/:id error:", err);
    return c.json({ error: `Failed to delete match: ${err}` }, 500);
  }
});

// ── Tournament Rules ──────────────────────────────────────────────────────────
app.get("/make-server-7950e5fa/rules", async (c) => {
  try {
    const raw = await kv.get("ep_rules");
    const rules = parseObject(raw);
    return c.json(rules);
  } catch (err) {
    console.log("GET /rules error:", err);
    return c.json({ error: `Failed to fetch rules: ${err}` }, 500);
  }
});

app.put("/make-server-7950e5fa/rules", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return c.json({ error: "Request body must be a valid JSON object." }, 400);
    }
    // Store as native JSONB object
    await kv.set("ep_rules", body);
    console.log("Tournament rules updated.");
    return c.json(body);
  } catch (err) {
    console.log("PUT /rules error:", err);
    return c.json({ error: `Failed to save rules: ${err}` }, 500);
  }
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.all("/make-server-7950e5fa/*", (c) => {
  return c.json({
    error: "Not found",
    path: c.req.path,
    method: c.req.method,
    availableRoutes: [
      "GET  /health",
      "POST /migrate",
      "POST /reset",
      "POST /seed",
      "GET|POST /teams",
      "PUT|DELETE /teams/:id",
      "GET|POST /matches",
      "PUT|DELETE /matches/:id",
      "GET|PUT /rules",
    ].map(r => `/make-server-7950e5fa/${r.split("/")[1]}`),
  }, 404);
});

Deno.serve(app.fetch);
