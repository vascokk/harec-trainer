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
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h6M9 19h3"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
};

/* ---------- views ---------- */
let state = { view: 'home' };
let timerHandle = null;

function go(view, extra = {}) {
  clearInterval(timerHandle);
  timerHandle = null;
  state = { ...extra, view };
  render();
  window.scrollTo({ top: 0 });
}

function render() {
  const views = { home: renderHome, practiceSetup: renderPracticeSetup, practice: renderPractice,
    practiceDone: renderPracticeDone, examSetup: renderExamSetup, exam: renderExam, results: renderResults };
  app.innerHTML = `<div class="fade-in">${views[state.view]()}</div>`;
  topStatus.textContent = state.view === 'exam' ? '' : `${QUESTIONS.length} questions · ${SET_NUMBERS.length} sets`;
  if (state.view === 'exam') startTimer();
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
function ring(pct, label) {
  const r = 64, c = 2 * Math.PI * r;
  const color = pct >= 60 ? 'var(--ok)' : 'var(--bad)';
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

/* ---------- events ---------- */
const actions = {
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
  const key = e.target.dataset.toggle;
  if (!key) return;
  const cfg = state.view === 'examSetup' ? examCfg : practiceCfg;
  cfg[key] = e.target.checked;
  render();
});

document.addEventListener('keydown', e => {
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
  }
});

window.addEventListener('beforeunload', () => { if (state.view === 'exam') saveExam(); });

render();
