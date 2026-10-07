'use strict';

const DATA = window.HAREC_DATA;
const SECTIONS = DATA.sections;
const SECTION = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
const QUESTIONS = DATA.questions;
const BY_ID = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const SET_NUMBERS = [...new Set(QUESTIONS.map(q => q.set))].sort((a, b) => a - b);
const PDF_OFFSET = 24;
const EXAM_SECONDS = 2 * 60 * 60;
const PASS_RATIO = 0.6;
const LETTERS = 'ABCD';

const app = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const topStatus = document.getElementById('topbar-status');

/* ---------- storage (per-viewer convenience; app works without it) ---------- */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('harec.' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('harec.' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
  remove(key) {
    try { localStorage.removeItem('harec.' + key); } catch { /* storage unavailable */ }
  },
};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const half = sec => sec.startsWith('A') ? 'A' : 'B';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normText = t => t.toLowerCase().replace(/[^a-z0-9]/g, '');

function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// A presented question: the bank question plus the display order of its options.
function present(q, shuffleOptions) {
  return { id: q.id, order: shuffleOptions ? shuffle([0, 1, 2, 3]) : [0, 1, 2, 3] };
}
const correctPos = item => item.order.indexOf(BY_ID[item.id].answer);

/* ---------- per-question statistics ---------- */
let stats = store.get('stats', {});
function record(id, ok) {
  const s = stats[id] || { c: 0, w: 0 };
  ok ? s.c++ : s.w++;
  s.last = ok ? 1 : 0;
  stats[id] = s;
  store.set('stats', stats);
}

/* ---------- exam composition ---------- */
// One question per syllabus slot: each section gets its official count, drawn
// from that section across every set, without repeating a question text.
function randomExam() {
  const used = new Set();
  const picked = [];
  for (const sec of SECTIONS) {
    const pool = shuffle(QUESTIONS.filter(q => q.section === sec.id));
    // Prefer questions not seen yet, then ones answered wrongly, then the rest.
    const rank = q => !stats[q.id] ? 0 : stats[q.id].last === 0 ? 1 : 2;
    pool.sort((a, b) => rank(a) - rank(b));
    let n = 0;
    for (const q of pool) {
      const key = normText(q.text);
      if (used.has(key)) continue;
      used.add(key);
      picked.push(q);
      if (++n === sec.count) break;
    }
  }
  return picked;
}

const setExam = n => QUESTIONS.filter(q => q.set === n).sort((a, b) => a.num - b.num);

/* ---------- theme ---------- */
const root = document.documentElement;
function applyTheme(t) {
  if (t) root.dataset.theme = t; else delete root.dataset.theme;
}
applyTheme(store.get('theme', null));
document.getElementById('theme-toggle').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  applyTheme(next);
  store.set('theme', next);
});

/* ---------- icons ---------- */
const ICON = {
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6M9 19h3"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19h18M6 19v-3h12v3M9 16l9-7M18 9a1.5 1.5 0 1 0 0-.01"/></svg>',
};

/* ---------- views ---------- */
let state = { view: 'home' };
// The app is usable only once the terms below are accepted. Bump TERMS_VERSION
// when their wording changes, so everyone has to accept them again.
const TERMS_VERSION = 1;
let termsAccepted = store.get('terms', 0) >= TERMS_VERSION;
let timerHandle = null;
let cueHandle = null;

function go(view, extra = {}) {
  clearInterval(timerHandle);
  timerHandle = null;
  clearTimeout(cueHandle);
  Morse.stop();
  dropKeyer();
  state = { ...extra, view };
  render();
  window.scrollTo({ top: 0 });
}

function render() {
  const views = { home: renderHome, practiceSetup: renderPracticeSetup, practice: renderPractice,
    practiceDone: renderPracticeDone, examSetup: renderExamSetup, exam: renderExam, results: renderResults,
    morse: renderMorse, koch: renderKoch, kochDone: renderKochDone };
  app.innerHTML = `<div class="fade-in">${termsAccepted ? views[state.view]() : renderTerms()}</div>`;
  topStatus.textContent = state.view === 'exam' || !termsAccepted ? ''
    : MORSE_VIEWS.includes(state.view) ? `Koch lesson ${koch.unlocked + 1} of ${Morse.LESSONS.length}`
    : `${QUESTIONS.length} questions · ${SET_NUMBERS.length} sets`;
  if (state.view === 'exam') startTimer();
  document.getElementById('k-input')?.focus();
}

/* ---------- home ---------- */
function renderHome() {
  const entries = Object.values(stats);
  const attempts = entries.reduce((n, s) => n + s.c + s.w, 0);
  const correct = entries.reduce((n, s) => n + s.c, 0);
  const history = store.get('history', []);
  const passed = history.filter(h => h.pass).length;
  const saved = store.get('examInProgress', null);
  return `
    <section class="hero">
      <div>
        <div class="eyebrow">IRTS HAREC · Amateur Station Licence</div>
        <h1 style="margin-top:10px">Get on the air.<br><span class="glow">Pass the HAREC.</span></h1>
        <p class="lead">${QUESTIONS.length} questions across all ${SECTIONS.length} syllabus sections, each with an explanation and the Study Guide page where you can check it.</p>
      </div>
      <div class="card dial">
        <div class="dial-scale"><span>3.5</span><span>7.0</span><span>10.1</span><span>14.0</span><span>21.0</span><span>28.0</span></div>
        <div class="dial-ticks"><div class="dial-needle"></div></div>
        <div class="stat-grid">
          <div class="stat"><div class="v">${Object.keys(stats).length}</div><div class="k">questions seen</div></div>
          <div class="stat"><div class="v">${attempts ? Math.round(100 * correct / attempts) + '%' : '—'}</div><div class="k">accuracy</div></div>
          <div class="stat"><div class="v">${passed}/${history.length}</div><div class="k">exams passed</div></div>
        </div>
      </div>
    </section>
    ${noticeHtml()}
    ${saved ? `
      <div class="card start-bar" style="margin-bottom:20px">
        <div class="summary"><b>Exam in progress</b> · ${esc(saved.label)} · ${saved.answers.filter(a => a !== null).length}/${saved.items.length} answered${saved.timed ? ` · ${fmtTime(saved.remaining)} left` : ''}</div>
        <div class="btn-row"><button class="btn btn-ghost btn-danger" data-action="discardExam">Discard</button><button class="btn btn-primary" data-action="resumeExam">Resume exam</button></div>
      </div>` : ''}
    <section class="modes">
      <button class="card mode-card" data-go="practiceSetup">
        <span class="go">→</span>
        <div class="icon">${ICON.bolt}</div>
        <h2>Question practice</h2>
        <p>One question at a time. Pick an answer and see straight away whether it's right, with the explanation.</p>
        <ul><li>Practise by section or by set</li><li>Wrongly answered questions can come first</li><li>Study Guide page for every answer</li></ul>
      </button>
      <button class="card mode-card" data-go="examSetup">
        <span class="go">→</span>
        <div class="icon">${ICON.clipboard}</div>
        <h2>Exam practice</h2>
        <p>A full 60-question paper under exam conditions. You're marked at the end, with every answer reviewed.</p>
        <ul><li>Any of the ${SET_NUMBERS.length} sets, or a random paper built to the syllabus</li><li>2-hour timer, flag questions and come back to them</li><li>Pass mark 60% in each section, as in the real exam</li></ul>
      </button>
      <button class="card mode-card" data-go="morse">
        <span class="go">→</span>
        <div class="icon">${ICON.key}</div>
        <h2>Morse code (CW)</h2>
        <p>Learn to copy Morse by ear with the Koch method, practise sending with a key, or hear any text sent in Morse.</p>
        <ul><li>${Morse.LESSONS.length} Koch lessons, two new characters each</li><li>Unlock the next lesson at 90% copy accuracy</li><li>Full-speed characters, ${Morse.MIN_WPM}–${Morse.MAX_WPM} WPM</li><li>Straight key or iambic paddles, with speed and error marking</li></ul>
      </button>
    </section>
    ${history.length ? `
      <section class="card history">
        <div class="btn-row"><h3>Recent exams</h3><span class="spacer"></span><button class="btn btn-ghost" data-action="clearHistory" style="padding:6px 12px;font-size:12.5px">Clear</button></div>
        <table>
          <thead><tr><th>When</th><th>Paper</th><th>Section A</th><th>Section B</th><th>Total</th><th>Time</th><th></th></tr></thead>
          <tbody>${history.slice(0, 8).map(h => `
            <tr><td class="muted">${fmtDate(h.date)}</td><td>${esc(h.label)}</td>
              <td class="num">${h.a}/${h.aOf}</td><td class="num">${h.b}/${h.bOf}</td>
              <td class="num"><b>${Math.round(100 * (h.a + h.b) / (h.aOf + h.bOf))}%</b></td>
              <td class="num muted">${fmtTime(h.seconds)}</td>
              <td><span class="pill ${h.pass ? 'ok' : 'bad'}">${h.pass ? 'Pass' : 'Fail'}</span></td></tr>`).join('')}
          </tbody>
        </table>
      </section>` : ''}`;
}

/* ---------- terms ---------- */
function noticeHtml(gate = false) {
  return `
    <aside class="card notice" role="note">
      <div class="notice-icon">${ICON.warn}</div>
      <div>
        <h3>Unofficial: please read</h3>
        <p>HAREC Trainer is an independent project. It is <b>not affiliated with, endorsed by or connected in any way to the IRTS, ComReg or any other governmental or non-governmental organisation or regulatory body</b>.</p>
        <p>The content may contain errors or be out of date, so always check it against the official material. The authors accept no responsibility or liability for any errors, or for any consequences of using this site or application.</p>
        ${gate ? `
        <label class="terms-check"><input type="checkbox" data-terms> <span>I have read and accept these terms.</span></label>
        <div class="btn-row" style="margin-top:16px"><button class="btn btn-primary" data-action="acceptTerms" id="terms-go" disabled>Continue →</button></div>`
        : '<p><b>By using this site or application, you accept these terms.</b></p>'}
      </div>
    </aside>`;
}

