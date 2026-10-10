"""Figures for the chapter practice banks (question_bank/chapters). Reuses the drawing
helpers from make_figures.py and make_figures_batch2.py. Figure names are chNN_<name>."""
import math

from make_figures import (GRID, L, T, antenna, arrow, battery_v, block, cap_h, cap_v, chain, dot, inductor_h,
                          meter, poly, polar, resistor_h, resistor_v, rf_trace, scope, terminal, write_all)
from make_figures_batch2 import diode, earth_and_sky, inductor_v

BLUE = 'stroke="#1a5fb4" stroke-width="2.4"'
RED = 'stroke="#c01c28" stroke-width="2.4"'


def axes(x0, y0, w, h, xlabel, ylabel):
    """Axes with the origin at (x0, y0 + h)."""
    return (arrow(x0, y0 + h, x0 + w, y0 + h) + arrow(x0, y0 + h, x0, y0) +
            T(x0 + w, y0 + h + 22, xlabel, anchor='end', size=13) + T(x0 - 8, y0 - 6, ylabel, anchor='start', size=13))


def curve(x0, y0, w, h, fn, n=400, extra=BLUE):
    """Plot fn(t) for t in 0..1, where fn returns 0..1 (fraction of height)."""
    return poly([(x0 + w * k / n, y0 + h - h * fn(k / n)) for k in range(n + 1)], extra)


def spectrum(x0, y0, w, h, lines, labels):
    """Frequency-domain plot: vertical lines at x fractions with height fractions."""
    out = axes(x0, y0, w, h, 'frequency', 'amplitude')
    for (fx, fh), lab in zip(lines, labels):
        x = x0 + w * fx
        out += L(x, y0 + h, x, y0 + h - h * fh, 'stroke="#1a5fb4" stroke-width="4"') + T(x, y0 + h + 22, lab, size=13)
    return out


def transformer(x, y1, y2, gap=16):
    return (inductor_v(x - gap, y1, y2) + inductor_v(x + gap, y1, y2) +
            L(x - 3, y1 + 10, x - 3, y2 - 10) + L(x + 3, y1 + 10, x + 3, y2 - 10))


figs = {}

# ---------- Chapter 3: Electrical and Electronic Principles ----------
b = battery_v(60, 60, 220, '12 V') + L(60, 60, 110, 60) + resistor_h(110, 230, 60) + T(170, 40, 'R1')
b += L(230, 60, 330, 60) + resistor_v(330, 60, 220) + T(344, 145, 'R2', anchor='start') + L(60, 220, 330, 220)
b += L(110, 60, 110, 110) + L(230, 60, 230, 110) + L(110, 110, 154, 110) + meter(170, 110, 'V') + L(186, 110, 230, 110)
b += T(170, 150, 'reads 8 V', size=13)
figs['ch03_series'] = (420, 250, b, '12 V battery with R1 and R2 in series; a voltmeter across R1 reads 8 V')

b = battery_v(60, 60, 220, 'E') + L(60, 60, 330, 60) + dot(200, 60)
b += L(200, 60, 200, 84) + meter(200, 100, 'A') + resistor_v(200, 116, 220) + T(222, 100, '2 A', anchor='start')
b += L(330, 60, 330, 84) + meter(330, 100, 'A') + resistor_v(330, 116, 220) + T(352, 100, '3 A', anchor='start')
b += L(60, 220, 330, 220) + dot(200, 220) + L(60, 60, 60, 60) + T(110, 45, 'I = ?', size=13)
figs['ch03_parallel'] = (420, 250, b, 'Battery feeding two parallel branches whose ammeters read 2 A and 3 A')

b = battery_v(60, 60, 220, '20 V') + L(60, 60, 184, 60) + meter(200, 60, 'A') + L(216, 60, 320, 60)
b += resistor_v(320, 60, 220) + T(334, 145, '100 Ω', anchor='start') + L(60, 220, 320, 220)
figs['ch03_ohm'] = (420, 250, b, '20 V battery, ammeter and 100 ohm resistor in series')

b = battery_v(60, 40, 120, '6 V') + battery_v(60, 140, 220, '6 V') + L(60, 120, 60, 140)
b += L(60, 40, 260, 40) + L(60, 220, 260, 220) + L(260, 40, 260, 114) + meter(260, 130, 'V') + L(260, 146, 260, 220)
figs['ch03_batteries'] = (360, 250, b, 'Two 6 V batteries connected in series, with a voltmeter across both')

# ---------- Chapter 4: Resistors in Circuits ----------
b = resistor_h(40, 140, 60) + T(90, 100, '(a)')
b += L(200, 60, 230, 60) + '<rect x="230" y="50" width="50" height="20" fill="#fff"/>' + L(280, 60, 310, 60) + T(255, 100, '(b)')
figs['ch04_symbols'] = (350, 120, b, 'Two circuit symbols: (a) a zig-zag line and (b) a rectangle')

