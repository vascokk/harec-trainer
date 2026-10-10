TITLE = 'Q-Codes and Abbreviations'
SECTION = 'B.2'
PAGES = (346, 349)
TOPICS = {
    '26.1': 'Q-Codes',
    '26.2': 'Q-Code as a Question or an Answer',
    '26.3': 'Operational Abbreviations',
}

QUESTIONS = [
    ('26.1', 'Q-codes are:', ['Standard three-letter codes beginning with Q', 'Call sign prefixes', 'ITU emission designators', 'Morse prosigns only'], 'A', 'Developed for commercial Morse, they act as an international language', 'are standard three-letter codes, that begin with letter Q'),
    ('26.1', 'QRG? means:', ['Should I stop?', 'Are you busy?', 'What is your location?', 'What is the (exact) frequency?'], 'D', 'QRG: frequency', 'What is the (exact) frequency?'),
    ('26.1', 'QRK? means:', ['Is my signal fading?', 'Are you ready?', 'What is the readability of my signals?', 'Who is calling me?'], 'C', 'QRK: readability', 'What is the readability of my'),
    ('26.1', 'QRL? means:', ['Should I increase power?', 'Is the frequency busy?', 'Can you confirm reception?', 'What is your location?'], 'B', 'QRL: are you busy / is the frequency in use', 'Is the frequency busy?'),
    ('26.1', 'QRM means:', ['I am bothered by atmospherics', 'I am being interfered with', 'Your signal is fading', 'Increase your power'], 'B', 'QRM: man-made interference; QRN: atmospherics', 'I am being interfered with'),
    ('26.1', 'QRN means:', ['I am ready', 'I am being interfered with by another station', 'I am bothered by atmospherics (natural noise)', 'I have nothing for you'], 'C', 'QRN: static and other natural noise', 'I am bothered by atmospherics'),
    ('26.1', 'QRO means:', ['Send slower', 'Decrease your power', 'Stop transmitting', 'Increase your power'], 'D', 'QRO: increase power; QRP: decrease power', 'Increase your power'),
    ('26.1', 'QRP means:', ['Decrease your power', 'Increase your power', 'I am ready', 'Change frequency'], 'A', 'QRP: reduce power; also used for low-power operation', 'Decrease your power'),
    ('26.1', 'QRS means:', ['Repeat your call sign', 'Stop your transmission', 'Increase your speed', 'Decrease your sending speed'], 'D', 'QRS: send more slowly, e.g. QRS 10 for 10 WPM', 'Decrease your sending speed'),
    ('26.1', 'QRT means:', ['Wait', 'Decrease your power', 'Stop your transmission', 'Change frequency'], 'C', 'QRT: stop transmitting; "going QRT" means closing down', 'Stop your transmission'),
    ('26.1', 'QRU means:', ['I have nothing for you', 'I am ready', 'I will call you back', 'You are called by'], 'A', 'QRU?: do you have anything for me?', 'I have nothing for you'),
    ('26.1', 'QRV means:', ['I am busy', 'I am ready', 'Wait', 'Your signal is fading'], 'B', 'QRV: ready', 'Are you ready?'),
    ('26.1', 'QRX means:', ['Who is calling me?', 'Stop transmitting', 'Increase power', 'I will call you back at …; wait, stand by'], 'D', 'QRX 3 is usually "wait three minutes"', 'When will you call me back?'),
    ('26.1', 'QRZ? means:', ['Is the frequency busy?', 'What is your location?', 'Who is (was) calling me?', 'Are you ready?'], 'C', 'Used when you did not copy the calling station', 'Who is/was calling me?'),
    ('26.1', 'QSB means:', ['I confirm reception', 'Your signal is fading', 'Change frequency', 'I am being interfered with'], 'B', 'QSB: fading', 'Your signal is fading'),
    ('26.1', 'QSL means:', ['I confirm reception', 'Your signal is fading', 'Stop transmitting', 'My location is'], 'A', 'QSL: confirm receipt; a QSL card confirms a contact', 'I confirm reception'),
    ('26.1', 'QSY means:', ['Listen on …', 'Change frequency to …', 'Wait', 'Decrease power'], 'B', 'For example QSY 7055 or QSY UP 1', 'Also: change frequency to'),
    ('26.1', 'QSX means:', ['Stop', 'Transmit on …', 'Listen on …', 'Confirm'], 'C', 'QSX: I am listening on (frequency)', 'Can you listen on'),
    ('26.1', 'QTH means:', ['My location is …', 'My name is …', 'My power is …', 'My frequency is …'], 'A', 'QTH: location', 'My location is'),
    ('26.1', 'If you hear QUF, you should:', ['Increase power', 'Reply with your QTH', 'Change frequency', 'Stop transmitting, listen and follow any instructions; it is an emergency signal'], 'D', 'QUF: I have received the distress signal. Pass on the message to 999 or 112', 'Stop transmitting, listen, and follow instructions'),
    ('26.2', 'In telegraphy, how is a Q-code made into a question?', ['By adding K', 'By sending it twice', 'By adding a question mark after the code', 'By sending it slowly'], 'C', 'QRL? is a question; QRL is a statement or answer', 'simply add a question mark'),
    ('26.2', 'In telephony, a Q-code is made into a question by:', ['Spelling it phonetically', 'Speaking it with a questioning tone of voice', 'Saying it three times', 'Adding "over"'], 'B', 'On phone, use a questioning tone', 'speak with a questioning tone of voice'),
    ('26.2', 'You send QRL? and receive QRL. This means:', ['Yes, the frequency is in use', 'The frequency is free', 'Please increase power', 'Change frequency'], 'A', 'QRL without a question mark is a statement', 'Yes, the frequency is in use'),
    ('26.3', 'The abbreviation CQ means:', ['End of contact', 'A call to a specific station', 'Please repeat', 'A general call to all stations'], 'D', 'CQ invites anyone to answer', 'General call to all stations'),
    ('26.3', 'The abbreviation DE means:', ['Delete', 'Distress', "From; separates the called station's call sign from the caller's", 'Distance'], 'C', 'e.g. W1ZZZ DE EI5ABC', 'used to separate the call sign of the station called'),
    ('26.3', 'The abbreviation DX means:', ['Long distance, usually another continent', 'Direct transmission', 'Digital exchange', 'Duplex'], 'A', 'DX: long-distance stations', 'Long distance, usually meaning on another continent'),
    ('26.3', 'At the end of a Morse transmission, K means:', ['End of contact', 'Over: an invitation for the other operator to transmit', 'Okay', 'Kilowatt'], 'B', 'K invites the other station to transmit', 'an invitation for the other operator to transmit'),
    ('26.3', 'The abbreviation BK means:', ['Bureau', 'Band', 'Back soon', 'A signal used to interrupt a transmission in progress'], 'D', 'BK: break', 'Signal used to interrupt a transmission in progress'),
    ('26.3', 'The abbreviation SKED means:', ['Skip distance', 'A scheduled call, planned and agreed ahead', 'Sky wave', 'Speed key'], 'B', 'SKED: schedule', 'Scheduled call, planned and agreed ahead'),
    ('26.3', 'Which pair of abbreviations means transmitter and receiver?', ['TX and RX', 'TR and RE', 'TS and RS', 'XT and XR'], 'A', 'TX = transmitter; RX = receiver', 'Transmitter'),
    ('26.3', 'The abbreviations PSE and UR mean:', ['Pass and ready', 'Pause and urgent', 'Power supply and unit', 'Please and your'], 'D', 'PSE = please; UR = your; OP = operator; MSG = message', 'Please'),
    ('26.3', 'Used on its own, R means:', ['Radio', 'Repeat', 'Received; a general yes or confirmed', 'Ready'], 'C', 'Often spoken as "Roger"', 'Received, also meaning a general yes or confirmed'),
]
