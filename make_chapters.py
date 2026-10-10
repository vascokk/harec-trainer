"""Build per-chapter practice question sets from question_bank/chapters/chNN.py.

Each chapter bank covers one Study Guide chapter that the exam draws on, so a
student can read a chapter and then practise on it. A bank module defines:

    TITLE = 'Resistors in Circuits'      # chapter title as in the guide
    SECTION = 'A.4'                      # syllabus subsection the chapter serves
    PAGES = (28, 37)                     # printed pages of the chapter
    TOPICS = {'4.1': 'Circuits', ...}    # the chapter's numbered subsections
    QUESTIONS = [(topic, question, [optA, optB, optC, optD], answer, explanation, ref[, figure]), ...]

- topic: the guide subsection the question tests, e.g. '4.2'. Every entry in
  TOPICS must have at least one question, which is how coverage is enforced.
- ref: a phrase from the Study Guide that confirms the answer, searched in the
  chapter's PAGES, or (phrase, first_page, last_page) to search elsewhere.
- figure: optional SVG name in figures/, drawn by make_figures_chapters.py; it
  must be named chNN_<name> after its chapter.

Writes chapter_practice/Chapter_NN.md for every bank. Usage:
python3 make_chapters.py 3 11 ...   (no arguments = every chapter)
Nothing is written if any check fails.
"""
import collections
import glob
import importlib.util
import os
import sys

from guide_index import PDF_OFFSET, Guide, norm
from make_exams import HERE

BANK_DIR = os.path.join(HERE, 'question_bank', 'chapters')
OUT_DIR = os.path.join(HERE, 'chapter_practice')

HEADER = """# IRTS HAREC Chapter Practice — Chapter {n}: {title}

{count} questions on Study Guide chapter {n} (printed pages {lo}–{hi}), grouped by the guide's own subsections.
Read the chapter first, then try the questions. Answers, explanations and page numbers are at the end.

> Unofficial practice material based on the IRTS HAREC Study Guide (4.0.3). Syllabus section: {section}.
> Page numbers are the **printed** page numbers of the Study Guide; in a PDF viewer, add {off}.

---
"""


def load_chapter(path):
    spec = importlib.util.spec_from_file_location(os.path.basename(path)[:-3], path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def chapter_banks(wanted=()):
    """(chapter number, module) for every bank, in chapter order."""
    out = []
    for path in sorted(glob.glob(os.path.join(BANK_DIR, 'ch*.py'))):
        n = int(os.path.basename(path)[2:-3])
        if not wanted or n in wanted:
            out.append((n, load_chapter(path)))
    return out


def ref_page(guide, ref, pages):
    phrase, ranges = (ref, [pages]) if isinstance(ref, str) else (ref[0], [(ref[1], ref[2])])
    return guide.page(phrase, ranges=ranges), phrase, ranges


def check(n, mod, guide, errors):
    """Validate a chapter bank; return its questions in topic order with their pages."""
    order = {t: i for i, t in enumerate(mod.TOPICS)}
    seen, out = set(), []
    for i, q in enumerate(mod.QUESTIONS, 1):
        topic, text, opts, ans, expl, ref = q[:6]
        fig = q[6] if len(q) > 6 else None
        where = f'chapter {n} #{i} [{topic}]'
        if topic not in order:
            errors.append(f'{where}: topic is not in TOPICS')
            continue
        if len(opts) != 4 or len(set(opts)) != 4 or ans not in ('A', 'B', 'C', 'D'):
            errors.append(f'{where}: needs 4 different options and an answer A-D')
        if norm(text) in seen:
            errors.append(f'{where}: duplicate question')
        seen.add(norm(text))
        page, phrase, ranges = ref_page(guide, ref, mod.PAGES)
        if isinstance(ref, str) and len(norm(phrase)) < 5:
            errors.append(f'{where}: ref {phrase!r} is too short to be unambiguous; give it a page range')
        if page is None:
            errors.append(f'{where}: ref not found: {phrase!r} (searched {ranges})')
        if fig and not fig.startswith(f'ch{n:02d}_'):
            errors.append(f'{where}: figure {fig} should be named ch{n:02d}_<name>')
        if fig and not os.path.exists(os.path.join(HERE, 'figures', fig + '.svg')):
            errors.append(f'{where}: figures/{fig}.svg is missing')
        out.append((topic, text, opts, ans, expl, page, fig))
    missing = [t for t in mod.TOPICS if not any(q[0] == t for q in mod.QUESTIONS)]
    if missing:
        errors.append(f'chapter {n}: no questions on {", ".join(missing)}')
    return sorted(out, key=lambda q: order[q[0]])


def markdown(n, mod, questions):
    lo, hi = mod.PAGES
    out = [HEADER.format(n=n, title=mod.TITLE, count=len(questions), lo=lo, hi=hi,
                         section=mod.SECTION, off=PDF_OFFSET)]
    key = ['## Answer Key', '', '| Q | Ans | Explanation (Study Guide page) |', '|---|-----|-------------|']
    topic = None
    for num, (t, text, opts, ans, expl, page, fig) in enumerate(questions, 1):
        if t != topic:
            topic = t
            out.append(f'### {t} {mod.TOPICS[t]}\n')
        out.append(f'**{num}.** {text}\n')
        if fig:
            out.append(f'![Figure for question {num}](../figures/{fig}.svg)\n')
        out.append(''.join(f'- {l}) {o}\n' for l, o in zip('ABCD', opts)))
        key.append(f'| {num} | {ans} | {expl} (p. {page}) |')
    out.append('---\n')
    out.append('\n'.join(key) + '\n')
    return '\n'.join(out).replace('\n\n\n', '\n\n')


def main():
    wanted = {int(a) for a in sys.argv[1:]}
    guide = Guide()
    errors, results = [], []
    for n, mod in chapter_banks(wanted):
        results.append((n, mod, check(n, mod, guide, errors)))
    if errors:
        print('\n'.join(errors))
        sys.exit(f'{len(errors)} problem(s); no files written')
    os.makedirs(OUT_DIR, exist_ok=True)
    total = 0
    for n, mod, questions in results:
        with open(os.path.join(OUT_DIR, f'Chapter_{n:02d}.md'), 'w') as f:
            f.write(markdown(n, mod, questions))
        letters = collections.Counter(q[3] for q in questions)
        total += len(questions)
        print(f'Chapter {n:02d}: {len(questions)} questions on {len(mod.TOPICS)} topics; answers',
              dict(sorted(letters.items())))
    print(f'{total} questions in {len(results)} chapters')


if __name__ == '__main__':
    main()
