"""Figures for practice exam sets 11-20. Reuses the drawing helpers from make_figures.py."""
import math

from make_figures import (GRID, INK, L, T, antenna, arrow, battery_v, block, cap_h, chain, dot, inductor_h,
                          meter, poly, polar, resistor_h, resistor_v, rf_trace, scope, terminal, write_all)


def inductor_v(x, y1, y2):
    m = (y1 + y2) / 2
    coil = f'<path d="M{x},{m - 24} ' + ' '.join(['a6,6 0 0 1 0,12'] * 4) + '"/>'
    return L(x, y1, x, m - 24) + coil + L(x, m + 24, x, y2)


def diode(x1, y1, x2, y2):
    """Diode from (x1,y1) to (x2,y2); conventional current flows in that direction."""
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    ux, uy, px, py = dx / n, dy / n, -dy / n, dx / n
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    a = (mx - 10 * ux + 10 * px, my - 10 * uy + 10 * py)
    b = (mx - 10 * ux - 10 * px, my - 10 * uy - 10 * py)
    tip = (mx + 10 * ux, my + 10 * uy)
    bar1 = (tip[0] + 10 * px, tip[1] + 10 * py)
    bar2 = (tip[0] - 10 * px, tip[1] - 10 * py)
    return (L(x1, y1, x2, y2) +
            f'<polygon points="{a[0]:.1f},{a[1]:.1f} {b[0]:.1f},{b[1]:.1f} {tip[0]:.1f},{tip[1]:.1f}" fill="{INK}"/>' +
            L(*bar1, *bar2))


def earth_and_sky(w):
    return (f'<path d="M20,300 Q{w / 2},250 {w - 20},300" stroke-width="3"/>' +
            f'<path d="M20,95 Q{w / 2},40 {w - 20},95" stroke="#888" stroke-dasharray="10,6"/>' +
            T(w - 30, 70, 'ionosphere', anchor='end', size=13) + T(w / 2, 300, 'Earth', size=13))


figs = {}

# ---------- Set 11 ----------
b = battery_v(60, 60, 220, '12 V') + L(60, 60, 300, 60) + resistor_v(300, 60, 140) + T(314, 105, '1 kΩ', anchor='start')
b += resistor_v(300, 140, 220) + T(314, 185, '2 kΩ', anchor='start') + dot(300, 140)
b += L(300, 140, 420, 140) + L(420, 140, 420, 164) + meter(420, 180, 'V') + L(420, 196, 420, 220)
b += L(60, 220, 420, 220) + dot(300, 220)
figs['set11_q14'] = (470, 250, b, 'Voltage divider: 1 kilohm over 2 kilohm on 12 V, voltmeter across the 2 kilohm')

b = L(200, 40, 200, 180, 'stroke-width="4"') + T(214, 100, 'radiator', anchor='start', size=13)
for ex, ey in ((70, 225), (330, 225), (135, 250), (265, 250)):
    b += L(200, 184, ex, ey, 'stroke-width="3"')
b += T(60, 215, 'X', anchor='end', weight='bold') + T(340, 215, 'X', anchor='start', weight='bold')
b += L(200, 184, 200, 280) + T(212, 275, 'coax to transmitter', anchor='start', size=13)
figs['set11_q21'] = (420, 300, b, 'Quarter-wave ground plane antenna with sloping elements X at the base')

b = scope(30, 40, lambda t: 2 if (t % 4) < 2 else -2, cycles_pts=4000)
b += T(210, 350, 'Vertical: 1 V/div    Horizontal: 0.5 ms/div')
figs['set11_q29'] = (420, 370, b, 'Square wave on an oscilloscope, period 4 divisions')

# ---------- Set 12 ----------
b = terminal(40, 60) + terminal(40, 200) + terminal(320, 60) + terminal(320, 200)
b += cap_h(44, 200, 60) + T(122, 36, 'C') + dot(200, 60) + inductor_v(200, 60, 200) + T(218, 135, 'L', anchor='start')
b += L(200, 60, 316, 60) + L(44, 200, 316, 200) + dot(200, 200)
b += T(40, 235, 'Input') + T(320, 235, 'Output')
figs['set12_q15'] = (370, 255, b, 'Series capacitor followed by shunt inductor')

