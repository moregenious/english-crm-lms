/**
 * Tenses Identification Quiz Dataset
 * Covers all 12 English Tenses across 5 progressive tiers: Easy, Middle, Hard, Impossible, Rampage
 */

export const TENSES_CONFIG = {
  present_simple: {
    id: 'present_simple',
    name: 'Present Simple',
    nameRu: 'Простое настоящее (Present Simple)',
    formula: 'V1 / Vs (do / does)',
    marker: 'usually, every day, always, often, seldom, never',
    tier: 'easy'
  },
  present_continuous: {
    id: 'present_continuous',
    name: 'Present Continuous',
    nameRu: 'Настоящее длительное (Present Continuous)',
    formula: 'am / is / are + V-ing',
    marker: 'now, at the moment, right now, currently, Look!, Listen!',
    tier: 'easy'
  },
  past_simple: {
    id: 'past_simple',
    name: 'Past Simple',
    nameRu: 'Простое прошедшее (Past Simple)',
    formula: 'V2 / Ved (did)',
    marker: 'yesterday, ago, last week/year, in 2010',
    tier: 'middle'
  },
  past_continuous: {
    id: 'past_continuous',
    name: 'Past Continuous',
    nameRu: 'Прошедшее длительное (Past Continuous)',
    formula: 'was / were + V-ing',
    marker: 'at 5 PM yesterday, while, when, all evening',
    tier: 'middle'
  },
  future_simple: {
    id: 'future_simple',
    name: 'Future Simple',
    nameRu: 'Простое будущее (Future Simple)',
    formula: 'will + V1',
    marker: 'tomorrow, next week, soon, in the future, probably',
    tier: 'hard'
  },
  present_perfect: {
    id: 'present_perfect',
    name: 'Present Perfect',
    nameRu: 'Настоящее совершенное (Present Perfect)',
    formula: 'have / has + V3',
    marker: 'already, just, yet, ever, never, since, for, recently',
    tier: 'hard'
  },
  present_perfect_continuous: {
    id: 'present_perfect_continuous',
    name: 'Present Perfect Continuous',
    nameRu: 'Настоящее длительное совершенное (Present Perfect Continuous)',
    formula: 'have / has been + V-ing',
    marker: 'for 3 hours, since morning, all day, how long',
    tier: 'hard'
  },
  past_perfect: {
    id: 'past_perfect',
    name: 'Past Perfect',
    nameRu: 'Прошедшее совершенное (Past Perfect)',
    formula: 'had + V3',
    marker: 'by 5 o\'clock yesterday, before, after, by the time',
    tier: 'impossible'
  },
  past_perfect_continuous: {
    id: 'past_perfect_continuous',
    name: 'Past Perfect Continuous',
    nameRu: 'Прошедшее длительное совершенное (Past Perfect Continuous)',
    formula: 'had been + V-ing',
    marker: 'for two hours before, since morning until...',
    tier: 'impossible'
  },
  future_continuous: {
    id: 'future_continuous',
    name: 'Future Continuous',
    nameRu: 'Будущее длительное (Future Continuous)',
    formula: 'will be + V-ing',
    marker: 'at 3 PM tomorrow, this time next week, from 5 to 7 PM',
    tier: 'rampage'
  },
  future_perfect: {
    id: 'future_perfect',
    name: 'Future Perfect',
    nameRu: 'Будущее совершенное (Future Perfect)',
    formula: 'will have + V3',
    marker: 'by tomorrow, by next Monday, by 2030',
    tier: 'rampage'
  },
  future_perfect_continuous: {
    id: 'future_perfect_continuous',
    name: 'Future Perfect Continuous',
    nameRu: 'Будущее длительное совершенное (Future Perfect Continuous)',
    formula: 'will have been + V-ing',
    marker: 'by next year for 10 years, for 5 hours by...',
    tier: 'rampage'
  }
};

