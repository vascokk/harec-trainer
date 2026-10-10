TITLE = 'Resistors in Circuits'
SECTION = 'A.4'
PAGES = (28, 37)
TOPICS = {
    '4.1': 'Circuits',
    '4.2': 'Resistors',
    '4.2.1': 'Resistor Power Rating',
    '4.2.2': 'Resistors Connected in Series',
    '4.2.3': 'Resistors Connected in Parallel',
    '4.2.4': 'Multiple Resistors in a Circuit',
    '4.2.5': 'Worked Example: Current, Voltage, and Power with Multiple Resistors',
}

QUESTIONS = [
    ('4.1', 'On a circuit diagram, the lines joining the component symbols represent:', ['The voltage at each point', 'The direction of the magnetic field', 'The conductors that connect the components', 'Where the current is zero'], 'C', 'Lines represent the conductors that connect components to each other', 'Lines represent the conductors that connect components'),
    ('4.2', 'A resistor does its work by:', ['Storing energy in a magnetic field', 'Dissipating energy as heat', 'Storing charge on two plates', 'Amplifying the current'], 'B', 'Resistors dissipate energy as heat, which is why they get warm', 'resistors perform their work by dissipating energy as heat'),
    ('4.2', 'A nominal 100 Ω resistor has a tolerance of 10%. Its actual resistance may be anywhere between:', ['99 Ω and 101 Ω', '95 Ω and 105 Ω', '90 Ω and 110 Ω', '10 Ω and 1000 Ω'], 'C', '10% of 100 Ω is 10 Ω, so 90–110 Ω', 'between 90 Ω and 110 Ω'),
    ('4.2', 'Which two symbols may be used for a resistor on a circuit diagram?', ['Two parallel lines, or a curl', 'A coil, or a dashed box', 'A circle with an arrow, or a triangle', 'A zig-zag line, or a rectangle'], 'D', 'The zig-zag (ANSI) and the rectangle (IEC, the more recent) are both used', 'a zig-zag line, and a rectangle'),
    ('4.2', 'A potentiometer is:', ['A type of variable resistor, such as a volume control', 'A fixed resistor with very high power rating', 'A meter that measures potential difference', 'A resistor made from a semiconductor junction'], 'A', 'Pots are variable resistors changed by turning a knob or moving a slider', 'are a type of variable resistor'),
    ('4.2.1', 'What may happen if the power rating of a resistor is exceeded?', ['It may burn out and fail', 'Its resistance falls to zero and it saves energy', 'It starts to oscillate', 'Its tolerance improves'], 'A', 'Exceeding the maximum power rating may burn out the component', 'the component may burn out and fail'),
    ('4.2.1', 'A 5 kΩ resistor carries a current of 10 mA. How much power does it dissipate?', ['0.05 W', '0.5 W', '5 W', '50 W'], 'B', 'P = I²R = 0.01² × 5000 = 0.5 W', 'a 5 kΩ kilohm resistor handling 10 mA'),
    ('4.2.1', 'A 1 MΩ resistor has 1.5 kV across it. It dissipates 2.25 W. Which resistor would be suitable?', ['1 MΩ rated 0.5 W', '1 MΩ rated 1 W', '1 MΩ rated 2 W', '1 MΩ rated 5 W'], 'D', 'The rating must exceed the dissipation: 5 W would do, 2 W might burn out', 'with a power rating of 5 W would meet and exceed'),
    ('4.2.1', 'A 100 Ω resistor has 10 V across it. What is the minimum power rating it needs?', ['0.1 W', '1 W', '10 W', '100 W'], 'B', 'P = V²/R = 100/100 = 1 W', ('Power rating for a resistor can be calculated', 29, 29)),
    ('4.2.2', 'Resistors of 10 kΩ and 4.7 kΩ are connected in series. What is the equivalent resistance?', ['3.2 kΩ', '5.3 kΩ', '14.7 kΩ', '47 kΩ'], 'C', 'In series the resistances add: 10 + 4.7 = 14.7 kΩ', 'Equivalent resistance is 14.7'),
    ('4.2.2', 'The equivalent resistance of resistors in series is always:', ['Less than the smallest resistance', 'Equal to the average resistance', 'Equal to the smallest resistance', 'Greater than the largest resistance'], 'D', 'Series resistors increase the total, which is always greater than the largest one', 'always greater than the largest resistance'),
    ('4.2.2', 'Resistors of 1.2 kΩ and 800 Ω are connected in series. What is the total resistance?', ['2 kΩ', '801.2 Ω', '480 Ω', '1.28 kΩ'], 'A', 'Convert to the same prefix: 1200 Ω + 800 Ω = 2000 Ω = 2 kΩ', 'If the prefixes differ, it is necessary to convert them'),
    ('4.2.3', 'Resistors of 120 Ω, 120 Ω and 60 Ω are connected in parallel. What is the equivalent resistance?', ['30 Ω', '60 Ω', '100 Ω', '300 Ω'], 'A', '1/R = 1/120 + 1/120 + 1/60 = 4/120, so R = 30 Ω', 'Equivalent resistance is 30 Ω'),
    ('4.2.3', 'The equivalent resistance of resistors in parallel is always:', ['Greater than the largest resistance', 'Less than the smallest resistance', 'Equal to their sum', 'Equal to the largest resistance'], 'B', 'Parallel resistors reduce the total, below the smallest one', 'always less than that of the smallest connected resistance'),
    ('4.2.3', 'Two 100 Ω resistors are connected in parallel. What is the equivalent resistance?', ['200 Ω', '100 Ω', '50 Ω', '25 Ω'], 'C', '1/R = 1/100 + 1/100 = 2/100, so R = 50 Ω', 'the inverse of the sum of the inversed resistances'),
    ('4.2.3', 'When calculating parallel resistance, the sum 1/R1 + 1/R2 + … gives:', ['The equivalent resistance directly', 'The power dissipated', 'The total current', '1/Req, which still has to be inverted'], 'D', 'The sum of the inverses is 1/Req; you must invert it to get Req', 'we still need to invert that intermediate result'),
    ('4.2.4', 'To find the overall resistance of a circuit with series and parallel resistors, you should first:', ['Calculate the equivalent resistance of the parallel resistances', 'Add up all the resistances', 'Calculate the power in each resistor', 'Measure the battery voltage'], 'A', "First the parallel combinations, then the series total, then Ohm's law", 'First, calculate the equivalent resistance of the parallel connected resistances'),
    ('4.2.4', 'What kind of calculator is provided in the HAREC exam?', ['None; calculators are not allowed', 'A simple calculator that adds, subtracts, multiplies and divides', 'A scientific calculator with square roots', 'A programmable calculator'], 'B', 'A simple calculator without squares or square roots is provided', 'A simple calculator will be provided for the duration of the exam'),
    ('4.2.5', 'A 12 V battery feeds a 4 Ω resistor in series with 30 Ω and 60 Ω in parallel. What is the total resistance?', ['94 Ω', '64 Ω', '34 Ω', '24 Ω'], 'D', '30 ∥ 60 = 20 Ω; 20 + 4 = 24 Ω', '4 Ω + 20 Ω = 24 Ω'),
    ('4.2.5', 'In the same circuit (12 V, 4 Ω in series with 30 Ω ∥ 60 Ω, total 24 Ω), what current flows from the battery?', ['3 A', '2 A', '0.5 A', '0.2 A'], 'C', 'I = 12 V / 24 Ω = 0.5 A', '12 V / 24 Ω = 0.5 A'),
    ('4.2.5', 'In the same circuit, 0.5 A flows through the 4 Ω resistor. What voltage is across the 30 Ω and 60 Ω parallel pair?', ['2 V', '6 V', '10 V', '12 V'], 'C', 'The 4 Ω resistor drops 0.5 × 4 = 2 V, leaving 12 − 2 = 10 V across the parallel pair', '12 − 2 = 10 V'),
    ('4.2.5', 'With 10 V across a 30 Ω and a 60 Ω resistor in parallel, which statement is true?', ['Both carry the same current', 'The 60 Ω resistor carries half the current of the 30 Ω resistor', 'The 60 Ω resistor carries twice the current of the 30 Ω resistor', 'The 60 Ω resistor dissipates more power'], 'B', 'Same voltage, twice the resistance, half the current (167 mA vs 333 mA)', 'twice as big resistance'),
    ('4.2.5', 'The 12 V circuit draws 0.5 A in total. What is the total power dissipated?', ['3 W', '24 W', '1 W', '6 W'], 'D', 'P = V × I = 12 × 0.5 = 6 W, also the sum of the powers in each resistor', 'The total power used by this circuit is 6 W'),
    ('4.2', 'The two circuit symbols (a) and (b) shown both represent a:', ['Capacitor', 'Inductor', 'Fuse', 'Resistor'], 'D', 'A resistor is drawn as a zig-zag line or as a rectangle', 'a zig-zag line, and a rectangle', 'ch04_symbols'),
    ('4.2.2', 'What is the resistance between A and B in the circuit shown?', ['14.7 kΩ', '3.2 kΩ', '5.3 kΩ', '47 kΩ'], 'A', 'Series resistances add: 10 kΩ + 4.7 kΩ = 14.7 kΩ', 'Equivalent resistance is 14.7', 'ch04_series'),
    ('4.2.3', 'What is the resistance between A and B in the parallel circuit shown?', ['300 Ω', '100 Ω', '30 Ω', '60 Ω'], 'C', '1/120 + 1/120 + 1/60 = 4/120, so R = 30 Ω', 'Equivalent resistance is 30 Ω', 'ch04_parallel'),
    ('4.2.5', 'What current does the battery supply in the circuit shown?', ['0.13 A', '0.5 A', '3 A', '0.2 A'], 'B', '30 Ω ∥ 60 Ω = 20 Ω; total 4 + 20 = 24 Ω; 12 V / 24 Ω = 0.5 A', '12 V / 24 Ω = 0.5 A', 'ch04_worked'),
    ('4.2.5', 'In the circuit shown, what is the voltage across the 30 Ω resistor?', ['2 V', '12 V', '6 V', '10 V'], 'D', '0.5 A through 4 Ω drops 2 V, leaving 12 − 2 = 10 V across the parallel pair', '12 − 2 = 10 V', 'ch04_worked'),
]