b, xs = chain(['Mixer', 'IF filter', 'IF\namplifier', 'Product\ndetector', 'AF\namplifier'], 20, 80, 100, 54, 30)
b += arrow(670, 107, 710, 107) + T(716, 112, 'Loudspeaker', anchor='start')
b += block(410, 190, 100, 50, 'X') + arrow(460, 190, 460, 134)
figs['set12_q19'] = (820, 260, b, 'Receiver back end: product detector fed by oscillator X')

b = f'<rect x="60" y="300" width="460" height="24" fill="#d9c8a9" stroke="none"/>' + T(290, 317, 'Earth', size=13)
for lab, y, h in (('1', 255, 14), ('2', 215, 14), ('3', 150, 18), ('4', 75, 30)):
    b += f'<rect x="60" y="{y}" width="460" height="{h}" fill="#cfe0f5" stroke="#1a5fb4" stroke-width="1"/>'
    b += T(540, y + h / 2 + 5, lab, anchor='start', weight='bold')
b += L(40, 320, 40, 30) + T(40, 20, 'height') + T(290, 18, 'Ionosphere in daytime (not to scale)', weight='bold')
figs['set12_q25'] = (580, 340, b, 'Daytime ionospheric layers numbered 1 (lowest) to 4 (highest)')

# ---------- Set 13 ----------
T_, R_, B_, L_ = (200, 60), (300, 160), (200, 260), (100, 160)
b = diode(*L_, *T_) + diode(*L_, *B_) + diode(*T_, *R_) + diode(*B_, *R_)
b += dot(*T_) + dot(*R_) + dot(*B_) + dot(*L_)
b += L(200, 60, 200, 30) + L(200, 30, 40, 30) + terminal(36, 30)
b += L(200, 260, 200, 290) + L(200, 290, 40, 290) + terminal(36, 290) + T(30, 165, 'AC in', anchor='end')
b += L(300, 160, 420, 160) + terminal(424, 160) + T(440, 165, '+', anchor='start', size=18)
b += L(100, 160, 100, 320) + L(100, 320, 420, 320) + terminal(424, 320) + T(440, 325, '−', anchor='start', size=18)
b += T(470, 245, 'DC out', anchor='end')
b = f'<g transform="translate(60,0)">{b}</g>'
figs['set13_q14'] = (560, 340, b, 'Four diodes in a bridge, AC in, DC out')

b = polar(190, 190, 130, lambda th: 0.12 + 0.88 * ((1 + math.cos(th)) / 2) ** 3)
b += T(190, 30, 'Horizontal radiation pattern (plan view)', weight='bold')
figs['set13_q24'] = (380, 360, b, 'Directional pattern with a large lobe towards 0 degrees and a small back lobe')

b = rf_trace(30, 110, 600, 32, lambda t: 1 + 0.5 * math.sin(2 * math.pi * 2 * t), cycles=70, n=4000)
figs['set13_q30'] = (660, 220, b, 'AM RF envelope varying smoothly without reaching zero')

# ---------- Set 14 ----------
b = L(40, 60, 140, 60) + inductor_v(140, 60, 220) + L(40, 220, 140, 220) + terminal(36, 60) + terminal(36, 220)
b += L(178, 70, 178, 210, 'stroke-width="3"') + L(190, 70, 190, 210, 'stroke-width="3"')
b += '<g transform="translate(368,0) scale(-1,1)">' + inductor_v(140, 60, 220) + '</g>'
b += L(228, 60, 330, 60) + L(228, 220, 330, 220) + terminal(334, 60) + terminal(334, 220)
b += T(30, 145, '230 V AC', anchor='end') + T(110, 145, '400', anchor='end', size=13) + T(110, 160, 'turns', anchor='end', size=13)
b += T(258, 145, '40', anchor='start', size=13) + T(258, 160, 'turns', anchor='start', size=13) + T(350, 145, 'V = ?', anchor='start')
b = f'<g transform="translate(70,0)">{b}</g>'
figs['set14_q15'] = (500, 260, b, 'Transformer: 400 turns primary on 230 V, 40 turns secondary')

