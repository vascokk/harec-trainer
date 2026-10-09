// HAREC Trainer API: anonymous players and contest leaderboards (all-time and weekly), stored in D1.
// Static files in app/src are served by Workers assets; only /api/* reaches this code.
//
// A player is identified by a random secret (the "player code") that lives on their
// device and is sent as `Authorization: Bearer <code>`. Only its SHA-256 hash is stored.
// No email, IP address or other personal details are kept.

const BOARDS = { 'contest-1': 1, 'contest-2': 2, 'contest-5': 5, 'contest-10': 10 };
const WPM_MIN = 10, WPM_MAX = 45;        // contest speed range, as in the app
const MAX_QSOS_PER_MIN = 20;             // faster than anyone logs at 45 WPM
const TOP_N = 20;
const DAY = 86_400_000;

const ADJECTIVES = ['Lucky', 'Swift', 'Quiet', 'Bright', 'Steady', 'Clever', 'Brave', 'Sunny', 'Crisp', 'Mellow',
  'Rapid', 'Keen', 'Happy', 'Nimble', 'Bold', 'Calm', 'Jolly', 'Sharp'];
const NOUNS = ['Dipole', 'Yagi', 'Keyer', 'Paddle', 'Fox', 'Balun', 'Beacon', 'Loop', 'Vertical', 'Squelch',
  'Ferrite', 'Ionosonde', 'Repeater', 'Feedline', 'Elmer', 'Ragchewer', 'Sideband', 'Counterpoise'];
// A short blocklist for nicknames; it only stops the obvious.
const BLOCKED = ['fuck', 'shit', 'cunt', 'nigg', 'fag', 'rape', 'nazi', 'hitler', 'whore', 'slut', 'bitch', 'dick', 'cock', 'pussy'];

// Writes are rate limited per IP, in memory only (per isolate, never stored).
const hits = new Map();
function limited(ip, key, max, windowMs) {
  const k = `${key}:${ip}`, now = Date.now();
  const h = hits.get(k);
  if (!h || now - h.start > windowMs) { hits.set(k, { start: now, n: 1 }); return false; }
  if (hits.size > 5000) hits.clear();
  return ++h.n > max;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
});
const fail = (status, error) => json({ error }, status);

const randomHex = bytes => [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
const pick = a => a[crypto.getRandomValues(new Uint32Array(1))[0] % a.length];
async function sha256(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const nickname = () => `${pick(ADJECTIVES)} ${pick(NOUNS)} ${10 + (crypto.getRandomValues(new Uint32Array(1))[0] % 990)}`;

function cleanName(raw) {
  const name = String(raw ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (name.length < 3 || name.length > 24) return { error: 'A nickname needs 3 to 24 characters.' };
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(name)) return { error: 'Use letters, digits, spaces and . _ \' - only.' };
  const flat = name.toLowerCase().replace(/[^a-z]/g, '');
  if (BLOCKED.some(w => flat.includes(w))) return { error: 'Please choose another nickname.' };
  return { name };
}

async function player(req, env) {
  const m = /^Bearer ([0-9a-f]{64})$/.exec(req.headers.get('Authorization') || '');
  if (!m) return null;
  return env.DB.prepare('SELECT id, name, created, last_submit FROM players WHERE secret_hash = ?').bind(await sha256(m[1])).first();
}

// Weeks start on Monday 00:00 UTC; a week is named by that Monday's date.
function weekOf(ms) {
  const d = new Date(ms);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - (d.getUTCDay() + 6) % 7)).toISOString().slice(0, 10);
}
const weekEnd = week => Date.parse(`${week}T00:00:00Z`) + 7 * DAY;

// Works out how players finished every past week that isn't settled yet: each player's
// best place across the boards, kept when it's in the top 5. Both inserts ignore rows
// that exist, so running it twice is harmless. It runs from the cron trigger, and
// lazily on requests in case a trigger was missed.
let settledFor = null;   // per isolate: the current week, once nothing older is left
async function settleWeeks(env) {
  const current = weekOf(Date.now());
  if (settledFor === current) return;
  const { results } = await env.DB.prepare('SELECT DISTINCT week FROM weekly WHERE week < ? AND week NOT IN (SELECT week FROM settled_weeks)')
    .bind(current).all();
  for (const { week } of results) {
    await env.DB.batch([
      env.DB.prepare(`INSERT OR IGNORE INTO week_results (week, player, place, board)
        SELECT week, player, MIN(rn), board FROM (
          SELECT week, player, board, ROW_NUMBER() OVER (PARTITION BY board ORDER BY score DESC, date ASC) AS rn
          FROM weekly WHERE week = ?)
        WHERE rn <= 5 GROUP BY player`).bind(week),
      env.DB.prepare('INSERT OR IGNORE INTO settled_weeks (week) VALUES (?)').bind(week),
    ]);
  }
  // Weekly scores are only needed until their week is settled; keep two months of them.
  await env.DB.prepare('DELETE FROM weekly WHERE week < ?').bind(weekOf(Date.now() - 56 * DAY)).run();
  settledFor = current;
}