function renderTerms() {
  return `
    <div class="terms-gate">
      <div class="eyebrow">Welcome to HAREC Trainer</div>
      <h2 style="margin:8px 0 20px">Before you start</h2>
      ${noticeHtml(true)}
    </div>`;
}

/* ---------- practice setup ---------- */
const practiceCfg = Object.assign({
  source: 'all', set: 1, sections: SECTIONS.map(s => s.id), length: 20, shuffle: true, missedFirst: true,
}, store.get('practiceCfg', {}));

function practicePool() {
  return QUESTIONS.filter(q => practiceCfg.sections.includes(q.section)
    && (practiceCfg.source === 'all' || q.set === practiceCfg.set));
}

function renderPracticeSetup() {
  const pool = practicePool();
  const missed = pool.filter(q => stats[q.id] && stats[q.id].last === 0).length;
  const group = h => {
    const secs = SECTIONS.filter(s => half(s.id) === h);
    return `
      <div class="chip-group">
        <div class="chip-group-title">Section ${h}: ${h === 'A' ? 'Technical' : 'Operating, Rules & Regulations'}
          <button data-action="secGroup" data-half="${h}">toggle all</button></div>
        <div class="chips">${secs.map(s => `
          <button class="chip ${practiceCfg.sections.includes(s.id) ? 'on' : ''}" data-action="secToggle" data-sec="${s.id}"><b>${s.id}</b>${esc(s.title)}</button>`).join('')}
        </div>
      </div>`;
  };
  const n = practiceCfg.length === 0 ? pool.length : Math.min(practiceCfg.length, pool.length);
  return `
    <div class="setup">
      <div class="setup-head">
        <div><div class="eyebrow">Question practice</div><h2 style="margin-top:6px">Choose what to practise</h2></div>
        <button class="btn btn-ghost" data-go="home">← Back</button>
      </div>
      <div class="card panel">
        <h3>Questions from</h3>
        <p class="hint">Use every set, or stick to one paper.</p>
        <div class="segmented">
          <button class="${practiceCfg.source === 'all' ? 'on' : ''}" data-action="pSource" data-v="all">All ${SET_NUMBERS.length} sets</button>
          <button class="${practiceCfg.source === 'set' ? 'on' : ''}" data-action="pSource" data-v="set">One set</button>
        </div>
        ${practiceCfg.source === 'set' ? `
          <div class="set-grid" style="margin-top:14px">${SET_NUMBERS.map(n => `
            <button class="set-tile ${practiceCfg.set === n ? 'on' : ''}" data-action="pSet" data-n="${n}"><div class="n">${pad2(n)}</div><div class="s">Set ${n}</div></button>`).join('')}
          </div>` : ''}
      </div>
      <div class="card panel">
        <h3>Syllabus sections</h3>
        <p class="hint">Choose the topics you want to drill.</p>
        ${group('A')}${group('B')}
      </div>
      <div class="card panel">
        <h3>Session</h3>
        <p class="hint">How many questions, and how they're ordered.</p>
        <div class="segmented" style="margin-bottom:18px">
          ${[10, 20, 50, 0].map(v => `<button class="${practiceCfg.length === v ? 'on' : ''}" data-action="pLength" data-v="${v}">${v || 'All'}</button>`).join('')}
        </div>
        <div class="toggle-list">
          ${toggle('missedFirst', 'Wrong answers first', `Questions you last got wrong come first (${missed} in this selection), then ones you haven't seen.`)}
          ${toggle('shuffle', 'Shuffle answer order', 'Learn the answer, not its letter.')}
        </div>
      </div>
      <div class="card start-bar">
        <div class="summary"><b>${n}</b> question${n === 1 ? '' : 's'} from a pool of <b>${pool.length}</b></div>
        <button class="btn btn-primary" data-action="startPractice" ${pool.length ? '' : 'disabled'}>Start practice →</button>
      </div>
    </div>`;
}

function toggle(key, title, desc, cfg = practiceCfg) {
  return `
    <label class="toggle"><input type="checkbox" data-toggle="${key}" ${cfg[key] ? 'checked' : ''}><span class="track"></span>
      <span><div class="t">${title}</div><div class="d">${desc}</div></span></label>`;
}

function startPractice() {
  let pool = shuffle(practicePool());
  if (practiceCfg.missedFirst) {
    const rank = q => !stats[q.id] ? 1 : stats[q.id].last === 0 ? 0 : 2;
    pool.sort((a, b) => rank(a) - rank(b));
  }
  if (practiceCfg.length) pool = pool.slice(0, practiceCfg.length);
  go('practice', {
    items: pool.map(q => present(q, practiceCfg.shuffle)),
    index: 0, chosen: null, results: [],
  });
}

/* ---------- shared question rendering ---------- */
function figureHtml(q) {
  return q.figure ? `<figure class="figure"><img src="${q.figure}" alt="Figure for this question"></figure>` : '';
}

function pageRef(q) {
  return `<span class="page-ref">${ICON.book}Study Guide <b>p. ${q.page}</b><span>(PDF page ${q.page + PDF_OFFSET})</span></span>`;
}

function sectionPill(q) {
  return `<span class="pill accent">${q.section}</span><span class="pill">${esc(SECTION[q.section].title)}</span>`;
}

// Options of an answered question: the correct one in green, a wrong pick in red.
function revealedOptions(item, chosen, animate) {
  const q = BY_ID[item.id];
  const right = correctPos(item);
  return item.order.map((orig, pos) => {
    let cls = 'dim', mark = '';
    if (pos === right) { cls = 'correct'; mark = '✓'; }
    else if (pos === chosen) { cls = 'wrong'; mark = '✗'; }
    if (animate && pos === chosen) cls += pos === right ? ' just-correct' : ' just-wrong';
    return `<button class="option ${cls}" disabled><span class="letter">${LETTERS[pos]}</span><span>${esc(q.options[orig])}</span><span class="mark">${mark}</span></button>`;
  }).join('');
}

function explanation(item, chosen) {
  const q = BY_ID[item.id];
  const right = correctPos(item);
  const ok = chosen === right;
  const verdict = chosen === null ? `Not answered. The correct answer is ${LETTERS[right]}.`
    : ok ? 'Correct!' : `Not quite. The correct answer is ${LETTERS[right]}.`;
  return `
    <div class="explain ${ok ? 'ok' : 'bad'}">
      <div class="badge">${ok ? '✓' : '✗'}</div>
      <div><div class="verdict">${verdict}</div><p class="why">${esc(q.explanation)}</p>${pageRef(q)}</div>
    </div>`;
}

/* ---------- practice ---------- */
function renderPractice() {
  const { items, index, chosen, results } = state;
  const item = items[index];
  const q = BY_ID[item.id];
  const okCount = results.filter(Boolean).length;
  const answered = chosen !== null;
  const last = index === items.length - 1;
  return `
    <div class="quiz">
      <div class="card session-bar">
        <span class="q-num">${index + 1} / ${items.length}</span>
        <div class="progress"><i style="width:${100 * (index + (answered ? 1 : 0)) / items.length}%"></i></div>
        <span class="score-chip"><span class="ok">✓ ${okCount}</span><span class="bad">✗ ${results.length - okCount}</span></span>
        <button class="btn btn-ghost" data-action="endPractice" style="padding:7px 14px">End</button>
      </div>
      <article class="card q-card">
        <div class="q-head">${sectionPill(q)}<span class="spacer"></span><span class="q-num">Set ${pad2(q.set)} · Q${q.num}</span></div>
        <p class="q-text">${esc(q.text)}</p>
        ${figureHtml(q)}
        <div class="options">${answered ? revealedOptions(item, chosen, true)
          : item.order.map((orig, pos) => `
            <button class="option" data-action="pAnswer" data-pos="${pos}"><span class="letter">${LETTERS[pos]}</span><span>${esc(q.options[orig])}</span><span class="mark"></span></button>`).join('')}
        </div>
        ${answered ? explanation(item, chosen) : ''}
        <div class="q-foot">
          <span class="hint-keys">${answered ? '<span class="kbd">Enter</span> next' : '<span class="kbd">1</span>–<span class="kbd">4</span> or <span class="kbd">A</span>–<span class="kbd">D</span> to answer'}</span>
          <span class="spacer"></span>
          ${answered ? `<button class="btn btn-primary" data-action="pNext">${last ? 'See results' : 'Next question →'}</button>` : ''}
        </div>
      </article>
    </div>`;
}

function practiceAnswer(pos) {
  if (state.chosen !== null) return;
  const item = state.items[state.index];
  const ok = pos === correctPos(item);
  record(item.id, ok);
  state.chosen = pos;
  state.results.push(ok);
  state.answers = (state.answers || []).concat(pos);
  render();
}

function practiceNext() {
  if (state.chosen === null) return;
  if (state.index === state.items.length - 1) return finishPractice();
  state.index++;
  state.chosen = null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function finishPractice() {
  const n = state.results.length;
  go('practiceDone', { items: state.items.slice(0, n), answers: state.answers || [], results: state.results });
}

function renderPracticeDone() {
  const { items, answers, results } = state;
  const ok = results.filter(Boolean).length;
  const pct = results.length ? Math.round(100 * ok / results.length) : 0;
  const missed = items.map((it, i) => [it, answers[i]]).filter(([it, a]) => a !== correctPos(it));
  return `
    <div class="card result-hero">
      ${ring(pct, `${ok}/${results.length}`)}
      <div>
        <div class="eyebrow">Practice complete</div>
        <div class="verdict-big ${pct >= 60 ? 'pass' : 'fail'}" style="margin-top:6px">${pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good going.' : 'Keep practising.'}</div>
        <p class="muted">You answered ${ok} of ${results.length} correctly. ${missed.length ? 'The questions you missed are below, so you can go over them again.' : 'No mistakes this time.'}</p>
        <div class="btn-row" style="margin-top:14px">
          <button class="btn btn-primary" data-action="startPractice">Practise again</button>
          <button class="btn" data-go="practiceSetup">Change selection</button>
          <button class="btn btn-ghost" data-go="home">Home</button>
        </div>
      </div>
    </div>
    ${missed.length ? `<section class="review"><div class="review-head"><h3>Questions to review (${missed.length})</h3></div>
      ${missed.map(([it, a]) => reviewItem(it, a)).join('')}</section>` : ''}`;
}

/* ---------- exam setup ---------- */
const examCfg = Object.assign({ paper: 'random', timed: true, shuffle: false }, store.get('examCfg', {}));

function renderExamSetup() {
  const best = {};
  for (const h of store.get('history', [])) {
    const pct = Math.round(100 * (h.a + h.b) / (h.aOf + h.bOf));
    if (h.set && !(best[h.set] >= pct)) best[h.set] = pct;
  }
  const label = examCfg.paper === 'random' ? 'a random syllabus-weighted paper' : `Set ${pad2(examCfg.paper)}`;
  return `
    <div class="setup">
      <div class="setup-head">
        <div><div class="eyebrow">Exam practice</div><h2 style="margin-top:6px">Choose a paper</h2></div>
        <button class="btn btn-ghost" data-go="home">← Back</button>
      </div>
      <div class="card panel">
        <h3>Paper</h3>
        <p class="hint">A random paper takes the official number of questions per syllabus section (for example 5 on Safety and 3 on Q-codes) from all ${SET_NUMBERS.length} sets. It prefers questions you haven't seen yet, then ones you got wrong.</p>
        <div class="set-grid">
          <button class="set-tile random ${examCfg.paper === 'random' ? 'on' : ''}" data-action="ePaper" data-v="random">
            <div class="n">🎲 Random</div><div class="s">Built from all sets</div></button>
          ${SET_NUMBERS.map(n => `
            <button class="set-tile ${examCfg.paper === n ? 'on' : ''}" data-action="ePaper" data-v="${n}">
              <div class="n">${pad2(n)}</div><div class="s">${best[n] !== undefined ? `Best ${best[n]}%` : 'Not taken'}</div></button>`).join('')}
        </div>
      </div>
      <div class="card panel">
        <h3>Conditions</h3>
        <p class="hint">The real exam is 60 questions in 2 hours, and you need 60% in both Section A and Section B.</p>
        <div class="toggle-list">
          ${toggle('timed', '2-hour time limit', 'The paper is submitted automatically when time runs out.', examCfg)}
          ${toggle('shuffle', 'Shuffle answer order', 'Mix up the A–D options, useful when retaking a set.', examCfg)}
        </div>
      </div>
      <div class="card start-bar">
        <div class="summary">You're about to sit <b>${label}</b>: 60 questions${examCfg.timed ? ', 2 hours' : ', no time limit'}</div>
        <button class="btn btn-primary" data-action="startExam">Start exam →</button>
      </div>
    </div>`;
}

function startExam(paper = examCfg.paper) {
  const qs = paper === 'random' ? randomExam() : setExam(paper);
  const exam = {
    label: paper === 'random' ? 'Random paper' : `Set ${pad2(paper)}`,
    set: paper === 'random' ? null : paper,
    items: qs.map(q => present(q, examCfg.shuffle)),
    answers: qs.map(() => null),
    flags: qs.map(() => false),
    index: 0,
    timed: examCfg.timed,
    remaining: EXAM_SECONDS,
    elapsed: 0,
  };
  go('exam', { exam });
  saveExam();
}

/* ---------- exam ---------- */
const saveExam = () => store.set('examInProgress', state.exam);

function renderExam() {
  const ex = state.exam;
  const item = ex.items[ex.index];
  const q = BY_ID[item.id];
  const chosen = ex.answers[ex.index];
  const answered = ex.answers.filter(a => a !== null).length;
  const cell = i => `<button class="nav-cell ${ex.answers[i] !== null ? 'answered' : ''} ${i === ex.index ? 'current' : ''} ${ex.flags[i] ? 'flagged' : ''}" data-action="eJump" data-i="${i}">${i + 1}</button>`;
  const firstB = ex.items.findIndex(it => half(BY_ID[it.id].section) === 'B');
  return `
    <div class="quiz with-nav">
      <article class="card q-card">
        <div class="q-head">
          <span class="q-num">Question ${ex.index + 1} of ${ex.items.length}</span>
          <span class="spacer"></span>${sectionPill(q)}
        </div>
        <p class="q-text">${esc(q.text)}</p>
        ${figureHtml(q)}
        <div class="options">${item.order.map((orig, pos) => `
          <button class="option ${chosen === pos ? 'selected' : ''}" data-action="eAnswer" data-pos="${pos}"><span class="letter">${LETTERS[pos]}</span><span>${esc(q.options[orig])}</span><span class="mark"></span></button>`).join('')}
        </div>
        <div class="q-foot">
          <button class="btn" data-action="eMove" data-d="-1" ${ex.index === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn flag-btn ${ex.flags[ex.index] ? 'on' : ''}" data-action="eFlag">${ICON.flag}${ex.flags[ex.index] ? 'Flagged' : 'Flag'}</button>
          <span class="spacer"></span>
          <span class="hint-keys"><span class="kbd">1</span>–<span class="kbd">4</span> answer · <span class="kbd">←</span><span class="kbd">→</span> move · <span class="kbd">F</span> flag</span>
          ${ex.index < ex.items.length - 1
            ? '<button class="btn btn-primary" data-action="eMove" data-d="1">Next →</button>'
            : '<button class="btn btn-primary" data-action="eSubmit">Finish exam</button>'}
        </div>
      </article>
      <aside class="card navigator">
        <div class="muted" style="font-size:12px">${esc(ex.label)} · ${ex.timed ? 'time left' : 'time elapsed'}</div>
        <div class="timer" id="timer">${fmtTime(ex.timed ? ex.remaining : ex.elapsed)}</div>
        <div class="progress" style="margin:10px 0 2px"><i style="width:${100 * answered / ex.items.length}%"></i></div>
        <div class="muted" style="font-size:12px">${answered} of ${ex.items.length} answered</div>
        <div class="nav-section-label">Section A</div>
        <div class="nav-grid">${ex.items.slice(0, firstB).map((_, i) => cell(i)).join('')}</div>
        <div class="nav-section-label">Section B</div>
        <div class="nav-grid">${ex.items.slice(firstB).map((_, i) => cell(firstB + i)).join('')}</div>
        <div class="legend"><span class="a">answered</span><span class="f">flagged</span></div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px" data-action="eSubmit">Submit exam</button>
        <button class="btn btn-ghost" style="width:100%;margin-top:8px" data-action="eQuit">Save & exit</button>
      </aside>
    </div>`;
}

function startTimer() {
  clearInterval(timerHandle);
  let ticks = 0;
  timerHandle = setInterval(() => {
    const ex = state.exam;
    if (!ex) return;
    ex.elapsed++;
    if (ex.timed) ex.remaining--;
    const el = document.getElementById('timer');
    if (el) {
      el.textContent = fmtTime(ex.timed ? ex.remaining : ex.elapsed);
      el.classList.toggle('low', ex.timed && ex.remaining <= 300);
    }
    if (++ticks % 5 === 0) saveExam();
    if (ex.timed && ex.remaining <= 0) submitExam(true);
  }, 1000);
}

function examMove(i) {
  const ex = state.exam;
  if (i < 0 || i >= ex.items.length) return;
  ex.index = i;
  saveExam();
  render();
}

function confirmModal(title, body, okLabel, onOk) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal="cancel">
      <div class="card modal" role="dialog" aria-modal="true">
        <h3>${title}</h3><p>${body}</p>
        <div class="btn-row"><button class="btn btn-ghost" data-modal="cancel">Cancel</button><button class="btn btn-primary" data-modal="ok">${okLabel}</button></div>
      </div>
    </div>`;
  const close = () => { modalRoot.innerHTML = ''; };
  modalRoot.onclick = e => {
    const t = e.target.closest('[data-modal]');
    if (!t || (t.classList.contains('modal-backdrop') && e.target !== t)) return;
    close();
    if (t.dataset.modal === 'ok') onOk();
  };
  modalRoot.querySelector('[data-modal="ok"]').focus();
}

function askSubmit() {
  const ex = state.exam;
  const open = ex.answers.filter(a => a === null).length;
  const flagged = ex.flags.filter(Boolean).length;
  const notes = [open && `${open} question${open === 1 ? ' is' : 's are'} unanswered`, flagged && `${flagged} flagged`].filter(Boolean);
  confirmModal('Submit your exam?', notes.length ? `${notes.join(', ')}. Unanswered questions are marked wrong.` : 'You have answered every question.',
    'Submit', () => submitExam(false));
}

function submitExam(timeUp) {
  const ex = state.exam;
  clearInterval(timerHandle);
  const marks = ex.items.map((it, i) => ex.answers[i] === correctPos(it));
  ex.items.forEach((it, i) => { if (ex.answers[i] !== null) record(it.id, marks[i]); });
  const score = h => ex.items.reduce((n, it, i) => n + (half(BY_ID[it.id].section) === h && marks[i] ? 1 : 0), 0);
  const of = h => ex.items.filter(it => half(BY_ID[it.id].section) === h).length;
  const a = score('A'), b = score('B'), aOf = of('A'), bOf = of('B');
  const pass = a >= Math.ceil(PASS_RATIO * aOf) && b >= Math.ceil(PASS_RATIO * bOf);
  const history = store.get('history', []);
  history.unshift({ date: Date.now(), label: ex.label, set: ex.set, a, b, aOf, bOf, pass, seconds: ex.elapsed });
  store.set('history', history.slice(0, 100));
  store.remove('examInProgress');
  go('results', { exam: ex, marks, a, b, aOf, bOf, pass, timeUp, filter: 'all' });
}

/* ---------- results ---------- */
function ring(pct, label, passAt = 60) {
  const r = 64, c = 2 * Math.PI * r;
  const color = pct >= passAt ? 'var(--ok)' : 'var(--bad)';
  return `
    <div class="ring"><svg viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--border)" stroke-width="12"/>
      <circle cx="75" cy="75" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}" style="transition:stroke-dashoffset .8s ease"/>
    </svg><div class="val"><div><b>${pct}%</b><span>${label}</span></div></div></div>`;
}

function sectionScore(name, got, of) {
  const need = Math.ceil(PASS_RATIO * of);
  const ok = got >= need;
  return `
    <div class="section-score">
      <div class="top"><span><b>${name}</b> <span class="muted" style="font-size:12px">need ${need}</span></span><span class="big">${got}<span class="muted" style="font-size:14px">/${of}</span></span></div>
      <div class="bar ${ok ? '' : 'fail'}"><i style="width:${100 * got / of}%"></i><span class="mark60"></span></div>
    </div>`;
}

function reviewItem(item, chosen, i, flagged) {
  const q = BY_ID[item.id];
  const right = correctPos(item);
  const cls = chosen === null || chosen === undefined ? 'skip' : chosen === right ? 'ok' : 'bad';
  const status = cls === 'ok' ? '<span class="pill ok">✓ Correct</span>' : cls === 'bad' ? '<span class="pill bad">✗ Incorrect</span>' : '<span class="pill">Unanswered</span>';
  const yours = cls === 'bad' ? `<span class="pill">Your answer: ${LETTERS[chosen]}</span>` : '';
  return `
    <article class="card review-item ${cls}">
      <div class="q-head">${i !== undefined ? `<span class="q-num">Q${i + 1}</span>` : ''}${status}${yours}${flagged ? `<span class="pill flag">${ICON.flag}Flagged</span>` : ''}<span class="spacer"></span>${sectionPill(q)}</div>
      <p class="q-text">${esc(q.text)}</p>
      ${figureHtml(q)}
      <div class="options">${revealedOptions(item, chosen ?? null, false)}</div>
      ${explanation(item, chosen ?? null)}
    </article>`;
}

function renderResults() {
  const { exam: ex, marks, a, b, aOf, bOf, pass, timeUp, filter } = state;
  const total = a + b, of = aOf + bOf;
  const pct = Math.round(100 * total / of);
  const bySec = SECTIONS.map(s => {
    const idx = ex.items.map((it, i) => i).filter(i => BY_ID[ex.items[i].id].section === s.id);
    return { s, got: idx.filter(i => marks[i]).length, of: idx.length };
  }).filter(r => r.of);
  const counts = {
    all: ex.items.length,
    wrong: marks.filter((m, i) => !m && ex.answers[i] !== null).length,
    skipped: ex.answers.filter(x => x === null).length,
    flagged: ex.flags.filter(Boolean).length,
  };
  const show = ex.items.map((_, i) => i).filter(i =>
    filter === 'all' || (filter === 'wrong' && !marks[i] && ex.answers[i] !== null)
    || (filter === 'skipped' && ex.answers[i] === null) || (filter === 'flagged' && ex.flags[i]));
  const half2 = rows => rows.map(r => `
    <div class="bd-row"><span class="code">${r.s.id}</span><span class="name">${esc(r.s.title)}</span><span class="sc">${r.got}/${r.of}</span>
      <div class="bar ${r.got / r.of >= PASS_RATIO ? '' : 'fail'}"><i style="width:${100 * r.got / r.of}%"></i></div></div>`).join('');
  return `
    <div class="card result-hero">
      ${ring(pct, `${total}/${of}`)}
      <div>
        <div class="eyebrow">${esc(ex.label)} · ${fmtTime(ex.elapsed)}${timeUp ? ' · time ran out' : ''}</div>
        <div class="verdict-big ${pass ? 'pass' : 'fail'}" style="margin-top:6px">${pass ? 'Pass, well done!' : 'Not a pass this time'}</div>
        <p class="muted" style="margin:4px 0 0">${pass ? 'You reached 60% in both sections.' : 'You need 60% in <b>each</b> section to pass.'}</p>
        <div class="section-scores">${sectionScore('Section A · Technical', a, aOf)}${sectionScore('Section B · Operating & Rules', b, bOf)}</div>
        <div class="btn-row" style="margin-top:18px">
          ${ex.set ? `<button class="btn btn-primary" data-action="retake">Retake Set ${pad2(ex.set)}</button>` : ''}
          <button class="btn ${ex.set ? '' : 'btn-primary'}" data-action="newRandom">New random paper</button>
          <button class="btn btn-ghost" data-go="home">Home</button>
        </div>
      </div>
    </div>
    <section class="card breakdown">
      <h3>By syllabus section</h3>
      <div class="breakdown-grid">
        <div>${half2(bySec.filter(r => half(r.s.id) === 'A'))}</div>
        <div>${half2(bySec.filter(r => half(r.s.id) === 'B'))}</div>
      </div>
    </section>
    <section class="review">
      <div class="review-head">
        <h3>Answer review</h3>
        <div class="segmented">
          ${[['all', 'All'], ['wrong', 'Incorrect'], ['skipped', 'Unanswered'], ['flagged', 'Flagged']].map(([k, l]) =>
            `<button class="${filter === k ? 'on' : ''}" data-action="rFilter" data-v="${k}">${l} · ${counts[k]}</button>`).join('')}
        </div>
      </div>
      ${show.length ? show.map(i => reviewItem(ex.items[i], ex.answers[i], i, ex.flags[i])).join('') : '<div class="card empty">No questions here.</div>'}
    </section>`;
}

/* ---------- Morse code ---------- */
const MORSE_VIEWS = ['morse', 'koch', 'kochDone'];
const KOCH_PASS = 90;
const EFF_MIN = 5, EFF_MAX = 15;
const SEND_MIN = 5, SEND_MAX = 30;   // sending speed; beginners key well below copying speed   // Farnsworth effective speed, kept below Morse.MIN_WPM
const morseCfg = Object.assign({
  tab: 'translate', wpm: 20, tone: 600, repeat: false, text: 'TNX FER QSO 73',
  lesson: null, rounds: 10, includePrev: true, farnsworth: false, effWpm: 8,
  sendKey: 'straight', sendWpm: 15, sendSrc: 'koch', ownText: '', swapPaddles: false, showCode: true,
}, store.get('morseCfg', {}));
morseCfg.sendWpm = Math.min(SEND_MAX, Math.max(SEND_MIN, morseCfg.sendWpm));
morseCfg.wpm = Math.min(Morse.MAX_WPM, Math.max(Morse.MIN_WPM, morseCfg.wpm));
morseCfg.effWpm = Math.min(EFF_MAX, Math.max(EFF_MIN, morseCfg.effWpm));
const saveMorse = () => store.set('morseCfg', morseCfg);
const koch = Object.assign({ unlocked: 0, best: {} }, store.get('koch', {}));
const saveKoch = () => store.set('koch', koch);
const kochLesson = () => Math.min(morseCfg.lesson ?? koch.unlocked, koch.unlocked);
// Koch lessons only: the translator always sends at standard spacing.
const sound = () => ({ wpm: morseCfg.wpm, tone: morseCfg.tone, eff: morseCfg.farnsworth ? morseCfg.effWpm : null });
const speedLabel = () => morseCfg.farnsworth ? `${morseCfg.wpm}/${morseCfg.effWpm} WPM` : `${morseCfg.wpm} WPM`;

const codeHtml = code => `<span class="code">${[...code].map(e => `<i class="${e === '.' ? 'dit' : 'dah'}"></i>`).join('')}</span>`;

function timingText() {
  const u = Morse.unitMs(morseCfg.wpm);
  const ms = n => Math.round(n * u) + ' ms';
  return `At ${morseCfg.wpm} WPM: dit ${ms(1)} · dah ${ms(3)} · gap inside a character ${ms(1)} · between characters ${ms(3)} · between words ${ms(7)}`;
}

function farnsworthText() {
  const gap = Morse.spacing(morseCfg.wpm, morseCfg.effWpm);
  const s = n => (n * Morse.unitMs(morseCfg.wpm) / 1000).toFixed(2) + ' s';
  return `Characters at ${morseCfg.wpm} WPM, overall ${morseCfg.effWpm} WPM: ${s(gap.char)} between characters, ${s(gap.word)} between words`;
}

function morseTokensHtml(text) {
  const toks = Morse.parse(text);
  if (!toks.length) return '<span class="muted">Type something above to see it in Morse code.</span>';
  return toks.map((t, i) => t.space ? `<span class="tok gap" id="mt-${i}"></span>`
    : `<span class="tok ${t.code ? '' : 'bad'}" id="mt-${i}"><span class="ch">${t.prosign ? `<span class="prosign">${esc(t.text)}</span>` : esc(t.text)}</span>${t.code ? codeHtml(t.code) : '<span class="code">no code</span>'}</span>`).join('');
}

function highlightTok(i) {
  document.querySelectorAll('.tok.on').forEach(el => el.classList.remove('on'));
  if (i !== null) document.getElementById('mt-' + i)?.classList.add('on');
}

function setPlayBtn() {
  const b = document.getElementById('m-play');
  if (b) b.textContent = Morse.playing() ? '■ Stop' : '▶ Play';
}

function renderMorse() {
  const tab = morseCfg.tab;
  return `
    <div class="setup">
      <div class="setup-head">
        <div><div class="eyebrow">Morse code (CW)</div><h2 style="margin-top:6px">${{ translate: 'Hear any text in Morse', koch: 'Koch method course', send: 'Send Morse with a key' }[tab]}</h2></div>
        <button class="btn btn-ghost" data-go="home">← Back</button>
      </div>
      <div><div class="segmented">
        <button class="${tab === 'translate' ? 'on' : ''}" data-action="mTab" data-v="translate">Translator</button>
        <button class="${tab === 'koch' ? 'on' : ''}" data-action="mTab" data-v="koch">Koch course</button>
        <button class="${tab === 'send' ? 'on' : ''}" data-action="mTab" data-v="send">Sending</button>
      </div></div>
      ${tab === 'send' ? sendPanel() : `
      <div class="card panel">
        <h3>Sound</h3>
        <p class="hint">Characters are always sent at full speed. Timing follows ITU-R M.1677-1, where the word PARIS defines the speed.</p>
        <div class="sound-row">
          <div class="speed"><label for="wpm">Speed</label>
            <input type="range" id="wpm" min="${Morse.MIN_WPM}" max="${Morse.MAX_WPM}" step="1" value="${morseCfg.wpm}" data-cfg="wpm">
            <output id="wpm-val">${morseCfg.wpm} WPM</output></div>
          ${toneHtml()}
        </div>
        <div class="muted timing" id="timing">${timingText()}</div>
      </div>
      ${tab === 'translate' ? translatorPanel() : kochPanel()}`}
    </div>`;
}

const toneHtml = () => `
  <div class="speed"><label>Tone</label><div class="segmented">
    ${[500, 600, 700, 800].map(v => `<button class="${morseCfg.tone === v ? 'on' : ''}" data-action="mTone" data-v="${v}">${v} Hz</button>`).join('')}
  </div></div>`;

function translatorPanel() {
  return `
    <div class="card panel">
      <h3>Text</h3>
      <p class="hint">Letters, digits and <span class="mono">. , : ? ' - / ( ) " = + @</span>. Put a prosign in angle brackets, such as <span class="mono">&lt;SK&gt;</span>, to send it as one character.</p>
      <textarea class="text-input" id="morse-text" data-morse-text rows="2" spellcheck="false" placeholder="Type a letter, word or phrase">${esc(morseCfg.text)}</textarea>
      <div class="morse-out" id="morse-out">${morseTokensHtml(morseCfg.text)}</div>
      <div class="btn-row" style="margin-top:20px;gap:24px">
        <button class="btn btn-primary" id="m-play" data-action="mPlay" style="min-width:110px">${Morse.playing() ? '■ Stop' : '▶ Play'}</button>
        ${toggle('repeat', 'Repeat continuously', 'Send the text again and again, with a word space in between, until you press Stop. Speed and tone changes apply from the next repeat.', morseCfg)}
      </div>
    </div>`;
}

function kochPanel() {
  const L = Morse.LESSONS;
  const sel = kochLesson();
  const fresh = L[sel];
  const earlier = Morse.learned(sel - 1);
  const parts = morseCfg.includePrev && sel ? 2 : 1;
  return `
    <div class="card panel">
      <h3>Lessons</h3>
      <p class="hint">Each lesson adds two characters in Koch order. Copy at least ${KOCH_PASS}% correctly in a full session to unlock the next lesson. A short session every day works better than a long one now and then.</p>
      <div class="set-grid lesson-grid">${L.map((chars, i) => {
        const best = koch.best[i];
        const locked = i > koch.unlocked;
        const passed = best >= KOCH_PASS;
        return `<button class="set-tile ${i === sel ? 'on' : ''} ${locked ? 'locked' : ''} ${passed ? 'passed' : ''}" data-action="mLesson" data-n="${i}">
          <div class="n">${esc(chars.join(' '))}</div>
          <div class="s">${locked ? '🔒 ' : passed ? '✓ ' : ''}Lesson ${i + 1}${best !== undefined ? ` · ${best}%` : ''}</div></button>`;
      }).join('')}</div>
      <div class="btn-row" style="margin-top:14px">
        <span class="muted" style="font-size:13px">${Morse.learned(koch.unlocked).length} of ${Morse.KOCH_ORDER.length} characters unlocked</span>
        <span class="spacer"></span>
        <button class="btn btn-ghost" data-action="mReset" style="padding:6px 12px;font-size:12.5px">Reset progress</button>
      </div>
    </div>
    <div class="card panel">
      <h3>Lesson ${sel + 1}: new characters</h3>
      <p class="hint">Listen to each one a few times. Learn its rhythm as a whole sound; don't count the dits and dahs.</p>
      <div class="new-chars">${fresh.map(c => `
        <button class="char-card" data-action="mPlayChar" data-ch="${esc(c)}"><span class="big">${esc(c)}</span>${codeHtml(Morse.CODE[c])}<span class="muted">▶ listen</span></button>`).join('')}
      </div>
      ${earlier.length ? `<p class="hint" style="margin:16px 0 0">Learned in earlier lessons: <span class="mono">${esc(earlier.join(' '))}</span></p>` : ''}
    </div>
    <div class="card panel">
      <h3>Session</h3>
      <p class="hint">Part 1 sends groups made only of this lesson's new characters. Part 2 mixes in every character learned so far, as groups, words and callsigns.</p>
      <div class="segmented" style="margin-bottom:18px">
        ${[5, 10, 15, 20].map(v => `<button class="${morseCfg.rounds === v ? 'on' : ''}" data-action="mRounds" data-v="${v}">${v} per part</button>`).join('')}
      </div>
      <div class="toggle-list">
        ${toggle('includePrev', 'Part 2: include earlier characters', sel ? `Add a second part with ${earlier.join(' ')} as well as ${fresh.join(' ')}.` : 'Lesson 1 has no earlier characters, so there is only part 1.', morseCfg)}
        ${toggle('farnsworth', 'Farnsworth spacing', 'Keep each character at full speed, so it sounds like one rhythm, but stretch the silence between characters and words to a slower effective speed. This gives you time to recognise each character before the next one starts. Sessions with Farnsworth spacing are practice only: they don\'t count towards passing the lesson.', morseCfg)}
      </div>
      ${morseCfg.farnsworth ? `
      <div class="speed" style="margin-top:16px"><label for="eff">Effective speed</label>
        <input type="range" id="eff" min="${EFF_MIN}" max="${EFF_MAX}" step="1" value="${morseCfg.effWpm}" data-cfg="eff">
        <output id="eff-val">${morseCfg.effWpm} WPM</output></div>
      <div class="muted timing" id="eff-timing">${farnsworthText()}</div>` : ''}
    </div>
    <div class="card start-bar">
      <div class="summary"><b>${parts * morseCfg.rounds}</b> transmissions at <b id="speed-label">${speedLabel()}</b>${parts === 2 ? ' in two parts' : ''}. Type what you hear; ${morseCfg.farnsworth ? 'practice only, so this session can\'t pass the lesson.' : `you need ${KOCH_PASS}% to pass.`}</div>
      <button class="btn btn-primary" data-action="startKoch">Start lesson ${sel + 1} →</button>
    </div>`;
}

function startKoch(lesson = kochLesson()) {
  const parts = [['new', morseCfg.rounds]];
  if (morseCfg.includePrev && lesson > 0) parts.push(['all', morseCfg.rounds]);
  const rounds = parts.flatMap(([phase, n]) => Array.from({ length: n }, () => ({ phase, text: Morse.exercise(lesson, phase) })));
  go('koch', { lesson, rounds, index: 0, typed: '', results: [], spaced: morseCfg.farnsworth });
  cueRound();
}

// Lines up what was sent with what was typed (edit-distance alignment). Each
// op is [sent, typed]; either side is null for a missed or extra character.
function gradeCopy(sent, typed) {
  const norm = t => t.toUpperCase().replace(/\s+/g, ' ').trim();
  const a = norm(sent), b = norm(typed);
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const ops = [];
  let i = a.length, j = b.length;
  while (i || j) {
    if (i && j && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) ops.push([a[--i], b[--j]]);
    else if (i && d[i][j] === d[i - 1][j] + 1) ops.push([a[--i], null]);
    else ops.push([null, b[--j]]);
  }
  ops.reverse();
  const chars = t => t.replace(/ /g, '').length;
  const matched = ops.filter(([x, y]) => x === y && x !== ' ').length;
  const of = Math.max(chars(a), chars(b));
  return { ops, matched, of, pct: of ? Math.floor(100 * matched / of) : 0 };
}

function kochScore(results) {
  const matched = results.reduce((n, r) => n + r.matched, 0);
  const of = results.reduce((n, r) => n + r.of, 0);
  return { matched, of, pct: of ? Math.floor(100 * matched / of) : 0 };
}

function diffHtml(res) {
  const show = c => c === null ? '' : c === ' ' ? '␣' : esc(c);
  const cols = res.ops.map(([x, y]) => {
    if (x === ' ' && y === ' ') return '<span class="dcol gap"></span>';
    const cls = x === y ? 'ok' : x === null ? 'extra' : y === null ? 'miss' : 'bad';
    return `<span class="dcol ${cls}"><b>${show(x)}</b><span>${show(y)}</span></span>`;
  }).join('');
  return `
    <div class="diff"><div class="diff-labels"><span>Sent</span><span>You</span></div><div class="diff-cols">${cols}</div></div>
    <div class="diff-legend"><span class="ok">correct</span><span class="bad">wrong</span><span class="miss">missed</span><span class="extra">extra</span></div>`;
}

function cueRound() {
  clearTimeout(cueHandle);
  cueHandle = setTimeout(kochPlay, 400);
}

function kochPlay() {
  const answered = () => !!state.results[state.index];
  const status = text => {
    const el = document.getElementById('tx-status');
    if (el && !answered()) el.textContent = text;
  };
  status('Transmitting…');
  Morse.play(state.rounds[state.index].text, sound(), { onEnd: () => status('Type what you heard, then press Enter.') });
}

function renderKoch() {
  const { lesson, rounds, index, results, typed } = state;
  const round = rounds[index];
  const res = results[index];
  const last = index === rounds.length - 1;
  const part = round.phase === 'new' ? `Part 1 · ${Morse.LESSONS[lesson].join(' ')}` : 'Part 2 · all learned characters';
  const score = kochScore(results);
  return `
    <div class="quiz">
      <div class="card session-bar">
        <span class="q-num">${index + 1} / ${rounds.length}</span>
        <div class="progress"><i style="width:${100 * results.length / rounds.length}%"></i></div>
        <span class="score-chip"><span class="${score.pct >= KOCH_PASS ? 'ok' : 'bad'}">${results.length ? score.pct + '%' : ''}</span></span>
        <button class="btn btn-ghost" data-action="kEnd" style="padding:7px 14px">End</button>
      </div>
      <article class="card q-card">
        <div class="q-head"><span class="pill accent">Lesson ${lesson + 1}</span><span class="pill">${part}</span><span class="spacer"></span><span class="q-num">${speedLabel()}</span></div>
        <p class="q-text" id="tx-status">${res ? (res.pct === 100 ? 'Perfect copy!' : `${res.pct}% copied. Here is what was sent:`) : 'Get ready to listen…'}</p>
        <input class="text-input copy-input" id="k-input" data-k-input autocomplete="off" autocapitalize="characters" spellcheck="false"
          value="${esc(typed)}" ${res ? 'disabled' : ''} placeholder="Type here as you listen">
        ${res ? diffHtml(res) : ''}
        <div class="q-foot">
          <span class="hint-keys"><span class="kbd">Enter</span> ${res ? 'next' : 'check'}</span>
          <span class="spacer"></span>
          <button class="btn" data-action="kReplay">▶ Play again</button>
          ${res ? `<button class="btn btn-primary" data-action="kNext">${last ? 'See results' : 'Next →'}</button>`
            : '<button class="btn btn-primary" data-action="kCheck">Check</button>'}
        </div>
      </article>
    </div>`;
}

function kochCheck() {
  if (state.results[state.index]) return;
  Morse.stop();
  const round = state.rounds[state.index];
  state.results[state.index] = { ...gradeCopy(round.text, state.typed), phase: round.phase, text: round.text };
  render();
}

function kochNext() {
  if (!state.results[state.index]) return;
  if (state.index === state.rounds.length - 1) return finishKoch();
  Morse.stop();
  state.index++;
  state.typed = '';
  render();
  cueRound();
}

function finishKoch() {
  const { lesson, rounds, results, spaced } = state;
  const complete = results.length === rounds.length;
  const { pct } = kochScore(results);
  // Farnsworth sessions are practice only: they never count as a pass or a best score.
  const pass = complete && !spaced && pct >= KOCH_PASS;
  let unlocked = false;
  if (complete && !spaced) {
    koch.best[lesson] = Math.max(koch.best[lesson] || 0, pct);
    if (pass && lesson === koch.unlocked && lesson < Morse.LESSONS.length - 1) { koch.unlocked++; unlocked = true; }
    saveKoch();
  }
  go('kochDone', { lesson, results, complete, pass, unlocked, spaced });
}

function renderKochDone() {
  const { lesson, results, complete, pass, unlocked, spaced } = state;
  const total = kochScore(results);
  const L = Morse.LESSONS;
  const hasNext = lesson + 1 < L.length && lesson + 1 <= koch.unlocked;
  const msg = spaced ? `You copied ${total.pct}% of the characters with Farnsworth spacing. This was practice: to pass the lesson, copy ${KOCH_PASS}% with Farnsworth spacing turned off.`
    : !complete ? 'Only a complete session counts towards unlocking the next lesson.'
    : pass && lesson === L.length - 1 ? `You copied ${total.pct}%. You have learned all ${Morse.KOCH_ORDER.length} Koch characters!`
    : pass ? `You copied ${total.pct}% of the characters.${unlocked ? ` Lesson ${lesson + 2} is now unlocked, with ${L[lesson + 1].join(' ')}.` : ''}`
    : `You copied ${total.pct}% of the characters. You need ${KOCH_PASS}% to move on, so try this lesson again.`;
  const parts = [['new', `Part 1 · ${L[lesson].join(' ')}`], ['all', 'Part 2 · all learned']]
    .map(([p, label]) => [label, results.filter(r => r.phase === p)]).filter(([, rs]) => rs.length);
  return `
    <div class="card result-hero">
      ${ring(total.pct, `${total.matched}/${total.of}`, KOCH_PASS)}
      <div>
        <div class="eyebrow">Koch lesson ${lesson + 1} · ${speedLabel()}</div>
        <div class="verdict-big ${pass ? 'pass' : spaced && complete ? '' : 'fail'}" style="margin-top:6px">${pass ? 'Lesson passed!' : !complete ? 'Session ended early' : spaced ? 'Practice complete' : `Not ${KOCH_PASS}% yet`}</div>
        <p class="muted" style="margin:4px 0 0">${msg}</p>
        <div class="section-scores">${parts.map(([label, rs]) => {
          const s = kochScore(rs);
          return `<div class="section-score"><div class="top"><b>${esc(label)}</b><span class="big">${s.pct}%</span></div>
            <div class="bar ${s.pct >= KOCH_PASS ? '' : 'fail'}"><i style="width:${s.pct}%"></i></div></div>`;
        }).join('')}</div>
        <div class="btn-row" style="margin-top:18px">
          ${pass && hasNext ? `<button class="btn btn-primary" data-action="kLesson" data-n="${lesson + 1}">Start lesson ${lesson + 2} →</button>` : ''}
          <button class="btn ${pass && hasNext ? '' : 'btn-primary'}" data-action="kLesson" data-n="${lesson}">Repeat lesson ${lesson + 1}</button>
          <button class="btn btn-ghost" data-action="kCourse">Back to course</button>
        </div>
      </div>
    </div>
    <section class="review">
      <div class="review-head"><h3>Transmissions</h3></div>
      ${results.map((r, i) => `
        <article class="card review-item ${r.pct === 100 ? 'ok' : 'bad'}">
          <div class="q-head"><span class="q-num">#${i + 1}</span><span class="pill ${r.pct === 100 ? 'ok' : r.pct >= KOCH_PASS ? '' : 'bad'}">${r.pct}%</span>
            <span class="spacer"></span><button class="btn btn-ghost" data-action="kHear" data-i="${i}" style="padding:6px 12px">▶ Play</button></div>
          ${diffHtml(r)}
        </article>`).join('')}
    </section>`;
}

/* ---------- Morse sending ---------- */
// QSO phrases for sending practice. A {KEY} is filled from SEND_FILL; the same
// key gets the same value throughout a phrase, so 'QTH {QTH} {QTH}' repeats one town.
const SEND_PHRASES = [
  // calling and answering
  'CQ CQ CQ DE {CALL} {CALL} K', 'CQ DE {CALL} {CALL} PSE K', 'CQ DX CQ DX DE {CALL} K', 'CQ TEST {CALL}',
  'QRL?', 'QRZ? DE {CALL}', '{CALL2} DE {CALL} K', '{CALL2} DE {CALL} KN', '{CALL2} {CALL2} DE {CALL} {CALL} AR',
  'GM ES TNX FER CALL', 'GA DR OM TNX FER CALL', 'GE {NAME} TNX FER CALL', 'TNX FER RPRT',
  // reports
  'UR RST {RST} {RST}', 'RST {RST} {RST} BK', 'UR SIG {RST} WID QSB', 'UR RST {RST} WID QRM', 'UR SIGS FB',
  'HW CPY?', 'SOLID CPY', 'ALL OK', 'TU 5NN {SERIAL}', '{CALL} 599 {SERIAL}',
  // name and location
  'NAME {NAME} {NAME}', 'OP HR IS {NAME}', 'NAME HR IS {NAME} = QTH {QTH}', 'QTH {QTH} {QTH}', 'QTH NR {QTH}',
  'QTH IS {QTH} IRELAND', 'OK {NAME} FB',
  // station
  'RIG {RIG} ES ANT {ANT}', 'RIG HR {RIG}', 'PWR {PWR}', 'PWR HR {PWR} = ANT {ANT}', 'RIG {RIG} PWR {PWR}',
  'ANT IS {ANT}', 'QRP 5W ES {ANT}',
  // weather, time and personal
  'WX {WX}', 'WX HR {WX} TEMP {TEMP}C', 'WX {WX} ES {TEMP}C', 'TIME {UTC}Z', 'AGE {AGE}', 'AGE HR {AGE} YRS',
  'LIC {YRS} YRS', 'HAM SINCE {YEAR}', 'RETIRED ENGINEER', 'WORK AS TEACHER', 'NEW TO CW', 'FIRST CW QSO',
  // operating
  'PSE QRS', 'PSE QRS QRM', 'PSE RPT', 'PSE RPT NAME', 'PSE RPT QTH', 'AGN PSE', 'QRM HR', 'QSB', 'QSY UP 2',
  'QSY {BAND}?', 'QRV {BAND}', 'QRX 5 MIN', 'QRT', 'R R TNX', 'R TU', 'BK', 'SRI QRM', 'SRI NIL CPY',
  'FB OM', 'FB {NAME}', 'BAND {BAND} OPEN', 'CONDX POOR',
  // QSL cards and closing
  'QSL VIA BURO', 'QSL VIA LOTW', 'PSE QSL DIRECT', 'WL QSL VIA BURO', 'TNX FER QSO {NAME} 73', 'CUL {NAME} 73',
  '73 ES GUD DX', 'GL ES 73', 'BEST 73 ES GL', 'GN OM 73', 'HPE CUAGN', 'TU 73 SK', '73 TU {CALL2} DE {CALL} SK',
  'GE ES TNX FER QSO', 'GM OM', 'TU EE',
];
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const letters = n => Array.from({ length: n }, () => String.fromCharCode(65 + randInt(0, 25))).join('');
const callsign = () => 'EI' + randInt(0, 9) + letters(randInt(2, 3));
const DX_PREFIXES = ['G', 'M', 'GI', 'GM', 'F', 'DL', 'ON', 'PA', 'EA', 'I', 'OH', 'SM', 'LA', 'OK', 'SP', 'HA', 'W', 'K', 'VE', 'JA', 'VK'];
const SEND_FILL = {
  CALL: callsign,
  CALL2: () => Math.random() < 0.5 ? callsign() : pickOne(DX_PREFIXES) + randInt(0, 9) + letters(randInt(2, 3)),
  NAME: () => pickOne(['JOHN', 'MARY', 'SEAN', 'AOIFE', 'PAT', 'NIAMH', 'TOM', 'ANN', 'DECLAN', 'CIARA', 'LIAM',
    'ORLA', 'BRIAN', 'EMMA', 'KEVIN', 'RUTH', 'PETER', 'GRACE', 'MIKE', 'DAVE']),
  QTH: () => pickOne(['DUBLIN', 'CORK', 'GALWAY', 'LIMERICK', 'SLIGO', 'KERRY', 'DONEGAL', 'WATERFORD', 'KILKENNY',
    'WEXFORD', 'ATHLONE', 'MAYO', 'CLARE', 'LOUTH', 'MEATH', 'WICKLOW', 'TIPPERARY', 'OFFALY']),
  RST: () => pickOne(['599', '579', '589', '569', '559', '449', '339', '5NN']),
  RIG: () => pickOne(['IC7300', 'IC705', 'IC7610', 'FT991A', 'FT710', 'FTDX10', 'FT818', 'TS590', 'K3', 'KX2']),
  ANT: () => pickOne(['DIPOLE', 'VERTICAL', 'EFHW', '3 EL YAGI', 'G5RV', 'LOOP', 'INV V', 'LONG WIRE']),
  PWR: () => pickOne(['5W', '10W', '50W', '100W', '400W']),
  WX: () => pickOne(['SUNNY', 'CLOUDY', 'RAIN', 'WINDY', 'FOGGY', 'COLD', 'WARM', 'SNOW']),
  TEMP: () => String(randInt(2, 25)),
  UTC: () => String(randInt(0, 23)).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0'),
  AGE: () => String(randInt(18, 80)),
  YRS: () => String(randInt(1, 50)),
  YEAR: () => String(randInt(1970, 2025)),
  BAND: () => pickOne(['80M', '40M', '30M', '20M', '17M', '15M', '10M']),
  SERIAL: () => String(randInt(1, 250)).padStart(3, '0'),
};
const fillPhrase = phrase => {
  const got = {};
  return phrase.replace(/\{(\w+)\}/g, (_, k) => got[k] ??= SEND_FILL[k]());
};

// The keyer lives outside state so re-renders keep it; go() and tab changes dispose of it.
const sendOpts = {
  get mode() { return morseCfg.sendKey === 'paddle' ? 'iambic' : 'straight'; },
  get wpm() { return morseCfg.sendWpm; },
  get tone() { return morseCfg.tone; },
};
let keyer = null;
let sendSt = { target: null, result: null, ownPos: 0, tally: [] };

function dropKeyer() {
  keyer?.dispose();
  keyer = null;
}

function getKeyer() {
  Morse.stop();
  return keyer = keyer || Morse.sender(sendOpts, sendChanged);
}

// Own text, cleaned to sendable characters and cut into pieces of up to three words.
function ownChunks() {
  const words = morseCfg.ownText.toUpperCase().split(/\s+/)
    .map(w => [...w].filter(c => Morse.CODE[c]).join('')).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += 3) chunks.push(words.slice(i, i + 3).join(' '));
  return chunks;
}

function newSendTarget() {
  const src = morseCfg.sendSrc;
  if (src === 'own') {
    const chunks = ownChunks();
    if (!chunks.length) return null;
    sendSt.ownPos %= chunks.length;
    return chunks[sendSt.ownPos++];
  }
  if (src === 'phrases') {
    return fillPhrase(pickOne(SEND_PHRASES));
  }
  const lesson = kochLesson();
  return Morse.exercise(lesson, lesson ? 'all' : 'new');
}

function sendNext() {
  keyer?.clear();
  sendSt.target = newSendTarget();
  sendSt.result = null;
}

function sendOutHtml(text, code) {
  if (!text && !code) return `<span class="muted">${morseCfg.sendKey === 'paddle' ? 'Use the paddles below' : 'Press the key below'} to start sending.</span>`;
  return `${esc(text)}${code ? `<span class="pending">${codeHtml(code)}</span>` : ''}`;
}

function sendChanged(text, code) {
  const out = document.getElementById('send-out');
  if (out) out.innerHTML = sendOutHtml(text, code);
  // Finish automatically once as many characters have been sent as the target has.
  const count = t => t.replace(/\s/g, '').length;
  if (!code && sendSt.target && !sendSt.result && count(text) >= count(sendSt.target)) sendCheck();
}

function sendCheck() {
  if (!keyer || !sendSt.target || sendSt.result) return;
  keyer.flush();
  const text = keyer.text;
  if (!text) return;
  const res = gradeCopy(sendSt.target, text);
  const { first, last, wpm } = keyer.stats();
  const secs = (last - first) / 1000;
  // Overall speed: PARIS units of what was sent, over the time from first key-down to last key-up.
  res.wpm = secs > 0 ? Morse.units(text) * 1.2 / secs : 0;
  res.charWpm = wpm;
  res.text = text;
  sendSt.result = res;
  sendSt.tally.push(res);
  render();
}

function sendResultHtml() {
  const r = sendSt.result;
  if (!r) return '';
  const n = sendSt.tally.length;
  const avg = Math.round(sendSt.tally.reduce((t, x) => t + x.pct, 0) / n);
  const avgWpm = sendSt.tally.reduce((t, x) => t + x.wpm, 0) / n;
  return `
    <div class="send-stats">
      <div><span class="big ${r.pct >= KOCH_PASS ? 'ok' : 'bad'}">${r.pct}%</span><span class="muted">accuracy · ${r.matched}/${r.of}</span></div>
      <div><span class="big">${r.wpm.toFixed(1)}</span><span class="muted">WPM overall</span></div>
      <div><span class="big">${r.charWpm.toFixed(0)}</span><span class="muted">${morseCfg.sendKey === 'paddle' ? 'WPM keyer speed' : 'WPM character speed'}</span></div>
      ${n > 1 ? `<div><span class="big">${avg}%</span><span class="muted">${n} sent · avg ${avgWpm.toFixed(1)} WPM</span></div>` : ''}
    </div>
    ${diffHtml(r)}`;
}

function sendTargetHtml() {
  const t = sendSt.target;
  return t === null ? '<span class="muted">Type some text above to practise with it.</span>'
    : morseCfg.showCode ? `<div class="morse-out">${morseTokensHtml(t)}</div>` : esc(t);
}

function sendPanel() {
  const paddle = morseCfg.sendKey === 'paddle';
  if (sendSt.target === null) sendSt.target = newSendTarget();
  const src = morseCfg.sendSrc;
  const keys = paddle
    ? (morseCfg.swapPaddles ? ['dah', 'dit'] : ['dit', 'dah']).map((k, side) => `
        <button class="key-btn" data-key="${k}" aria-label="${k} paddle"><span class="key-sym">${k === 'dit' ? '·' : '–'}</span>${k === 'dit' ? 'Dit' : 'Dah'}<kbd>${side ? '→' : '←'}</kbd></button>`).join('')
    : `<button class="key-btn" data-key="key" aria-label="Straight key"><span class="key-sym">●</span>Key<kbd>Space</kbd></button>`;
  return `
    <div class="card panel">
      <h3>Key</h3>
      <div class="segmented" style="margin-bottom:18px">
        <button class="${paddle ? '' : 'on'}" data-action="sKey" data-v="straight">Straight key</button>
        <button class="${paddle ? 'on' : ''}" data-action="sKey" data-v="paddle">Iambic paddles</button>
      </div>
      <p class="hint">${paddle
        ? 'Hold the dit paddle for a string of dits and the dah paddle for dahs. Squeeze both to alternate (iambic mode B); the keyer times every element for you. On a keyboard, use ← and → (or left and right Ctrl).'
        : 'Hold the key down for each dit or dah; the length of each press decides which it is. The decoder adapts to your own rhythm, starting from the speed below. On a keyboard, use the space bar.'}
        A pause of about 3 dits ends a character and about 7 ends a word. Send 8 dits (the error sign) to erase the last word.</p>
      <div class="sound-row">
        <div class="speed"><label for="send-wpm">${paddle ? 'Keyer speed' : 'Starting speed'}</label>
          <input type="range" id="send-wpm" min="${SEND_MIN}" max="${SEND_MAX}" step="1" value="${morseCfg.sendWpm}" data-cfg="sendWpm">
          <output id="send-wpm-val">${morseCfg.sendWpm} WPM</output></div>
        ${toneHtml()}
      </div>
      ${paddle ? `<div class="toggle-list" style="margin-top:16px">${toggle('swapPaddles', 'Swap paddles', 'Put dah on the left and dit on the right, for left-handed sending.', morseCfg)}</div>` : ''}
    </div>
    <div class="card panel">
      <h3>Practice text</h3>
      <div class="segmented" style="margin-bottom:14px">
        <button class="${src === 'koch' ? 'on' : ''}" data-action="sSrc" data-v="koch">Koch characters</button>
        <button class="${src === 'phrases' ? 'on' : ''}" data-action="sSrc" data-v="phrases">QSO phrases</button>
        <button class="${src === 'own' ? 'on' : ''}" data-action="sSrc" data-v="own">My own text</button>
      </div>
      <p class="hint">${src === 'koch' ? `Groups, words and callsigns using the ${Morse.learned(kochLesson()).length} characters you have reached in the Koch course: <span class="mono">${esc(Morse.learned(kochLesson()).join(' '))}</span>`
        : src === 'phrases' ? 'Typical parts of a CW contact: calls, reports, names and abbreviations.'
        : 'Type or paste any text. It is sent in pieces of up to three words; characters with no Morse code are left out.'}</p>
      ${src === 'own' ? `<textarea class="text-input" data-own-text rows="3" spellcheck="false" placeholder="Type or paste your own text">${esc(morseCfg.ownText)}</textarea>` : ''}
      <div class="toggle-list" style="margin-top:14px">${toggle('showCode', 'Show the code', 'Show the dits and dahs under each character of the text to send.', morseCfg)}</div>
    </div>
    <div class="card panel send-card">
      <div class="eyebrow">Send this</div>
      <div class="send-target" id="send-target">${sendTargetHtml()}</div>
      <div class="eyebrow" style="margin-top:18px">You sent</div>
      <div class="send-out" id="send-out">${sendOutHtml(keyer?.text || '', '')}</div>
      <div class="key-pad ${paddle ? 'paddles' : ''}">${keys}</div>
      <div class="btn-row" style="margin-top:16px">
        ${sendSt.result
          ? `<button class="btn btn-primary" data-action="sNext">New text →</button><button class="btn" data-action="sRetry">Send it again</button>`
          : `<button class="btn btn-primary" data-action="sCheck">Check</button><button class="btn" data-action="sClear">Clear</button><button class="btn btn-ghost" data-action="sNext">New text</button>`}
      </div>
      <div id="send-result">${sendResultHtml()}</div>
    </div>`;
}

function keyDown(which) {
  if (state.view !== 'morse' || morseCfg.tab !== 'send') return;
  if (sendSt.result) { sendSt.result = null; keyer?.clear(); render(); }
  getKeyer().down(which);
  document.querySelector(`[data-key="${which}"]`)?.classList.add('down');
}

function keyUp(which) {
  keyer?.up(which);
  document.querySelector(`[data-key="${which}"]`)?.classList.remove('down');
}

/* ---------- events ---------- */
const actions = {
  acceptTerms() {
    if (!document.querySelector('[data-terms]')?.checked) return true;
    termsAccepted = true;
    store.set('terms', TERMS_VERSION);
  },
  secToggle(el) {
    const s = el.dataset.sec, list = practiceCfg.sections;
    practiceCfg.sections = list.includes(s) ? list.filter(x => x !== s) : [...list, s];
  },
  secGroup(el) {
    const ids = SECTIONS.filter(s => half(s.id) === el.dataset.half).map(s => s.id);
    const allOn = ids.every(id => practiceCfg.sections.includes(id));
    practiceCfg.sections = allOn ? practiceCfg.sections.filter(id => !ids.includes(id))
      : [...new Set([...practiceCfg.sections, ...ids])];
  },
  pSource(el) { practiceCfg.source = el.dataset.v; },
  pSet(el) { practiceCfg.set = +el.dataset.n; },
  pLength(el) { practiceCfg.length = +el.dataset.v; },
  startPractice() { store.set('practiceCfg', practiceCfg); startPractice(); return true; },
  pAnswer(el) { practiceAnswer(+el.dataset.pos); return true; },
  pNext() { practiceNext(); return true; },
  endPractice() {
    if (!state.results.length) { go('practiceSetup'); return true; }
    if (state.chosen === null) state.items = state.items.slice(0, state.results.length);
    finishPractice();
    return true;
  },
  ePaper(el) { examCfg.paper = el.dataset.v === 'random' ? 'random' : +el.dataset.v; },
  startExam() { store.set('examCfg', examCfg); startExam(); return true; },
  eAnswer(el) {
    const ex = state.exam, pos = +el.dataset.pos;
    ex.answers[ex.index] = ex.answers[ex.index] === pos ? null : pos;
    saveExam();
  },
  eMove(el) { examMove(state.exam.index + +el.dataset.d); return true; },
  eJump(el) { examMove(+el.dataset.i); return true; },
  eFlag() { state.exam.flags[state.exam.index] = !state.exam.flags[state.exam.index]; saveExam(); },
  eSubmit() { askSubmit(); return true; },
  eQuit() { saveExam(); go('home'); return true; },
  resumeExam() { go('exam', { exam: store.get('examInProgress', null) }); return true; },
  discardExam() {
    confirmModal('Discard this exam?', 'Your answers so far will be lost.', 'Discard', () => {
      store.remove('examInProgress');
      render();
    });
    return true;
  },
  clearHistory() {
    confirmModal('Clear exam history?', 'Your list of past exam results will be deleted. Per-question statistics are kept.', 'Clear', () => {
      store.remove('history');
      render();
    });
    return true;
  },
  rFilter(el) { state.filter = el.dataset.v; },
  retake() { startExam(state.exam.set); return true; },
  newRandom() { startExam('random'); return true; },
  mTab(el) { Morse.stop(); dropKeyer(); morseCfg.tab = el.dataset.v; saveMorse(); },
  sKey(el) { dropKeyer(); morseCfg.sendKey = el.dataset.v; saveMorse(); },
  sSrc(el) { morseCfg.sendSrc = el.dataset.v; saveMorse(); sendSt.ownPos = 0; sendNext(); },
  sCheck() { sendCheck(); return true; },
  sClear() { keyer?.clear(); },
  sNext() { sendNext(); },
  sRetry() { keyer?.clear(); sendSt.result = null; },
  mTone(el) { morseCfg.tone = +el.dataset.v; saveMorse(); },
  mPlay() {
    if (Morse.playing()) Morse.stop();
    else Morse.play(morseCfg.text, morseCfg, { onChar: highlightTok, onEnd: setPlayBtn });
    highlightTok(null);
    setPlayBtn();
    return true;
  },
  mPlayChar(el) { Morse.play(el.dataset.ch, sound()); return true; },
  mLesson(el) {
    const n = +el.dataset.n;
    if (n <= koch.unlocked) { morseCfg.lesson = n; saveMorse(); return; }
    confirmModal(`Skip to lesson ${n + 1}?`, `This unlocks every lesson up to ${n + 1}. Only skip ahead if you can already copy ${Morse.learned(n - 1).join(' ')} reliably.`, 'Skip ahead', () => {
      koch.unlocked = n;
      morseCfg.lesson = n;
      saveKoch();
      saveMorse();
      render();
    });
    return true;
  },
  mRounds(el) { morseCfg.rounds = +el.dataset.v; saveMorse(); },
  mReset() {
    confirmModal('Reset Koch progress?', 'All lessons except the first are locked again and your best scores are deleted.', 'Reset', () => {
      Object.assign(koch, { unlocked: 0, best: {} });
      morseCfg.lesson = 0;
      saveKoch();
      saveMorse();
      render();
    });
    return true;
  },
  startKoch() { startKoch(); return true; },
  kCheck() { kochCheck(); return true; },
  kNext() { kochNext(); return true; },
  kReplay() { kochPlay(); document.getElementById('k-input')?.focus(); return true; },
  kEnd() {
    if (!state.results.length) { go('morse'); return true; }
    finishKoch();
    return true;
  },
  kHear(el) { Morse.play(state.results[+el.dataset.i].text, sound()); return true; },
  kLesson(el) { morseCfg.lesson = +el.dataset.n; saveMorse(); startKoch(morseCfg.lesson); return true; },
  kCourse() { morseCfg.tab = 'koch'; go('morse'); return true; },
};

app.addEventListener('click', e => {
  const nav = e.target.closest('[data-go]');
  if (nav) return go(nav.dataset.go);
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const handled = actions[el.dataset.action](el);
  if (!handled) render();
});
document.querySelector('.brand').addEventListener('click', () => {
  if (state.view === 'exam') saveExam();
  go('home');
});

app.addEventListener('change', e => {
  if ('terms' in e.target.dataset) {
    document.getElementById('terms-go').disabled = !e.target.checked;
    return;
  }
  const key = e.target.dataset.toggle;
  if (!key) return;
  const cfg = state.view === 'examSetup' ? examCfg : state.view === 'morse' ? morseCfg : practiceCfg;
  cfg[key] = e.target.checked;
  if (cfg === morseCfg) saveMorse();
  render();
});

function updateSpeedLabels() {
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('speed-label', speedLabel());
  set('eff-timing', farnsworthText());
}

app.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.cfg === 'wpm') {
    morseCfg.wpm = +t.value;
    saveMorse();
    document.getElementById('wpm-val').textContent = `${morseCfg.wpm} WPM`;
    document.getElementById('timing').textContent = timingText();
    updateSpeedLabels();
  } else if (t.dataset.cfg === 'eff') {
    morseCfg.effWpm = +t.value;
    saveMorse();
    document.getElementById('eff-val').textContent = `${morseCfg.effWpm} WPM`;
    updateSpeedLabels();
  } else if ('morseText' in t.dataset) {
    morseCfg.text = t.value;
    saveMorse();
    if (Morse.playing()) { Morse.stop(); setPlayBtn(); }
    document.getElementById('morse-out').innerHTML = morseTokensHtml(t.value);
  } else if (t.dataset.cfg === 'sendWpm') {
    morseCfg.sendWpm = +t.value;
    saveMorse();
    document.getElementById('send-wpm-val').textContent = `${morseCfg.sendWpm} WPM`;
  } else if ('ownText' in t.dataset) {
    morseCfg.ownText = t.value;
    saveMorse();
    sendSt.ownPos = 0;
    if (!sendSt.result) {
      sendSt.target = newSendTarget();
      document.getElementById('send-target').innerHTML = sendTargetHtml();
    }
  } else if ('kInput' in t.dataset) {
    state.typed = t.value;
  }
});

