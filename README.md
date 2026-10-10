# HAREC Practice Exams & Trainer

Unofficial practice material for the **IRTS HAREC** exam, the Harmonised Amateur Radio Examination Certificate that leads to an amateur station licence in Ireland.

- **20 practice papers** with 1,200 questions in total. Each paper follows the official exam layout: 60 multiple-choice questions, split by syllabus section in the official proportions.
- **Answer keys** with a short explanation for each answer and the Study Guide page that confirms it.
- **Chapter practice:** 1,036 more questions, separate from the papers, arranged by Study Guide chapter (chapters 3–29) so you can practise each chapter right after reading it. Every subsection the exam draws on has questions, and 70 of them come with diagrams.
- **60 diagram questions** covering circuits, block diagrams, radiation patterns and oscilloscope traces. They are drawn as SVG.
- **HAREC Trainer**, a study app that runs in the browser or as a desktop app and works offline. It has question practice, study by chapter, timed mock exams, and a Morse code trainer for receiving and sending, with a mock IRTS Morse test and a contest mode. Daily streaks and QSL-card awards track your progress, and there are optional online contest leaderboards.

**▶ Try the app online: <https://harec-trainer.com/>**

> **Disclaimer:** This project, its website and its application are unofficial. They are not affiliated with, endorsed by or connected in any way to the IRTS, ComReg or any other governmental or non-governmental organisation or regulatory body. The questions are written to the IRTS HAREC Exam Syllabus (Rev 2.0.2) and checked against the IRTS HAREC Study Guide (edition 4.0.3), but they are not official exam questions, and the content may contain errors. The authors accept no responsibility or liability for any errors or for any consequences of using this material, the website or the application. Always check against the current official material. By using the website or the application, you accept these terms.

## The exam format

| | Section A: Technical | Section B: Operating, Rules & Regulations |
|---|---|---|
| Questions | 30 | 30 |
| Pass mark | 18/30 (60%) | 18/30 (60%) |

You have 2 hours for all 60 questions, and you must reach the pass mark **in each section**. Every paper here uses the per-section question counts of the syllabus, for example 5 on Safety and 3 on Q-codes.

## Using the practice papers

Open any `HAREC_Practice_Exam_Set_NN.md` file. GitHub renders these with their figures. The answer key is at the end of each paper.

For chapter practice, open `chapter_practice/Chapter_NN.md`. The questions are grouped by the chapter's subsections, with the answer key at the end.

Page numbers in the answer keys are the **printed** page numbers of the Study Guide. In a PDF viewer, add 24: printed page 343 is PDF page 367.

## HAREC Trainer app

A small static web app in `app/src/`. It has no dependencies or build step, and everything except the optional leaderboards works offline. A hosted copy is at <https://harec-trainer.com/>.

- **Question practice:** pick sets and syllabus sections. You can put questions you got wrong first and shuffle the answer order. Each answer shows its explanation and Study Guide page straight away.
- **Study by chapter:** pick a Study Guide chapter and practise its questions, all at once or one subsection at a time, in the guide's order or mixed. The exam-set diagram questions whose answers are in that chapter are included too. A mastery bar for each chapter and subsection shows the share of questions you got right the last time you answered them.
- **Exam practice:** sit any of the 20 sets, or a random paper weighted by syllabus that prefers questions you haven't seen yet or got wrong. You can turn the 2-hour timer on, flag questions to come back to, and get a per-section result with a full review.
- **Morse code (CW)** has five tabs:
  - **Koch course:** 21 lessons, each adding two characters in Koch order. Every lesson sends groups of the new characters first, then, if you choose, groups, words and callsigns using everything learned so far. You type what you hear and the trainer marks each mistake. Copying 90% unlocks the next lesson. Characters are sent at 18–25 WPM with ITU timing. Lessons can use Farnsworth spacing, which keeps the characters at full speed but lengthens the gaps to an effective speed of 5–15 WPM. These sessions are practice only; a lesson is passed only at full speed.
  - **Translator:** sends any text you type, once or on repeat.
  - **Sending:** key Morse with an on-screen straight key, a bug or iambic paddles (touch, mouse or keyboard), using Koch characters, QSO phrases or your own text. The trainer decodes what you send, marks each mistake and measures your speed.
  - **Morse test:** a mock of the IRTS Morse test at 5 WPM by default (adjustable). It has four parts: receiving and sending 75 characters of plain language (at most 4 errors), and receiving and sending five 5-figure groups (at most 3 errors). Sending uses the same key as the Sending tab.
  - **Contest:** a timed receiving run in the style of a WPX contest, lasting 1, 2, 5 or 10 minutes. Stations send `CALL 5NN serial`, and a QSO counts when you copy both the call and the number. Your score is QSOs × distinct prefixes. Optional adaptive speed (10–45 WPM) speeds up after each good QSO and slows down after a miss, and optional cut numbers send T for 0 and N for 9. Personal bests are kept for each run length.
- **Streaks and QSL cards:** a day counts towards your streak when you reach 20 points. Each answered question scores 1 point, each good contest QSO 2, each checked sending exercise 4, and a completed Koch lesson or Morse test part fills the whole day. One missed day a week is forgiven. Milestones earn QSL cards, for example your first answer, 80% in every syllabus section, a passed mock exam, mastering a chapter, finishing the Koch course, passing the Morse test or a 30-day streak. Earned cards appear on the home page and in an album.
- **Contest leaderboards (optional):** join from the profile button with a nickname to post full-length contest runs to online leaderboards, one per run length, ranked all-time and weekly. Weeks run from Monday 00:00 UTC, and finishing a week in the top 5, top 3 or at number 1 earns its own QSL card. You get no account or password: the app creates a random player code, which you can copy to restore your profile on another device. The server stores only a hash of that code, your nickname, your best scores and the time of your last run, never your email or IP address. You can rename yourself, sign out or delete your data from the profile page. The server recalculates every score from the submitted log and rejects implausible runs.
- Your progress, exam history, streak, QSL cards and an exam in progress are saved in the browser's local storage. Nothing but the optional leaderboards leaves your device. Light and dark themes are available.