b = terminal(40, 60) + resistor_h(44, 180, 60) + T(112, 40, '10 kΩ') + resistor_h(180, 316, 60) + T(248, 40, '4.7 kΩ')
b += terminal(320, 60) + T(40, 95, 'A') + T(320, 95, 'B')
figs['ch04_series'] = (370, 120, b, '10 kilohm and 4.7 kilohm resistors in series between A and B')

b = terminal(40, 60) + terminal(40, 220) + L(44, 60, 340, 60) + L(44, 220, 340, 220)
for x, lab in ((140, '120 Ω'), (240, '120 Ω'), (340, '60 Ω')):
    b += dot(x, 60) + resistor_v(x, 60, 220) + dot(x, 220) + T(x + 14, 145, lab, anchor='start')
b += T(26, 64, 'A', anchor='end') + T(26, 224, 'B', anchor='end')
figs['ch04_parallel'] = (420, 250, b, 'Resistors of 120, 120 and 60 ohms in parallel between A and B')

b = battery_v(60, 60, 220, '12 V') + L(60, 60, 90, 60) + resistor_h(90, 190, 60) + T(140, 40, '4 Ω')
b += L(190, 60, 340, 60) + dot(240, 60) + resistor_v(240, 60, 220) + T(254, 145, '30 Ω', anchor='start')
b += resistor_v(340, 60, 220) + T(354, 145, '60 Ω', anchor='start') + L(60, 220, 340, 220) + dot(240, 220)
figs['ch04_worked'] = (430, 250, b, '12 V battery, 4 ohm resistor in series with 30 ohm and 60 ohm in parallel')

# ---------- Chapter 5: Alternating Current and Sinusoidal Signals ----------
b = scope(30, 40, lambda t: 3 * math.sin(2 * math.pi * t / 4))
b += T(210, 350, 'Vertical: 2 V/div    Horizontal: 0.5 ms/div')
figs['ch05_scope'] = (420, 370, b, 'Oscilloscope sine wave: 3 divisions to each peak, one cycle every 4 divisions')

b = axes(40, 30, 560, 200, 'time', 'voltage') + L(40, 130, 600, 130, f'stroke="{GRID}" stroke-width="1"')
b += curve(40, 30, 540, 200, lambda t: 0.5 + 0.42 * math.sin(2 * math.pi * 2 * t + math.pi / 2), extra=BLUE)
b += curve(40, 30, 540, 200, lambda t: 0.5 + 0.42 * math.sin(2 * math.pi * 2 * t), extra=RED)
b += T(70, 30, 'A', weight='bold') + T(150, 30, 'B', weight='bold')
figs['ch05_phase'] = (640, 270, b, 'Two sine waves of the same frequency; A peaks a quarter cycle before B')

b = axes(40, 40, 560, 180, 'distance', '')
b += curve(40, 40, 540, 180, lambda t: 0.5 + 0.4 * math.sin(2 * math.pi * 2.5 * t), extra=BLUE)
x1, x2 = 40 + 540 * 0.1, 40 + 540 * 0.5
b += L(x1, 40, x1, 220, 'stroke-dasharray="4,4"') + L(x2, 40, x2, 220, 'stroke-dasharray="4,4"')
b += arrow((x1 + x2) / 2, 30, x1, 30) + arrow((x1 + x2) / 2, 30, x2, 30) + T((x1 + x2) / 2, 22, 'X', weight='bold')
figs['ch05_crests'] = (640, 260, b, 'A wave with distance X marked between two successive crests')

b = spectrum(40, 30, 540, 200, [(0.2, 0.9), (0.4, 0.35), (0.6, 0.15)], ['7.1 MHz', '14.2 MHz', '21.3 MHz'])
figs['ch05_harmonics'] = (620, 270, b, 'Spectrum with lines at 7.1, 14.2 and 21.3 MHz, decreasing in size')

# ---------- Chapter 6: Digital Signal Processing and Non-Sinusoidal Signals ----------
b = scope(30, 40, lambda t: 2.5 if (t % 4) < 2 else -2.5, cycles_pts=2000)
figs['ch06_square'] = (420, 340, b, 'Oscilloscope showing a square wave')

b = spectrum(40, 30, 540, 200, [(1 / 8, 0.8), (6 / 8, 0.4)], ['1 Hz', '6 Hz'])
figs['ch06_domains'] = (620, 270, b, 'Plot with frequency on the horizontal axis: lines at 1 Hz and 6 Hz')

b = axes(40, 30, 560, 200, 'time', 'voltage')
b += curve(40, 30, 540, 200, lambda t: 0.5 + 0.4 * math.sin(2 * math.pi * 1.5 * t), extra='stroke="#999" stroke-width="2"')
for k in range(19):
    t = k / 18
    x, y = 40 + 540 * t, 30 + 200 - 200 * (0.5 + 0.4 * math.sin(2 * math.pi * 1.5 * t))
    b += L(x, 130, x, y, 'stroke="#1a5fb4" stroke-width="1.5"') + f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4" fill="#1a5fb4" stroke="none"/>'
