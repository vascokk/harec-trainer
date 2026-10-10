# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Unofficial practice material for the Irish IRTS HAREC amateur radio licence exam. It has two parts:

1. **Question banks → Markdown exam papers**: Python scripts turn `question_bank/setNN.py` into `practice_exams/HAREC_Practice_Exam_Set_NN.md`. Each paper has 60 questions and an answer key that cites Study Guide page numbers.
2. **HAREC Trainer app** (`app/`): a static vanilla-JS web app (`app/src/`) wrapped in a Tauri 2 desktop shell (`app/src-tauri/`). The app uses no Tauri APIs, and the same `app/src/` folder is deployed to Cloudflare as a Worker with static assets (`wrangler.jsonc`, custom domain harec-trainer.com). The Worker script (`worker/index.js`) only handles `/api/*`: the optional contest leaderboards, stored in a D1 database. `.wrangler/` is local Wrangler state and is gitignored.

The sources of truth are the IRTS syllabus and the IRTS Study Guide (edition 4.0.3), kept as PDFs in the repo root. They are gitignored (`*.pdf`) because they are IRTS copyright, and they must never be committed. The live app is at https://harec-trainer.com/.

## Commands

```sh
python3 make_exams.py            # rebuild every exam Markdown file
python3 make_exams.py 11 12      # rebuild only sets 11 and 12
python3 make_chapters.py         # validate chapter banks, write chapter_practice/Chapter_NN.md (args: chapter numbers)
python3 make_figures.py          # regenerate figures/ for sets 01–10
python3 make_figures_batch2.py   # regenerate figures/ for sets 11–20
python3 make_figures_chapters.py # regenerate figures/chNN_*.svg for the chapter banks
python3 export_app_data.py       # regenerate app/src/data/questions.js (sets + chapter banks) and copy figures/ to app/src/figures/
cd app/src-tauri && cargo tauri dev     # run the desktop app
cd app/src-tauri && cargo tauri build   # build desktop bundles
npx wrangler deploy                     # deploy app/src and worker/ to harec-trainer.com (wrangler.jsonc)
npx wrangler d1 migrations apply harec-trainer --local    # create/upgrade the local D1 database (--remote for production)
npx wrangler dev                        # app + API locally, with the local D1 database
```

There are no tests and no linters. `make_exams.py` is the validator. If anything fails, it writes nothing and prints the errors: a reference phrase is missing from the guide, a section has the wrong question count, a question doesn't have exactly 4 options or a valid answer, or a figure name doesn't match its position or is missing.

`guide_index.py` needs `pdftotext` (poppler) installed.

## Data pipeline

```
question_bank/setNN.py ──make_exams.py──▶ practice_exams/HAREC_Practice_Exam_Set_NN.md
        │                    ▲
        │               guide_index.py (pdftotext page lookup)
        │                    ▼
        └──────export_app_data.py──▶ app/src/data/questions.js  (window.HAREC_DATA)
make_figures*.py ──▶ figures/*.svg ──export_app_data.py──▶ app/src/figures/
question_bank/chapters/chNN.py ──make_chapters.py──▶ chapter_practice/Chapter_NN.md
        └──────export_app_data.py──▶ app/src/data/questions.js (chapters, chapterQuestions)
```

