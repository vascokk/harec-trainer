"""Export the question banks for the HAREC Trainer app (app/).

Writes app/src/data/questions.js (window.HAREC_DATA) with every question,
its answer, explanation and Study Guide printed page, and copies the SVG
figures to app/src/figures/. Page numbers are looked up exactly as in
make_exams.py, so the app and the Markdown answer keys agree.

Usage: python3 export_app_data.py
"""
import glob
import json
import os
import shutil
import sys

from guide_index import Guide
from make_exams import HERE, SECTIONS, load

APP_SRC = os.path.join(HERE, 'app', 'src')


def main():
    guide = Guide()
    questions, errors = [], []
    for path in sorted(glob.glob(os.path.join(HERE, 'question_bank', 'set*.py'))):
        n = int(os.path.basename(path)[3:-3])
        order = {sec: i for i, (sec, _, _) in enumerate(SECTIONS)}
        bank = sorted(load(path), key=lambda q: order[q[0]])
        for num, q in enumerate(bank, 1):
            sec, text, opts, ans, expl, ref = q[:6]
            fig = q[6] if len(q) > 6 else None
            phrase, ranges = (ref, None) if isinstance(ref, str) else (ref[0], [(ref[1], ref[2])])
            page = guide.page(phrase, sec, ranges)
            if page is None:
                errors.append(f'set {n} Q{num}: ref not found: {phrase!r}')
            questions.append({
                'id': f's{n:02d}q{num:02d}', 'set': n, 'num': num, 'section': sec,
                'text': text, 'options': opts, 'answer': 'ABCD'.index(ans),
                'explanation': expl, 'page': page,
                'figure': f'figures/{fig}.svg' if fig else None,
            })
    if errors:
        sys.exit('\n'.join(errors))
    data = {
        'sections': [{'id': s, 'title': t, 'count': c} for s, t, c in SECTIONS],
        'questions': questions,
    }
    os.makedirs(os.path.join(APP_SRC, 'data'), exist_ok=True)
    with open(os.path.join(APP_SRC, 'data', 'questions.js'), 'w') as f:
        f.write('window.HAREC_DATA = ')
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write(';\n')
    fig_dir = os.path.join(APP_SRC, 'figures')
    os.makedirs(fig_dir, exist_ok=True)
    for svg in glob.glob(os.path.join(HERE, 'figures', '*.svg')):
        shutil.copy(svg, fig_dir)
    sets = len({q['set'] for q in questions})
    print(f'{len(questions)} questions from {sets} sets exported')


if __name__ == '__main__':
    main()