figs['ch06_sampling'] = (640, 270, b, 'An analogue sine wave measured at regular intervals, shown as dots')

# ---------- Chapter 8: Resonant Circuits and Components ----------
b = terminal(40, 60) + terminal(40, 200) + terminal(340, 60) + terminal(340, 200)
b += L(44, 60, 336, 60) + L(44, 200, 336, 200) + dot(190, 60) + dot(190, 200)
b += inductor_v(190, 60, 130) + cap_v(190, 130, 200) + T(206, 98, 'L', anchor='start') + T(210, 170, 'C', anchor='start')
b += T(40, 235, 'Input') + T(340, 235, 'Output (load)')
figs['ch08_series_shunt'] = (400, 255, b, 'Series LC circuit connected across the line, in parallel with the load')

b = terminal(40, 80) + terminal(40, 200) + terminal(340, 80) + terminal(340, 200)
b += L(44, 80, 120, 80) + L(260, 80, 336, 80) + L(120, 40, 120, 120) + L(260, 40, 260, 120)
b += inductor_h(120, 260, 40) + cap_h(120, 260, 120) + T(190, 26, 'L') + T(190, 150, 'C')
b += L(44, 200, 336, 200) + T(40, 235, 'Input') + T(340, 235, 'Output')
figs['ch08_parallel_lc'] = (400, 255, b, 'Parallel LC circuit in series with the signal path')

b = axes(50, 30, 520, 200, 'frequency', 'output')
b += curve(50, 30, 500, 200, lambda t: 0.85 if t < 0.45 else 0.85 / (1 + ((t - 0.45) / 0.08) ** 2) ** 1.5)
b += L(50 + 500 * 0.45, 230, 50 + 500 * 0.45, 236) + T(50 + 500 * 0.45, 252, 'fc', size=13)
figs['ch08_lowpass'] = (610, 270, b, 'Filter response: flat below fc, falling steeply above fc')

b = axes(50, 30, 520, 200, 'frequency', 'output')
b += curve(50, 30, 500, 200, lambda t: 0.85 if t > 0.55 else 0.85 / (1 + ((0.55 - t) / 0.08) ** 2) ** 1.5)
b += L(50 + 500 * 0.55, 230, 50 + 500 * 0.55, 236) + T(50 + 500 * 0.55, 252, 'fc', size=13)
figs['ch08_highpass'] = (610, 270, b, 'Filter response: falling below fc, flat above fc')

b = axes(50, 30, 520, 200, 'frequency', 'output')
b += curve(50, 30, 500, 200, lambda t: 0.85 * (1 - 0.97 / (1 + ((t - 0.5) / 0.012) ** 2)), n=1200)
figs['ch08_notch'] = (610, 270, b, 'Filter response: flat except for a very narrow, deep dip at one frequency')

g = lambda t: 0.85 / math.sqrt(1 + ((t - 0.5) / 0.1) ** 2)
b = axes(50, 30, 520, 210, 'frequency', 'output')
b += curve(50, 30, 500, 210, g)
y3 = 30 + 210 - 210 * 0.85 * 0.7071
b += L(50, y3, 550, y3, 'stroke="#888" stroke-width="1" stroke-dasharray="5,4"') + T(556, y3 + 4, '−3 dB', anchor='start', size=12)
for t, lab in ((0.4, '6.965'), (0.5, '7.000'), (0.6, '7.035')):
    x = 50 + 500 * t
    b += L(x, 240, x, 246) + T(x, 262, lab, size=12)
b += T(300, 290, 'Frequency in MHz', size=13)
figs['ch08_bandpass'] = (640, 300, b, 'Resonance curve peaking at 7.000 MHz, half-power points at 6.965 and 7.035 MHz')

b = terminal(40, 60) + terminal(40, 200) + terminal(380, 60) + terminal(380, 200)
b += L(44, 60, 120, 60) + inductor_h(120, 300, 60) + L(300, 60, 376, 60) + L(44, 200, 376, 200)
b += dot(120, 60) + dot(300, 60) + dot(120, 200) + dot(300, 200) + cap_v(120, 60, 200) + cap_v(300, 60, 200)
b += T(98, 135, 'C1', anchor='end') + T(322, 135, 'C2', anchor='start') + T(210, 40, 'L')
figs['ch08_pi'] = (420, 240, b, 'Filter with a capacitor to ground at each end and an inductor in series between them')