// Weeks each player finished #1, in the top 3 and in the top 5 (a #1 counts in all three).
const WINS = `LEFT JOIN (SELECT player, SUM(place = 1) AS w1, SUM(place <= 3) AS w3, COUNT(*) AS w5
  FROM week_results GROUP BY player) w ON w.player = p.id`;
const WINS_COLS = 'COALESCE(w.w1, 0) AS w1, COALESCE(w.w3, 0) AS w3, COALESCE(w.w5, 0) AS w5';

// A board is all-time (table scores) or this week's (table weekly). `a` is a table alias prefix.
const source = (period, board, a = '') => period === 'week'
  ? { table: 'weekly', where: `${a}board = ? AND ${a}week = ?`, args: [board, weekOf(Date.now())] }
  : { table: 'scores', where: `${a}board = ?`, args: [board] };

async function rankOf(env, period, board, score, date) {
  const src = source(period, board);
  const r = await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${src.table} WHERE ${src.where} AND (score > ? OR (score = ? AND date < ?))`)
    .bind(...src.args, score, score, date).first();
  return r.n + 1;
}

async function winsOf(env, id) {
  return env.DB.prepare(`SELECT ${WINS_COLS} FROM players p ${WINS} WHERE p.id = ?`).bind(id).first();
}

// Recomputes a contest score from the submitted log, the same way the app does, and
// rejects logs that couldn't have come from a real run.
const uncut = s => s.toUpperCase().replace(/[TO]/g, '0').replace(/N/g, '9').replace(/\D/g, '');
function scoreLog(log, minutes) {
  if (!Array.isArray(log) || !log.length || log.length > minutes * MAX_QSOS_PER_MIN) return null;
  let prev = null;
  const good = [];
  for (const q of log) {
    if (!q || typeof q !== 'object') return null;
    const { call, nr, gotCall, gotNr, wpm } = q;
    if (typeof call !== 'string' || !/^[A-Z]{1,2}\d[A-Z]{2,3}$/.test(call)) return null;
    if (typeof nr !== 'string' || !/^\d{3}$/.test(nr) || +nr < 1 || +nr > 500) return null;
    if (typeof gotCall !== 'string' || gotCall.length > 16 || typeof gotNr !== 'string' || gotNr.length > 8) return null;
    if (!Number.isInteger(wpm) || wpm < WPM_MIN || wpm > WPM_MAX) return null;
    // Adaptive speed moves +1 after a good QSO and -2 after a bust; fixed speed doesn't move.
    if (prev !== null && (wpm - prev > 1 || prev - wpm > 2)) return null;
    prev = wpm;
    const n = uncut(gotNr);
    if (gotCall.trim().toUpperCase() === call && n && +n === +nr) good.push(q);
  }
  if (!good.length) return null;
  const mults = new Set(good.map(q => q.call.match(/^[A-Z]+\d/)[0])).size;
  return { qsos: good.length, mults, score: good.length * mults, top: Math.max(...good.map(q => q.wpm)) };
}

async function handle(req, env) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  const ip = req.headers.get('CF-Connecting-IP') || 'local';
  const method = req.method;
  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (method !== 'GET' && limited(ip, 'write', 30, 60_000)) return fail(429, 'Too many requests. Try again in a minute.');
  const body = async () => { try { return await req.json(); } catch { return {}; } };

  if (path === '/api/players' && method === 'POST') {
    if (limited(ip, 'join', 5, 3_600_000)) return fail(429, 'Too many new players from here. Try again later.');
    const secret = randomHex(32), id = randomHex(5), name = nickname(), created = Date.now();
    await env.DB.prepare('INSERT INTO players (id, secret_hash, name, created) VALUES (?, ?, ?, ?)')
      .bind(id, await sha256(secret), name, created).run();
    return json({ secret, id, name, created }, 201);
  }

  if (path === '/api/leaderboard' && method === 'GET') {
    const board = url.searchParams.get('board');
    if (!BOARDS[board]) return fail(400, 'Unknown board.');
    await settleWeeks(env);
    const period = url.searchParams.get('period') === 'week' ? 'week' : 'all';
    const src = source(period, board), srcS = source(period, board, 's.');
    const { results } = await env.DB.prepare(`SELECT p.id, p.name, s.score, s.qsos, s.mults, s.top, s.date, ${WINS_COLS}
      FROM ${src.table} s JOIN players p ON p.id = s.player ${WINS} WHERE ${srcS.where} ORDER BY s.score DESC, s.date ASC LIMIT ?`)
      .bind(...src.args, TOP_N).all();
    const top = results.map((r, i) => ({ rank: i + 1, ...r }));
    const me = await player(req, env);
    let mine = null, wins = null;
    if (me) {
      wins = await winsOf(env, me.id);
      const s = await env.DB.prepare(`SELECT score, qsos, mults, top, date FROM ${src.table} WHERE ${src.where} AND player = ?`).bind(...src.args, me.id).first();
      if (s) mine = { rank: await rankOf(env, period, board, s.score, s.date), id: me.id, name: me.name, ...s, ...wins };
    }
    const total = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${src.table} WHERE ${src.where}`).bind(...src.args).first()).n;
    const week = weekOf(Date.now());
    return json({ board, period, top, me: mine, wins, total, week, closes: weekEnd(week) });
  }

  if (!path.startsWith('/api/')) return fail(404, 'Not found.');
  const me = await player(req, env);
  if (!me) return fail(401, 'Unknown player code.');

  if (path === '/api/me' && method === 'GET') {
    await settleWeeks(env);
    const week = weekOf(Date.now());
    const cols = 'board, score, qsos, mults, top, date';
    const all = await env.DB.prepare(`SELECT ${cols} FROM scores WHERE player = ?`).bind(me.id).all();
    const wk = await env.DB.prepare(`SELECT ${cols} FROM weekly WHERE player = ? AND week = ?`).bind(me.id, week).all();
    const scores = [];
    for (const [period, rows] of [['all', all.results], ['week', wk.results]])
      for (const s of rows) scores.push({ period, ...s, rank: await rankOf(env, period, s.board, s.score, s.date) });
    return json({ id: me.id, name: me.name, created: me.created, scores, wins: await winsOf(env, me.id), week, closes: weekEnd(week) });
  }

  if (path === '/api/me' && method === 'PATCH') {
    const c = cleanName((await body()).name);
    if (c.error) return fail(400, c.error);
    await env.DB.prepare('UPDATE players SET name = ? WHERE id = ?').bind(c.name, me.id).run();
    return json({ id: me.id, name: c.name });
  }

  if (path === '/api/me' && method === 'DELETE') {
    await env.DB.batch([
      env.DB.prepare('DELETE FROM scores WHERE player = ?').bind(me.id),
      env.DB.prepare('DELETE FROM weekly WHERE player = ?').bind(me.id),
      env.DB.prepare('DELETE FROM week_results WHERE player = ?').bind(me.id),
      env.DB.prepare('DELETE FROM players WHERE id = ?').bind(me.id),
    ]);
    return json({ deleted: true });
  }

  if (path === '/api/scores' && method === 'POST') {
    const { board, log } = await body();
    const minutes = BOARDS[board];
    if (!minutes) return fail(400, 'Unknown board.');
    // A run of N minutes can't end sooner than N minutes after the previous one did.
    const now = Date.now();
    if (now - me.last_submit < minutes * 60_000 * 0.9) return fail(429, 'That run ended too soon after the last one.');
    const s = scoreLog(log, minutes);
    if (!s) return fail(400, 'That log doesn\'t look like a valid run.');
    await env.DB.prepare('UPDATE players SET last_submit = ? WHERE id = ?').bind(now, me.id).run();
    const prev = await env.DB.prepare('SELECT score, date FROM scores WHERE player = ? AND board = ?').bind(me.id, board).first();
    const best = !prev || s.score > prev.score;
    if (best) {
      await env.DB.prepare(`INSERT INTO scores (player, board, score, qsos, mults, top, date) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (player, board) DO UPDATE SET score = excluded.score, qsos = excluded.qsos, mults = excluded.mults, top = excluded.top, date = excluded.date`)
        .bind(me.id, board, s.score, s.qsos, s.mults, s.top, now).run();
    }
    const week = weekOf(now);
    const prevWeek = await env.DB.prepare('SELECT score, date FROM weekly WHERE player = ? AND board = ? AND week = ?').bind(me.id, board, week).first();
    const weekBest = !prevWeek || s.score > prevWeek.score;
    if (weekBest) {
      await env.DB.prepare(`INSERT INTO weekly (player, board, week, score, qsos, mults, top, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (player, board, week) DO UPDATE SET score = excluded.score, qsos = excluded.qsos, mults = excluded.mults, top = excluded.top, date = excluded.date`)
        .bind(me.id, board, week, s.score, s.qsos, s.mults, s.top, now).run();
    }
    const rank = best ? await rankOf(env, 'all', board, s.score, now) : await rankOf(env, 'all', board, prev.score, prev.date);
    const weekRank = weekBest ? await rankOf(env, 'week', board, s.score, now) : await rankOf(env, 'week', board, prevWeek.score, prevWeek.date);
    return json({ board, ...s, best, rank, bestScore: best ? s.score : prev.score, weekBest, weekRank, weekScore: weekBest ? s.score : prevWeek.score });
  }

  return fail(404, 'Not found.');
}

export default {
  // Cron trigger (wrangler.jsonc): closes the week that has just ended.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(settleWeeks(env));
  },
  async fetch(req, env) {
    try {
      return await handle(req, env);
    } catch (e) {
      console.error(e);
      return fail(500, 'Something went wrong on the server.');
    }
  },
};
