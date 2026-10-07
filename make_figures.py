import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figures')
os.makedirs(OUT, exist_ok=True)
INK = '#111'
GRID = '#bbb'


def svg(w, h, body, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" font-family="Helvetica, Arial, sans-serif" font-size="14">
<title>{title}</title>
<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{INK}" stroke="none"/></marker></defs>
<rect width="100%" height="100%" fill="#fff"/>
<g stroke="{INK}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
{body}
</g>
</svg>
'''


def L(x1, y1, x2, y2, extra=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {extra}/>'


def T(x, y, s, anchor='middle', size=14, weight='normal', italic=False):
    st = ' font-style="italic"' if italic else ''
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{INK}" stroke="none" '
            f'font-size="{size}" font-weight="{weight}"{st}>{s}</text>')


def poly(pts, extra=''):
    p = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return f'<polyline points="{p}" {extra}/>'


def dot(x, y):
    return f'<circle cx="{x}" cy="{y}" r="3.5" fill="{INK}"/>'


def terminal(x, y):
    return f'<circle cx="{x}" cy="{y}" r="4" fill="#fff"/>'


def resistor_h(x1, x2, y):
    m = (x1 + x2) / 2
    pts = [(m - 20, y)] + [(m - 20 + i * 40 / 6, y + (-7 if i % 2 else 7)) for i in range(1, 6)] + [(m + 20, y)]
    return L(x1, y, m - 20, y) + poly(pts) + L(m + 20, y, x2, y)


def resistor_v(x, y1, y2):
    m = (y1 + y2) / 2
    pts = [(x, m - 20)] + [(x + (7 if i % 2 else -7), m - 20 + i * 40 / 6) for i in range(1, 6)] + [(x, m + 20)]
    return L(x, y1, x, m - 20) + poly(pts) + L(x, m + 20, x, y2)


def cap_h(x1, x2, y):
    m = (x1 + x2) / 2
    return L(x1, y, m - 4, y) + L(m - 4, y - 14, m - 4, y + 14) + L(m + 4, y - 14, m + 4, y + 14) + L(m + 4, y, x2, y)


def cap_v(x, y1, y2):
    m = (y1 + y2) / 2
    return L(x, y1, x, m - 4) + L(x - 14, m - 4, x + 14, m - 4) + L(x - 14, m + 4, x + 14, m + 4) + L(x, m + 4, x, y2)


def inductor_h(x1, x2, y):
    m = (x1 + x2) / 2
    coil = f'<path d="M{m - 24},{y} ' + ' '.join(['a6,6 0 0 1 12,0'] * 4) + '"/>'
    return L(x1, y, m - 24, y) + coil + L(m + 24, y, x2, y)


def battery_v(x, y1, y2, label):
    m = (y1 + y2) / 2
    return (L(x, y1, x, m - 6) + L(x - 18, m - 6, x + 18, m - 6) +
            L(x - 9, m + 6, x + 9, m + 6, 'stroke-width="5"') + L(x, m + 6, x, y2) +
            T(x + 26, m - 10, '+', size=16) + T(x - 26, m + 5, label, anchor='end'))


def meter(cx, cy, s, dashed=False):
    d = ' stroke-dasharray="5,4"' if dashed else ''
    return f'<circle cx="{cx}" cy="{cy}" r="16" fill="#fff"{d}/>' + T(cx, cy + 5, s, size=13, weight='bold')


def block(x, y, w, h, label):
    lines = label.split('\n')
    out = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="#fff"/>'
    cy = y + h / 2 - (len(lines) - 1) * 8 + 5
    for i, s in enumerate(lines):
        out += T(x + w / 2, cy + i * 16, s, size=13, weight='bold' if s == 'X' else 'normal')
    return out


def arrow(x1, y1, x2, y2):
    return L(x1, y1, x2, y2, 'marker-end="url(#arr)"')


def antenna(x, y):
    return L(x, y, x, y - 34) + L(x, y - 34, x - 11, y - 50) + L(x, y - 34, x + 11, y - 50) + L(x, y - 34, x, y - 50)


def chain(labels, x0, y, w, h, gap):
    out, xs = '', []
    for i, lab in enumerate(labels):
        x = x0 + i * (w + gap)
        xs.append(x)
        out += block(x, y, w, h, lab)
        if i:
            out += arrow(x - gap, y + h / 2, x, y + h / 2)
    return out, xs


def scope(x0, y0, fn, nx=10, ny=8, d=36, cycles_pts=800):
    out = ''
    for i in range(nx + 1):
        out += L(x0 + i * d, y0, x0 + i * d, y0 + ny * d, f'stroke="{GRID}" stroke-width="1"')
    for j in range(ny + 1):
        out += L(x0, y0 + j * d, x0 + nx * d, y0 + j * d, f'stroke="{GRID}" stroke-width="1"')
    cy = y0 + ny * d / 2
    out += L(x0, cy, x0 + nx * d, cy, f'stroke="#888" stroke-width="1.2"')
    out += L(x0 + nx * d / 2, y0, x0 + nx * d / 2, y0 + ny * d, f'stroke="#888" stroke-width="1.2"')
    pts = [(x0 + t * d, cy - fn(t) * d) for t in (k * nx / cycles_pts for k in range(cycles_pts + 1))]
    out += poly(pts, 'stroke="#1a5fb4" stroke-width="2.2"')
    return out


def polar(cx, cy, R, fn, n=360):
    out = ''
    for r in (R / 3, 2 * R / 3, R):
        out += f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" stroke="{GRID}" stroke-width="1"/>'
    for a in range(0, 180, 30):
        t = math.radians(a)
        out += L(cx - R * math.cos(t), cy - R * math.sin(t), cx + R * math.cos(t), cy + R * math.sin(t),
                 f'stroke="{GRID}" stroke-width="1"')
    pts = []
    for k in range(n + 1):
        th = 2 * math.pi * k / n
        r = R * fn(th)
        pts.append((cx + r * math.sin(th), cy - r * math.cos(th)))
    out += poly(pts, 'stroke="#1a5fb4" stroke-width="2.5"')
    out += T(cx, cy - R - 8, '0°') + T(cx + R + 8, cy + 5, '90°', anchor='start')
    out += T(cx, cy + R + 20, '180°') + T(cx - R - 8, cy + 5, '270°', anchor='end')
    return out


def rf_trace(x0, y0, w, amp, env, cycles=40, n=2400):
    pts = []
    for k in range(n + 1):
        t = k / n
        pts.append((x0 + t * w, y0 - amp * env(t) * math.sin(2 * math.pi * cycles * t)))
    return L(x0, y0, x0 + w, y0, f'stroke="{GRID}" stroke-width="1"') + poly(pts, 'stroke="#1a5fb4" stroke-width="1.2"')


figs = {}

# ---------- Set 1 ----------
b = battery_v(60, 60, 220, '12 V') + L(60, 60, 100, 60) + resistor_h(100, 200, 60) + T(150, 40, 'R1 = 100 Ω')
b += L(200, 60, 420, 60) + dot(260, 60) + resistor_v(260, 60, 220) + T(274, 145, 'R2 = 100 Ω', anchor='start')
b += resistor_v(420, 60, 220) + T(434, 145, 'R3 = 100 Ω', anchor='start') + L(60, 220, 420, 220) + dot(260, 220)
figs['set01_q14'] = (530, 260, b, 'Resistor network: R1 in series with R2 parallel R3, 12 V supply')

b, xs = chain(['RF\namplifier', 'Mixer', 'X', 'IF\namplifier', 'Detector', 'AF\namplifier'], 70, 80, 100, 54, 30)
b += antenna(40, 107) + arrow(40, 107, 70, 107) + arrow(820, 107, 860, 107) + T(866, 112, 'Loudspeaker', anchor='start')
b += block(200, 190, 100, 50, 'Local\noscillator') + arrow(250, 190, 250, 134)
figs['set01_q19'] = (960, 260, b, 'Superheterodyne receiver block diagram with block X after the mixer')

b = battery_v(60, 60, 220, '12 V') + L(60, 60, 134, 60) + meter(150, 60, 'M1') + L(166, 60, 260, 60)
b += dot(260, 60) + resistor_v(260, 60, 220) + T(274, 145, 'Load', anchor='start')
b += L(260, 60, 360, 60) + L(360, 60, 360, 124) + meter(360, 140, 'M2') + L(360, 156, 360, 220)
b += L(60, 220, 360, 220) + dot(260, 220)
figs['set01_q29'] = (420, 260, b, 'Circuit with meter M1 in series and meter M2 across the load')

# ---------- Set 2 ----------
b = terminal(40, 60) + terminal(40, 180) + terminal(300, 60) + terminal(300, 180)
b += inductor_h(44, 150, 60) + T(97, 40, 'L') + cap_h(150, 296, 60) + T(223, 36, 'C')
b += L(44, 180, 296, 180) + T(40, 215, 'Input') + T(300, 215, 'Output')
figs['set02_q15'] = (350, 235, b, 'Series LC circuit in series with the signal path')

b = polar(190, 190, 130, lambda th: abs(math.sin(th)))
b += T(190, 30, 'Horizontal radiation pattern (plan view)', weight='bold')
figs['set02_q24'] = (380, 360, b, 'Figure-of-eight radiation pattern')

b = scope(30, 40, lambda t: 2 * math.sin(2 * math.pi * t / 5))
b += T(210, 350, 'Vertical: 2 V/div    Horizontal: 1 ms/div')
figs['set02_q30'] = (420, 370, b, 'Oscilloscope sine wave, 4 divisions peak-to-peak at 2 V/div')

# ---------- Set 3 ----------
b = battery_v(60, 60, 220, '9 V') + L(60, 60, 90, 60) + resistor_h(90, 190, 60) + T(140, 40, '30 Ω')
b += resistor_h(190, 290, 60) + T(240, 40, '30 Ω') + L(290, 60, 340, 60)
b += resistor_v(340, 60, 220) + T(354, 145, '30 Ω', anchor='start') + L(60, 220, 340, 220)
figs['set03_q14'] = (420, 250, b, 'Three 30 ohm resistors in series with a 9 V battery')

b, xs = chain(['VFO', 'X', 'Driver', 'Power\namplifier', 'Low-pass\nfilter'], 30, 80, 100, 54, 30)
b += arrow(650, 107, 700, 107) + antenna(700, 107)
b += block(290, 190, 100, 40, 'Morse key') + L(340, 190, 340, 134)
figs['set03_q20'] = (760, 250, b, 'CW transmitter block diagram with stage X after the VFO')


def hard(t):
    return 1.0 if 0.15 <= t <= 0.85 else 0.0


def soft(t):
    if t < 0.12 or t > 0.88:
        return 0.0
    if t < 0.25:
        return 0.5 - 0.5 * math.cos(math.pi * (t - 0.12) / 0.13)
    if t > 0.75:
        return 0.5 - 0.5 * math.cos(math.pi * (0.88 - t) / 0.13)
    return 1.0


b = T(30, 30, 'Trace 1', anchor='start', weight='bold') + rf_trace(30, 100, 600, 45, hard)
b += T(30, 190, 'Trace 2', anchor='start', weight='bold') + rf_trace(30, 260, 600, 45, soft)
figs['set03_q30'] = (660, 330, b, 'Two CW RF envelopes: trace 1 with abrupt edges, trace 2 with shaped edges')

# ---------- Set 4 ----------
x0, y0, per = 50, 150, 280
b = L(x0, 40, x0, 260) + arrow(x0, y0, 640, y0) + T(640, y0 + 22, 'time', anchor='end')
b += poly([(x0 + k, y0 - 90 * math.sin(2 * math.pi * k / per)) for k in range(0, 571)])
b += poly([(x0 + k, y0 - 65 * math.sin(2 * math.pi * k / per + math.pi / 2)) for k in range(0, 571)],
          'stroke-dasharray="8,6" stroke="#c01c28"')
b += L(420, 30, 450, 30) + T(458, 35, 'Voltage V', anchor='start')
b += L(420, 52, 450, 52, 'stroke-dasharray="8,6" stroke="#c01c28"') + T(458, 57, 'Current I', anchor='start')
figs['set04_q15'] = (660, 280, b, 'Voltage and current waveforms, current peaking a quarter cycle earlier')

b, xs = chain(['RF\namplifier', 'X', 'IF filter &amp;\namplifier', 'Detector', 'AF\namplifier'], 70, 80, 110, 54, 30)
b += antenna(40, 107) + arrow(40, 107, 70, 107) + arrow(770, 107, 810, 107) + T(816, 112, 'Loudspeaker', anchor='start')
b += block(210, 190, 110, 50, 'Local\noscillator') + arrow(265, 190, 265, 134)
figs['set04_q17'] = (920, 260, b, 'Superheterodyne receiver block diagram with block X fed by the local oscillator')

b, xs = chain(['Transmitter', 'SWR meter\nM', 'ATU'], 30, 80, 110, 54, 40)
b += L(410, 107, 640, 107) + T(525, 97, 'coaxial feeder') + antenna(640, 107)
figs['set04_q24'] = (700, 180, b, 'Transmitter, SWR meter M, ATU, coaxial feeder, antenna')

# ---------- Set 5 ----------
b = terminal(40, 80) + terminal(40, 200) + terminal(320, 80) + terminal(320, 200)
b += L(44, 80, 120, 80) + dot(120, 80) + L(120, 50, 120, 110) + inductor_h(120, 240, 50) + T(180, 32, 'L')
b += cap_h(120, 240, 110) + T(180, 142, 'C') + L(240, 50, 240, 110) + dot(240, 80) + L(240, 80, 316, 80)
b += L(44, 200, 316, 200) + T(40, 235, 'Input') + T(320, 235, 'Output')
figs['set05_q14'] = (370, 255, b, 'Parallel LC circuit in series with the signal path')

b, xs = chain(['Microphone', 'Speech\namplifier', 'X', 'Sideband\nfilter', 'Mixer', 'Linear\namplifier'], 20, 80, 100, 54, 28)
b += arrow(760, 107, 800, 107) + antenna(800, 107)
b += block(276, 190, 100, 50, 'Carrier\noscillator') + arrow(326, 190, 326, 134)
b += block(532, 190, 100, 50, 'VFO') + arrow(582, 190, 582, 134)
figs['set05_q19'] = (850, 260, b, 'SSB transmitter block diagram with block X fed by the carrier oscillator')

b = rf_trace(30, 110, 600, 32, lambda t: max(0.0, 1 + 1.6 * math.sin(2 * math.pi * 2 * t)), cycles=70, n=4000)
figs['set05_q30'] = (660, 220, b, 'AM RF envelope pinched to zero with flat gaps')

# ---------- Set 6 ----------
b = arrow(60, 230, 470, 230) + arrow(60, 230, 60, 30) + T(470, 255, 'Frequency', anchor='end')
b += T(50, 130, 'Output', anchor='end') + T(50, 146, 'level', anchor='end')
b += '<path d="M62,70 L220,70 C262,72 282,200 360,214 L455,218" stroke="#1a5fb4" stroke-width="2.5"/>'
b += L(250, 60, 250, 230, 'stroke-dasharray="5,5" stroke="#888" stroke-width="1.2"') + T(250, 250, 'fc')
b = '<g transform="translate(40,0)">' + b + '</g>'
figs['set06_q15'] = (540, 270, b, 'Filter response: flat below fc, falling above fc')

b = L(60, 200, 296, 200, 'stroke-width="4"') + L(304, 200, 540, 200, 'stroke-width="4"') + dot(296, 200) + dot(304, 200)
b += T(300, 228, 'Feed point') + T(300, 20, 'Resonant half-wave dipole', weight='bold')
b += poly([(x, 200 - 120 * math.cos(math.pi * (x - 300) / 480)) for x in range(60, 541, 4)], 'stroke="#1a5fb4" stroke-width="2.5"')
b += poly([(x, 200 - 120 * abs(math.sin(math.pi * (x - 300) / 480))) for x in range(60, 541, 4)],
          'stroke="#c01c28" stroke-width="2.5" stroke-dasharray="8,6"')
b += T(300, 66, 'Curve 1') + T(90, 66, 'Curve 2') + T(510, 66, 'Curve 2')
figs['set06_q22'] = (600, 245, b, 'Current and voltage distribution along a half-wave dipole')

b = battery_v(140, 70, 230, '9 V') + L(140, 70, 224, 70) + meter(240, 70, 'X', dashed=True) + L(256, 70, 380, 70)
b += dot(380, 70) + resistor_v(380, 70, 230) + T(394, 155, 'R', anchor='start')
b += L(380, 70, 480, 70) + L(480, 70, 480, 134) + meter(480, 150, 'Y', dashed=True) + L(480, 166, 480, 230)
b += L(140, 70, 40, 70) + L(40, 70, 40, 134) + meter(40, 150, 'Z', dashed=True) + L(40, 166, 40, 230)
b += L(40, 230, 480, 230) + dot(140, 70) + dot(140, 230) + dot(380, 230)
figs['set06_q29'] = (540, 260, b, 'Circuit with possible meter positions X (series), Y (across R), Z (across battery)')

# ---------- Set 7 ----------
b = battery_v(60, 60, 220, '30 V') + L(60, 60, 380, 60) + L(60, 220, 380, 220)
for x in (180, 280, 380):
    b += resistor_v(x, 60, 220) + T(x + 14, 145, '300 Ω', anchor='start')
    if x < 380:
        b += dot(x, 60) + dot(x, 220)
figs['set07_q14'] = (460, 250, b, 'Three 300 ohm resistors in parallel across a 30 V battery')

b, xs = chain(['Transmitter\n50 W (17 dBW)', 'Feeder\nloss 3 dB', 'Antenna\ngain 6 dBd'], 30, 70, 150, 60, 40)
b += arrow(560, 100, 600, 100) + antenna(600, 100)
figs['set07_q24'] = (650, 170, b, 'Transmitter 50 W, feeder loss 3 dB, antenna gain 6 dBd')

b, xs = chain(['Transmitter', 'ATU', 'SWR\nmeter'], 30, 80, 110, 54, 40)
b += L(410, 107, 640, 107) + T(525, 97, 'feeder') + antenna(640, 107)
figs['set07_q30'] = (700, 180, b, 'Transmitter, ATU, SWR meter, feeder, antenna')

# ---------- Set 8 ----------
b = terminal(40, 65) + T(40, 50, 'A', weight='bold') + resistor_h(44, 160, 65) + T(102, 45, '100 Ω')
b += L(160, 65, 220, 65) + dot(220, 65) + L(220, 30, 220, 100) + resistor_h(220, 340, 30) + T(280, 14, '200 Ω')
b += resistor_h(220, 340, 100) + T(280, 128, '200 Ω') + L(340, 30, 340, 100) + dot(340, 65)
b += L(340, 65, 400, 65) + terminal(404, 65) + T(404, 50, 'B', weight='bold')
figs['set08_q14'] = (450, 140, b, '100 ohm in series with two 200 ohm resistors in parallel, between A and B')

b, xs = chain(['RF\namplifier', 'Mixer', 'IF\namplifier', 'Limiter', 'X', 'AF\namplifier'], 70, 80, 100, 54, 28)
b += antenna(40, 107) + arrow(40, 107, 70, 107) + arrow(808, 107, 848, 107) + T(854, 112, 'Loudspeaker', anchor='start')
b += block(198, 190, 100, 50, 'Local\noscillator') + arrow(248, 190, 248, 134)
figs['set08_q19'] = (950, 260, b, 'FM receiver block diagram with block X after the limiter')

b = L(60, 150, 340, 150, 'stroke-width="3"') + T(200, 24, 'Plan view (from above)', weight='bold')
b += L(100, 50, 100, 250, 'stroke-width="3.5"') + L(200, 60, 200, 144, 'stroke-width="3.5"') + L(200, 156, 200, 240, 'stroke-width="3.5"')
b += L(300, 70, 300, 230, 'stroke-width="3.5"') + T(214, 168, 'feed', anchor='start', size=12)
b += T(100, 275, '1', weight='bold') + T(200, 275, '2', weight='bold') + T(300, 275, '3', weight='bold')
figs['set08_q24'] = (400, 290, b, 'Three-element Yagi: element 1 longest, element 2 fed, element 3 shortest')

# ---------- Set 9 ----------
b = terminal(40, 60) + terminal(40, 200) + terminal(360, 60) + terminal(360, 200)
b += L(44, 60, 120, 60) + dot(120, 60) + cap_v(120, 60, 200) + T(140, 135, 'C1', anchor='start')
b += inductor_h(120, 280, 60) + T(200, 40, 'L') + dot(280, 60) + cap_v(280, 60, 200) + T(300, 135, 'C2', anchor='start')
b += L(280, 60, 356, 60) + L(44, 200, 356, 200) + dot(120, 200) + dot(280, 200)
b += T(40, 235, 'Input') + T(360, 235, 'Output')
figs['set09_q15'] = (410, 255, b, 'Pi network: shunt C1, series L, shunt C2')

b, xs = chain(['DSP\n(modulator)', 'NCO', 'X', 'Reconstruction\nfilter', 'Power\namplifier'], 20, 80, 120, 54, 30)
b += arrow(740, 107, 780, 107) + antenna(780, 107)
figs['set09_q17'] = (830, 180, b, 'SDR transmitter: DSP, NCO, block X, reconstruction filter, power amplifier')

b = polar(190, 190, 130, lambda th: 0.92)
b += T(190, 30, 'Horizontal radiation pattern (plan view)', weight='bold')
figs['set09_q24'] = (380, 360, b, 'Omnidirectional radiation pattern')

# ---------- Set 10 ----------
b = battery_v(60, 60, 220, '10 V') + L(60, 60, 134, 60) + meter(150, 60, 'A') + T(150, 30, 'reads 10 mA')
b += L(166, 60, 300, 60) + resistor_v(300, 60, 220) + T(314, 145, '1 kΩ', anchor='start') + L(60, 220, 300, 220)
figs['set10_q14'] = (380, 250, b, 'Ammeter reading 10 mA in series with a 1 kilohm resistor')

b = '<path d="M160,64 L52,64 A12,12 0 0 1 52,40 L288,40 A12,12 0 0 1 288,64 L180,64"/>'
b += T(310, 57, '300 Ω folded dipole', anchor='start') + L(160, 64, 160, 110) + L(180, 64, 180, 110)
b += block(120, 110, 100, 50, 'X') + L(170, 160, 170, 230) + T(182, 200, '75 Ω coax', anchor='start')
b += block(120, 230, 100, 40, 'Receiver')
figs['set10_q21'] = (480, 290, b, '300 ohm folded dipole connected through block X to 75 ohm coax')

b = scope(30, 40, lambda t: 3 * math.sin(2 * math.pi * t / 5))
b += T(210, 350, 'Vertical: 1 V/div    Horizontal: 0.2 ms/div')
figs['set10_q30'] = (420, 370, b, 'Oscilloscope sine wave, one cycle spans 5 divisions')



def write_all(figures):
    for name, (w, h, body, title) in figures.items():
        with open(os.path.join(OUT, name + '.svg'), 'w') as f:
            f.write(svg(w, h, body, title))
    print(len(figures), 'figures written')


if __name__ == '__main__':
    write_all(figs)