b = terminal(40, 60) + terminal(40, 200) + terminal(340, 60) + terminal(340, 200)
b += cap_h(44, 190, 60) + T(117, 36, 'C') + L(190, 60, 336, 60) + dot(250, 60) + inductor_v(250, 60, 200) + dot(250, 200)
b += T(266, 135, 'L', anchor='start') + L(44, 200, 336, 200) + T(40, 235, 'Input') + T(340, 235, 'Output')
figs['ch08_hp_circuit'] = (400, 255, b, 'Capacitor in series with the signal path and an inductor to ground')

b = terminal(40, 60) + cap_h(44, 180, 60) + T(112, 36, '120 pF') + cap_h(180, 316, 60) + T(248, 36, '60 pF') + terminal(320, 60)
b += T(40, 95, 'A') + T(320, 95, 'B')
figs['ch08_caps'] = (370, 120, b, '120 pF and 60 pF capacitors in series between A and B')

b = terminal(40, 60) + inductor_h(44, 180, 60) + T(112, 36, '22 mH') + inductor_h(180, 316, 60) + T(248, 36, '10 mH') + terminal(320, 60)
b += T(40, 95, 'A') + T(320, 95, 'B')
figs['ch08_inductors'] = (370, 120, b, '22 mH and 10 mH inductors in series between A and B')

b = axes(40, 30, 560, 200, 'time', '') + L(40, 130, 600, 130, f'stroke="{GRID}" stroke-width="1"')
b += curve(40, 30, 540, 200, lambda t: 0.5 + 0.42 * math.sin(2 * math.pi * 2 * t), extra=BLUE)
b += curve(40, 30, 540, 200, lambda t: 0.5 + 0.3 * math.sin(2 * math.pi * 2 * t + math.pi / 2), extra=RED)
b += T(470, 30, 'voltage', anchor='start', size=13) + L(440, 26, 464, 26, BLUE)
b += T(470, 50, 'current', anchor='start', size=13) + L(440, 46, 464, 46, RED)
figs['ch08_lead'] = (640, 270, b, 'AC voltage and current in a component: the current peaks a quarter cycle before the voltage')

# ---------- Chapter 9: Power Ratios and Decibels ----------
b, xs = chain(['Transmitter\n100 W', 'Coaxial cable\n−1 dB', 'Antenna\n+7 dBi'], 30, 50, 150, 60, 50)
b += arrow(580, 80, 620, 80) + T(628, 85, 'EIRP = ?', anchor='start')
figs['ch09_chain'] = (720, 140, b, '100 W transmitter, cable with 1 dB loss, antenna with 7 dBi gain')

b, xs = chain(['Input\n25 W', 'Amplifier', 'Output\n400 W'], 30, 50, 140, 60, 50)
figs['ch09_amp'] = (580, 140, b, 'Amplifier with 25 W input and 400 W output')

# ---------- Chapter 10: Other Components and Circuits ----------
b = L(40, 80, 140, 80) + diode(140, 80, 240, 80) + L(240, 80, 340, 80) + terminal(40, 80) + terminal(340, 80)
b += T(40, 115, 'X') + T(340, 115, 'Y')
figs['ch10_diode'] = (380, 140, b, 'Diode symbol between terminals X (triangle side) and Y (bar side)')

b = terminal(30, 60) + terminal(30, 200) + L(34, 60, 84, 60) + L(84, 60, 84, 70) + L(34, 200, 84, 200) + L(84, 200, 84, 190)
b += transformer(100, 70, 190) + L(116, 70, 116, 60) + L(116, 190, 116, 200) + L(116, 60, 150, 60)
b += diode(150, 60, 250, 60) + L(250, 60, 320, 60) + resistor_v(320, 60, 200) + L(116, 200, 320, 200)
b += T(30, 235, '230 V AC') + T(336, 135, 'Load', anchor='start')
b += poly([(400 + 200 * k / 200, 130 - 60 * max(0, math.sin(2 * math.pi * 2 * k / 200))) for k in range(201)], BLUE)
b += L(400, 130, 600, 130, f'stroke="{GRID}" stroke-width="1"') + T(500, 160, 'output voltage', size=13)
figs['ch10_halfwave'] = (640, 250, b, 'Transformer, one diode and a load; the output has only every other half-cycle')

d = 70
cx, cy = 200, 140
top, right, bot, left = (cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)
b = diode(left[0], left[1], top[0], top[1]) + diode(bot[0], bot[1], left[0], left[1])
b += diode(right[0], right[1], top[0], top[1]) + diode(bot[0], bot[1], right[0], right[1])
b += dot(*top) + dot(*bot) + dot(*left) + dot(*right)
b += L(left[0], left[1], 60, left[1]) + L(right[0], right[1], 340, right[1]) + T(60, cy - 14, 'AC in') + T(340, cy - 14, 'AC in')
b += L(top[0], top[1], top[0], 40) + T(top[0] + 12, 46, '+ DC out', anchor='start') + L(bot[0], bot[1], bot[0], 240) + T(bot[0] + 12, 240, '− DC out', anchor='start')
figs['ch10_bridge'] = (420, 270, b, 'Four diodes arranged in a diamond, with AC in at the sides and DC out at the top and bottom')

