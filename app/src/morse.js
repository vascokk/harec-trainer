'use strict';

// Morse code engine: the code table, ITU timing, the Koch lesson plan, exercise
// generation and a Web Audio keyer. No UI here; the views live in app.js.
const Morse = (() => {
  // ITU-R M.1677-1 characters.
  const CODE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
    K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
    U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
    '.': '.-.-.-', ',': '--..--', ':': '---...', '?': '..--..', "'": '.----.', '-': '-....-', '/': '-..-.',
    '(': '-.--.', ')': '-.--.-', '"': '.-..-.', '=': '-...-', '+': '.-.-.', '@': '.--.-.',
  };

  const MIN_WPM = 18, MAX_WPM = 25;

  // Koch order (as used by LCWO), taught two new characters per lesson.
  const KOCH_ORDER = [...'KMURESNAPTLWI.JZ=FOY,VG5/Q92H38B?47C1D60X'];
  const LESSONS = [];
  for (let i = 0; i < KOCH_ORDER.length; i += 2) LESSONS.push(KOCH_ORDER.slice(i, i + 2));
  const learned = lesson => LESSONS.slice(0, lesson + 1).flat();

  // Plain words and common CW abbreviations. Exercises use only the ones whose
  // characters have all been learned.
  const WORDS = `
    THE AND FOR ARE BUT NOT YOU ALL ANY CAN HAD HER WAS ONE OUR OUT DAY GET HAS HIM HIS HOW MAN NEW NOW OLD SEE
    TWO WAY WHO DID ITS LET PUT SAY SHE TOO USE ARM ART ATE EAR EAT END ERA RAN RUN SUN SEA SET SIT TEA TEN TIP
    TOP WET WIN NET MAP PEN PIN RUM SUM URN USE AIM AIR KIT KEY ICE INK LAP LIP NAP PAN PAT RAT RIM SKI SPA TAN
    MAKE MARK MASK MUSE NAME SAME RANK SEEN NEAR KNEE MEAN NURSE SNAKE ARMS MEAT TEAM STEM TERM PART PAST PEAK
    TAKE TALK TALE TAPE TRAP TRUE TUNE TURN LAKE LAMP LAST LATE LEAN LEARN LIKE LINE LINK LIST LITTLE LIVE LONG
    MILE MILK MINE MIST WALK WALL WANT WARM WAVE WIRE WISE WITH WORK WORLD WRITE KEEP KIND KNOW SLOW SNOW SPIN
    STAR START STEP STILL STOP SURE SWIM TIME TINY TOWN TREE WEST WIND WINTER WATER PAPER PLANE PLANT POWER
    METAL MUSIC NOISE PLAIN RADIO TRAIN SIGNAL SPEED SOUND MORSE LETTER NUMBER SPRING SUMMER QUIET QUICK
    GOOD HAVE HERE JUST MUCH ONLY SUCH TELL VERY ALSO BACK CAME COME DOWN EACH EVEN FIND GIVE HAND HIGH LEFT
    LIFE MANY MUST NEXT OPEN PLAY READ REAL REST SEND SHORT SOON TONE COPY CODE FIELD FOREST GREEN BLUE JUMP
    JOIN JOKE ZERO ZONE ZOOM DOZEN FROZEN FIVE SEVEN NINE EIGHT THREE FOUR SIX BOX FOX MIX FIX NEXT TEXT
    CQ DE K KN AR SK BK TNX TU FB OM YL UR RST 599 5NN NAME QTH RIG ANT PWR WX ES HR HW CPY GM GA GE GN 73
    QSL QRZ QRM QRN QSB QSY QRS QRQ QRL QRP QRO DX TEST ABT AGN BAND BEST CALL CUL DR FER GUD HPE INFO MSG NR
    OP PSE RPT SIG SRI VY WID WKD TX RX`.trim().split(/\s+/);

  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const group = (len, draw) => Array.from({ length: len }, draw).join('');

  // One transmission for a Koch lesson. Phase 'new' uses only the lesson's new
  // characters; phase 'all' mixes in everything learned so far, favouring the
  // new characters, as random groups, real words or an Irish-style callsign.
  function exercise(lesson, phase) {
    const fresh = LESSONS[lesson];
    if (phase === 'new') {
      const pool = fresh.length > 1 || !lesson ? fresh : [...LESSONS[lesson - 1], ...fresh];
      return [0, 1].map(() => group(4 + rnd(2), () => pick(pool))).join(' ');
    }
    const known = learned(lesson);
    const has = new Set(known);
    const words = WORDS.filter(w => [...w].every(c => has.has(c)));
    const withNew = words.filter(w => fresh.some(c => w.includes(c)));
    const digits = known.filter(c => /\d/.test(c));
    const letters = known.filter(c => /[A-Z]/.test(c));
    const kinds = ['group', 'group'];
    if (words.length >= 5) kinds.push('words', 'words', 'words');
    if (has.has('E') && has.has('I') && digits.length) kinds.push('call');
    const word = () => pick(withNew.length && Math.random() < 0.5 ? withNew : words);
    switch (pick(kinds)) {
      case 'words':
        return Array.from({ length: 2 + rnd(2) }, word).join(' ');
      case 'call': {
        const call = 'EI' + pick(digits) + group(2 + rnd(2), () => pick(letters));
        return words.length ? `${call} ${word()}` : call;
      }
      default:
        return [0, 1].map(() => group(4 + rnd(3), () => pick(Math.random() < 0.5 ? fresh : known))).join(' ');
    }
  }

  // Text → tokens: characters (with their code), word spaces and <XX> prosigns.
  // Characters without a Morse code keep code: null and are not sent.
  function parse(text) {
    const toks = [];
    const s = String(text).toUpperCase();
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (/\s/.test(c)) {
        if (toks.length && !toks[toks.length - 1].space) toks.push({ space: true });
        continue;
      }
      if (c === '<') {
        const j = s.indexOf('>', i);
        const inner = j > i + 1 ? s.slice(i + 1, j) : '';
        if (inner && [...inner].every(ch => CODE[ch])) {
          toks.push({ text: inner, prosign: true, code: [...inner].map(ch => CODE[ch]).join('') });
          i = j;
          continue;
        }
      }
      toks.push({ text: c, code: CODE[c] || null });
    }
    while (toks.length && toks[toks.length - 1].space) toks.pop();
    return toks;
  }

  // Key-down events and character start marks, in units. ITU-R M.1677-1:
  // dot 1 unit, dash 3, gap inside a character 1, between characters 3,
  // between words 7. Farnsworth spacing stretches only the last two.
  function timeline(toks, gap = { char: 3, word: 7 }) {
    const events = [], marks = [];
    let t = 0, sent = false, wordGap = false;
    toks.forEach((tok, index) => {
      if (tok.space) { wordGap = sent; return; }
      if (!tok.code) return;
      if (sent) t += wordGap ? gap.word : gap.char;
      wordGap = false;
      marks.push({ t, index });
      [...tok.code].forEach((el, k) => {
        if (k) t += 1;
        const dur = el === '.' ? 1 : 3;
        events.push({ t, dur });
        t += dur;
      });
      sent = true;
    });
    return { events, marks, length: t };
  }

  // PARIS standard: 50 units per word, so one unit lasts 1.2 / WPM seconds.
  const unitMs = wpm => 1200 / wpm;

  // Gaps between characters and words, in units of the character speed. With
  // Farnsworth spacing (eff below wpm) characters keep their full speed and the
  // extra time goes into the gaps, so PARIS takes 60/eff seconds (ARRL formula:
  // 19 units of spacing per word, 3/19 between characters, 7/19 between words).
  function spacing(wpm, eff) {
    if (!eff || eff >= wpm) return { char: 3, word: 7 };
    const spare = (60 * wpm - 37.2 * eff) / (eff * wpm) * 1000 / unitMs(wpm);
    return { char: spare * 3 / 19, word: spare * 7 / 19 };
  }

  /* ---------- keyer ---------- */
  const RAMP = 0.005;   // 5 ms rise and fall, so the tone doesn't click
  const LEVEL = 0.3;
  let ctx = null, run = null;

  // The shared AudioContext, created on first use (inside a user gesture).
  function audio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = ctx || new Ctx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Sends text. opts is { wpm, tone, eff?, repeat? }, where eff is the
  // Farnsworth effective speed. It is read again before every repeat, so
  // changes take effect from the next repetition. onChar(index) fires as
  // each character starts (index into parse(text)), and onChar(null) at the
  // end of each pass. onEnd fires when playback finishes by itself.
  function play(text, opts, { onChar, onEnd } = {}) {
    stop();
    const toks = parse(text);
    let tl = timeline(toks);
    if (!tl.events.length || !audio()) return false;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine';
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    const r = { osc, gain, marks: [], end: 0, next: 0 };
    const pass = t0 => {
      const unit = unitMs(opts.wpm) / 1000;
      const gap = spacing(opts.wpm, opts.eff);
      tl = timeline(toks, gap);
      osc.frequency.setValueAtTime(opts.tone, t0);
      for (const e of tl.events) {
        const a = t0 + e.t * unit, b = a + e.dur * unit;
        gain.gain.setValueAtTime(0, a);
        gain.gain.linearRampToValueAtTime(LEVEL, a + RAMP);
        gain.gain.setValueAtTime(LEVEL, b - RAMP);
        gain.gain.linearRampToValueAtTime(0, b);
      }
      for (const m of tl.marks) r.marks.push({ at: t0 + m.t * unit, index: m.index });
      r.end = t0 + tl.length * unit;
      r.next = r.end + gap.word * unit;
    };
    const t0 = ctx.currentTime + 0.1;
    osc.start(t0);
    pass(t0);
    r.timer = setInterval(() => {
      const now = ctx.currentTime;
      while (r.marks.length && r.marks[0].at <= now) {
        const { index } = r.marks.shift();
        if (onChar) onChar(index);
      }
      if (now < r.end) return;
      onChar && onChar(null);
      if (opts.repeat) return pass(Math.max(r.next, now + 0.05));
      clearInterval(r.timer);
      osc.stop();
      run = null;
      onEnd && onEnd();
    }, 25);
    run = r;
    return true;
  }

  function stop() {
    if (!run) return;
    const { osc, gain, timer } = run;
    run = null;
    clearInterval(timer);
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + RAMP);
    osc.stop(now + RAMP + 0.01);
  }

  /* ---------- sending ---------- */
  const DECODE = Object.fromEntries(Object.entries(CODE).map(([c, m]) => [m, c]));

  // A practice key with sidetone and decoder. opts ({ mode, wpm, tone }) is read
  // live. mode 'straight' times each press of one key ('key'); the dit/dah
  // boundary adapts to the sender's own dit and dah lengths, starting from wpm.
  // mode 'iambic' is a squeeze keyer (Curtis mode B) on two paddles ('dit',
  // 'dah') at wpm. mode 'bug' is a semi-automatic key: holding 'dit' sends a
  // stream of dits at wpm, and each closure of 'dah' is a hand-made dah.
  // A gap over 2.5 units ends a character and one over 5 units ends a word. Eight or more dits is the error sign and erases the last word.
  // onChange(text, code) fires with the decoded text and the character in progress.
  function sender(opts, onChange) {
    const ac = audio();
    let osc = null, gain = null;
    if (ac) {
      osc = ac.createOscillator();
      gain = ac.createGain();
      gain.gain.value = 0;
      osc.connect(gain).connect(ac.destination);
      osc.start();
    }
    const tone = on => {
      if (!gain) return;
      const now = ac.currentTime;
      if (on) osc.frequency.setValueAtTime(opts.tone, now);
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(on ? 0 : LEVEL, now);
      gain.gain.linearRampToValueAtTime(on ? LEVEL : 0, now + RAMP);
    };
    const now = () => performance.now();

    // Decoder.
    let ditMs = unitMs(opts.wpm), dahMs = 3 * ditMs;
    const unit = () => opts.mode !== 'straight' ? unitMs(opts.wpm) : (ditMs + dahMs / 3) / 2;
    let text = '', code = '', space = false, first = null, last = null, gapTimer = null;
    const emit = () => onChange && onChange(text, code);
    const commit = () => {
      if (/^\.{8,}$/.test(code)) {
        text = text.trimEnd().replace(/\S+$/, '').trimEnd();
        space = !!text;
      } else if (code) {
        text += (space && text ? ' ' : '') + (DECODE[code] || '*');
        space = false;
      }
      code = '';
      emit();
    };
    const markStart = () => {
      clearTimeout(gapTimer);
      if (first === null) first = now();
    };
    const markEnd = el => {
      last = now();
      code += el;
      emit();
      clearTimeout(gapTimer);
      gapTimer = setTimeout(() => {
        commit();
        gapTimer = setTimeout(() => { space = true; }, 2.5 * unit());
      }, 2.5 * unit());
    };

    // Straight key.
    let pressed = null;
    const straightDown = () => {
      if (pressed !== null) return;
      markStart();
      pressed = now();
      tone(true);
    };
    const straightUp = () => {
      if (pressed === null) return;
      tone(false);
      const d = now() - pressed;
      pressed = null;
      const el = d < (ditMs + dahMs) / 2 ? '.' : '-';
      if (el === '.') ditMs = 0.7 * ditMs + 0.3 * d;
      else dahMs = 0.7 * dahMs + 0.3 * d;
      const lo = unitMs(40), hi = unitMs(4);
      ditMs = Math.min(hi, Math.max(lo, ditMs));
      dahMs = Math.min(5 * ditMs, Math.max(2 * ditMs, dahMs));
      markEnd(el);
    };

    // Iambic keyer.
    const pad = { dit: false, dah: false }, mem = { dit: false, dah: false };
    let busy = false, cur = null, lastEl = null, keyTimer = null;
    const name = el => el === '.' ? 'dit' : 'dah';
    const next = () => {
      const want = el => pad[name(el)] || mem[name(el)];
      const opp = lastEl === '.' ? '-' : '.';
      const el = lastEl && want(opp) ? opp : lastEl && want(lastEl) ? lastEl : want('.') ? '.' : want('-') ? '-' : null;
      if (!el) { busy = false; lastEl = null; return; }
      busy = true; cur = el; lastEl = el;
      mem[name(el)] = false;
      if (pad.dit && pad.dah) mem[name(el === '.' ? '-' : '.')] = true;
      markStart();
      tone(true);
      const u = unitMs(opts.wpm);
      keyTimer = setTimeout(() => {
        tone(false);
        cur = null;
        markEnd(el);
        keyTimer = setTimeout(next, u);
      }, (el === '.' ? 1 : 3) * u);
    };

    // Bug. One lever, so a dah can't start during a dit or a dit during a dah.
    let bugDit = false, dahAt = null;
    const bugNext = () => {
      if (!bugDit || dahAt !== null) { busy = false; return; }
      busy = true;
      markStart();
      tone(true);
      const u = unitMs(opts.wpm);
      keyTimer = setTimeout(() => {
        tone(false);
        markEnd('.');
        keyTimer = setTimeout(bugNext, u);
      }, u);
    };
    const bugDown = which => {
      if (which === 'dit') {
        bugDit = true;
        if (!busy && dahAt === null) bugNext();
      } else if (!busy && dahAt === null) {
        markStart();
        dahAt = now();
        tone(true);
      }
    };
    const bugUp = which => {
      if (which === 'dit') { bugDit = false; return; }
      if (dahAt === null) return;
      tone(false);
      dahAt = null;
      markEnd('-');
    };

    return {
      down(which) {
        if (opts.mode === 'bug') return bugDown(which);
        if (opts.mode !== 'iambic') return straightDown();
        if (pad[which]) return;
        pad[which] = true;
        if (!busy) next();
        else if (cur === null || which !== name(cur)) mem[which] = true;
      },
      up(which) {
        if (opts.mode === 'bug') return bugUp(which);
        if (opts.mode !== 'iambic') return straightUp();
        pad[which] = false;
      },
      // Decodes the character in progress straight away.
      flush() { clearTimeout(gapTimer); if (code) commit(); },
      clear() { clearTimeout(gapTimer); text = code = ''; space = false; first = last = null; emit(); },
      get text() { return text; },
      stats: () => ({ first, last, wpm: 1200 / unit() }),
      dispose() {
        clearTimeout(gapTimer);
        clearTimeout(keyTimer);
        if (osc) { tone(false); osc.stop(ac.currentTime + 0.05); }
      },
    };
  }

  // Length of text in units at standard spacing, for working out a sending speed.
  const units = text => timeline(parse(text)).length;

  return {
    CODE, MIN_WPM, MAX_WPM, KOCH_ORDER, LESSONS, learned, exercise, parse, unitMs, spacing, play, stop, sender, units,
    playing: () => !!run,
  };
})();