### Run in a browser

Serve the `app/src` folder with any static file server:

```sh
python3 -m http.server -d app/src 8000
# then open http://localhost:8000
```

This runs everything except the leaderboards. To run the leaderboard API too, use Wrangler with a local database:

```sh
npx wrangler d1 migrations apply harec-trainer --local   # create or upgrade the local database
npx wrangler dev                                         # app and API on http://localhost:8787
```

### Run as a desktop app

The desktop version uses [Tauri 2](https://tauri.app). It needs Rust and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

```sh
cargo install tauri-cli --version "^2"
cd app/src-tauri
cargo tauri dev      # run
cargo tauri build    # build installers / bundles
```

### Deploy

The website is a Cloudflare Worker with static assets, configured in `wrangler.jsonc`. It serves `app/src/`, and `worker/index.js` handles `/api/*` for the leaderboards, which are stored in a D1 database. A cron trigger every Monday settles the previous week's rankings.

```sh
npx wrangler d1 migrations apply harec-trainer --remote   # apply schema changes from worker/migrations/
npx wrangler deploy
```

The desktop app uses the leaderboard API at <https://harec-trainer.com>.

## Repository layout

```
question_bank/setNN.py           Source of truth: the questions for each paper
figures/                         SVG diagrams (generated)
HAREC_Practice_Exam_Set_NN.md    Practice papers (generated)
make_exams.py                    Builds and validates the Markdown papers
guide_index.py                   Finds Study Guide pages for answer references
make_figures.py                  Draws the figures for sets 01–10
make_figures_batch2.py           Draws the figures for sets 11–20
question_bank/chapters/chNN.py   Questions for Study Guide chapter NN
chapter_practice/Chapter_NN.md   Chapter practice sets (generated)
make_chapters.py                 Builds and validates the chapter practice sets
make_figures_chapters.py         Draws the figures for the chapter questions
export_app_data.py               Exports questions and figures to the app
app/src/                         HAREC Trainer web app
app/src-tauri/                   Tauri desktop wrapper
worker/                          Cloudflare Worker for the leaderboard API, with D1 migrations
wrangler.jsonc                   Cloudflare deployment configuration
```

## Editing or adding questions

The Markdown papers and the app data are generated, so don't edit them by hand. Edit the question bank and rebuild instead.

Each `question_bank/setNN.py` defines a `QUESTIONS` list of tuples:

```python
(section, question, [optA, optB, optC, optD], answer, explanation, ref[, figure])

# example
('A.3', 'A voltage of 12 V is applied across a 4 Ω resistor. What current flows?',
 ['0.33 A', '3 A', '16 A', '48 A'], 'B', 'I = V/R = 12/4 = 3 A', ('Ohm’s law', 20, 23)),
```

- `section` is a syllabus subsection, such as `A.1` or `B.10`.
- `ref` is a phrase from the Study Guide that confirms the answer. By default it is searched in the chapters for that section. You can also give `(phrase, first_page, last_page)` to search a specific range of printed pages. The page where it is found goes into the answer key.
- `figure` is optional. It names an SVG in `figures/` and must be `setNN_qM`, where M is the question's number in the finished paper.

Then rebuild:

```sh
python3 make_figures.py && python3 make_figures_batch2.py && python3 make_figures_chapters.py   # only if figures changed
python3 make_exams.py            # all sets, or e.g. `python3 make_exams.py 7` for a single set
python3 export_app_data.py       # update the app
```

### Chapter questions

Each `question_bank/chapters/chNN.py` defines the chapter's `TITLE`, `SECTION` (syllabus subsection), `PAGES` (printed pages), `TOPICS` (the chapter's subsections the exam draws on) and a `QUESTIONS` list:

```python
(topic, question, [optA, optB, optC, optD], answer, explanation, ref[, figure])
```

`topic` is a key of `TOPICS`, such as `'8.4.2'`. `ref` is searched within the chapter's pages unless you give a page range. `figure` is optional and must be named `chNN_<name>`. Rebuild with `python3 make_figures_chapters.py` (if figures changed), `python3 make_chapters.py` and `python3 export_app_data.py`. `make_chapters.py` checks the same things as `make_exams.py`, and also that every subsection in `TOPICS` has at least one question.

`make_exams.py` writes nothing if any check fails. The checks are: every reference phrase is found in the Study Guide, each section has the right number of questions, each question has exactly four options and a valid answer, and every figure exists and matches its question's position.

The page lookup needs `pdftotext` from [Poppler](https://poppler.freedesktop.org/), for example `apt install poppler-utils` or `brew install poppler`. It also needs the IRTS HAREC Study Guide (edition 4.0.3). That is an IRTS publication, so it is not included in this repository. Download it from the [IRTS website](https://www.irts.ie) and save it in the repository root as `IRTS_HAREC_Amateur_Station_Licence_Study_Guide.pdf`. Page lookups assume edition 4.0.3; another edition may give different page numbers.

## Official resources

- [IRTS](https://www.irts.ie): the Irish Radio Transmitters Society, which publishes the HAREC Study Guide, syllabus and sample papers
- [ComReg](https://www.comreg.ie): the Irish licensing authority for amateur stations

## License

Licensed under the [Apache License 2.0](LICENSE). The licence covers this project's own content only, not the IRTS publications it refers to.

73 and good luck in the exam!
