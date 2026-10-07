"""Build HAREC practice exam Markdown files from question_bank/setNN.py.

Each bank module defines QUESTIONS, a list of tuples:

    (section, question, [optA, optB, optC, optD], answer, explanation, ref[, figure])

- section: syllabus subsection, e.g. 'A.1' or 'B.10'
- ref: a phrase from the Study Guide that confirms the answer, or
  (phrase, first_page, last_page) to search outside the topic's chapters.
  The printed page where the phrase is found is added to the answer key.
- figure: optional SVG name in figures/ (e.g. 'set11_q14'); the number must
  match the question's position in the paper.

Usage: python3 make_exams.py 11 12 ...   (no arguments = every bank)
Nothing is written if any reference cannot be found in the guide.
"""
import collections
import glob
import importlib.util
import os
import sys

from guide_index import PDF_OFFSET, TOPIC_PAGES, Guide, norm

HERE = os.path.dirname(os.path.abspath(__file__))

SECTIONS = [
    ('A.1', 'Safety', 5),
    ('A.2', 'Interference and Immunity', 4),
    ('A.3', 'Electrical, Electromagnetic, and Radio Theory', 4),
    ('A.4', 'Components and Circuits', 3),
    ('A.5', 'Transmitters and Receivers', 4),
    ('A.6', 'Antennas and Transmission Lines', 4),
    ('A.7', 'Propagation', 4),
    ('A.8', 'Measurements', 2),
    ('B.1', 'Phonetic Alphabet', 1),
    ('B.2', 'Q-Codes', 3),
    ('B.3', 'International Distress Signs, Emergency Traffic and Natural Disaster Communications', 3),
    ('B.4', 'Call Signs', 3),
    ('B.5', 'Radio Spectrum Allocation in Ireland and IARU Band Plans', 4),
    ('B.6', 'Social Responsibility of Radio Amateur Operation and the Code of Conduct', 3),
    ('B.7', 'Operating Procedures and Non-Interference', 5),
    ('B.8', 'ITU Radio Regulations', 2),
    ('B.9', 'CEPT Regulations', 3),
    ('B.10', 'Irish Laws, Regulations, and Licence Conditions', 3),
]

HEADER = """# IRTS HAREC Practice Exam — Set {n}

60 questions · 2 hours · pass mark 60% **in each section** (at least 18/30 in Section A and 18/30 in Section B).
Only ONE answer is correct for each question. Answers and short explanations are at the end.

> Unofficial practice paper based on the IRTS HAREC Exam Syllabus (Rev 2.0.2), the IRTS Sample Exam Paper 2022 and the IRTS HAREC Study Guide (4.0.3).
> Page numbers in the answer key are the **printed** page numbers of the Study Guide; in a PDF viewer, add {off} (e.g. p. 343 is PDF page {ex}).

---
"""


def load(path):
    spec = importlib.util.spec_from_file_location(os.path.basename(path)[:-3], path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.QUESTIONS


def build(n, questions, guide, errors):
    by_sec = collections.defaultdict(list)
    for q in questions:
        by_sec[q[0]].append(q)
    for sec, _, count in SECTIONS:
        if len(by_sec[sec]) != count:
            errors.append(f'set {n}: {sec} has {len(by_sec[sec])} questions, expected {count}')
    out = [HEADER.format(n=n, off=PDF_OFFSET, ex=343 + PDF_OFFSET)]
    key = ['## Answer Key', '', '| Q | Ans | Explanation (Study Guide page) |', '|---|-----|-------------|']
    num = 0
    for sec, title, _ in SECTIONS:
        if sec == 'A.1':
            out.append('## Section A: Technical\n')
        if sec == 'B.1':
            out.append('---\n\n## Section B: Operating Rules, Procedures, and Regulations\n')
        count = len(by_sec[sec])
        out.append(f'### {sec} {title} ({count} question{"s" if count != 1 else ""})\n')
        for q in by_sec[sec]:
            num += 1
            _, text, opts, ans, expl, ref = q[:6]
            fig = q[6] if len(q) > 6 else None
            if len(opts) != 4 or ans not in 'ABCD':
                errors.append(f'set {n} Q{num}: needs 4 options and an answer A-D')
            out.append(f'**{num}.** {text}\n')
            if fig:
                if fig != f'set{n:02d}_q{num}':
                    errors.append(f'set {n} Q{num}: figure {fig} does not match its position')
                if not os.path.exists(os.path.join(HERE, 'figures', fig + '.svg')):
                    errors.append(f'set {n} Q{num}: figures/{fig}.svg is missing')
                out.append(f'![Figure for question {num}](figures/{fig}.svg)\n')
            out.append(''.join(f'- {l}) {o}\n' for l, o in zip('ABCD', opts)))
            phrase, ranges = (ref, None) if isinstance(ref, str) else (ref[0], [(ref[1], ref[2])])
            if len(norm(phrase)) < 5 and ranges is None:
                errors.append(f'set {n} Q{num}: ref {phrase!r} is too short to be unambiguous; give it a page range')
            page = guide.page(phrase, sec, ranges)
            if page is None:
                errors.append(f'set {n} Q{num} [{sec}]: ref not found: {phrase!r} '
                              f'(searched {ranges or TOPIC_PAGES[sec]})')
            key.append(f'| {num} | {ans} | {expl} (p. {page}) |')
    out.append('---\n')
    out.append('\n'.join(key) + '\n')
    letters = collections.Counter(q[3] for q in questions)
    return '\n'.join(out).replace('\n\n\n', '\n\n'), letters


def main():
    banks = sorted(glob.glob(os.path.join(HERE, 'question_bank', 'set*.py')))
    wanted = {int(a) for a in sys.argv[1:]}
    guide = Guide()
    errors, results = [], {}
    for path in banks:
        n = int(os.path.basename(path)[3:-3])
        if wanted and n not in wanted:
            continue
        results[n] = build(n, load(path), guide, errors)
    if errors:
        print('\n'.join(errors))
        sys.exit(f'{len(errors)} problem(s); no files written')
    for n, (md, letters) in sorted(results.items()):
        with open(os.path.join(HERE, f'HAREC_Practice_Exam_Set_{n:02d}.md'), 'w') as f:
            f.write(md)
        print(f'Set {n:02d} written; answers', dict(sorted(letters.items())))


if __name__ == '__main__':
    main()
