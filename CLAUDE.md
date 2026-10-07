# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Unofficial practice material for the Irish IRTS HAREC amateur radio licence exam. It has two parts:

1. **Question banks → Markdown exam papers**: Python scripts turn `question_bank/setNN.py` into `HAREC_Practice_Exam_Set_NN.md`. Each paper has 60 questions and an answer key that cites Study Guide page numbers.
2. **HAREC Trainer app** (`app/`): a static vanilla-JS web app (`app/src/`) wrapped in a Tauri 2 desktop shell (`app/src-tauri/`). The app uses no Tauri APIs, and the same `app/src/` folder is deployed to Cloudflare as a Worker with static assets (`wrangler.jsonc`, custom domain harec-trainer.com). `.wrangler/` is local Wrangler state and is gitignored.

The sources of truth are the IRTS syllabus and the IRTS Study Guide (edition 4.0.3), kept as PDFs in the repo root. They are gitignored (`*.pdf`) because they are IRTS copyright, and they must never be committed. The live app is at https://harec-trainer.com/.

## Commands

```sh
python3 make_exams.py            # rebuild every exam Markdown file
python3 make_exams.py 11 12      # rebuild only sets 11 and 12
python3 make_figures.py          # regenerate figures/ for sets 01–10
python3 make_figures_batch2.py   # regenerate figures/ for sets 11–20
python3 export_app_data.py       # regenerate app/src/data/questions.js and copy figures/ to app/src/figures/
cd app/src-tauri && cargo tauri dev     # run the desktop app
cd app/src-tauri && cargo tauri build   # build desktop bundles
npx wrangler deploy                     # deploy app/src to harec-trainer.com (wrangler.jsonc)
```

There are no tests and no linters. `make_exams.py` is the validator. If anything fails, it writes nothing and prints the errors: a reference phrase is missing from the guide, a section has the wrong question count, a question doesn't have exactly 4 options or a valid answer, or a figure name doesn't match its position or is missing.

`guide_index.py` needs `pdftotext` (poppler) installed.

## Data pipeline

```
question_bank/setNN.py ──make_exams.py──▶ HAREC_Practice_Exam_Set_NN.md
        │                    ▲
        │               guide_index.py (pdftotext page lookup)
        │                    ▼
        └──────export_app_data.py──▶ app/src/data/questions.js  (window.HAREC_DATA)
make_figures*.py ──▶ figures/*.svg ──export_app_data.py──▶ app/src/figures/
```

- **Do not hand-edit generated files.** These are `HAREC_Practice_Exam_Set_*.md`, `app/src/data/questions.js` and `app/src/figures/`. Edit the bank or figure script instead, then re-run the generators. After any change to a bank, run both `make_exams.py` and `export_app_data.py`.
- **Bank format.** Each bank defines `QUESTIONS`, a list of `(section, question, [A, B, C, D], answer_letter, explanation, ref[, figure])`. The `make_exams.py` docstring documents it. `ref` is a phrase that must appear in the Study Guide. Without a page range, it is searched in that section's chapters (`TOPIC_PAGES` in `guide_index.py`). Pass `(phrase, first_page, last_page)` to search elsewhere. Phrases that normalise to fewer than 5 characters must have a range. Matching ignores case, punctuation, spacing and ligatures.
- **Ordering.** Questions are numbered after sorting into `SECTIONS` order. `SECTIONS` in `make_exams.py` fixes the per-section counts (30 questions in Section A, 30 in Section B). A figure must be named `setNN_qM`, where M is the question's final position in the paper.
- **Page numbers.** These are *printed* Study Guide pages. PDF page = printed + 24 (`PDF_OFFSET`). The app also hard-codes this offset in `app.js`.
- `make_figures_batch2.py` reuses the SVG drawing helpers in `make_figures.py` (resistors, meters, scopes, polar plots, block chains). Each script fills a `figs` dict and calls `write_all`.
- `insert_figure_questions.py` is an obsolete one-off script that patched figure questions into the exam Markdown for sets 01–10. Do not run or import it: it rewrites those files at import time and removes the page numbers from their answer keys.

## App (`app/src/`)

- `index.html` loads `data/questions.js`, then `morse.js`, then `app.js`. There is no build step or bundler, and no framework.
- `app.js` is a single-file view router: `go(view)` → `render()` → `renderHome`, `renderPracticeSetup`, `renderPractice`, `renderExamSetup`, `renderExam`, `renderResults`, and so on. HTML is built from template strings, so escape interpolated text with `esc()`. A delegated event handler sits at the bottom of the file.
- Practice and exam modes are both supported. An exam is 2 hours, and the pass mark is 60% in each of Section A and Section B. A paper is either one fixed set or a random exam that follows the `SECTIONS` counts. Answer options can be shuffled for display (`present()`).
- `morse.js` is the Morse engine with no UI (`window.Morse`): the ITU code table and timing (1 unit = 1200/WPM ms; gaps of 1, 3 and 7 units), the Koch order split into 2-character lessons, exercise generation limited to learned characters, and a Web Audio keyer. Its views (`renderMorse`, `renderKoch`, `renderKochDone`) live in `app.js`. Speed is clamped to 18–25 WPM, and the Koch pass mark is 90%. Koch lessons can use Farnsworth spacing (`Morse.spacing`, ARRL formula, effective speed 5–15 WPM); the translator always uses standard spacing. Farnsworth sessions are practice only: they never unlock a lesson or record a best score. `Morse.sender` is the sending keyer (straight key with an adaptive decoder, or an iambic mode B paddle keyer) and decoder; the Sending tab's UI and its pointer and keyboard handlers are in `app.js`.
- The app shows only the terms gate (`renderTerms`) until the disclaimer checkbox is accepted; acceptance is stored as `harec.terms`. Bump `TERMS_VERSION` in `app.js` when the disclaimer wording changes, so everyone accepts it again.
- Per-question stats, theme and an in-progress exam are saved in `localStorage` under the `harec.` prefix, through the `store` wrapper. The app must keep working when storage is unavailable.
- The Tauri CSP (`tauri.conf.json`) allows only `'self'` scripts, plus `data:` images and inline styles. Keep everything local; no CDNs.
