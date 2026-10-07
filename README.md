# HAREC Practice Exams & Trainer

Unofficial practice material for the **IRTS HAREC** exam, the Harmonised Amateur Radio Examination Certificate that leads to an amateur station licence in Ireland.

- **20 practice papers** with 1,200 questions in total. Each paper follows the official exam layout: 60 multiple-choice questions, split by syllabus section in the official proportions.
- **Answer keys** with a short explanation for each answer and the Study Guide page that confirms it.
- **60 diagram questions** covering circuits, block diagrams, radiation patterns and oscilloscope traces. They are drawn as SVG.
- **HAREC Trainer**, an offline study app that runs in the browser or as a desktop app, with question practice, timed mock exams and a Morse code trainer for receiving and sending.

**▶ Try the app online: <https://harec-trainer.pages.dev/>**

> **Disclaimer:** This project is not affiliated with or endorsed by the IRTS or ComReg. The questions are written to the IRTS HAREC Exam Syllabus (Rev 2.0.2) and checked against the IRTS HAREC Study Guide (edition 4.0.3), but they are not official exam questions. Always check against the current official material.

## The exam format

| | Section A: Technical | Section B: Operating, Rules & Regulations |
|---|---|---|
| Questions | 30 | 30 |
| Pass mark | 18/30 (60%) | 18/30 (60%) |

You have 2 hours for all 60 questions, and you must reach the pass mark **in each section**. Every paper here uses the per-section question counts of the syllabus, for example 5 on Safety and 3 on Q-codes.

## Using the practice papers

Open any `HAREC_Practice_Exam_Set_NN.md` file. GitHub renders these with their figures. The answer key is at the end of each paper.

Page numbers in the answer keys are the **printed** page numbers of the Study Guide. In a PDF viewer, add 24: printed page 343 is PDF page 367.

## HAREC Trainer app

A small static web app in `app/src/`. It has no dependencies or build step, and it works offline. A hosted copy is at <https://harec-trainer.pages.dev/>.

- **Question practice:** pick sets and syllabus sections. You can put questions you got wrong first and shuffle the answer order. Each answer shows its explanation and Study Guide page straight away.
- **Exam practice:** sit any of the 20 sets, or a random paper weighted by syllabus that prefers questions you haven't seen yet or got wrong. You can turn the 2-hour timer on, flag questions to come back to, and get a per-section result with a full review.
- **Morse code (CW):** a Koch method course of 21 lessons, each adding two characters in Koch order. Every lesson sends groups of the new characters first, then, if you choose, groups, words and callsigns using everything learned so far. You type what you hear and the trainer marks each mistake. Copying 90% unlocks the next lesson. A translator sends any text you type, once or on repeat. Characters are sent at 18–25 WPM with ITU timing. Lessons can use Farnsworth spacing, which keeps the characters at full speed but lengthens the gaps to an effective speed of 5–15 WPM. These sessions are practice only; a lesson is passed only at full speed. A sending trainer lets you key Morse with an on-screen straight key or iambic paddles (touch, mouse or keyboard), using Koch characters, QSO phrases or your own text; it decodes what you send, marks each mistake and measures your speed.
- Your progress, exam history and an exam in progress are saved in the browser's local storage. Light and dark themes are available.

### Run in a browser

Serve the `app/src` folder with any static file server:

```sh
python3 -m http.server -d app/src 8000
# then open http://localhost:8000
```

### Run as a desktop app

The desktop version uses [Tauri 2](https://tauri.app). It needs Rust and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your platform.

```sh
cargo install tauri-cli --version "^2"
cd app/src-tauri
cargo tauri dev      # run
cargo tauri build    # build installers / bundles
```

## Repository layout

```
question_bank/setNN.py           Source of truth: the questions for each paper
figures/                         SVG diagrams (generated)
HAREC_Practice_Exam_Set_NN.md    Practice papers (generated)
make_exams.py                    Builds and validates the Markdown papers
guide_index.py                   Finds Study Guide pages for answer references
make_figures.py                  Draws the figures for sets 01–10
make_figures_batch2.py           Draws the figures for sets 11–20
export_app_data.py               Exports questions and figures to the app
app/src/                         HAREC Trainer web app
app/src-tauri/                   Tauri desktop wrapper
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
python3 make_figures.py && python3 make_figures_batch2.py   # only if figures changed
python3 make_exams.py            # all sets, or e.g. `python3 make_exams.py 7` for a single set
python3 export_app_data.py       # update the app
```

`make_exams.py` writes nothing if any check fails. The checks are: every reference phrase is found in the Study Guide, each section has the right number of questions, each question has exactly four options and a valid answer, and every figure exists and matches its question's position.

The page lookup needs `pdftotext` from [Poppler](https://poppler.freedesktop.org/), for example `apt install poppler-utils` or `brew install poppler`. It also needs the IRTS HAREC Study Guide (edition 4.0.3). That is an IRTS publication, so it is not included in this repository. Download it from the [IRTS website](https://www.irts.ie) and save it in the repository root as `IRTS_HAREC_Amateur_Station_Licence_Study_Guide.pdf`. Page lookups assume edition 4.0.3; another edition may give different page numbers.

## Official resources

- [IRTS](https://www.irts.ie): the Irish Radio Transmitters Society, which publishes the HAREC Study Guide, syllabus and sample papers
- [ComReg](https://www.comreg.ie): the Irish licensing authority for amateur stations

## License

Licensed under the [Apache License 2.0](LICENSE). The licence covers this project's own content only, not the IRTS publications it refers to.

73 and good luck in the exam!