b = transformer(200, 60, 200) + T(150, 130, '100 turns', anchor='end') + T(250, 130, '20 turns', anchor='start')
b += L(184, 60, 120, 60) + L(184, 200, 120, 200) + terminal(120, 60) + terminal(120, 200) + T(110, 35, '200 V AC')
b += L(216, 60, 300, 60) + L(216, 200, 300, 200) + terminal(300, 60) + terminal(300, 200) + T(330, 135, '?', anchor='start')
figs['ch10_transformer'] = (420, 250, b, 'Transformer with 100 turns on the primary fed with 200 V AC and 20 turns on the secondary')

b = '<circle cx="200" cy="130" r="50"/>' + L(80, 130, 180, 130) + L(180, 100, 180, 160, 'stroke-width="4"')
b += L(180, 115, 225, 85) + L(225, 85, 225, 40) + L(180, 145, 225, 175) + L(225, 175, 225, 220)
b += '<polygon points="225,175 207,172 214,160" fill="#111"/>'
b += T(80, 118, 'X') + T(240, 50, 'Y', anchor='start') + T(240, 215, 'Z', anchor='start')
figs['ch10_npn'] = (340, 250, b, 'NPN transistor symbol with terminals X (left), Y (top) and Z (bottom, with the arrow)')

b, xs = chain(['Transformer', 'X', 'Smoothing\ncapacitor', 'Voltage\nregulator'], 70, 50, 120, 60, 40)
b += T(35, 76, '230 V', size=13) + T(35, 92, 'AC', size=13)
b += arrow(670, 80, 710, 80) + T(718, 85, '13.8 V DC', anchor='start')
figs['ch10_psu'] = (820, 140, b, 'Power supply: transformer, block X, smoothing capacitor, voltage regulator')

# ---------- Chapter 11: Modulation and Modes ----------
b = rf_trace(40, 110, 560, 80, lambda t: 0.6 + 0.35 * math.sin(2 * math.pi * 3 * t), cycles=60)
figs['ch11_am'] = (640, 220, b, 'RF signal whose amplitude rises and falls smoothly with the audio, never reaching zero')

b = rf_trace(40, 110, 560, 80, lambda t: max(0.0, 0.5 + 0.9 * math.sin(2 * math.pi * 3 * t)), cycles=60)
figs['ch11_overmod'] = (640, 220, b, 'RF envelope that is cut off to zero, with flat gaps, for part of each audio cycle')


def fm_wave(t):
    return math.sin(2 * math.pi * 30 * t + 8 * math.sin(2 * math.pi * 3 * t))


b = poly([(40 + 560 * k / 2400, 110 - 80 * fm_wave(k / 2400)) for k in range(2401)], 'stroke="#1a5fb4" stroke-width="1.2"')
b += L(40, 110, 600, 110, f'stroke="{GRID}" stroke-width="1"')
figs['ch11_fm'] = (640, 220, b, 'RF signal with constant amplitude whose cycles bunch together and spread apart')

b = spectrum(40, 30, 540, 200, [(0.3, 0.45), (0.5, 0.9), (0.7, 0.45)], ['7.097', '7.100', '7.103'])
b += T(310, 280, 'Frequency in MHz', size=13)
figs['ch11_am_spectrum'] = (620, 300, b, 'Spectrum: carrier at 7.100 MHz with sidebands at 7.097 and 7.103 MHz')

b = axes(40, 30, 560, 200, 'frequency', 'amplitude')
xc = 40 + 540 * 0.62
b += L(xc, 230, xc, 50, 'stroke="#888" stroke-dasharray="6,5"') + T(xc, 44, 'suppressed carrier', size=12)
b += poly([(xc - 210, 230), (xc - 200, 150), (xc - 140, 120), (xc - 60, 140), (xc - 20, 160), (xc - 12, 230)], 'stroke="#1a5fb4" stroke-width="2.4" fill="#cfe0f7"')
figs['ch11_ssb'] = (640, 270, b, 'Spectrum of a voice signal lying entirely below the position of the suppressed carrier')

b = rf_trace(40, 70, 560, 45, lambda t: 1.0 if 0.15 <= t <= 0.85 else 0.0, cycles=80) + T(20, 75, '1', weight='bold')
b += rf_trace(40, 200, 560, 45, lambda t: max(0.0, min(1.0, (t - 0.15) / 0.06, (0.85 - t) / 0.06)), cycles=80) + T(20, 205, '2', weight='bold')
figs['ch11_keying'] = (640, 260, b, 'Two CW RF envelopes: 1 switches on and off abruptly, 2 rises and falls gradually')

