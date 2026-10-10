TITLE = 'ITU Radio Regulations'
SECTION = 'B.8'
PAGES = (314, 319)
TOPICS = {
    '20.1': 'International Telecommunications Union (ITU)',
    '20.2': 'ITU Radio Regions and the IARU',
    '20.3': 'Purpose of the Amateur Service',
    '20.4': 'Permitted Communications',
    '20.5': 'Primary and Secondary Allocations',
    '20.6': 'Emission Designators',
    '20.7': 'Frequency of Identification',
}

QUESTIONS = [
    ('20.1', 'The International Telecommunication Union (ITU) is:', ['The United Nations agency for information and communication technologies', 'The Irish radio regulator', 'A European radio society', 'A manufacturer of radio equipment'], 'A', 'The ITU Radio Regulations govern all users of radio frequencies', 'is the United Nations (UN) agency for information and communication technologies'),
    ('20.2', 'Ireland is in which ITU Region?', ['Region 2', 'Region 1', 'Region 3', 'Region 4'], 'B', 'Region 1: Europe, Africa, the former Soviet Union, Mongolia and the Middle East west of the Persian Gulf', 'Europe, Africa, the former Soviet Union, Mongolia'),
    ('20.2', 'The Americas, including Greenland, are in ITU:', ['Region 1', 'Region 3', 'Region 2', 'Region 0'], 'C', 'Region 2: the Americas including Greenland', 'Americas including Greenland'),
    ('20.2', 'Australia and New Zealand are in ITU:', ['Region 1', 'Region 2', 'They have no region', 'Region 3'], 'D', 'Region 3: Asia east of and including Iran, and most of Oceania', 'Asia east of and including Iran'),
    ('20.2', 'The worldwide representative body for amateur radio is the:', ['ComReg', 'CEPT', 'IARU', 'ICNIRP'], 'C', 'The International Amateur Radio Union, organised in three Regions; the IRTS represents Ireland in IARU R1', 'is the worldwide representative body for amateur radio'),
    ('20.3', 'According to the ITU, the amateur service is for:', ['Military communications', 'Commercial broadcasting', 'Paid messaging services', 'Self-training, intercommunication and technical investigations'], 'D', 'Carried out by amateurs with a personal aim and without pecuniary interest', 'self-training'),
    ('20.3', 'Amateurs operate "without pecuniary interest". This means:', ['You cannot make money from amateur radio communications', 'You must pay to transmit', 'You may sell advertising on air', 'You cannot buy equipment'], 'A', 'Amateur radio is solely for a personal aim', 'without pecuniary interest'),
    ('20.4', 'Communications between amateur stations in different countries are permitted:', ['Only within the same ITU Region', 'Unless one of the administrations concerned has objected', 'Only with prior written permission', 'Never'], 'B', 'ITU RR article 25.1', 'is permitted unless the administration of one of the countries concerned has notified that it objects'),
    ('20.4', 'Amateur transmissions may not be encoded to obscure their meaning, except for:', ['Personal messages', 'Control signals between earth command stations and amateur satellites', 'Contest exchanges', 'Emergency traffic'], 'B', 'Only satellite control signals may be secret; digital modes are fine as long as the encoding is not secret', 'except for control signals exchanged between earth command stations and space stations'),
    ('20.4', 'Under the ITU rules, amateur communications are limited to:', ['Music', 'Business messages', 'News broadcasts', 'Matters incidental to the amateur service and remarks of a personal character'], 'D', 'ITU RR article 25.2', 'is limited to communications incidental to the purposes of the amateur service'),
    ('20.4', 'ARen, the Amateur Radio Emergency Network, is run by:', ['The Irish Coast Guard alone', 'The ITU', 'The IRTS in co-operation with ComReg', 'CEPT'], 'C', 'ARen operators may pass messages for designated services in emergencies', 'It is run by the IRTS in co-operation with ComReg'),
    ('20.5', 'On a band allocated to amateurs on a primary basis, amateurs:', ['Have priority and can claim protection from harmful interference from secondary users', 'Must give way to all other users', 'Cannot transmit', 'Must use low power'], 'A', 'Primary users have priority', 'It means that radio amateurs have priority use of those bands'),
    ('20.5', 'Which of these amateur bands is allocated on a secondary basis?', ['10 MHz', '14 MHz', '144 MHz', '7 MHz'], 'A', 'The 5, 10, 50 and 70 MHz bands are secondary', 'are allocated on a secondary basis'),
    ('20.5', 'Stations with a secondary allocation:', ['Need no licence', 'Have priority over primary services', 'May use unlimited power', 'Must not cause harmful interference to primary services and cannot claim protection from them'], 'D', 'Secondary users must not interfere and have no protection from primary users', 'shall not cause harmful interference to stations of primary services'),
    ('20.6', 'ITU emission designators classify:', ["The operator's licence class", 'The make of the transmitter', 'The characteristics of the signal', 'The antenna type'], 'C', 'They describe the signal, not the transmitter used', 'the characteristics of the signal'),
    ('20.6', 'The three symbols of an emission designator such as J3E describe, in order:', ['Power, bandwidth, frequency', 'Type of modulation, nature of modulating signal, type of information', 'Band, mode, power', 'Antenna, feeder, transmitter'], 'B', 'J = SSB suppressed carrier, 3 = analogue, E = telephony', 'type of modulation, nature of modulating signal, type of information transmitted'),
    ('20.6', 'The emission designator for SSB voice is:', ['A1A', 'F3E', 'J3E', 'A3E'], 'C', 'J3E: single sideband, suppressed carrier, analogue telephony', 'single side band amplitude modulation, suppressed carrier'),
    ('20.6', 'The emission designator for CW Morse code by on-off keying of the carrier is:', ['F1B', 'J3E', 'F3E', 'A1A'], 'D', 'A1A: double-sideband AM, digital without subcarrier, aural telegraphy', 'Morse code telegraphy using on-off keying of the carrier'),
    ('20.6', 'F3E is:', ['AM voice', 'FM voice (telephony)', 'CW', 'Packet radio'], 'B', 'F = frequency modulation, 3 = analogue, E = telephony', 'frequency modulation, speech'),
    ('20.6', 'A3E is:', ['AM voice with full carrier, double sideband', 'SSB voice', 'FM voice', 'RTTY'], 'A', 'A = double sideband AM', 'amplitude modulation with both carriers, speech'),
    ('20.6', 'In an emission designator, the final letter "D" means:', ['Telephony', 'Data, e.g. files, telemetry, packet radio', 'Aural telegraphy', 'Television'], 'B', 'A = aural telegraphy, B = machine telegraphy, D = data, E = telephony', 'Data, e.g., computer files, telemetry, packet radio'),
    ('20.6', 'Which designator describes RTTY or FT8 (machine-received telegraphy)?', ['J3E', 'A1A', 'F3E', 'F1B'], 'D', 'B = automatic (machine) reception telegraphy', 'Automatic (machine) reception telegraphy'),
    ('20.6', 'In an emission designator, the symbol "3" indicates:', ['One channel of analogue information', 'Digital information without a subcarrier', 'Digital information using a subcarrier', 'Three channels'], 'A', '1 = digital no subcarrier, 2 = digital with subcarrier, 3 = analogue', 'One channel containing analogue information'),
    ('20.7', 'The ITU Radio Regulations require amateur stations to transmit their call sign:', ['Only at the start of the day', 'Once a day', 'At short intervals during their transmissions', 'Only on request'], 'C', 'ITU RR 25.9', 'sign at short intervals'),
    ('20.7', 'A land mobile station must identify at the start and end, or at intervals of:', ['10 minutes', '1 hour', '30 minutes, whichever is more frequent', '5 minutes'], 'C', 'Land or maritime mobile: start and end, or every 30 minutes', 'or at intervals of 30 minutes whichever is the more frequent'),
]