export const TENSE_LEVELS = [
  {
    id: 'easy',
    name: 'Easy (Легкий)',
    icon: '🟢',
    badgeClass: 'level-easy',
    desc: 'Present Simple и Present Continuous',
    tenses: ['present_simple', 'present_continuous'],
    minScoreToUnlockNext: 8
  },
  {
    id: 'middle',
    name: 'Middle (Средний)',
    icon: '🟡',
    badgeClass: 'level-middle',
    desc: '+ Past Simple и Past Continuous',
    tenses: ['present_simple', 'present_continuous', 'past_simple', 'past_continuous'],
    minScoreToUnlockNext: 8
  },
  {
    id: 'hard',
    name: 'Hard (Сложный)',
    icon: '🟠',
    badgeClass: 'level-hard',
    desc: '+ Future Simple, Present Perfect, Present Perfect Continuous',
    tenses: ['present_simple', 'present_continuous', 'past_simple', 'past_continuous', 'future_simple', 'present_perfect', 'present_perfect_continuous'],
    minScoreToUnlockNext: 8
  },
  {
    id: 'impossible',
    name: 'Impossible (Эксперт)',
    icon: '🔴',
    badgeClass: 'level-impossible',
    desc: '+ Past Perfect и Past Perfect Continuous',
    tenses: ['present_simple', 'present_continuous', 'past_simple', 'past_continuous', 'future_simple', 'present_perfect', 'present_perfect_continuous', 'past_perfect', 'past_perfect_continuous'],
    minScoreToUnlockNext: 8
  },
  {
    id: 'rampage',
    name: 'Rampage (Все 12 времён)',
    icon: '⚡👑',
    badgeClass: 'level-rampage',
    desc: 'Абсолютно все 12 времён английского языка!',
    tenses: [
      'present_simple', 'present_continuous', 'past_simple', 'past_continuous',
      'future_simple', 'future_continuous', 'present_perfect', 'present_perfect_continuous',
      'past_perfect', 'past_perfect_continuous', 'future_perfect', 'future_perfect_continuous'
    ],
    minScoreToUnlockNext: null // final boss level
  }
];