# ---------- Chapter 12: Transmitters ----------
b, xs = chain(['Master\noscillator', 'X', 'Power\namplifier', 'Low-pass\nfilter'], 30, 60, 120, 60, 40)
b += arrow(670, 90, 710, 90) + antenna(720, 90) + block(350, 170, 120, 40, 'Morse key') + L(410, 170, 410, 120)
figs['ch12_cw'] = (780, 230, b, 'CW transmitter: master oscillator, stage X, power amplifier, low-pass filter; key on the power amplifier')

b, xs = chain(['Microphone\namplifier', 'Balanced\nmodulator', 'X', 'Mixer', 'Linear\namplifier'], 30, 60, 120, 60, 40)
b += block(190, 170, 120, 50, 'Carrier\noscillator') + arrow(250, 170, 250, 120)
b += block(510, 170, 120, 50, 'VFO') + arrow(570, 170, 570, 120) + arrow(830, 90, 870, 90) + antenna(880, 90)
figs['ch12_ssb'] = (930, 240, b, 'SSB transmitter: microphone amplifier, balanced modulator, stage X, mixer with VFO, linear amplifier')

b, xs = chain(['Oscillator\nf = ?', 'Multiplier\n× 3', 'Power\namplifier'], 30, 60, 130, 60, 50)
b += arrow(570, 90, 610, 90) + T(618, 95, '30 MHz output', anchor='start')
figs['ch12_fm'] = (760, 150, b, 'FM transmitter: oscillator, frequency tripler, power amplifier, 30 MHz output')

b, xs = chain(['Transceiver', 'Linear\namplifier', 'SWR\nbridge', 'X', 'Antenna\ntuner'], 30, 60, 120, 60, 40)
b += arrow(830, 90, 870, 90) + antenna(880, 90)
figs['ch12_station'] = (930, 150, b, 'HF station: transceiver, linear amplifier, SWR bridge, unit X, antenna tuner, antenna')

# ---------- Chapter 13: Receivers ----------
b, xs = chain(['RF\namplifier', 'Mixer', 'X', 'IF\namplifier', 'Detector', 'AF\namplifier'], 70, 80, 100, 54, 30)
b += antenna(40, 107) + arrow(40, 107, 70, 107) + block(200, 190, 100, 50, 'Local\noscillator') + arrow(250, 190, 250, 134)
figs['ch13_superhet'] = (860, 260, b, 'Superheterodyne receiver with an unknown block X between the mixer and the IF amplifier')

b = block(200, 60, 120, 70, 'Mixer') + arrow(60, 95, 200, 95) + T(60, 80, '7000 kHz', anchor='start', size=13)
b += block(200, 190, 120, 50, 'LO 7455 kHz') + arrow(260, 190, 260, 130) + arrow(320, 95, 440, 95) + T(380, 80, 'IF = ?', size=13)
figs['ch13_mixer'] = (480, 260, b, 'A 7000 kHz signal and a 7455 kHz local oscillator feed a mixer')

b, xs = chain(['IF\namplifier', 'X', 'FM\ndemodulator', 'AF\namplifier'], 30, 60, 120, 60, 40)
figs['ch13_fm'] = (680, 150, b, 'FM receiver stages: IF amplifier, block X, FM demodulator, AF amplifier')

cx, cy, R = 300, 230, 190
b = ''
labels = ['1', '3', '5', '7', '9', '+20', '+40', '+60']
for i, lab in enumerate(labels):
    a = math.radians(150 - 120 * i / (len(labels) - 1))
    b += L(cx + (R - 14) * math.cos(a), cy - (R - 14) * math.sin(a), cx + R * math.cos(a), cy - R * math.sin(a))
    b += T(cx + (R + 18) * math.cos(a), cy - (R + 18) * math.sin(a) + 5, lab, size=13)
b += f'<path d="M{cx + R * math.cos(math.radians(150)):.1f},{cy - R * math.sin(math.radians(150)):.1f} A{R},{R} 0 0 1 {cx + R * math.cos(math.radians(30)):.1f},{cy - R * math.sin(math.radians(30)):.1f}"/>'
a = math.radians(150 - 120 * 4 / 7)
b += L(cx, cy, cx + (R - 6) * math.cos(a), cy - (R - 6) * math.sin(a), RED) + dot(cx, cy) + T(cx, cy + 30, 'S', weight='bold')
figs['ch13_smeter'] = (600, 280, b, 'S meter on an HF receiver, with the needle on S9')

# ---------- Chapter 14: Transmission Lines ----------
cx, cy = 200, 150
b = f'<circle cx="{cx}" cy="{cy}" r="110" fill="#444"/>' + f'<circle cx="{cx}" cy="{cy}" r="96" fill="#fff" stroke-dasharray="3,3" stroke-width="6"/>'
b += f'<circle cx="{cx}" cy="{cy}" r="88" fill="#e8e8e8"/>' + f'<circle cx="{cx}" cy="{cy}" r="16" fill="#b5651d"/>'
for (r, lab, ang) in ((16, 'A', 20), (60, 'B', -30), (96, 'C', 45), (106, 'D', -60)):
    t = math.radians(ang)
    b += L(cx + r * math.cos(t), cy - r * math.sin(t), 380, cy - 120 * math.sin(t)) + T(392, cy - 120 * math.sin(t) + 5, lab, anchor='start', weight='bold')