// Practice key: pointer events cover mouse, pen and multi-touch (squeezing both paddles).
app.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-key]');
  if (!b || e.button > 0) return;
  e.preventDefault();
  b.setPointerCapture(e.pointerId);
  keyDown(b.dataset.key);
});
for (const type of ['pointerup', 'pointercancel']) {
  app.addEventListener(type, e => {
    const b = e.target.closest('[data-key]');
    if (b) keyUp(b.dataset.key);
  });
}
app.addEventListener('contextmenu', e => { if (e.target.closest('[data-key]')) e.preventDefault(); });

// Keyboard key: space for the straight key; arrows or left/right Ctrl for the paddles.
function keyFor(e) {
  if (state.view !== 'morse' || morseCfg.tab !== 'send' || modalRoot.innerHTML) return null;
  if (e.target.closest('textarea, input, select')) return null;
  if (morseCfg.sendKey !== 'paddle') return e.code === 'Space' ? 'key' : null;
  const side = { ArrowLeft: 0, ControlLeft: 0, ArrowRight: 1, ControlRight: 1 }[e.code];
  if (side === undefined) return null;
  return (morseCfg.swapPaddles ? ['dah', 'dit'] : ['dit', 'dah'])[side];
}
document.addEventListener('keydown', e => {
  const k = keyFor(e);
  if (!k) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!e.repeat) keyDown(k);
}, true);
document.addEventListener('keyup', e => {
  const k = keyFor(e);
  if (!k) return;
  e.preventDefault();
  keyUp(k);
}, true);