export const TENSES_SENTENCES = [
  // --- Present Simple ---
  {
    id: 'ts-ps-1',
    sentence: 'Water boils at 100 degrees Celsius.',
    highlight: 'boils',
    tense: 'present_simple',
    translation: 'Вода закипает при 100 градусах Цельсия.',
    explanation: 'Научный факт и закон природы — используется Present Simple.'
  },
  {
    id: 'ts-ps-2',
    sentence: 'She drinks green tea every morning before school.',
    highlight: 'drinks',
    tense: 'present_simple',
    translation: 'Она пьет зеленый чай каждое утро перед школой.',
    explanation: 'Регулярное повторяющееся действие (маркер: every morning) — Present Simple.'
  },
  {
    id: 'ts-ps-3',
    sentence: 'The train to London departs at 8:30 AM.',
    highlight: 'departs',
    tense: 'present_simple',
    translation: 'Поезд в Лондон отправляется в 8:30 утра.',
    explanation: 'Действие по расписанию — используется Present Simple.'
  },
  {
    id: 'ts-ps-4',
    sentence: 'My brother usually plays football on Saturdays.',
    highlight: 'plays',
    tense: 'present_simple',
    translation: 'Мой брат обычно играет в футбол по субботам.',
    explanation: 'Привычное действие с маркером usually — Present Simple.'
  },
  {
    id: 'ts-ps-5',
    sentence: 'Do they live in that big red house?',
    highlight: 'Do they live',
    tense: 'present_simple',
    translation: 'Они живут в том большом красном доме?',
    explanation: 'Постоянное состояние в настоящем с вспомогательным глаголом do — Present Simple.'
  },
  {
    id: 'ts-ps-6',
    sentence: 'He never eats spicy food.',
    highlight: 'eats',
    tense: 'present_simple',
    translation: 'Он никогда не ест острую пищу.',
    explanation: 'Частотный маркер never и форма глагола с окончанием -s — Present Simple.'
  },
  {
    id: 'ts-ps-7',
    sentence: 'Spiders have eight legs.',
    highlight: 'have',
    tense: 'present_simple',
    translation: 'У пауков восемь ног.',
    explanation: 'Общий факт о мире — Present Simple.'
  },

  // --- Present Continuous ---
  {
    id: 'ts-pc-1',
    sentence: 'Listen! Somebody is singing in the shower.',
    highlight: 'is singing',
    tense: 'present_continuous',
    translation: 'Послушай! Кто-то поет в душе.',
    explanation: 'Действие происходит прямо сейчас в момент речи (маркер: Listen!) — is singing.'
  },
  {
    id: 'ts-pc-2',
    sentence: 'They are playing board games in the living room right now.',
    highlight: 'are playing',
    tense: 'present_continuous',
    translation: 'Они играют в настольные игры в гостиной прямо сейчас.',
    explanation: 'Маркер right now и конструкция are + V-ing указывают на Present Continuous.'
  },
  {
    id: 'ts-pc-3',
    sentence: 'Why are you wearing that warm jacket on such a sunny day?',
    highlight: 'are you wearing',
    tense: 'present_continuous',
    translation: 'Почему ты одет в эту теплую куртку в такой солнечный день?',
    explanation: 'Действие происходит в текущий период времени — Present Continuous.'
  },
  {
    id: 'ts-pc-4',
    sentence: 'I am currently reading a fascinating book about space.',
    highlight: 'am reading',
    tense: 'present_continuous',
    translation: 'В настоящее время я читаю увлекательную книгу о космосе.',
    explanation: 'Маркер currently и конструкция am + V-ing — Present Continuous.'
  },
  {
    id: 'ts-pc-5',
    sentence: 'Look! The kitten is chasing a butterfly!',
    highlight: 'is chasing',
    tense: 'present_continuous',
    translation: 'Смотри! Котенок бегает за бабочкой!',
    explanation: 'Сигнал Look! указывает на действие, разворачивающееся перед глазами — Present Continuous.'
  },
  {
    id: 'ts-pc-6',
    sentence: 'My English is getting better every single day.',
    highlight: 'is getting',
    tense: 'present_continuous',
    translation: 'Мой английский становится лучше с каждым днем.',
    explanation: 'Постепенное изменение и развитие ситуации — Present Continuous.'
  },

  // --- Past Simple ---
  {
    id: 'ts-pas-1',
    sentence: 'We visited the British Museum two years ago.',
    highlight: 'visited',
    tense: 'past_simple',
    translation: 'Мы посетили Британский музей два года назад.',
    explanation: 'Завершенное действие в прошлом с точным маркером ago — Past Simple.'
  },
  {
    id: 'ts-pas-2',
    sentence: 'She bought a vintage camera yesterday.',
    highlight: 'bought',
    tense: 'past_simple',
    translation: 'Она купила винтажную камеру вчера.',
    explanation: 'Неправильный глагол во 2-й форме (bought) с маркером yesterday — Past Simple.'
  },
  {
    id: 'ts-pas-3',
    sentence: 'Did you lock the front door before leaving?',
    highlight: 'Did you lock',
    tense: 'past_simple',
    translation: 'Ты запер входную дверь перед уходом?',
    explanation: 'Вопрос о прошлом действии с вспомогательным глаголом did — Past Simple.'
  },
  {
    id: 'ts-pas-4',
    sentence: 'Leonardo da Vinci painted the Mona Lisa in the 16th century.',
    highlight: 'painted',
    tense: 'past_simple',
    translation: 'Леонардо да Винчи написал «Мону Лизу» в 16 веке.',
    explanation: 'Исторический факт, завершившийся в прошлом — Past Simple.'
  },
  {
    id: 'ts-pas-5',
    sentence: 'I didn’t hear the doorbell ring because I had headphones on.',
    highlight: 'didn’t hear',
    tense: 'past_simple',
    translation: 'Я не услышал звонок в дверь, потому что был в наушниках.',
    explanation: 'Отрицание в прошедшем времени: didn\'t hear — Past Simple.'
  },
  {
    id: 'ts-pas-6',
    sentence: 'They arrived at the airport late last night.',
    highlight: 'arrived',
    tense: 'past_simple',
    translation: 'Они прибыли в аэропорт поздно прошлым вечером.',
    explanation: 'Маркер last night и глагол с окончанием -ed — Past Simple.'
  },

  // --- Past Continuous ---
  {
    id: 'ts-pac-1',
    sentence: 'I was doing my English homework at 7 PM yesterday.',
    highlight: 'was doing',
    tense: 'past_continuous',
    translation: 'Я делал домашку по английскому в 7 вечера вчера.',
    explanation: 'Длительное действие в определенный момент в прошлом (at 7 PM yesterday) — was doing.'
  },
  {
    id: 'ts-pac-2',
    sentence: 'While we were having dinner, the lights suddenly went out.',
    highlight: 'were having',
    tense: 'past_continuous',
    translation: 'Пока мы ужинали, свет внезапно погас.',
    explanation: 'Длительный фоновый процесс в прошлом с союзом while — were having.'
  },
  {
    id: 'ts-pac-3',
    sentence: 'What were you doing when the phone rang?',
    highlight: 'were you doing',
    tense: 'past_continuous',
    translation: 'Что ты делал, когда зазвонил телефон?',
    explanation: 'Процесс в прошлом, прерванный звонком — Past Continuous.'
  },
  {
    id: 'ts-pac-4',
    sentence: 'The children were laughing and playing in the garden all afternoon.',
    highlight: 'were laughing and playing',
    tense: 'past_continuous',
    translation: 'Дети смеялись и играли в саду весь день.',
    explanation: 'Процесс, длившийся весь день в прошлом (all afternoon) — Past Continuous.'
  },
  {
    id: 'ts-pac-5',
    sentence: 'It was raining heavily when I woke up this morning.',
    highlight: 'was raining',
    tense: 'past_continuous',
    translation: 'Шел сильный дождь, когда я проснулся сегодня утром.',
    explanation: 'Фоновое длящееся состояние в прошлом: was raining.'
  },

  // --- Future Simple ---
  {
    id: 'ts-fs-1',
    sentence: 'I think robot helpers will be common in 2040.',
    highlight: 'will be',
    tense: 'future_simple',
    translation: 'Я думаю, роботы-помощники станут привычными к 2040 году.',
    explanation: 'Предсказание на будущее с I think — Future Simple (will be).'
  },
  {
    id: 'ts-fs-2',
    sentence: 'Don’t worry, I will help you carry those heavy bags.',
    highlight: 'will help',
    tense: 'future_simple',
    translation: 'Не переживай, я помогу тебе донести эти тяжелые сумки.',
    explanation: 'Спонтанное решение помочь, принятое в момент речи — will help.'
  },
  {
    id: 'ts-fs-3',
    sentence: 'Tomorrow the sun will rise at 6:15 AM.',
    highlight: 'will rise',
    tense: 'future_simple',
    translation: 'Завтра солнце взойдет в 6:15 утра.',
    explanation: 'Неизбежный факт будущего с маркером tomorrow — Future Simple.'
  },
  {
    id: 'ts-fs-4',
    sentence: 'Will you join us for lunch tomorrow?',
    highlight: 'Will you join',
    tense: 'future_simple',
    translation: 'Ты присоединишься к нам на обед завтра?',
    explanation: 'Вопрос о планах/приглашение в будущем: will you join.'
  },
  {
    id: 'ts-fs-5',
    sentence: 'She won’t tell anyone your secret, I promise.',
    highlight: 'won’t tell',
    tense: 'future_simple',
    translation: 'Она никому не расскажет твой секрет, я обещаю.',
    explanation: 'Обещание относительно будущего: won\'t tell.'
  },

  // --- Present Perfect ---
  {
    id: 'ts-prep-1',
    sentence: 'Have you ever seen a shooting star?',
    highlight: 'Have you seen',
    tense: 'present_perfect',
    translation: 'Ты когда-нибудь видел падающую звезду?',
    explanation: 'Жизненный опыт к настоящему моменту с маркером ever — Present Perfect.'
  },
  {
    id: 'ts-prep-2',
    sentence: 'She has already finished three units of the textbook.',
    highlight: 'has finished',
    tense: 'present_perfect',
    translation: 'Она уже прошла три юнита учебника.',
    explanation: 'Результат к настоящему моменту с маркером already — has finished.'
  },
  {
    id: 'ts-prep-3',
    sentence: 'I have lost my passport, so I cannot board the plane!',
    highlight: 'have lost',
    tense: 'present_perfect',
    translation: 'Я потерял паспорт, поэтому не могу сесть на самолет!',
    explanation: 'Действие произошло в прошлом, но его результат критически важен прямо сейчас — Present Perfect.'
  },
  {
    id: 'ts-prep-4',
    sentence: 'They haven’t announced the test results yet.',
    highlight: 'haven’t announced',
    tense: 'present_perfect',
    translation: 'Они еще не объявили результаты теста.',
    explanation: 'Отрицание с маркером yet (еще не) — Present Perfect.'
  },
  {
    id: 'ts-prep-5',
    sentence: 'He has lived in London since 2018.',
    highlight: 'has lived',
    tense: 'present_perfect',
    translation: 'Он живет в Лондоне с 2018 года.',
    explanation: 'Действие началось в прошлом и продолжается в настоящем (маркер since) — Present Perfect.'
  },
  {
    id: 'ts-prep-6',
    sentence: 'We have just received an important notification.',
    highlight: 'have received',
    tense: 'present_perfect',
    translation: 'Мы только что получили важное уведомление.',
    explanation: 'Только что свершившееся действие (маркер just) — Present Perfect.'
  },

  // --- Present Perfect Continuous ---
  {
    id: 'ts-ppc-1',
    sentence: 'I have been studying English for five years.',
    highlight: 'have been studying',
    tense: 'present_perfect_continuous',
    translation: 'Я изучаю английский уже пять лет.',
    explanation: 'Действие началось в прошлом и длится до сих пор (for five years) — have been studying.'
  },
  {
    id: 'ts-ppc-2',
    sentence: 'Her eyes are red because she has been crying.',
    highlight: 'has been crying',
    tense: 'present_perfect_continuous',
    translation: 'Ее глаза красные, потому что она плакала.',
    explanation: 'Видимый результат в настоящем от длительного недавнего действия — has been crying.'
  },
  {
    id: 'ts-ppc-3',
    sentence: 'How long have you been waiting here?',
    highlight: 'have you been waiting',
    tense: 'present_perfect_continuous',
    translation: 'Как долго ты ждешь здесь?',
    explanation: 'Вопрос How long о длительности непрерывного действия — Present Perfect Continuous.'
  },
  {
    id: 'ts-ppc-4',
    sentence: 'It has been raining all morning and the grass is still wet.',
    highlight: 'has been raining',
    tense: 'present_perfect_continuous',
    translation: 'Дождь шел все утро, и трава все еще мокрая.',
    explanation: 'Непрерывное действие на протяжении всего утра с видимым эффектом — has been raining.'
  },
  {
    id: 'ts-ppc-5',
    sentence: 'He is out of breath because he has been running.',
    highlight: 'has been running',
    tense: 'present_perfect_continuous',
    translation: 'Он запыхался, потому что бежал.',
    explanation: 'Свежий физический результат недавнего непрерывного процесса — has been running.'
  },

  // --- Past Perfect ---
  {
    id: 'ts-pasp-1',
    sentence: 'When we arrived at the cinema, the movie had already started.',
    highlight: 'had started',
    tense: 'past_perfect',
    translation: 'Когда мы пришли в кинотеатр, фильм уже начался.',
    explanation: 'Действие произошло раньше другого действия в прошлом (предпрошедшее) — had started.'
  },
  {
    id: 'ts-pasp-2',
    sentence: 'She was nervous because she had never flown in an airplane before.',
    highlight: 'had flown',
    tense: 'past_perfect',
    translation: 'Она нервничала, потому что до этого никогда не летала на самолете.',
    explanation: 'Опыт до определенного момента в прошлом (маркер before) — had never flown.'
  },
  {
    id: 'ts-pasp-3',
    sentence: 'By 5 PM yesterday, he had completed all his assignments.',
    highlight: 'had completed',
    tense: 'past_perfect',
    translation: 'К 5 часам вечера вчера он завершил все свои задания.',
    explanation: 'Завершение действия к определенному моменту в прошлом (by 5 PM yesterday) — had completed.'
  },
  {
    id: 'ts-pasp-4',
    sentence: 'I couldn’t open the door because I had forgotten my keys inside.',
    highlight: 'had forgotten',
    tense: 'past_perfect',
    translation: 'Я не мог открыть дверь, потому что забыл ключи внутри.',
    explanation: 'Причина в предпрошедшем времени: had forgotten.'
  },
  {
    id: 'ts-pasp-5',
    sentence: 'The train had left before we even reached the platform.',
    highlight: 'had left',
    tense: 'past_perfect',
    translation: 'Поезд ушел еще до того, как мы добрались до платформы.',
    explanation: 'Действие завершилось до того, как мы дошли — Past Perfect (had left).'
  },

  // --- Past Perfect Continuous ---
  {
    id: 'ts-paspc-1',
    sentence: 'They had been driving for four hours before they finally saw a gas station.',
    highlight: 'had been driving',
    tense: 'past_perfect_continuous',
    translation: 'Они ехали уже четыре часа, прежде чем наконец увидели заправку.',
    explanation: 'Длительное действие продолжалось в течение 4 часов до момента в прошлом — had been driving.'
  },
  {
    id: 'ts-paspc-2',
    sentence: 'Her eyes hurt because she had been staring at the computer screen all day.',
    highlight: 'had been staring',
    tense: 'past_perfect_continuous',
    translation: 'Ее глаза болели, потому что она весь день смотрела в экран компьютера.',
    explanation: 'Длительный процесс в прошлом, вызвавший последствие в прошлом — had been staring.'
  },
  {
    id: 'ts-paspc-3',
    sentence: 'The ground was muddy because it had been raining heavily for days.',
    highlight: 'had been raining',
    tense: 'past_perfect_continuous',
    translation: 'Земля была грязной, потому что несколько дней подряд лил сильный дождь.',
    explanation: 'Непрерывное действие в прошлом с маркером for days — had been raining.'
  },
  {
    id: 'ts-paspc-4',
    sentence: 'He was exhausted because he had been working out at the gym for two hours.',
    highlight: 'had been working out',
    tense: 'past_perfect_continuous',
    translation: 'Он был измотан, потому что тренировался в спортзале два часа.',
    explanation: 'Длительность тренировки до момента усталости в прошлом — had been working out.'
  },

  // --- Future Continuous ---
  {
    id: 'ts-fc-1',
    sentence: 'This time tomorrow, I will be flying over the Atlantic Ocean.',
    highlight: 'will be flying',
    tense: 'future_continuous',
    translation: 'В это время завтра я буду лететь над Атлантическим океаном.',
    explanation: 'Действие будет находиться в процессе в точный момент будущего (this time tomorrow) — will be flying.'
  },
  {
    id: 'ts-fc-2',
    sentence: 'Don’t call me at 8 PM tonight, I will be having dinner with my family.',
    highlight: 'will be having',
    tense: 'future_continuous',
    translation: 'Не звони мне в 8 вечера сегодня, я буду ужинать с семьей.',
    explanation: 'Процесс в конкретный час в будущем: will be having.'
  },
  {
    id: 'ts-fc-3',
    sentence: 'They will be waiting for us at the station when the train arrives.',
    highlight: 'will be waiting',
    tense: 'future_continuous',
    translation: 'Они будут ждать нас на станции, когда прибудет поезд.',
    explanation: 'Процесс ожидания в момент прибытия поезда — will be waiting.'
  },
  {
    id: 'ts-fc-4',
    sentence: 'At 10 AM on Monday, we will be writing our final exam.',
    highlight: 'will be writing',
    tense: 'future_continuous',
    translation: 'В 10 утра в понедельник мы будем писать выпускной экзамен.',
    explanation: 'Конкретное время в будущем + процесс — will be writing.'
  },

  // --- Future Perfect ---
  {
    id: 'ts-fp-1',
    sentence: 'By the end of this year, I will have read fifty English novels.',
    highlight: 'will have read',
    tense: 'future_perfect',
    translation: 'К концу этого года я прочту пятьдесят романов на английском.',
    explanation: 'Действие завершится к определенному моменту в будущем (by the end of this year) — will have read.'
  },
  {
    id: 'ts-fp-2',
    sentence: 'By next Friday, they will have finished building the new bridge.',
    highlight: 'will have finished',
    tense: 'future_perfect',
    translation: 'К следующей пятнице они закончат строительство нового моста.',
    explanation: 'Маркер by next Friday указывает на завершенность к сроку — will have finished.'
  },
  {
    id: 'ts-fp-3',
    sentence: 'Will you have prepared dinner by the time the guests arrive?',
    highlight: 'Will you have prepared',
    tense: 'future_perfect',
    translation: 'Ты приготовишь ужин к тому времени, как придут гости?',
    explanation: 'Завершение действия к моменту прибытия гостей в будущем — Future Perfect.'
  },
  {
    id: 'ts-fp-4',
    sentence: 'By 2030, scientists will have discovered new sources of clean energy.',
    highlight: 'will have discovered',
    tense: 'future_perfect',
    translation: 'К 2030 году ученые откроют новые источники чистой энергии.',
    explanation: 'Результат к определенному году в будущем (by 2030) — will have discovered.'
  },

  // --- Future Perfect Continuous ---
  {
    id: 'ts-fpc-1',
    sentence: 'By next month, she will have been teaching English for twenty years.',
    highlight: 'will have been teaching',
    tense: 'future_perfect_continuous',
    translation: 'К следующему месяцу исполнится ровно двадцать лет, как она преподает английский.',
    explanation: 'Длительность непрерывного действия к моменту в будущем (by next month + for 20 years) — will have been teaching.'
  },
  {
    id: 'ts-fpc-2',
    sentence: 'By 10 PM, the programmer will have been coding for twelve hours straight.',
    highlight: 'will have been coding',
    tense: 'future_perfect_continuous',
    translation: 'К 10 вечера программист будет непрерывно кодить уже двенадцать часов подряд.',
    explanation: 'Маркер by 10 PM + for 12 hours straight — will have been coding.'
  },
  {
    id: 'ts-fpc-3',
    sentence: 'When you arrive, we will have been waiting for you for over two hours.',
    highlight: 'will have been waiting',
    tense: 'future_perfect_continuous',
    translation: 'Когда ты приедешь, мы будем ждать тебя уже более двух часов.',
    explanation: 'Длительность ожидания к моменту твоего приезда — Future Perfect Continuous.'
  },
  {
    id: 'ts-fpc-4',
    sentence: 'By the time he retires, he will have been working at this company for 35 years.',
    highlight: 'will have been working',
    tense: 'future_perfect_continuous',
    translation: 'К моменту выхода на пенсию он проработает в этой компании 35 лет.',
    explanation: 'Стаж к моменту выхода на пенсию — will have been working.'
  }
];