b = '<circle cx="200" cy="170" r="120" fill="#555"/>' + '<circle cx="200" cy="170" r="104" fill="#c9a227" stroke="none"/>'
b += '<circle cx="200" cy="170" r="96" fill="#e8f0fb"/>' + '<circle cx="200" cy="170" r="20" fill="#c9a227"/>'
b += L(180, 170, 220, 170, 'marker-end="url(#arr)" marker-start="url(#arr)" stroke-width="1.5"') + T(200, 205, 'd', weight='bold')
b += L(104, 260, 296, 260, 'marker-end="url(#arr)" marker-start="url(#arr)" stroke-width="1.5"') + T(200, 255, 'D', weight='bold')
b += L(104, 230, 104, 270, 'stroke-width="1" stroke-dasharray="3,3"') + L(296, 230, 296, 270, 'stroke-width="1" stroke-dasharray="3,3"')
b += T(340, 60, 'outer jacket', anchor='start', size=13) + L(338, 56, 300, 90, 'stroke-width="1"')
b += T(340, 120, 'braid (outer conductor)', anchor='start', size=13) + L(338, 116, 296, 140, 'stroke-width="1"')
b += T(340, 180, 'dielectric', anchor='start', size=13) + L(338, 176, 260, 176, 'stroke-width="1"')
b += T(200, 140, 'inner conductor', size=12)
figs['set14_q22'] = (520, 310, b, 'Cross-section of coaxial cable with dimensions D and d')

b = earth_and_sky(600) + antenna(80, 288) + T(80, 232, 'TX', size=13)
b += L(80, 286, 300, 66, 'stroke="#1a5fb4"') + arrow(300, 66, 520, 286).replace('/>', ' stroke="#1a5fb4"/>')
b += '<path d="M80,292 Q125,281 170,276" stroke="#c01c28" stroke-width="6"/>' + T(150, 308, 'ground wave', size=12)
b += '<path d="M178,276 Q345,250 512,284" stroke="#888" stroke-width="1.5" stroke-dasharray="4,4"/>'
b += T(345, 245, 'X', weight='bold', size=18)
figs['set14_q27'] = (600, 320, b, 'Ground-wave range near TX, sky wave landing far away, region X between them')

# ---------- Set 15 ----------
b = terminal(40, 80) + T(40, 64, 'A', weight='bold') + cap_h(44, 160, 80) + T(102, 52, '100 pF')
b += cap_h(160, 276, 80) + T(218, 52, '100 pF') + terminal(280, 80) + T(280, 64, 'B', weight='bold')
figs['set15_q14'] = (330, 120, b, 'Two 100 pF capacitors in series between A and B')

b, xs = chain(['Band-pass\nfilter', 'X', 'DSP\n(computer/FPGA)', 'DAC', 'AF\namplifier'], 70, 80, 120, 54, 30)
b += antenna(40, 107) + arrow(40, 107, 70, 107) + arrow(820, 107, 860, 107) + T(866, 112, 'Loudspeaker', anchor='start')
figs['set15_q20'] = (970, 180, b, 'Direct-sampling SDR receiver with block X after the band-pass filter')

b = L(60, 120, 296, 120, 'stroke-width="4"') + L(304, 120, 540, 120, 'stroke-width="4"') + dot(296, 120) + dot(304, 120)
b += L(296, 120, 296, 200) + L(304, 120, 304, 200) + T(300, 222, 'feeder', size=13)
for x, lab in ((300, 'P'), (180, 'R'), (60, 'Q')):
    b += f'<circle cx="{x}" cy="120" r="6" fill="#c01c28" stroke="none"/>' + T(x, 100, lab, weight='bold')
b += T(300, 40, 'Resonant half-wave dipole', weight='bold')
figs['set15_q23'] = (600, 240, b, 'Half-wave dipole with points P (centre), R (halfway) and Q (end)')

# ---------- Set 16 ----------
b = '<circle cx="200" cy="140" r="60"/>' + L(178, 105, 178, 175, 'stroke-width="4"') + L(90, 140, 178, 140)
b += L(178, 120, 225, 92) + L(225, 92, 225, 40) + L(178, 160, 225, 188) + L(225, 188, 225, 240)
b += f'<polygon points="225,188 207,187 215,174" fill="{INK}"/>'
b += T(80, 135, '1', weight='bold') + T(240, 50, '2', anchor='start', weight='bold') + T(240, 235, '3', anchor='start', weight='bold')
figs['set16_q16'] = (320, 270, b, 'NPN bipolar transistor symbol with terminals 1, 2 and 3')

b = arrow(40, 220, 560, 220) + T(560, 245, 'frequency', anchor='end') + arrow(60, 230, 60, 30) + T(70, 30, 'power', anchor='start')
b += L(250, 40, 250, 220, 'stroke-dasharray="6,5" stroke="#888"') + T(250, 240, 'f₀ (suppressed carrier)', size=13)
b += '<path d="M265,220 L280,80 L430,90 L445,220 Z" fill="#cfe0f5" stroke="#1a5fb4"/>'
b += L(250, 120, 445, 120, 'marker-end="url(#arr)" marker-start="url(#arr)" stroke-width="1"') + T(350, 112, '≈ 2.7 kHz', size=13)
figs['set16_q17'] = (600, 260, b, 'Spectrum: energy from f0 up to about 2.7 kHz above it, carrier suppressed')