document.addEventListener('keydown', e => {
  if (!termsAccepted) return;
  if (modalRoot.innerHTML) {
    if (e.key === 'Escape') modalRoot.innerHTML = '';
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const pos = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
  if (state.view === 'practice') {
    if (pos >= 0 && state.chosen === null) practiceAnswer(pos);
    else if ((k === 'enter' || k === 'arrowright' || k === ' ') && state.chosen !== null) { e.preventDefault(); practiceNext(); }
  } else if (state.view === 'exam') {
    const ex = state.exam;
    if (pos >= 0) { ex.answers[ex.index] = pos; saveExam(); render(); }
    else if (k === 'arrowright' || k === 'enter') { e.preventDefault(); examMove(ex.index + 1); }
    else if (k === 'arrowleft') examMove(ex.index - 1);
    else if (k === 'f') actions.eFlag(), render();
  } else if (state.view === 'morse' && morseCfg.tab === 'send' && k === 'enter' && !e.target.closest('textarea, button')) {
    e.preventDefault();
    sendSt.result ? (sendNext(), render()) : sendCheck();
  } else if (state.view === 'koch' && k === 'enter') {
    e.preventDefault();
    state.results[state.index] ? kochNext() : kochCheck();
  }
});

window.addEventListener('beforeunload', () => { if (state.view === 'exam') saveExam(); });

render();
