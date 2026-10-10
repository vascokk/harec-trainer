TITLE = 'Power Ratios and Decibels'
SECTION = 'A.3'
PAGES = (116, 119)
TOPICS = {
    '9.1': 'Decibel',
    '9.2.1': 'Power Ratios in Watts as Decibels',
    '9.2.2': 'Power Ratios using Voltage or Current as Decibels',
    '9.3': 'Absolute Power in Decibel-Watts',
    '9.4': 'Effective Power',
}

QUESTIONS = [
    ('9.1', 'The decibel (dB) expresses:', ['A ratio between two quantities', 'An absolute power in watts', 'A voltage', 'A frequency'], 'A', 'A decibel is a relative unit for expressing ratios', 'Decibel is a handy way of expressing ratios'),
    ('9.1', 'An amplifier makes its output signal ten times as strong as its input. Its gain is:', ['1 dB', '3 dB', '10 dB', '100 dB'], 'C', 'A power ratio of 10 is 10 dB', 'your amplifier adds 10 dB of power'),
    ('9.1', 'Why are decibels so convenient for working out the power through a transmitter, feeder and antenna?', ['They do not depend on power', 'They are always whole numbers', 'They are measured in watts', 'They can be added instead of multiplying the ratios'], 'D', 'Because the scale is logarithmic, gains and losses in dB simply add', 'It allows us to simply add the decibels together'),
    ('9.1', 'A power gain of 3 dB is approximately a power ratio of:', ['1.5', '2', '3', '30'], 'B', '3 dB ≈ ×2', ('3 dB 2 times', 117, 117)),
    ('9.1', 'A power gain of 6 dB is approximately a power ratio of:', ['2', '4', '6', '60'], 'B', '6 dB = 3 dB + 3 dB ≈ ×4', ('6 dB 4 times', 117, 117)),
    ('9.1', 'A power gain of 9 dB is approximately a power ratio of:', ['90', '9', '8', '3'], 'C', '9 dB = 3 + 3 + 3 dB ≈ ×8', ('9 dB 8 times', 117, 117)),
    ('9.1', 'A power ratio of 1000 is:', ['10 dB', '20 dB', '30 dB', '1000 dB'], 'C', '30 dB = ×1000', ('30 dB 1 000 times', 117, 117)),
    ('9.1', 'A loss of 3 dB means the power is:', ['Doubled', 'Reduced to a tenth', 'Reduced to a quarter', 'Halved'], 'D', '−3 dB ≈ half the power', ('-3 dB half', 117, 117)),
    ('9.1', 'A loss of 10 dB means the power falls to:', ['One tenth', 'A quarter', 'Half', 'One hundredth'], 'A', '−10 dB = one tenth', ('-10 dB one tenth', 117, 117)),
    ('9.1', 'A loss of 6 dB means the power falls to about:', ['Half', 'One tenth', 'One sixth', 'A quarter'], 'D', '−6 dB ≈ a quarter', ('-6 dB quarter', 117, 117)),
    ('9.1', '0 dB corresponds to a power ratio of:', ['0', '1', '10', '100'], 'B', '0 dB means no change: a ratio of one', ('0 dB one', 117, 117)),
    ('9.2.1', 'An amplifier outputs 1000 W when driven with 10 W. Its power gain is:', ['10 dB', '20 dB', '30 dB', '100 dB'], 'B', '1000/10 = 100 = 20 dB', 'if output of an amplifier is 1 000 W when it is supplied with 10 W'),
    ('9.2.1', 'An amplifier outputs 400 W with 25 W of drive. Its gain is about:', ['24 dB', '16 dB', '12 dB', '6 dB'], 'C', '400/25 = 16 = 4 × 4, and each ×4 is 6 dB, so 6 + 6 = 12 dB', 'To calculate the ratio, simply divide the output by the input power'),
    ('9.2.2', 'An amplifier has 10 V at its input and 1000 V at its output (same impedance). The power gain is:', ['20 dB', '30 dB', '40 dB', '100 dB'], 'C', 'Voltage ratio 100 = 20 dB, multiplied by two = 40 dB', 'the power ratio in dB is'),
    ('9.2.2', 'When a power ratio is calculated from a voltage or current ratio, the dB value from the table must be:', ['Multiplied by two', 'Halved', 'Squared', 'Left as it is'], 'A', 'Power goes with the square of voltage, so the dB figure is doubled', 'then multiply the found dB value by two'),
    ('9.3', 'The unit dBW means decibels relative to:', ['1 mW', '1 W', '1 kW', '1 V'], 'B', 'dBW is dB relative to 1 W', 'It expresses dB relative to 1 W'),
    ('9.3', '0 dBW is:', ['0 W', '1 W', '10 W', '100 W'], 'B', '0 dB = ratio of 1; 1 × 1 W = 1 W', '0 dBW would mean 1 W'),
    ('9.3', '20 dBW is:', ['1000 W', '200 W', '100 W', '20 W'], 'C', '20 dB = ×100, so 100 W', ('20 dBW', 118, 118)),
    ('9.3', '26 dBW is about:', ['26 W', '100 W', '400 W', '1000 W'], 'C', '26 dBW = 20 dBW + 6 dB = 100 W × 4 = 400 W', ('26 dBW', 118, 118)),
    ('9.3', '30 dBW is:', ['1 kW', '100 W', '30 W', '1.5 kW'], 'A', '30 dB = ×1000, so 1 kW', ('30 dBW', 118, 118)),
    ('9.3', '17 dBW is about:', ['170 W', '50 W', '25 W', '17 W'], 'B', '17 dBW = 20 − 3 dB = 100 W / 2 = 50 W', ('17 dBW', 118, 118)),
    ('9.3', '32 dBW is about:', ['320 W', '1 kW', '3.2 kW', '1.5 kW'], 'D', '32 dBW ≈ 1.5 kW (Table 9-B)', ('32 dBW', 118, 118)),
    ('9.3', 'A power of 10 mW expressed in dBm is:', ['1 dBm', '−10 dBm', '20 dBm', '10 dBm'], 'D', 'dBm is relative to 1 mW: 10 mW = 10 dBm', '10 dBm = 10 mW'),
    ('9.4', 'A 100 W transmitter feeds a cable with 1 dB loss and an antenna with 7 dBi gain. The EIRP is:', ['26 dBW (400 W)', '20 dBW (100 W)', '28 dBW (630 W)', '27 dBW (500 W)'], 'A', '20 dBW − 1 dB + 7 dBi = 26 dBW = 400 W', '20 dBW 1 dB + 7 dBi = 26 dBW = 400 W'),
    ('9.4', 'To find the effective power at the end of a chain of devices, you:', ['Add the transmitter power in dBW and all the dB gains and losses', 'Multiply all the dB values', 'Take the largest dB value', 'Divide by the number of devices'], 'A', 'Add the dBW output and all the dB gains (and subtract the losses)', 'To calculate it you need to add the output power of a transmitter, in dBW'),
    ('9.4', 'What is the EIRP of the station shown?', ['26 dBW (400 W)', '28 dBW', '20 dBW (100 W)', '13 dBW'], 'A', '100 W = 20 dBW; 20 − 1 + 7 = 26 dBW = 400 W', '20 dBW 1 dB + 7 dBi = 26 dBW = 400 W', 'ch09_chain'),
    ('9.2.1', 'What is the gain of the amplifier shown?', ['6 dB', '16 dB', '12 dB', '24 dB'], 'C', '400/25 = 16 = 4 × 4; each ×4 is 6 dB, so 12 dB', 'To calculate the ratio, simply divide the output by the input power', 'ch09_amp'),
]