- **Do not hand-edit generated files.** These are `practice_exams/`, `chapter_practice/`, `app/src/data/questions.js` and `app/src/figures/`. Edit the bank or figure script instead, then re-run the generators. After any change to a bank, run both `make_exams.py` and `export_app_data.py`.
- **Bank format.** Each bank defines `QUESTIONS`, a list of `(section, question, [A, B, C, D], answer_letter, explanation, ref[, figure])`. The `make_exams.py` docstring documents it. `ref` is a phrase that must appear in the Study Guide. Without a page range, it is searched in that section's chapters (`TOPIC_PAGES` in `guide_index.py`). Pass `(phrase, first_page, last_page)` to search elsewhere. Phrases that normalise to fewer than 5 characters must have a range. Matching ignores case, punctuation, spacing and ligatures.
- **Ordering.** Questions are numbered after sorting into `SECTIONS` order. `SECTIONS` in `make_exams.py` fixes the per-section counts (30 questions in Section A, 30 in Section B). A figure must be named `setNN_qM`, where M is the question's final position in the paper.
- **Page numbers.** These are *printed* Study Guide pages. PDF page = printed + 24 (`PDF_OFFSET`). The app also hard-codes this offset in `app.js`.
- **Chapter banks.** `question_bank/chapters/chNN.py` holds practice questions for one Study Guide chapter (3–29), separate from the exam sets. Each defines `TITLE`, `SECTION`, `PAGES` (printed), `TOPICS` (the chapter's subsections the exam draws on; sections the guide marks as outside the syllabus are left out) and `QUESTIONS` of `(topic, question, [A, B, C, D], answer_letter, explanation, ref[, figure])`; the `make_chapters.py` docstring documents it. A figure must be named `chNN_<name>` after its chapter, drawn in `make_figures_chapters.py`, and may be shared by several questions. `ref` is searched within `PAGES` unless given as `(phrase, first, last)`. Every topic must have at least one question, which is how coverage is enforced. After editing a chapter bank, run `make_chapters.py` and `export_app_data.py`. The exporter also lists, per chapter, the exam-set figure questions whose page lies in the chapter's `PAGES` (`setFigures`); the app adds them to the chapter's pool.
- `make_figures_batch2.py` and `make_figures_chapters.py` reuse the SVG drawing helpers in `make_figures.py` (resistors, meters, scopes, polar plots, block chains). Each script fills a `figs` dict and calls `write_all`.
- `insert_figure_questions.py` is an obsolete one-off script that patched figure questions into the exam Markdown for sets 01–10. Do not run or import it: it rewrites those files at import time and removes the page numbers from their answer keys.

## App (`app/src/`)

- `index.html` loads `data/questions.js`, then `morse.js`, then `app.js`. There is no build step or bundler, and no framework.
- `app.js` is a single-file view router: `go(view)` → `render()` → `renderHome`, `renderPracticeSetup`, `renderPractice`, `renderExamSetup`, `renderExam`, `renderResults`, and so on. HTML is built from template strings, so escape interpolated text with `esc()`. A delegated event handler sits at the bottom of the file.
- Question practice has two modes, switched by `practiceCfg.by` on the setup page. 'section' filters by syllabus section, and `practiceCfg.source` picks the pool: 'all' sets, one 'set', 'chapters' (the chapter questions) or 'everything'. 'chapter' shows the chapter list (`chapterListHtml`); a chapter opens the `chapter` view (`renderChapter`, `startChapter`, `chapterCfg` saved as `harec.chapterCfg`). Chapter questions (`CHAPTER_QS`, ids `cNNqMM`, with `chapter` and `topic` instead of `set`) are in `BY_ID` but not in `QUESTIONS`, so exams and the set-based QSL cards ignore them. A chapter's pool (`chapterQs`) also includes the exam-set figure questions listed in its `setFigures`. Mastery is the share of questions whose last answer was correct (`mastery()`); a chapter session reuses the practice view and keeps `state.again` so "Practise again" restarts the same chapter or subsection. The `chapter` and `rtm` QSL cards are based on chapter mastery.
- Practice and exam modes are both supported. An exam is 2 hours, and the pass mark is 60% in each of Section A and Section B. A paper is either one fixed set or a random exam that follows the `SECTIONS` counts. Answer options can be shuffled for display (`present()`).
- `morse.js` is the Morse engine with no UI (`window.Morse`): the ITU code table and timing (1 unit = 1200/WPM ms; gaps of 1, 3 and 7 units), the Koch order split into 2-character lessons, exercise generation limited to learned characters, and a Web Audio keyer. Its views (`renderMorse`, `renderKoch`, `renderKochDone`) live in `app.js`. Speed is clamped to 18–25 WPM, and the Koch pass mark is 90%. Koch lessons can use Farnsworth spacing (`Morse.spacing`, ARRL formula, effective speed 5–15 WPM); the translator always uses standard spacing. Farnsworth sessions are practice only: they never unlock a lesson or record a best score. `Morse.sender` is the sending keyer (straight key with an adaptive decoder, a bug, or an iambic mode B paddle keyer) and decoder; the Sending tab's UI and its pointer and keyboard handlers are in `app.js`. The Morse test tab (`testPanel`, `renderMorseTest`, `TEST_PARTS`) simulates the IRTS Morse test: 5 WPM by default (adjustable), receiving and sending of 75 characters of plain language (max 4 errors) and five 5-figure groups (max 3 errors); sending uses the same keyer and key choice as the Sending tab. The Contest tab (`contestPanel`, `renderContest`, `renderContestDone`) is a timed WPX-style receiving run: stations send `CALL 5NN serial`, a QSO counts when both call and number are copied, score = QSOs × distinct prefixes, optional adaptive speed (10–45 WPM) and cut numbers; personal bests per run length are saved as `harec.contest`, and only full-length runs count.
- The mascot is a cartoon Irish hare, one hand-drawn SVG per mood in `app/src/mascot/` (`classic`, `sleepy`, `qsl`, `tangled`, `morse`, `cq`, and `badge`, which is the favicon). `mascot(mood, cls)` in `app.js` returns a decorative `<img>`; it appears in the streak bar (sleepy while the streak is at risk), on the exam and Koch results (`qsl`/`morse` on a pass, `tangled` on a fail) and on the contest results.
- The home page ends with a link to the GitHub repository (https://github.com/vascokk/harec-trainer), with an inline GitHub icon (`ICON.github`, `.repo-link`).
- The app shows only the terms gate (`renderTerms`) until the disclaimer checkbox is accepted; acceptance is stored as `harec.terms`. Bump `TERMS_VERSION` in `app.js` when the disclaimer wording changes, so everyone accepts it again.
- Gamification: a daily streak (`streak()`, `logActivity()`; a day counts at `DAY_GOAL` points, one missed day a week is forgiven) shown on the home page, and QSL-card awards (`QSL_CARDS`, each with a `got(ctx)` test) checked on every render by `checkAwards()`, which shows a toast for new cards; the album is the `qsl` view, and earned cards also appear newest first in a horizontally scrolling row on the home page (`earnedQslHtml`). Earned cards are kept even if their condition later stops holding.
- Per-question stats, theme, an in-progress exam, streak activity (`activity`) and earned QSL cards (`qsl`) are saved in `localStorage` under the `harec.` prefix, through the `store` wrapper. The app must keep working when storage is unavailable.
- Leaderboards are opt-in and online; everything else stays local. The profile page (`renderProfile`, top-bar button) joins, renames, shows the player code, restores it on another device, signs out, and deletes the player's data (`DELETE /api/me`). A player is a random 64-hex secret kept as `harec.player` and sent as a bearer token; D1 stores only its SHA-256, a public id, a nickname, best scores per board and the last submission time, never emails or IPs. Contest runs that last their full length are posted automatically (`postContest`); the Worker recomputes the score from the submitted log and rejects implausible logs (`scoreLog`) and runs that end too soon after the previous one. Each board has an all-time and a weekly ranking (`period=all|week`); weeks run from Monday 00:00 UTC and are named by that Monday's date. When a week ends, `settleWeeks()` stores each player's best place across the boards in `week_results` if it is in the top 5. It runs from the Monday cron trigger in `wrangler.jsonc` and lazily on requests, and is idempotent. Leaderboard rows carry each player's weekly finish counts (`w1`, `w3`, `w5`; a #1 week counts in all three), which the app keeps in `harec.weekWins` (`syncWins`, never lowered) for the three weekly QSL cards and their counts. Test the cron locally with `npx wrangler dev --test-scheduled` and `curl 'localhost:8787/__scheduled?cron=5+0+*+*+1'`. Boards render into `[data-lb]` placeholders that `hydrateBoards()` fills after every render. The app calls `/api` on its own origin when served from harec-trainer.com or localhost, and `https://harec-trainer.com` otherwise (the desktop app). Schema changes go in a new file in `worker/migrations/`.
- The Tauri CSP (`tauri.conf.json`) allows only `'self'` scripts, plus `data:` images, inline styles and `connect-src` to harec-trainer.com for the leaderboard API. Keep everything local; no CDNs.