figs['ch14_coax'] = (440, 300, b, 'Cross-section of a coaxial cable: A centre, B insulation, C braid, D outer jacket')

b = axes(40, 30, 560, 200, 'position along the line', 'voltage')
b += curve(40, 30, 540, 200, lambda t: 0.3 + 0.6 * abs(math.cos(2 * math.pi * 1.25 * t)))
b += L(40, 30 + 200 - 200 * 0.9, 600, 30 + 200 - 200 * 0.9, 'stroke="#888" stroke-width="1" stroke-dasharray="5,4"') + T(604, 30 + 200 - 180 + 4, '3 V', anchor='start', size=12)
b += L(40, 30 + 200 - 200 * 0.3, 600, 30 + 200 - 200 * 0.3, 'stroke="#888" stroke-width="1" stroke-dasharray="5,4"') + T(604, 30 + 200 - 60 + 4, '1 V', anchor='start', size=12)
figs['ch14_standing'] = (660, 270, b, 'Standing wave of voltage along a line, with maxima of 3 V and minima of 1 V')

b = L(60, 60, 200, 60) + L(220, 60, 360, 60) + T(210, 40, 'Half-wave dipole') + L(200, 60, 200, 110) + L(220, 60, 220, 110)
b += block(160, 110, 100, 50, 'X') + L(210, 160, 210, 230) + T(222, 200, '50 Ω coax', anchor='start') + block(160, 230, 100, 40, 'Transceiver')
figs['ch14_balun'] = (420, 290, b, 'Half-wave dipole connected through unit X to 50 ohm coaxial cable')

# ---------- Chapter 15: Antennas ----------
b = L(40, 160, 560, 160, 'stroke-width="5"') + dot(300, 160) + T(300, 190, 'feed point', size=13)
b += curve(40, 40, 520, 120, lambda t: math.sin(math.pi * t), extra=BLUE) + T(300, 30, 'X', weight='bold')
b += curve(40, 40, 520, 120, lambda t: abs(math.cos(math.pi * t)), extra=RED) + T(50, 30, 'Y', weight='bold')
figs['ch15_dipole'] = (600, 210, b, 'Half-wave dipole with curve X largest at the centre and curve Y largest at the ends')

b = polar(190, 200, 130, lambda th: abs(math.cos(th))) + L(70, 200, 310, 200, 'stroke="#c01c28" stroke-width="5"')
b += T(190, 36, 'Wire runs left to right (red); pattern seen from above', size=13)
figs['ch15_fig8'] = (380, 370, b, 'Figure-of-eight pattern with lobes at 0 and 180 degrees, wire along 90 to 270 degrees')

b = L(80, 60, 80, 260) + L(200, 75, 200, 245) + L(300, 90, 300, 230) + L(40, 160, 340, 160, 'stroke="#888"')
b += T(80, 290, '1') + T(200, 290, '2') + T(300, 290, '3') + dot(200, 160) + T(214, 152, 'feed', anchor='start', size=12)
figs['ch15_yagi'] = (380, 310, b, 'Three-element Yagi seen from above: element 1 longest, element 2 fed, element 3 shortest')


def yagi_pattern(th):
    front = math.cos(th) ** 2 if math.cos(th) > 0 else 0
    back = 0.07 * math.cos(th) ** 2 if math.cos(th) < 0 else 0
    return max(front ** 1.5, back)


b = polar(190, 200, 130, yagi_pattern) + T(190, 36, 'Rear lobe: −23 dB relative to the front', size=13)
figs['ch15_pattern'] = (380, 370, b, 'Directional pattern with a large front lobe and a small rear lobe 23 dB down')

b = L(200, 40, 200, 170, 'stroke-width="4"') + dot(200, 170)
for dx in (-110, 110):
    b += L(200, 175, 200 + dx, 230)
b += L(200, 175, 160, 210) + L(200, 175, 240, 210) + L(200, 175, 200, 300) + T(214, 105, 'λ/4', anchor='start')
b += T(330, 240, 'radials', anchor='start', size=13)
figs['ch15_groundplane'] = (420, 320, b, 'Vertical quarter-wave element above four drooping radials')

b, xs = chain(['Transmitter\n100 W', 'Amplifier\n+4 dB', 'Cable\n−1.15 dB', 'Antenna\n+7.15 dBi'], 30, 50, 130, 60, 40)
b += arrow(660, 80, 700, 80) + T(708, 85, 'EIRP = ?', anchor='start')
figs['ch15_eirp'] = (800, 140, b, 'Transmitter 100 W, amplifier +4 dB, cable −1.15 dB, antenna +7.15 dBi')

