"""Page lookup in the IRTS HAREC Study Guide (edition 4.0.3).

Splits the guide PDF into pages with pdftotext and finds the printed page
number on which a reference phrase appears. Matching ignores case, spacing,
punctuation and typographic ligatures, because the PDF text uses spaced-out
small caps (e.g. "C OM R E G").

Printed page numbers are what the guide itself uses ("see page 343");
the PDF viewer page is printed page + 24.
"""
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(HERE, 'IRTS_HAREC_Amateur_Station_Licence_Study_Guide.pdf')
PDF_OFFSET = 24

# Printed page ranges of the guide chapters covering each syllabus subsection.
TOPIC_PAGES = {
    'A.1': [(292, 313)],
    'A.2': [(282, 291)],
    'A.3': [(10, 87), (116, 119), (140, 169)],
    'A.4': [(28, 37), (88, 139)],
    'A.5': [(140, 205)],
    'A.6': [(206, 253)],
    'A.7': [(254, 271)],
    'A.8': [(272, 281)],
    'B.1': [(334, 335)],
    'B.2': [(346, 349)],
    'B.3': [(338, 355)],
    'B.4': [(320, 337)],
    'B.5': [(338, 345)],
    'B.6': [(356, 359)],
    'B.7': [(360, 371)],
    'B.8': [(314, 319)],
    'B.9': [(320, 325)],
    'B.10': [(326, 333)],
}

_LIG = {'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬀ': 'ff', 'ﬃ': 'ffi', 'ﬄ': 'ffl', '�': 'th'}


def norm(s):
    s = s.lower()
    for k, v in _LIG.items():
        s = s.replace(k, v)
    return re.sub(r'[^a-z0-9µω]', '', s)


class Guide:
    def __init__(self, pdf=PDF):
        # Layout mode keeps paragraphs intact; raw mode keeps table rows intact.
        # A phrase may match either version of a page ('#' never occurs in a key).
        self.pages = {}
        for mode in (['-layout'], ['-raw']):
            text = subprocess.run(['pdftotext', *mode, pdf, '-'], check=True,
                                  capture_output=True, text=True).stdout
            for i, raw in enumerate(text.split('\f')):
                printed = i + 1 - PDF_OFFSET
                if printed >= 1:
                    self.pages[printed] = self.pages.get(printed, '') + '#' + norm(raw)

    def find_all(self, phrase, ranges):
        key = norm(phrase)
        return [p for lo, hi in ranges for p in range(lo, hi + 1)
                if key in self.pages.get(p, '')]

    def page(self, phrase, topic=None, ranges=None):
        """First printed page in the topic's chapters containing the phrase, or None."""
        hits = self.find_all(phrase, ranges or TOPIC_PAGES[topic])
        return hits[0] if hits else None
