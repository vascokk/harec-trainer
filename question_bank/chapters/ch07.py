TITLE = 'Radio Waves and Spectrum'
SECTION = 'A.3'
PAGES = (70, 87)
# 7.3 Fields and Wave Formation is marked in the guide as outside the exam syllabus.
TOPICS = {
    '7.1': 'Radio Waves and Electromagnetic Radiation',
    '7.2': 'Electromagnetic Wave',
    '7.4': 'Frequency',
    '7.5': 'Radio Spectrum',
    '7.6': 'Electric Field',
    '7.7': 'Magnetic Field',
    '7.8': 'Polarisation',
}

QUESTIONS = [
    ('7.1', 'Radio waves are a type of:', ['Electromagnetic radiation', 'Sound wave', 'Ionising radiation', 'Mechanical vibration'], 'A', 'Radio waves are invisible electromagnetic radiation', 'Radio waves are a type of electromagnetic radiation'),
    ('7.1', 'In a vacuum, radio waves travel at about:', ['300 km/s', '3000 km/s', '300 000 km/s', '300 000 000 km/s'], 'C', 'The speed of light, c, is about 300 000 km/s (300 000 000 m/s)', 'which is approximately 300 000 km/s, in vacuum'),
    ('7.1', 'Which of these is also a form of electromagnetic radiation?', ['Earthquake waves', 'Ultrasound', 'Ocean waves', 'Visible light'], 'D', 'Visible light, infrared, microwaves and x-rays are all electromagnetic radiation', 'Some that you already know are visible light'),
    ('7.1', 'Which letter represents the speed of light in formulae?', ['v', 'c', 'λ', 'f'], 'B', 'The speed of light is represented by lowercase c', 'The speed of light is represented by lowercase letter c'),
    ('7.2', 'An electromagnetic wave consists of:', ['An electric field only', 'A magnetic field only', 'A stream of electrons', 'Oscillating electric (E) and magnetic (H) fields'], 'D', 'It is an interaction between changing electric and magnetic fields', 'interaction between ever-changing electric E and magnetic H fields'),
    ('7.2', 'Far from the antenna, the electric and magnetic fields of a radio wave are:', ['Parallel to each other', 'At right angles (90°) to each other and to the direction of travel', 'At 45° to each other', 'Pointing in the direction of travel'], 'B', 'They are perpendicular to each other and to the direction of propagation', 'They are perpendicular, that is, at right angles, 90 , to each other'),
    ('7.2', 'In amateur radio, the uppercase abbreviation EMF stands for:', ['Electromotive force', 'Electronic modulation frequency', 'Electromagnetic fields', 'Effective maximum frequency'], 'C', 'EMF = electromagnetic fields; lowercase emf = electromotive force', 'together they are known as electromagnetic fields EMF'),
    ('7.2', 'Why must the fields oscillate for long-distance radio communication to happen?', ['Static fields do not radiate energy away as a wave', 'Oscillation makes the fields stronger near the antenna', 'Static fields travel faster than light', 'It does not matter'], 'A', 'Without oscillation no electromagnetic wave would radiate to carry energy', 'no electromagnetic wave would radiate to carry its energy with it'),
    ('7.4', 'The ITU HF band covers:', ['3–30 MHz', '300 kHz–3 MHz', '30–300 MHz', '300 MHz–3 GHz'], 'A', 'HF, High Frequency, is 3–30 MHz', ('High Frequency', 82, 82)),
    ('7.4', 'The ITU VHF band covers:', ['3–30 MHz', '30–300 kHz', '300 MHz–3 GHz', '30–300 MHz'], 'D', 'VHF, Very High Frequency, is 30–300 MHz', 'Very High Frequency'),
    ('7.4', 'The 433 MHz amateur band lies in which ITU band?', ['HF', 'UHF', 'VHF', 'MF'], 'B', 'UHF is 300 MHz–3 GHz', 'Ultra High Frequency'),
    ('7.4', 'The ITU MF band covers:', ['30–300 kHz', '3–30 MHz', '300 kHz–3 MHz', '30–300 MHz'], 'C', 'MF, Medium Frequency, is 300 kHz–3 MHz', 'Medium Frequency'),
    ('7.4', 'Which ITU band is 30–300 kHz?', ['HF', 'MF', 'LF', 'VHF'], 'C', 'LF, Low Frequency, is 30–300 kHz', ('Low Frequency', 82, 82)),
    ('7.4', 'Microwave frequencies are the range:', ['3–30 MHz', '1–300 GHz', '30–300 MHz', '300–3000 GHz'], 'B', 'Microwaves are 1–300 GHz, starting in UHF', 'It is the 1 300 GHz range'),
    ('7.5', 'Which of these is ionising radiation?', ['X-rays', 'Visible light', 'Infrared', 'Radio waves'], 'A', 'Some ultraviolet, all x-rays and gamma rays are ionising; radio waves are not', 'all x-rays and gamma waves, are known as ionising radiation'),
    ('7.5', 'Radio waves belong to the part of the electromagnetic spectrum known as:', ['Ionising radiation', 'Gamma radiation', 'Nuclear radiation', 'Non-ionising radiation'], 'D', 'Visible light and everything below it in frequency, including radio, is non-ionising', 'is known as non-ionising radiation'),
    ('7.5', 'Compared with visible light, radio waves have:', ['Much higher frequencies', 'Much lower frequencies', 'The same frequency', 'No frequency'], 'B', 'Radio wave frequencies are much lower than those of visible light', 'radio wave frequencies are much lower than those of the electromagnetic waves of visible light'),
    ('7.5', 'In a rainbow, which colour has the lowest frequency?', ['Violet', 'Blue', 'Green', 'Red'], 'D', 'The lowest frequency is red and the highest is violet', 'with the lowest frequency represented by the red light'),
    ('7.6', 'Electric field strength is measured in:', ['A/m', 'W', 'V/m', 'Ω'], 'C', 'Electric field strength is in volts per metre', 'is measured in volts/metre V/m'),
    ('7.6', 'In the far field, if you double the distance from the antenna, the electric field strength:', ['Is halved', 'Doubles', 'Falls to a quarter', 'Stays the same'], 'A', 'Field strength is inversely proportional to distance', 'At twice the distance the field strength is halved'),
    ('7.6', 'If you double the distance from the antenna, the power density (W/m²):', ['Falls to a quarter', 'Is halved', 'Doubles', 'Stays the same'], 'A', 'Power density follows the inverse square law', 'At twice the distance, the power density is only a quarter'),
    ('7.6', 'An electric field is created by:', ['Only by magnets', 'Only by DC current', 'A difference in electric potential, such as a voltage between the ends of an antenna', 'Resistance in a wire'], 'C', 'A potential difference creates an electric field; a changing magnetic field can too', 'An electric field is created by a difference in electric potential'),
    ('7.7', 'Magnetic field strength is measured in:', ['V/m', 'A/m', 'W/m²', 'H'], 'B', 'Magnetic field strength is in amperes per metre', 'is measured in amperes/metre A/m'),
    ('7.7', 'A conductor carrying a steady DC current has around it:', ['No field at all', 'A radiating electromagnetic wave', 'An oscillating electric field only', 'A static (non-changing) magnetic field'], 'D', 'Any current, even DC, creates a magnetic field; a steady current creates a static one', 'A steady current creates a static, that is, a non-changing magnetic field'),
    ('7.8', 'The polarisation of an electromagnetic wave is determined by the direction of its:', ['Magnetic field', 'Electric field', 'Direction of travel', 'Frequency'], 'B', 'Polarisation is the direction of the electric lines of force relative to the earth', 'The electric E field determines the polarisation'),
    ('7.8', 'A horizontal dipole antenna transmits waves that are:', ['Vertically polarised', 'Circularly polarised', 'Horizontally polarised', 'Unpolarised'], 'C', 'Horizontal antennas transmit horizontally polarised waves', 'Horizontal antennas transmit horizontally polarised waves'),
    ('7.8', 'After refraction by the ionosphere, a radio wave is:', ['No longer purely horizontally or vertically polarised', 'Still exactly vertically polarised', 'Still exactly horizontally polarised', 'Not polarised at all, and cannot be received'], 'A', 'Ionospheric refraction makes waves elliptically polarised', 'Waves refracted by the ionosphere are no longer horizontally nor vertically polarised'),
]