# ---------- Chapter 16: Propagation ----------
b = earth_and_sky(700) + T(60, 290, 'TX', weight='bold')
b += f'<path d="M60,282 L360,72 L640,270" {BLUE} fill="none"/>' + f'<path d="M60,282 Q200,268 260,270" {RED} fill="none"/>'
b += T(160, 255, 'ground wave', size=12)
b += T(450, 262, 'X', weight='bold', size=18)
figs['ch16_deadzone'] = (720, 330, b, 'Ground wave reaching a short distance and a sky wave landing far away, with region X between them')

b = earth_and_sky(700) + T(350, 290, 'TX', weight='bold')
b += f'<path d="M350,270 L330,20" {RED} fill="none"/>' + T(320, 30, 'A', anchor='end', weight='bold')
b += f'<path d="M350,270 L560,64 L660,240" {BLUE} fill="none"/>' + T(565, 50, 'B', weight='bold')
figs['ch16_escape'] = (720, 330, b, 'Two rays: A goes almost straight up through the ionosphere; B is returned to Earth')

# ---------- Chapter 17: Measurements ----------
b = battery_v(60, 60, 220, '12 V') + L(60, 60, 134, 60) + meter(150, 60, 'X') + L(166, 60, 260, 60)
b += dot(260, 60) + resistor_v(260, 60, 220) + T(274, 145, 'Load', anchor='start')
b += L(260, 60, 360, 60) + L(360, 60, 360, 124) + meter(360, 140, 'Y') + L(360, 156, 360, 220)
b += L(60, 220, 360, 220) + dot(260, 220)
figs['ch17_meters'] = (420, 260, b, 'Circuit with meter X in series and meter Y across the load')

b = scope(30, 40, lambda t: 2 * math.sin(2 * math.pi * t / 2.5))
b += T(210, 350, 'Vertical: 5 V/div    Horizontal: 1 µs/div')
figs['ch17_scope'] = (420, 370, b, 'Oscilloscope sine wave reaching 2 divisions above the centre line at 5 V/div')

b = '<rect x="30" y="30" width="200" height="110" rx="8" fill="#fff"/>' + T(130, 70, 'FORWARD', size=13) + T(130, 110, '120 W', size=26, weight='bold')
b += '<rect x="260" y="30" width="200" height="110" rx="8" fill="#fff"/>' + T(360, 70, 'REFLECTED', size=13) + T(360, 110, '20 W', size=26, weight='bold')
figs['ch17_swr'] = (490, 170, b, 'SWR and power meter readings: forward 120 W, reflected 20 W')

b = axes(40, 30, 560, 200, 'frequency', 'level')
for fx, fh in ((0.25, 0.25), (0.5, 0.9), (0.75, 0.3), (0.92, 0.12)):
    x = 40 + 540 * fx
    b += L(x, 230, x, 230 - 200 * fh, 'stroke="#1a5fb4" stroke-width="3"')
b += poly([(40 + 540 * k / 300, 225 - 6 * abs(math.sin(k * 1.7))) for k in range(301)], 'stroke="#1a5fb4" stroke-width="1"')
figs['ch17_spectrum'] = (640, 270, b, 'Instrument display with frequency on the horizontal axis: a main signal and smaller spurious lines')

# ---------- Chapter 18: EMC ----------
b = block(30, 60, 120, 60, 'Stereo\namplifier') + L(150, 90, 520, 90) + L(150, 98, 520, 98)
b += '<rect x="290" y="70" width="60" height="48" rx="10" fill="#555"/>' + T(320, 150, 'X', weight='bold')
b += '<rect x="520" y="50" width="70" height="90" rx="6" fill="#fff"/>' + '<circle cx="555" cy="95" r="22"/>'
b += T(555, 165, 'Loudspeaker', size=13)
figs['ch18_ferrite'] = (620, 190, b, 'Loudspeaker cable passing through a ring X near a stereo amplifier')

# ---------- Chapter 19: Safety ----------
b = '<rect x="60" y="30" width="260" height="260" rx="30" fill="#fff"/>'
b += '<rect x="175" y="60" width="30" height="60" fill="#ddd"/>' + T(190, 140, 'X', weight='bold')
b += '<rect x="90" y="190" width="60" height="30" fill="#ddd"/>' + T(120, 250, 'Y', weight='bold')
b += '<rect x="230" y="190" width="60" height="30" fill="#ddd"/>' + T(260, 250, 'Z', weight='bold')
b += '<rect x="235" y="140" width="50" height="22" rx="8" fill="#fff"/>' + T(260, 156, 'fuse', size=11)
b += L(260, 162, 260, 190)
figs['ch19_plug'] = (380, 320, b, 'Inside of a three-pin mains plug: terminal X at the top, Y bottom left, Z bottom right next to the fuse')

if __name__ == '__main__':
    write_all(figs)