b, xs = chain(['Transmitter', 'ATU'], 30, 80, 120, 54, 80)
b += L(380, 107, 640, 107) + T(520, 97, 'feeder') + antenna(640, 107)
b += f'<circle cx="190" cy="107" r="14" fill="#fff" stroke-dasharray="4,3"/>' + T(190, 112, 'P1', size=12, weight='bold')
b += f'<circle cx="430" cy="107" r="14" fill="#fff" stroke-dasharray="4,3"/>' + T(430, 112, 'P2', size=12, weight='bold')
figs['set16_q29'] = (700, 180, b, 'Possible SWR meter positions P1 (transmitter to ATU) and P2 (ATU to feeder)')

# ---------- Set 17 ----------
b = arrow(60, 230, 520, 230) + arrow(60, 230, 60, 30) + T(520, 255, 'Frequency', anchor='end')
b += T(50, 130, 'Output', anchor='end') + T(50, 146, 'level', anchor='end')
pts = [(x, 225 - 160 / (1 + ((x - 290) / 55) ** 4)) for x in range(62, 515, 3)]
b += poly(pts, 'stroke="#1a5fb4" stroke-width="2.5"')
y3 = 225 - 160 / math.sqrt(2)
b += L(62, y3, 515, y3, 'stroke-dasharray="5,5" stroke="#888" stroke-width="1.2"') + T(512, y3 - 6, '−3 dB', anchor='end', size=13)
for xf, lab in ((235, 'f1'), (345, 'f2')):
    b += L(xf, y3, xf, 230, 'stroke-dasharray="3,4" stroke="#888" stroke-width="1.2"') + T(xf, 250, lab)
b = f'<g transform="translate(40,0)">{b}</g>'
figs['set17_q15'] = (580, 270, b, 'Band-pass response with half-power points f1 and f2')

b = L(40, 60, 230, 60, 'stroke-width="4"') + L(250, 60, 440, 60, 'stroke-width="4"') + L(230, 60, 230, 100) + L(250, 60, 250, 100)
b += block(200, 100, 80, 50, 'X') + L(240, 150, 240, 240) + T(252, 200, 'coax', anchor='start', size=13)
b += block(180, 240, 120, 40, 'Transceiver') + T(240, 40, 'Half-wave dipole (balanced)', weight='bold', size=13)
figs['set17_q21'] = (480, 300, b, 'Balanced dipole connected through component X to coax')

b = '<path d="M20,260 Q300,160 580,260" stroke-width="3"/>' + T(300, 250, 'Earth', size=13)
b += L(90, 228, 90, 120, 'stroke-width="4"') + L(510, 228, 510, 140, 'stroke-width="4"')
b += L(90, 120, 510, 140, 'stroke="#1a5fb4" stroke-dasharray="8,5"') + T(300, 118, 'line of sight', size=13)
b += T(76, 175, 'h1', anchor='end', weight='bold') + T(524, 185, 'h2', anchor='start', weight='bold')
figs['set17_q28'] = (600, 280, b, 'Two antennas of heights h1 and h2 over the curved Earth with a line-of-sight path')

# ---------- Set 18 ----------
b = battery_v(60, 60, 220, '30 V') + L(60, 60, 100, 60) + resistor_h(100, 220, 60) + T(160, 40, '10 Ω')
b += L(220, 60, 300, 60) + resistor_v(300, 60, 220) + T(314, 145, '20 Ω', anchor='start') + L(60, 220, 300, 220)
figs['set18_q14'] = (380, 250, b, '10 ohm and 20 ohm in series across 30 V')

b, xs = chain(['RF amplifier\n7.1 MHz', 'Mixer', 'IF filter\n9 MHz', 'Detector'], 70, 80, 120, 54, 30)
b += antenna(40, 107) + arrow(40, 107, 70, 107)
b += block(220, 190, 120, 50, 'Local oscillator\n16.1 MHz') + arrow(280, 190, 280, 134)
figs['set18_q18'] = (700, 260, b, 'Receiver tuned to 7.1 MHz, LO 16.1 MHz, IF 9 MHz')

b, xs = chain(['Transmitter\n100 W (20 dBW)', 'Feeder\nloss 1 dB', 'Antenna\ngain 7 dBd'], 30, 70, 150, 60, 40)
b += arrow(560, 100, 600, 100) + antenna(600, 100)
figs['set18_q24'] = (650, 170, b, 'Transmitter 100 W, feeder loss 1 dB, antenna gain 7 dBd')

# ---------- Set 19 ----------
b = L(40, 120, 180, 120) + L(180, 80, 180, 160, 'stroke-width="3"') + '<rect x="192" y="90" width="36" height="60" fill="#fff"/>'
b += L(240, 80, 240, 160, 'stroke-width="3"') + L(240, 120, 380, 120) + terminal(36, 120) + terminal(384, 120)
b += T(210, 60, 'X', weight='bold', size=18)
figs['set19_q15'] = (420, 190, b, 'Component X: a rectangle between two plates')

b = arrow(60, 260, 560, 260) + T(560, 285, 'distance along the line', anchor='end') + arrow(60, 260, 60, 30)
b += T(70, 30, 'RF voltage', anchor='start')
pts = [(x, 260 - 45 * (2 + math.cos(2 * math.pi * (x - 60) / 200))) for x in range(60, 555, 3)]
b += poly(pts, 'stroke="#1a5fb4" stroke-width="2.5"')
for v in (1, 3):
    b += L(60, 260 - 45 * v, 555, 260 - 45 * v, 'stroke-dasharray="5,5" stroke="#888" stroke-width="1"')
b += T(52, 260 - 45 * 3 + 5, '3 V', anchor='end', size=13) + T(52, 260 - 45 + 5, '1 V', anchor='end', size=13)
b = f'<g transform="translate(20,0)">{b}</g>'
figs['set19_q22'] = (600, 300, b, 'Standing wave voltage along a line between 1 V and 3 V')

b = battery_v(60, 60, 260, '10 V') + L(60, 60, 260, 60) + resistor_v(260, 60, 160) + T(274, 110, '1 MΩ', anchor='start')
b += dot(260, 160) + resistor_v(260, 160, 260) + T(274, 215, '1 MΩ', anchor='start') + L(60, 260, 400, 260) + dot(260, 260)
b += L(260, 160, 400, 160) + L(400, 160, 400, 194) + meter(400, 210, 'V') + L(400, 226, 400, 260)
b += T(424, 205, 'voltmeter,', anchor='start', size=13) + T(424, 221, 'internal 1 MΩ', anchor='start', size=13)
figs['set19_q29'] = (540, 290, b, 'Voltmeter with 1 megohm internal resistance across the lower of two 1 megohm resistors on 10 V')

# ---------- Set 20 ----------
b = terminal(40, 110) + T(40, 94, 'A', weight='bold') + L(44, 110, 120, 110) + dot(120, 110) + L(120, 70, 120, 150)
b += inductor_h(120, 260, 70) + T(190, 50, '20 µH') + inductor_h(120, 260, 150) + T(190, 180, '20 µH')
b += L(260, 70, 260, 150) + dot(260, 110) + L(260, 110, 336, 110) + terminal(340, 110) + T(340, 94, 'B', weight='bold')
figs['set20_q14'] = (380, 200, b, 'Two 20 microhenry inductors in parallel between A and B')

b, xs = chain(['IF amplifier\n455 kHz', 'Product\ndetector', 'AF\namplifier'], 30, 80, 120, 54, 40)
b += arrow(510, 107, 550, 107) + T(556, 112, 'Loudspeaker', anchor='start')
b += block(190, 190, 120, 50, 'BFO\n456 kHz') + arrow(250, 190, 250, 134)
figs['set20_q19'] = (660, 260, b, 'IF at 455 kHz, BFO at 456 kHz feeding a product detector')

b = earth_and_sky(600) + antenna(80, 288) + T(80, 232, 'TX', size=13)
b += L(80, 286, 170, 76, 'stroke="#c01c28"') + arrow(170, 76, 260, 278).replace('/>', ' stroke="#c01c28"/>') + T(150, 120, 'B', weight='bold')
b += L(80, 286, 300, 66, 'stroke="#1a5fb4"') + arrow(300, 66, 520, 286).replace('/>', ' stroke="#1a5fb4"/>') + T(250, 140, 'A', weight='bold')
figs['set20_q26'] = (600, 320, b, 'Two sky-wave rays: A at a low angle landing far, B at a high angle landing near')

if __name__ == '__main__':
    write_all(figs)
