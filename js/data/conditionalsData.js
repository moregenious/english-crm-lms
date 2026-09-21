/**
 * 160 Conditionals Sentences: 40 Type 1, 40 Type 2, 40 Type 3, 40 Mixed
 * Each item contains: id, prompt, options, correct, translation, explanation
 */

export const CONDITIONALS_DATA = {
  type1: [
    {
      id: 'c1-1',
      prompt: 'If it rains tomorrow, we ___ at home.',
      options: ['stay', 'will stay', 'would stay', 'stayed'],
      correct: 'will stay',
      translation: 'Если завтра пойдет дождь, мы останемся дома.',
      explanation: 'First Conditional: в придаточном условие (If + Present Simple: rains), в главном — будущее время (will + V1: will stay).'
    },
    {
      id: 'c1-2',
      prompt: 'If you study hard, you ___ the exam.',
      options: ['will pass', 'pass', 'would pass', 'passed'],
      correct: 'will pass',
      translation: 'Если ты будешь усердно учиться, ты сдашь экзамен.',
      explanation: 'First Conditional: в главном предложении используется will + V1 (will pass).'
    },
    {
      id: 'c1-3',
      prompt: 'She will be late if she ___ now.',
      options: ["doesn't leave", "won't leave", "didn't leave", "wouldn't leave"],
      correct: "doesn't leave",
      translation: 'Она опоздает, если не выйдет прямо сейчас.',
      explanation: 'В части с if будущее время не используется; ставится Present Simple (doesn\'t leave).'
    },
    {
      id: 'c1-4',
      prompt: 'If I have enough free time, I ___ you with your project.',
      options: ['will help', 'help', 'would help', 'helped'],
      correct: 'will help',
      translation: 'Если у меня будет достаточно свободного времени, я помогу тебе с проектом.',
      explanation: 'First Conditional: условие реально для будущего, поэтому will help.'
    },
    {
      id: 'c1-5',
      prompt: 'If the weather ___ fine on Sunday, we will go for a picnic.',
      options: ['is', 'will be', 'was', 'would be'],
      correct: 'is',
      translation: 'Если погода в воскресенье будет хорошей, мы поедем на пикник.',
      explanation: 'В придаточном времени и условия после if используется Present Simple (is), а не will be.'
    },
    {
      id: 'c1-6',
      prompt: 'We will miss the train if we ___ a taxi.',
      options: ["don't take", "won't take", "didn't take", "haven't taken"],
      correct: "don't take",
      translation: 'Мы опоздаем на поезд, если не возьмем такси.',
      explanation: 'После if для настоящего/будущего действия используется Present Simple (don\'t take).'
    },
    {
      id: 'c1-7',
      prompt: 'If you eat too much candy, your teeth ___ .',
      options: ['will hurt', 'hurts', 'would hurt', 'hurted'],
      correct: 'will hurt',
      translation: 'Если ты съешь слишком много конфет, у тебя разболятся зубы.',
      explanation: 'Главное предложение выражает реальное следствие в будущем (will hurt).'
    },
    {
      id: 'c1-8',
      prompt: 'If he ___ me, I will tell him the good news.',
      options: ['calls', 'will call', 'called', 'would call'],
      correct: 'calls',
      translation: 'Если он мне позвонит, я расскажу ему хорошую новость.',
      explanation: 'В условии после he используется глагол в Present Simple с окончанием -s (calls).'
    },
    {
      id: 'c1-9',
      prompt: 'What will you do if they ___ the flight?',
      options: ['cancel', 'will cancel', 'canceled', 'would cancel'],
      correct: 'cancel',
      translation: 'Что ты будешь делать, если они отменят рейс?',
      explanation: 'В условной части после if ставится Present Simple (cancel).'
    },
    {
      id: 'c1-10',
      prompt: 'If you press this button, the green light ___ on.',
      options: ['will turn', 'turns', 'would turn', 'turned'],
      correct: 'will turn',
      translation: 'Если ты нажмешь эту кнопку, включится зеленый индикатор.',
      explanation: 'First Conditional: реальный результат конкретного действия в будущем — will turn.'
    },
    {
      id: 'c1-11',
      prompt: 'I will buy this book if the bookstore ___ open.',
      options: ['is', 'will be', 'was', 'were'],
      correct: 'is',
      translation: 'Я куплю эту книгу, если книжный магазин будет открыт.',
      explanation: 'После if используется настоящее время (is).'
    },
    {
      id: 'c1-12',
      prompt: 'If they don’t invite us, we ___ to their party.',
      options: ["won't go", "don't go", "wouldn't go", "didn't go"],
      correct: "won't go",
      translation: 'Если они нас не пригласят, мы не пойдем на их вечеринку.',
      explanation: 'В главном предложении отрицание будущего времени: will not / won\'t go.'
    },
    {
      id: 'c1-13',
      prompt: 'If you ___ your homework now, you can play games later.',
      options: ['finish', 'will finish', 'finished', 'would finish'],
      correct: 'finish',
      translation: 'Если ты сделаешь домашку сейчас, сможешь поиграть позже.',
      explanation: 'В части с if для 2-го лица (you) используется начальная форма Present Simple (finish).'
    },
    {
      id: 'c1-14',
      prompt: 'If our team ___ this match, they will become the champions.',
      options: ['wins', 'will win', 'won', 'would win'],
      correct: 'wins',
      translation: 'Если наша команда выиграет этот матч, она станет чемпионом.',
      explanation: 'Our team (it) согласуется с формой wins в Present Simple.'
    },
    {
      id: 'c1-15',
      prompt: 'You will catch a cold if you ___ a warm coat.',
      options: ["don't put on", "won't put on", "didn't put on", "wouldn't put on"],
      correct: "don't put on",
      translation: 'Ты простудишься, если не наденешь теплое пальто.',
      explanation: 'Условие в будущем строится через Present Simple: don\'t put on.'
    },
    {
      id: 'c1-16',
      prompt: 'If she needs any help, I ___ happy to assist her.',
      options: ['will be', 'am', 'would be', 'was'],
      correct: 'will be',
      translation: 'Если ей понадобится помощь, я с радостью ей помогу.',
      explanation: 'Главное предложение в First Conditional: will be.'
    },
    {
      id: 'c1-17',
      prompt: 'If I find your keys, I ___ you right away.',
      options: ['will text', 'text', 'would text', 'texted'],
      correct: 'will text',
      translation: 'Если я найду твои ключи, я сразу же напишу тебе.',
      explanation: 'Обещание или действие в будущем: will text.'
    },
    {
      id: 'c1-18',
      prompt: 'He ___ angry if you break his favorite mug.',
      options: ['will get', 'gets', 'would get', 'got'],
      correct: 'will get',
      translation: 'Он рассердится, если ты разобьешь его любимую кружку.',
      explanation: 'Главное предложение: will get.'
    },
    {
      id: 'c1-19',
      prompt: 'If we leave at 7:00, we ___ the traffic jam.',
      options: ['will avoid', 'avoid', 'would avoid', 'avoided'],
      correct: 'will avoid',
      translation: 'Если мы выедем в 7:00, мы избежим пробки.',
      explanation: 'First Conditional: следствие в будущем (will avoid).'
    },
    {
      id: 'c1-20',
      prompt: 'If the price drops, I ___ a new laptop.',
      options: ['will order', 'order', 'would order', 'ordered'],
      correct: 'will order',
      translation: 'Если цена упадет, я закажу новый ноутбук.',
      explanation: 'First Conditional: If + Present Simple (drops) -> will order.'
    },
    {
      id: 'c1-21',
      prompt: 'If you ___ water to 100 degrees Celsius, it boils.',
      options: ['heat', 'will heat', 'heated', 'would heat'],
      correct: 'heat',
      translation: 'Если нагреть воду до 100 градусов, она закипит.',
      explanation: 'Закон природы/факт (Zero/First conditional): Present Simple (heat).'
    },
    {
      id: 'c1-22',
      prompt: 'If you don’t listen carefully, you ___ understand the rule.',
      options: ["won't", "don't", "wouldn't", "didn't"],
      correct: "won't",
      translation: 'Если ты не будешь слушать внимательно, ты не поймешь правило.',
      explanation: 'Будущее отрицание в главном предложении: won\'t.'
    },
    {
      id: 'c1-23',
      prompt: 'I will lend you my umbrella if it ___ .',
      options: ['rains', 'will rain', 'rained', 'would rain'],
      correct: 'rains',
      translation: 'Я одолжу тебе зонт, если пойдет дождь.',
      explanation: 'После if: Present Simple (rains).'
    },
    {
      id: 'c1-24',
      prompt: 'If the bus ___ on time, we will be there at noon.',
      options: ['arrives', 'will arrive', 'arrived', 'would arrive'],
      correct: 'arrives',
      translation: 'Если автобус прибудет вовремя, мы будем там в полдень.',
      explanation: 'В придаточном условии — Present Simple (arrives).'
    },
    {
      id: 'c1-25',
      prompt: 'They will be surprised if we ___ up unexpectedly.',
      options: ['show', 'will show', 'showed', 'would show'],
      correct: 'show',
      translation: 'Они удивятся, если мы появимся неожиданно.',
      explanation: 'После if: show (Present Simple).'
    },
    {
      id: 'c1-26',
      prompt: 'If you practice speaking English every day, you ___ fluent.',
      options: ['will become', 'become', 'would become', 'became'],
      correct: 'will become',
      translation: 'Если ты будешь практиковать разговорный английский каждый день, ты заговоришь бегло.',
      explanation: 'Следствие в будущем: will become.'
    },
    {
      id: 'c1-27',
      prompt: 'If she ___ her phone, she will buy a new one.',
      options: ['loses', 'will lose', 'lost', 'would lose'],
      correct: 'loses',
      translation: 'Если она потеряет телефон, она купит новый.',
      explanation: 'После she в условном придаточном: loses.'
    },
    {
      id: 'c1-28',
      prompt: 'We will have to walk if the car ___ down.',
      options: ['breaks', 'will break', 'broke', 'would break'],
      correct: 'breaks',
      translation: 'Нам придется идти пешком, если машина сломается.',
      explanation: 'Present Simple: breaks down.'
    },
    {
      id: 'c1-29',
      prompt: 'If you touch that hot pan, you ___ yourself.',
      options: ['will burn', 'burn', 'would burn', 'burnt'],
      correct: 'will burn',
      translation: 'Если ты дотронешься до горячей сковороды, ты обожжешься.',
      explanation: 'Предупреждение о будущем результате: will burn.'
    },
    {
      id: 'c1-30',
      prompt: 'If he ___ the truth, they will forgive him.',
      options: ['tells', 'will tell', 'told', 'would tell'],
      correct: 'tells',
      translation: 'Если он скажет правду, они его простят.',
      explanation: 'После if: tells (Present Simple).'
    },
    {
      id: 'c1-31',
      prompt: 'I will buy ice cream if you ___ your room.',
      options: ['clean', 'will clean', 'cleaned', 'would clean'],
      correct: 'clean',
      translation: 'Я куплю мороженое, если ты уберешь в своей комнате.',
      explanation: 'Present Simple в придаточном условии: clean.'
    },
    {
      id: 'c1-32',
      prompt: 'If the battery dies, the phone ___ off.',
      options: ['will turn', 'turns', 'would turn', 'turned'],
      correct: 'will turn',
      translation: 'Если батарея сядет, телефон выключится.',
      explanation: 'First Conditional: will turn off.'
    },
    {
      id: 'c1-33',
      prompt: 'She ___ the job if she does well in the interview.',
      options: ['will get', 'gets', 'would get', 'got'],
      correct: 'will get',
      translation: 'Она получит эту работу, если хорошо покажет себя на собеседовании.',
      explanation: 'Главное предложение: will get.'
    },
    {
      id: 'c1-34',
      prompt: 'If you ___ the dog, it won’t bark at you.',
      options: ["don't tease", "won't tease", "didn't tease", "wouldn't tease"],
      correct: "don't tease",
      translation: 'Если ты не будешь дразнить собаку, она не станет лаять на тебя.',
      explanation: 'Present Simple отрицание: don\'t tease.'
    },
    {
      id: 'c1-35',
      prompt: 'If the soup is too salty, you ___ some water.',
      options: ['can add', 'added', 'would add', 'could added'],
      correct: 'can add',
      translation: 'Если суп слишком соленый, ты можешь добавить немного воды.',
      explanation: 'В First Conditional модальный глагол can выражает возможность в будущем.'
    },
    {
      id: 'c1-36',
      prompt: 'If they ___ hard, they will achieve their goal.',
      options: ['work', 'will work', 'worked', 'would work'],
      correct: 'work',
      translation: 'Если они будут усердно трудиться, они достигнут своей цели.',
      explanation: 'В придаточном с if ставится Present Simple: work.'
    },
    {
      id: 'c1-37',
      prompt: 'What will happen if we ___ the deadline?',
      options: ['miss', 'will miss', 'missed', 'would miss'],
      correct: 'miss',
      translation: 'Что случится, если мы пропустим дедлайн?',
      explanation: 'После if: miss (Present Simple).'
    },
    {
      id: 'c1-38',
      prompt: 'If you drink cold milk with a sore throat, it ___ worse.',
      options: ['will make', 'makes', 'would make', 'made'],
      correct: 'will make',
      translation: 'Если ты выпьешь холодное молоко с больным горлом, это сделает только хуже.',
      explanation: 'First Conditional: will make.'
    },
    {
      id: 'c1-39',
      prompt: 'If Mark comes over, we ___ video games together.',
      options: ['will play', 'play', 'would play', 'played'],
      correct: 'will play',
      translation: 'Если Марк придет в гости, мы поиграем в видеоигры вместе.',
      explanation: 'Главное предложение: will play.'
    },
    {
      id: 'c1-40',
      prompt: 'Unless you hurry, you ___ the bus.',
      options: ['will miss', 'miss', 'would miss', 'missed'],
      correct: 'will miss',
      translation: 'Если ты не поторопишься, ты опоздаешь на автобус.',
      explanation: 'Unless = if not. В главном предложении ставится будущее время (will miss).'
    }
  ],

  type2: [
    {
      id: 'c2-1',
      prompt: 'If I ___ a million dollars, I would travel around the world.',
      options: ['had', 'have', 'would have', 'will have'],
      correct: 'had',
      translation: 'Если бы у меня был миллион долларов, я бы путешествовал по всему миру.',
      explanation: 'Second Conditional (нереальное условие в настоящем): If + Past Simple (had), would + V1.'
    },
    {
      id: 'c2-2',
      prompt: 'If I ___ you, I would take that opportunity.',
      options: ['were', 'am', 'will be', 'would be'],
      correct: 'were',
      translation: 'На твоем месте (если бы я был тобой), я бы воспользовался этой возможностью.',
      explanation: 'В сослагательном наклонении (Second Conditional) для всех лиц традиционно используется were.'
    },
    {
      id: 'c2-3',
      prompt: 'What would you do if you ___ an alien?',
      options: ['saw', 'see', 'will see', 'would see'],
      correct: 'saw',
      translation: 'Что бы ты сделал, если бы увидел пришельца?',
      explanation: 'Second Conditional: в части с if используется Past Simple (saw).'
    },
    {
      id: 'c2-4',
      prompt: 'If she knew his phone number, she ___ him.',
      options: ['would call', 'will call', 'called', 'had called'],
      correct: 'would call',
      translation: 'Если бы она знала его номер телефона, она бы ему позвонила.',
      explanation: 'Second Conditional: в главном предложении ставится would + V1 (would call).'
    },
    {
      id: 'c2-5',
      prompt: 'If we ___ in Spain, we would speak Spanish every day.',
      options: ['lived', 'live', 'will live', 'would live'],
      correct: 'lived',
      translation: 'Если бы мы жили в Испании, мы бы говорили по-испански каждый день.',
      explanation: 'Нереальное условие настоящего: If + Past Simple (lived).'
    },
    {
      id: 'c2-6',
      prompt: 'I ___ that expensive car even if I had the money.',
      options: ["wouldn't buy", "won't buy", "didn't buy", "hadn't bought"],
      correct: "wouldn't buy",
      translation: 'Я бы не купил ту дорогую машину, даже если бы у меня были деньги.',
      explanation: 'Second Conditional в отрицании: wouldn\'t buy.'
    },
    {
      id: 'c2-7',
      prompt: 'If he ___ so fast, he wouldn’t get so many speeding tickets.',
      options: ["didn't drive", "doesn't drive", "wouldn't drive", "won't drive"],
      correct: "didn't drive",
      translation: 'Если бы он не водил так быстро, он бы не получал столько штрафов.',
      explanation: 'Past Simple отрицание в условии: didn\'t drive.'
    },
    {
      id: 'c2-8',
      prompt: 'If animals ___ talk, which one would be the rudest?',
      options: ['could', 'can', 'will can', 'would can'],
      correct: 'could',
      translation: 'Если бы животные умели говорить, какое из них было бы самым грубым?',
      explanation: 'Форма прошедшего времени от can — could в сослагательном значении.'
    },
    {
      id: 'c2-9',
      prompt: 'If it snowed in July, everyone ___ very surprised.',
      options: ['would be', 'will be', 'is', 'was'],
      correct: 'would be',
      translation: 'Если бы в июле пошел снег, все были бы очень удивлены.',
      explanation: 'Second Conditional: маловероятное условие, в главном предложении would be.'
    },
    {
      id: 'c2-10',
      prompt: 'If I ___ more free time, I would learn how to play the guitar.',
      options: ['had', 'have', 'would have', 'will have'],
      correct: 'had',
      translation: 'Если бы у меня было больше свободного времени, я бы научился играть на гитаре.',
      explanation: 'If + Past Simple (had).'
    },
    {
      id: 'c2-11',
      prompt: 'Where would you live if you ___ choose any country?',
      options: ['could', 'can', 'will', 'would'],
      correct: 'could',
      translation: 'Где бы ты жил, если бы мог выбрать любую страну?',
      explanation: 'В придаточном условии — could (мог бы).'
    },
    {
      id: 'c2-12',
      prompt: 'If she ___ more confident, she would get the promotion.',
      options: ['were', 'is', 'will be', 'would be'],
      correct: 'were',
      translation: 'Если бы она была более уверенной в себе, она бы получила повышение.',
      explanation: 'Second Conditional: сослагательное were (или was в разговорной речи, нормативно were).'
    },
    {
      id: 'c2-13',
      prompt: 'We would go camping this weekend if the weather ___ better.',
      options: ['were', 'is', 'will be', 'would be'],
      correct: 'were',
      translation: 'Мы бы пошли в поход на этих выходных, если бы погода была лучше.',
      explanation: 'If + were / was (Second Conditional).'
    },
    {
      id: 'c2-14',
      prompt: 'If they offered you the position, ___ it?',
      options: ['would you accept', 'will you accept', 'did you accept', 'do you accept'],
      correct: 'would you accept',
      translation: 'Если бы они предложили тебе эту должность, ты бы согласился?',
      explanation: 'Вопрос во 2-м типе условий: Would you + V1 (would you accept)?'
    },
    {
      id: 'c2-15',
      prompt: 'If I ___ how to fly an airplane, I would fly to Tokyo right now.',
      options: ['knew', 'know', 'will know', 'would know'],
      correct: 'knew',
      translation: 'Если бы я умел управлять самолетом, я бы полетел в Токио прямо сейчас.',
      explanation: 'Second Conditional: If + knew.'
    },
    {
      id: 'c2-16',
      prompt: 'He would feel much healthier if he ___ smoking.',
      options: ['stopped', 'stops', 'will stop', 'would stop'],
      correct: 'stopped',
      translation: 'Он чувствовал бы себя гораздо здоровее, если бы бросил курить.',
      explanation: 'В условной части ставится Past Simple: stopped.'
    },
    {
      id: 'c2-17',
      prompt: 'If my cat ___ speak English, it would probably ask for treats all day.',
      options: ['could', 'can', 'would', 'is able to'],
      correct: 'could',
      translation: 'Если бы мой кот мог говорить по-английски, он бы целый день просил вкусняшки.',
      explanation: 'Нереальное условие с глаголом способности: could.'
    },
    {
      id: 'c2-18',
      prompt: 'If I were invisible for a day, I ___ tricks on my friends.',
      options: ['would play', 'will play', 'played', 'had played'],
      correct: 'would play',
      translation: 'Если бы я стал невидимым на один день, я бы разыгрывал своих друзей.',
      explanation: 'Главное предложение: would play.'
    },
    {
      id: 'c2-19',
      prompt: 'If we ___ closer to school, we could walk there every morning.',
      options: ['lived', 'live', 'will live', 'would live'],
      correct: 'lived',
      translation: 'Если бы мы жили ближе к школе, мы могли бы ходить туда пешком каждое утро.',
      explanation: 'If + Past Simple (lived).'
    },
    {
      id: 'c2-20',
      prompt: 'She ___ happier if she did what she truly loves.',
      options: ['would be', 'will be', 'is', 'was'],
      correct: 'would be',
      translation: 'Она была бы счастливее, если бы занималась тем, что действительно любит.',
      explanation: 'Главное предложение сослагательного наклонения: would be.'
    },
    {
      id: 'c2-21',
      prompt: 'If I won the lottery, I ___ a shelter for homeless animals.',
      options: ['would open', 'will open', 'opened', 'have opened'],
      correct: 'would open',
      translation: 'Если бы я выиграл в лотерею, я бы открыл приют для бездомных животных.',
      explanation: 'Second Conditional: won -> would open.'
    },
    {
      id: 'c2-22',
      prompt: 'If humans ___ wings, we wouldn’t need airplanes.',
      options: ['had', 'have', 'would have', 'will have'],
      correct: 'had',
      translation: 'Если бы у людей были крылья, нам не нужны были бы самолеты.',
      explanation: 'Нереальное условие: If + had.'
    },
    {
      id: 'c2-23',
      prompt: 'I ___ you the secret if you promised not to tell anyone.',
      options: ['would tell', 'will tell', 'told', 'had told'],
      correct: 'would tell',
      translation: 'Я бы рассказал тебе секрет, если бы ты пообещал никому не говорить.',
      explanation: 'Главное предложение: would tell.'
    },
    {
      id: 'c2-24',
      prompt: 'If they ___ us to the wedding, we would gladly come.',
      options: ['invited', 'invite', 'will invite', 'would invite'],
      correct: 'invited',
      translation: 'Если бы они пригласили нас на свадьбу, мы бы с радостью пришли.',
      explanation: 'Second Conditional: If + Past Simple (invited).'
    },
    {
      id: 'c2-25',
      prompt: 'What superpower ___ you choose if you could have one?',
      options: ['would', 'will', 'did', 'do'],
      correct: 'would',
      translation: 'Какую суперспособность ты бы выбрал, если бы мог получить одну?',
      explanation: 'Вопрос во 2-м типе условных предложений: What superpower would you choose?'
    },
    {
      id: 'c2-26',
      prompt: 'If the internet ___ for a week, people would read more books.',
      options: ['disappeared', 'disappears', 'will disappear', 'would disappear'],
      correct: 'disappeared',
      translation: 'Если бы интернет исчез на неделю, люди бы читали больше книг.',
      explanation: 'If + Past Simple (disappeared).'
    },
    {
      id: 'c2-27',
      prompt: 'I wouldn’t worry so much if I ___ you.',
      options: ['were', 'am', 'will be', 'would be'],
      correct: 'were',
      translation: 'Я бы так не переживал, если бы был на твоем месте.',
      explanation: 'Идиоматическое выражение: If I were you.'
    },
    {
      id: 'c2-28',
      prompt: 'If he practiced more, he ___ much better.',
      options: ['would play', 'will play', 'played', 'had played'],
      correct: 'would play',
      translation: 'Если бы он больше тренировался, он бы играл намного лучше.',
      explanation: 'Следствие в Second Conditional: would play.'
    },
    {
      id: 'c2-29',
      prompt: 'If we ___ a bigger apartment, I would adopt a puppy.',
      options: ['had', 'have', 'would have', 'will have'],
      correct: 'had',
      translation: 'Если бы у нас была квартира побольше, я бы взял щенка.',
      explanation: 'Second Conditional: If + had.'
    },
    {
      id: 'c2-30',
      prompt: 'She ___ to the party if she weren’t so tired today.',
      options: ['would come', 'will come', 'comes', 'came'],
      correct: 'would come',
      translation: 'Она бы пришла на вечеринку, если бы не была сегодня такой уставшей.',
      explanation: 'Главная часть: would come.'
    },
    {
      id: 'c2-31',
      prompt: 'If you ___ an extra ticket, who would you take with you?',
      options: ['had', 'have', 'will have', 'would have'],
      correct: 'had',
      translation: 'Если бы у тебя был лишний билет, кого бы ты взял с собой?',
      explanation: 'If + Past Simple (had).'
    },
    {
      id: 'c2-32',
      prompt: 'He ___ lend you money if you really needed it.',
      options: ['would', 'will', 'did', 'does'],
      correct: 'would',
      translation: 'Он бы одолжил тебе денег, если бы они тебе действительно были нужны.',
      explanation: 'В главном предложении Second Conditional ставится would.'
    },
    {
      id: 'c2-33',
      prompt: 'If dinosaurs ___ still alive, the world would be very dangerous.',
      options: ['were', 'are', 'will be', 'would be'],
      correct: 'were',
      translation: 'Если бы динозавры все еще были живы, мир был бы очень опасным.',
      explanation: 'Нереальное условие настоящего времени: were.'
    },
    {
      id: 'c2-34',
      prompt: 'If I spoke fluent French, I ___ in Paris.',
      options: ['would live', 'will live', 'lived', 'had lived'],
      correct: 'would live',
      translation: 'Если бы я свободно говорил по-французски, я бы жил в Париже.',
      explanation: 'Главная часть: would live.'
    },
    {
      id: 'c2-35',
      prompt: 'If you didn’t have to work tomorrow, what ___ ?',
      options: ['would you do', 'will you do', 'did you do', 'do you do'],
      correct: 'would you do',
      translation: 'Если бы тебе не нужно было завтра на работу, что бы ты делал?',
      explanation: 'Вопрос Second Conditional: would you do.'
    },
    {
      id: 'c2-36',
      prompt: 'I would buy this jacket if it ___ so expensive.',
      options: ["weren't", "isn't", "won't be", "wouldn't be"],
      correct: "weren't",
      translation: 'Я бы купил эту куртку, если бы она не была такой дорогой.',
      explanation: 'Сослагательное отрицание: weren\'t (или wasn\'t).'
    },
    {
      id: 'c2-37',
      prompt: 'If you ___ any historical figure, who would it be?',
      options: ['could meet', 'can meet', 'will meet', 'would meet'],
      correct: 'could meet',
      translation: 'Если бы ты мог встретить любую историческую личность, кто бы это был?',
      explanation: 'If + could meet.'
    },
    {
      id: 'c2-38',
      prompt: 'If gravity ___ suddenly weaker, we could jump over buildings.',
      options: ['became', 'becomes', 'will become', 'would become'],
      correct: 'became',
      translation: 'Если бы гравитация внезапно стала слабее, мы могли бы перепрыгивать здания.',
      explanation: 'Second Conditional: If + became.'
    },
    {
      id: 'c2-39',
      prompt: 'She wouldn’t say that if she ___ how much it hurts you.',
      options: ['knew', 'knows', 'will know', 'would know'],
      correct: 'knew',
      translation: 'Она бы не говорила этого, если бы знала, как сильно тебе это ранит.',
      explanation: 'If + Past Simple (knew).'
    },
    {
      id: 'c2-40',
      prompt: 'If you ___ the president for one day, what law would you pass?',
      options: ['were', 'are', 'will be', 'would be'],
      correct: 'were',
      translation: 'Если бы ты стал президентом на один день, какой закон ты бы принял?',
      explanation: 'If you were the president (сослагательное наклонение).'
    }
  ],

  type3: [
    {
      id: 'c3-1',
      prompt: 'If I had studied harder, I ___ the exam last week.',
      options: ['would have passed', 'would pass', 'will have passed', 'passed'],
      correct: 'would have passed',
      translation: 'Если бы я усерднее учился, я бы сдал экзамен на прошлой неделе.',
      explanation: 'Third Conditional (сожаление о прошлом): If + Past Perfect (had studied) -> would have + V3 (would have passed).'
    },
    {
      id: 'c3-2',
      prompt: 'If she ___ earlier, she would not have missed her flight.',
      options: ['had woken up', 'woke up', 'wakes up', 'would wake up'],
      correct: 'had woken up',
      translation: 'Если бы она проснулась раньше, она бы не опоздала на рейс.',
      explanation: 'Third Conditional: в придаточном условия требуется Past Perfect (had woken up).'
    },
    {
      id: 'c3-3',
      prompt: 'We ___ to the beach yesterday if it hadn’t rained all day.',
      options: ['would have gone', 'would go', 'went', 'will have gone'],
      correct: 'would have gone',
      translation: 'Мы бы пошли на пляж вчера, если бы не шел дождь весь день.',
      explanation: 'Действие в прошлом не состоялось: would have gone.'
    },
    {
      id: 'c3-4',
      prompt: 'If they had invited us, we ___ to their wedding.',
      options: ['would have come', 'would come', 'came', 'will come'],
      correct: 'would have come',
      translation: 'Если бы они нас пригласили, мы бы пришли на их свадьбу.',
      explanation: 'Third Conditional: would have + V3 (come).'
    },
    {
      id: 'c3-5',
      prompt: 'If you ___ me about the meeting, I wouldn’t have forgotten.',
      options: ['had reminded', 'reminded', 'would remind', 'have reminded'],
      correct: 'had reminded',
      translation: 'Если бы ты напомнил мне о встрече, я бы не забыл.',
      explanation: 'Прошедшее условие: Past Perfect (had reminded).'
    },
    {
      id: 'c3-6',
      prompt: 'I wouldn’t have bought this coat if I ___ how expensive it was.',
      options: ['had known', 'knew', 'would know', 'have known'],
      correct: 'had known',
      translation: 'Я бы не купил это пальто, если бы знал, насколько оно дорогое.',
      explanation: 'Third Conditional: If + had known.'
    },
    {
      id: 'c3-7',
      prompt: 'If the driver ___ the red light, the accident wouldn’t have happened.',
      options: ["hadn't run", "didn't run", "wouldn't run", "hasn't run"],
      correct: "hadn't run",
      translation: 'Если бы водитель не проехал на красный свет, авария бы не произошла.',
      explanation: 'Past Perfect отрицание в прошлом: hadn\'t run.'
    },
    {
      id: 'c3-8',
      prompt: 'If he had practiced more, he ___ the championship.',
      options: ['would have won', 'would win', 'had won', 'won'],
      correct: 'would have won',
      translation: 'Если бы он больше тренировался, он бы выиграл чемпионат.',
      explanation: 'Главное предложение в Third Conditional: would have won.'
    },
    {
      id: 'c3-9',
      prompt: 'What ___ if you had won that million dollars last year?',
      options: ['would you have done', 'would you do', 'did you do', 'had you done'],
      correct: 'would you have done',
      translation: 'Что бы ты сделал, если бы выиграл тот миллион долларов в прошлом году?',
      explanation: 'Вопрос о нереальном прошлом: Would you have done.'
    },
    {
      id: 'c3-10',
      prompt: 'If we ___ a map, we wouldn’t have gotten lost in the woods.',
      options: ['had taken', 'took', 'would take', 'have taken'],
      correct: 'had taken',
      translation: 'Если бы мы взяли карту, мы бы не заблудились в лесу.',
      explanation: 'Third Conditional: If + had taken.'
    },
    {
      id: 'c3-11',
      prompt: 'She ___ the job offer if the salary had been higher.',
      options: ['would have accepted', 'would accept', 'accepted', 'had accepted'],
      correct: 'would have accepted',
      translation: 'Она бы приняла предложение о работе, если бы зарплата была выше.',
      explanation: 'Главное предложение: would have accepted.'
    },
    {
      id: 'c3-12',
      prompt: 'If you had listened to my advice, you ___ into this trouble.',
      options: ["wouldn't have gotten", "wouldn't get", "didn't get", "hadn't gotten"],
      correct: "wouldn't have gotten",
      translation: 'Если бы ты послушал мой совет, ты бы не попал в эту неприятность.',
      explanation: 'Third Conditional: wouldn\'t have gotten.'
    },
    {
      id: 'c3-13',
      prompt: 'If they ___ the tickets in advance, they would have seen the concert.',
      options: ['had booked', 'booked', 'would book', 'have booked'],
      correct: 'had booked',
      translation: 'Если бы они забронировали билеты заранее, они бы попали на концерт.',
      explanation: 'If + Past Perfect (had booked).'
    },
    {
      id: 'c3-14',
      prompt: 'I ___ you from the station if my car hadn’t broken down.',
      options: ['would have picked up', 'would pick up', 'picked up', 'had picked up'],
      correct: 'would have picked up',
      translation: 'Я бы забрал тебя со станции, если бы моя машина не сломалась.',
      explanation: 'Нереальное действие в прошлом: would have picked up.'
    },
    {
      id: 'c3-15',
      prompt: 'If he had set an alarm clock, he ___ asleep.',
      options: ["wouldn't have fallen", "wouldn't fall", "didn't fall", "hadn't fallen"],
      correct: "wouldn't have fallen",
      translation: 'Если бы он поставил будильник, он бы не проспал.',
      explanation: 'Third Conditional: wouldn\'t have fallen asleep.'
    },
    {
      id: 'c3-16',
      prompt: 'If we ___ about the traffic, we would have taken another route.',
      options: ['had known', 'knew', 'would know', 'have known'],
      correct: 'had known',
      translation: 'Если бы мы знали о пробке, мы бы поехали другим маршрутом.',
      explanation: 'If + had known.'
    },
    {
      id: 'c3-17',
      prompt: 'She ___ the competition if she hadn’t injured her knee.',
      options: ['would have won', 'would win', 'won', 'had won'],
      correct: 'would have won',
      translation: 'Она выиграла бы соревнование, если бы не травмировала колено.',
      explanation: 'Главное предложение: would have won.'
    },
    {
      id: 'c3-18',
      prompt: 'If I ___ my glasses at home, I would have read the menu easily.',
      options: ["hadn't left", "didn't leave", "wouldn't leave", "haven't left"],
      correct: "hadn't left",
      translation: 'Если бы я не оставил очки дома, я бы легко прочитал меню.',
      explanation: 'Past Perfect отрицание: hadn\'t left.'
    },
    {
      id: 'c3-19',
      prompt: 'The cake ___ burned if you had taken it out of the oven in time.',
      options: ["wouldn't have", "wouldn't be", "didn't", "hadn't been"],
      correct: "wouldn't have",
      translation: 'Пирог бы не сгорел, если бы ты вовремя вытащил его из духовки.',
      explanation: 'Third Conditional: wouldn\'t have (gotten/been burned).'
    },
    {
      id: 'c3-20',
      prompt: 'If they ___ our email, they would have replied by now.',
      options: ['had received', 'received', 'would receive', 'have received'],
      correct: 'had received',
      translation: 'Если бы они получили наше письмо, они бы уже ответили.',
      explanation: 'Third Conditional: If + had received.'
    },
    {
      id: 'c3-21',
      prompt: 'If you had arrived five minutes earlier, you ___ the bus.',
      options: ['would have caught', 'would catch', 'caught', 'had caught'],
      correct: 'would have caught',
      translation: 'Если бы ты пришел на 5 минут раньше, ты бы успел на автобус.',
      explanation: 'Third Conditional: would have caught.'
    },
    {
      id: 'c3-22',
      prompt: 'He ___ the test if he hadn’t made so many careless mistakes.',
      options: ['would have passed', 'would pass', 'passed', 'had passed'],
      correct: 'would have passed',
      translation: 'Он сдал бы тест, если бы не сделал столько нелепых ошибок.',
      explanation: 'Нереализованный результат в прошлом: would have passed.'
    },
    {
      id: 'c3-23',
      prompt: 'If I ___ that you were in the hospital, I would have visited you.',
      options: ['had known', 'knew', 'would know', 'have known'],
      correct: 'had known',
      translation: 'Если бы я знал, что ты в больнице, я бы навестил тебя.',
      explanation: 'If + had known.'
    },
    {
      id: 'c3-24',
      prompt: 'We ___ dinner at home if all the restaurants hadn’t been fully booked.',
      options: ["wouldn't have cooked", "wouldn't cook", "didn't cook", "hadn't cooked"],
      correct: "wouldn't have cooked",
      translation: 'Мы бы не готовили ужин дома, если бы все рестораны не были забронированы.',
      explanation: 'Third Conditional: wouldn\'t have cooked.'
    },
    {
      id: 'c3-25',
      prompt: 'If she ___ her umbrella, she wouldn’t have gotten completely soaked.',
      options: ['had taken', 'took', 'would take', 'has taken'],
      correct: 'had taken',
      translation: 'Если бы она взяла зонт, она бы не промокла до нитки.',
      explanation: 'If + had taken.'
    },
    {
      id: 'c3-26',
      prompt: 'If the police ___ in time, the thieves would have escaped.',
      options: ["hadn't arrived", "didn't arrive", "wouldn't arrive", "haven't arrived"],
      correct: "hadn't arrived",
      translation: 'Если бы полиция не прибыла вовремя, воры бы сбежали.',
      explanation: 'Past Perfect отрицание в прошлом: hadn\'t arrived.'
    },
    {
      id: 'c3-27',
      prompt: 'I ___ you if my phone battery hadn’t died.',
      options: ['would have called', 'would call', 'called', 'had called'],
      correct: 'would have called',
      translation: 'Я бы позвонил тебе, если бы батарея телефона не села.',
      explanation: 'Third Conditional: would have called.'
    },
    {
      id: 'c3-28',
      prompt: 'If the hotel ___ so noisy, we would have slept like babies.',
      options: ["hadn't been", "weren't", "wouldn't be", "hasn't been"],
      correct: "hadn't been",
      translation: 'Если бы в отеле не было так шумно, мы бы спали как младенцы.',
      explanation: 'If + hadn\'t been.'
    },
    {
      id: 'c3-29',
      prompt: 'They ___ their train if they had left the house on time.',
      options: ["wouldn't have missed", "wouldn't miss", "didn't miss", "hadn't missed"],
      correct: "wouldn't have missed",
      translation: 'Они не опоздали бы на поезд, если бы вышли из дома вовремя.',
      explanation: 'Third Conditional: wouldn\'t have missed.'
    },
    {
      id: 'c3-30',
      prompt: 'If Columbus hadn’t sailed west, someone else ___ America.',
      options: ['would have discovered', 'would discover', 'discovered', 'had discovered'],
      correct: 'would have discovered',
      translation: 'Если бы Колумб не поплыл на запад, кто-нибудь другой открыл бы Америку.',
      explanation: 'Историческое нереальное прошлое: would have discovered.'
    },
    {
      id: 'c3-31',
      prompt: 'If you had asked me politely, I ___ to help you.',
      options: ['would have agreed', 'would agree', 'agreed', 'had agreed'],
      correct: 'would have agreed',
      translation: 'Если бы ты вежливо попросил меня, я бы согласился помочь.',
      explanation: 'Third Conditional: would have agreed.'
    },
    {
      id: 'c3-32',
      prompt: 'She wouldn’t have failed her driving test if she ___ parallel parking.',
      options: ['had practiced', 'practiced', 'would practice', 'has practiced'],
      correct: 'had practiced',
      translation: 'Она бы не завалила экзамен по вождению, если бы потренировала параллельную парковку.',
      explanation: 'If + had practiced.'
    },
    {
      id: 'c3-33',
      prompt: 'If we ___ that museum, our trip wouldn’t have been complete.',
      options: ["hadn't visited", "didn't visit", "wouldn't visit", "haven't visited"],
      correct: "hadn't visited",
      translation: 'Если бы мы не посетили тот музей, наша поездка не была бы полной.',
      explanation: 'Third Conditional: If + hadn\'t visited.'
    },
    {
      id: 'c3-34',
      prompt: 'He ___ the job if he had dressed more professionally for the interview.',
      options: ['might have gotten', 'might get', 'gets', 'had gotten'],
      correct: 'might have gotten',
      translation: 'Он, возможно, получил бы эту работу, если бы оделся солиднее на собеседование.',
      explanation: 'Модальный вариант Third Conditional: might have gotten.'
    },
    {
      id: 'c3-35',
      prompt: 'If I hadn’t slipped on the ice, I ___ my ankle.',
      options: ["wouldn't have sprained", "wouldn't sprain", "didn't sprain", "hadn't sprained"],
      correct: "wouldn't have sprained",
      translation: 'Если бы я не поскользнулся на льду, я бы не подвернул лодыжку.',
      explanation: 'Third Conditional отрицание: wouldn\'t have sprained.'
    },
    {
      id: 'c3-36',
      prompt: 'If the fire department ___ so quickly, the whole house would have burned down.',
      options: ["hadn't responded", "didn't respond", "wouldn't respond", "hasn't responded"],
      correct: "hadn't responded",
      translation: 'Если бы пожарные не отреагировали так быстро, весь дом бы сгорел.',
      explanation: 'If + hadn\'t responded.'
    },
    {
      id: 'c3-37',
      prompt: 'I could have passed the test if I ___ more time to finish.',
      options: ['had had', 'had', 'would have', 'have had'],
      correct: 'had had',
      translation: 'Я мог бы сдать тест, если бы у меня было больше времени закончить.',
      explanation: 'Past Perfect от глагола have — это had had (had + V3).'
    },
    {
      id: 'c3-38',
      prompt: 'If you had watered the plants, they ___ .',
      options: ["wouldn't have died", "wouldn't die", "didn't die", "hadn't died"],
      correct: "wouldn't have died",
      translation: 'Если бы ты поливал растения, они бы не погибли.',
      explanation: 'Third Conditional: wouldn\'t have died.'
    },
    {
      id: 'c3-39',
      prompt: 'She ___ the train if she had run a little faster.',
      options: ['could have caught', 'could catch', 'caught', 'had caught'],
      correct: 'could have caught',
      translation: 'Она могла бы успеть на поезд, если бы бежала чуть быстрее.',
      explanation: 'Third Conditional с модальным глаголом: could have caught.'
    },
    {
      id: 'c3-40',
      prompt: 'If we had known you were coming, we ___ a cake for you.',
      options: ['would have baked', 'would bake', 'baked', 'had baked'],
      correct: 'would have baked',
      translation: 'Если бы мы знали, что ты придешь, мы бы испекли для тебя торт.',
      explanation: 'Third Conditional: would have baked.'
    }
  ],

  mixed: [
    {
      id: 'cm-1',
      prompt: 'If I had taken that job in London last year, I ___ living there now.',
      options: ['would be', 'would have been', 'will be', 'am'],
      correct: 'would be',
      translation: 'Если бы я принял ту работу в Лондоне в прошлом году, я бы жил там сейчас.',
      explanation: 'Mixed Conditional (прошлое условие -> результат в настоящем now): If + Past Perfect (had taken), в главном would + V1 (would be).'
    },
    {
      id: 'cm-2',
      prompt: 'If she weren’t afraid of flying, she ___ by plane to visit us yesterday.',
      options: ['would have traveled', 'would travel', 'traveled', 'will travel'],
      correct: 'would have traveled',
      translation: 'Если бы она не боялась летать (постоянное качество), она бы прилетела к нам вчера.',
      explanation: 'Mixed Conditional (постоянное свойство в настоящем weren\'t -> действие в прошлом yesterday): would have traveled.'
    },
    {
      id: 'cm-3',
      prompt: 'If you had listened to the directions, we ___ lost right now.',
      options: ["wouldn't be", "wouldn't have been", "aren't", "weren't"],
      correct: "wouldn't be",
      translation: 'Если бы ты послушал указания дороги, мы бы не были сейчас потеряны.',
      explanation: 'Действие в прошлом (had listened) влияет на текущее состояние (right now): wouldn\'t be.'
    },
    {
      id: 'cm-4',
      prompt: 'If I spoke better German, I ___ that document yesterday without a dictionary.',
      options: ['could have translated', 'could translate', 'translated', 'can translate'],
      correct: 'could have translated',
      translation: 'Если бы я лучше говорил по-немецки, я бы смог перевести тот документ вчера без словаря.',
      explanation: 'Mixed Conditional (настоящее умение spoke -> результат в прошлом yesterday): could have translated.'
    },
    {
      id: 'cm-5',
      prompt: 'If he had saved some money during the summer, he ___ broke today.',
      options: ["wouldn't be", "wouldn't have been", "isn't", "wasn't"],
      correct: "wouldn't be",
      translation: 'Если бы он скопил немного денег летом, он не был бы сегодня на мели.',
      explanation: 'Условие в прошлом (had saved) -> результат сегодня (today): wouldn\'t be.'
    },
    {
      id: 'cm-6',
      prompt: 'If I were taller, I ___ selected for the basketball team last month.',
      options: ['would have been', 'would be', 'was', 'had been'],
      correct: 'would have been',
      translation: 'Если бы я был выше ростом (постоянное свойство), меня бы выбрали в команду в прошлом месяце.',
      explanation: 'Свойство в настоящем (were) -> нереализованный шанс в прошлом (last month): would have been.'
    },
    {
      id: 'cm-7',
      prompt: 'If she hadn’t lost her passport yesterday, she ___ on the beach right now.',
      options: ['would be lying', 'would have lied', 'is lying', 'will lie'],
      correct: 'would be lying',
      translation: 'Если бы она вчера не потеряла паспорт, она бы сейчас лежала на пляже.',
      explanation: 'Mixed Conditional (прошлое событие -> действие в данный момент right now): would be lying.'
    },
    {
      id: 'cm-8',
      prompt: 'If we had won the lottery last week, we ___ rich today.',
      options: ['would be', 'would have been', 'will be', 'are'],
      correct: 'would be',
      translation: 'Если бы мы выиграли в лотерею на прошлой неделе, мы были бы богаты сегодня.',
      explanation: 'Событие в прошлом (had won) -> статус сегодня (today): would be.'
    },
    {
      id: 'cm-9',
      prompt: 'If you were more careful, you ___ your phone in the taxi last night.',
      options: ["wouldn't have left", "wouldn't leave", "didn't leave", "hadn't left"],
      correct: "wouldn't have left",
      translation: 'Если бы ты был более внимательным (черта характера), ты бы не оставил телефон в такси прошлой ночью.',
      explanation: 'Характер в настоящем (were) -> действие прошлой ночью (last night): wouldn\'t have left.'
    },
    {
      id: 'cm-10',
      prompt: 'If he had gone to medical school, he ___ a doctor today.',
      options: ['would be', 'would have been', 'is', 'will be'],
      correct: 'would be',
      translation: 'Если бы он окончил медицинский, он был бы врачом сегодня.',
      explanation: 'Учеба в прошлом (had gone) -> текущая профессия (today): would be.'
    },
    {
      id: 'cm-11',
      prompt: 'If I didn’t have so much work this week, I ___ to your concert yesterday.',
      options: ['would have come', 'would come', 'came', 'will come'],
      correct: 'would have come',
      translation: 'Если бы у меня не было столько работы на этой неделе, я бы пришел на твой концерт вчера.',
      explanation: 'Общая занятость (didn\'t have) -> результат вчера (yesterday): would have come.'
    },
    {
      id: 'cm-12',
      prompt: 'If they had trained harder, they ___ champions now.',
      options: ['would be', 'would have been', 'will be', 'are'],
      correct: 'would be',
      translation: 'Если бы они усерднее тренировались, они были бы чемпионами сейчас.',
      explanation: 'Прошлые тренировки (had trained) -> текущий статус (now): would be.'
    },
    {
      id: 'cm-13',
      prompt: 'If she loved him, she ___ his proposal last Sunday.',
      options: ['would have accepted', 'would accept', 'accepted', 'will accept'],
      correct: 'would have accepted',
      translation: 'Если бы она любила его (чувство в настоящем), она бы приняла его предложение в прошлое воскресенье.',
      explanation: 'Настоящее чувство (loved) -> действие в прошлое воскресенье: would have accepted.'
    },
    {
      id: 'cm-14',
      prompt: 'If I had eaten breakfast this morning, I ___ so hungry now.',
      options: ["wouldn't be", "wouldn't have been", "am not", "wasn't"],
      correct: "wouldn't be",
      translation: 'Если бы я позавтракал этим утром, я бы не был сейчас таким голодным.',
      explanation: 'Завтрак утром (had eaten) -> голод прямо сейчас (now): wouldn\'t be.'
    },
    {
      id: 'cm-15',
      prompt: 'If he weren’t so arrogant, people ___ him at the conference yesterday.',
      options: ['would have supported', 'would support', 'supported', 'will support'],
      correct: 'would have supported',
      translation: 'Если бы он не был таким высокомерным, люди поддержали бы его на вчерашней конференции.',
      explanation: 'Характер (weren\'t) -> поддержка вчера (yesterday): would have supported.'
    },
    {
      id: 'cm-16',
      prompt: 'If we had booked the hotel in advance, we ___ sleeping in the car tonight.',
      options: ["wouldn't be", "wouldn't have been", "aren't", "weren't"],
      correct: "wouldn't be",
      translation: 'Если бы мы забронировали отель заранее, мы бы не спали в машине этой ночью.',
      explanation: 'Прошлое бронирование (had booked) -> ситуация сегодня ночью (tonight): wouldn\'t be.'
    },
    {
      id: 'cm-17',
      prompt: 'If I knew how to swim, I ___ into the lake with everyone else an hour ago.',
      options: ['would have jumped', 'would jump', 'jumped', 'will jump'],
      correct: 'would have jumped',
      translation: 'Если бы я умел плавать, я бы прыгнул в озеро вместе со всеми час назад.',
      explanation: 'Постоянный навык (knew) -> действие час назад (an hour ago): would have jumped.'
    },
    {
      id: 'cm-18',
      prompt: 'If she had passed the bar exam, she ___ a lawyer now.',
      options: ['would be', 'would have been', 'is', 'will be'],
      correct: 'would be',
      translation: 'Если бы она сдала адвокатский экзамен, она бы работала юристом сейчас.',
      explanation: 'Экзамен в прошлом -> статус в настоящем (now): would be.'
    },
    {
      id: 'cm-19',
      prompt: 'If you weren’t always so stubborn, you ___ your mistake last night.',
      options: ['would have admitted', 'would admit', 'admitted', 'will admit'],
      correct: 'would have admitted',
      translation: 'Если бы ты не был всегда таким упрямым, ты бы признал свою ошибку прошлой ночью.',
      explanation: 'Черта характера (weren\'t stubborn) -> признание прошлой ночью: would have admitted.'
    },
    {
      id: 'cm-20',
      prompt: 'If I had bought those stocks five years ago, I ___ a millionaire today.',
      options: ['would be', 'would have been', 'am', 'will be'],
      correct: 'would be',
      translation: 'Если бы я купил те акции пять лет назад, я был бы миллионером сегодня.',
      explanation: 'Покупка 5 лет назад -> богатство сегодня (today): would be.'
    },
    {
      id: 'cm-21',
      prompt: 'If they were good friends, they ___ you when you moved last weekend.',
      options: ['would have helped', 'would help', 'helped', 'will help'],
      correct: 'would have helped',
      translation: 'Если бы они были хорошими друзьями, они бы помогли тебе с переездом в прошлые выходные.',
      explanation: 'Отношения в целом (were) -> помощь в прошлые выходные: would have helped.'
    },
    {
      id: 'cm-22',
      prompt: 'If I hadn’t stayed up until 4 AM, I ___ so exhausted right now.',
      options: ["wouldn't feel", "wouldn't have felt", "don't feel", "didn't feel"],
      correct: "wouldn't feel",
      translation: 'Если бы я не сидел до 4 утра, я бы не чувствовал себя таким уставшим прямо сейчас.',
      explanation: 'Прошлая бессонная ночь (hadn\'t stayed up) -> самочувствие сейчас (right now): wouldn\'t feel.'
    },
    {
      id: 'cm-23',
      prompt: 'If he spoke fluent Spanish, he ___ that job in Madrid last month.',
      options: ['could have gotten', 'could get', 'got', 'can get'],
      correct: 'could have gotten',
      translation: 'Если бы он свободно владел испанским, он мог бы получить ту работу в Мадриде в прошлом месяце.',
      explanation: 'Языковой навык (spoke) -> возможность в прошлом месяце: could have gotten.'
    },
    {
      id: 'cm-24',
      prompt: 'If she had taken her medicine, her headache ___ gone by now.',
      options: ['would be', 'would have been', 'is', 'will be'],
      correct: 'would be',
      translation: 'Если бы она приняла лекарство, ее головная боль уже прошла бы к настоящему моменту.',
      explanation: 'Прием лекарства в прошлом -> текущее состояние (by now): would be.'
    },
    {
      id: 'cm-25',
      prompt: 'If we didn’t live so far away, we ___ you more often during the holidays.',
      options: ['would have visited', 'would visit', 'visited', 'will visit'],
      correct: 'would have visited',
      translation: 'Если бы мы не жили так далеко (настоящее), мы бы навещали тебя чаще на праздниках (прошлое).',
      explanation: 'Место жительства сейчас (didn\'t live) -> визиты в праздники: would have visited.'
    },
    {
      id: 'cm-26',
      prompt: 'If he had fixed the brakes yesterday, the car ___ safe to drive today.',
      options: ['would be', 'would have been', 'is', 'was'],
      correct: 'would be',
      translation: 'Если бы он починил тормоза вчера, на машине было бы безопасно ехать сегодня.',
      explanation: 'Ремонт вчера (had fixed) -> безопасность сегодня (today): would be.'
    },
    {
      id: 'cm-27',
      prompt: 'If I were an organized person, I ___ my keys yesterday.',
      options: ["wouldn't have lost", "wouldn't lose", "didn't lose", "hadn't lost"],
      correct: "wouldn't have lost",
      translation: 'Если бы я был организованным человеком, я бы не потерял ключи вчера.',
      explanation: 'Качество личности (were) -> потеря ключей вчера (yesterday): wouldn\'t have lost.'
    },
    {
      id: 'cm-28',
      prompt: 'If they had told us about the delay earlier, we ___ waiting at the airport now.',
      options: ["wouldn't be", "wouldn't have been", "aren't", "weren't"],
      correct: "wouldn't be",
      translation: 'Если бы нам сообщили о задержке раньше, мы бы не ждали сейчас в аэропорту.',
      explanation: 'Сообщение в прошлом -> ожидание сейчас (now): wouldn\'t be.'
    },
    {
      id: 'cm-29',
      prompt: 'If you weren’t afraid of dogs, you ___ to the shelter with us yesterday.',
      options: ['would have come', 'would come', 'came', 'had come'],
      correct: 'would have come',
      translation: 'Если бы ты не боялся собак, ты бы пошел в приют с нами вчера.',
      explanation: 'Страх собак (настоящее) -> поход вчера (yesterday): would have come.'
    },
    {
      id: 'cm-30',
      prompt: 'If he hadn’t dropped out of college, he ___ his master’s degree this semester.',
      options: ['would be finishing', 'would have finished', 'is finishing', 'finishes'],
      correct: 'would be finishing',
      translation: 'Если бы он не бросил колледж, он бы заканчивал магистратуру в этом семестре.',
      explanation: 'Прошлое решение (hadn\'t dropped out) -> текущий процесс (this semester): would be finishing.'
    },
    {
      id: 'cm-31',
      prompt: 'If I had remembered to charge my phone, it ___ working right now.',
      options: ['would be', 'would have been', 'is', 'will be'],
      correct: 'would be',
      translation: 'Если бы я не забыл зарядить телефон, он бы работал прямо сейчас.',
      explanation: 'Зарядка в прошлом -> работоспособность сейчас: would be.'
    },
    {
      id: 'cm-32',
      prompt: 'If she were a better driver, she ___ into that lamppost last week.',
      options: ["wouldn't have crashed", "wouldn't crash", "didn't crash", "hadn't crashed"],
      correct: "wouldn't have crashed",
      translation: 'Если бы она лучше водила машину, она бы не врезалась в тот фонарный столб на прошлой неделе.',
      explanation: 'Навык вождения (were) -> авария на прошлой неделе: wouldn\'t have crashed.'
    },
    {
      id: 'cm-33',
      prompt: 'If we had known you were a vegetarian, we ___ meat for dinner tonight.',
      options: ["wouldn't have prepared", "wouldn't prepare", "didn't prepare", "don't prepare"],
      correct: "wouldn't have prepared",
      translation: 'Если бы мы знали, что вы вегетарианец, мы бы не готовили мясо на сегодняшний ужин.',
      explanation: 'Знание в прошлом (had known) -> подготовка блюда: wouldn\'t have prepared.'
    },
    {
      id: 'cm-34',
      prompt: 'If he had put on sunscreen earlier, his skin ___ so burned right now.',
      options: ["wouldn't be", "wouldn't have been", "isn't", "wasn't"],
      correct: "wouldn't be",
      translation: 'Если бы он нанес крем от загара раньше, его кожа не была бы такой сгоревшей прямо сейчас.',
      explanation: 'Крем раньше (had put on) -> состояние кожи сейчас (right now): wouldn\'t be.'
    },
    {
      id: 'cm-35',
      prompt: 'If I didn’t love coffee so much, I ___ three cups already this morning.',
      options: ["wouldn't have drunk", "wouldn't drink", "didn't drink", "hadn't drunk"],
      correct: "wouldn't have drunk",
      translation: 'Если бы я не любил кофе так сильно, я бы не выпил уже три чашки этим утром.',
      explanation: 'Любовь к кофе (настоящее) -> три выпитые чашки утром (прошлое): wouldn\'t have drunk.'
    },
    {
      id: 'cm-36',
      prompt: 'If they had taken the highway, they ___ here by now.',
      options: ['would be', 'would have been', 'will be', 'are'],
      correct: 'would be',
      translation: 'Если бы они поехали по шоссе, они бы уже были здесь к настоящему моменту.',
      explanation: 'Маршрут в прошлом (had taken) -> нахождение здесь сейчас (by now): would be.'
    },
    {
      id: 'cm-37',
      prompt: 'If she weren’t so shy, she ___ to him at the party last Friday.',
      options: ['would have spoken', 'would speak', 'spoke', 'had spoken'],
      correct: 'would have spoken',
      translation: 'Если бы она не была такой застенчивой, она бы заговорила с ним на вечеринке в прошлую пятницу.',
      explanation: 'Застенчивость (черта характера) -> разговор в прошлую пятницу: would have spoken.'
    },
    {
      id: 'cm-38',
      prompt: 'If I had packed my warm jacket, I ___ freezing to death right now.',
      options: ["wouldn't be", "wouldn't have been", "am not", "wasn't"],
      correct: "wouldn't be",
      translation: 'Если бы я упаковал теплую куртку, я бы не замерзал сейчас насмерть.',
      explanation: 'Сборы в прошлом (had packed) -> замерзание сейчас (right now): wouldn\'t be.'
    },
    {
      id: 'cm-39',
      prompt: 'If he had learned to manage his time in school, his career ___ flourishing today.',
      options: ['would be', 'would have been', 'is', 'will be'],
      correct: 'would be',
      translation: 'Если бы он научился управлять временем в школе, его карьера процветала бы сегодня.',
      explanation: 'Школа в прошлом -> состояние карьеры сегодня (today): would be.'
    },
    {
      id: 'cm-40',
      prompt: 'If you had turned off the stove before leaving, the kitchen ___ full of smoke now.',
      options: ["wouldn't be", "wouldn't have been", "isn't", "wasn't"],
      correct: "wouldn't be",
      translation: 'Если бы ты выключил плиту перед уходом, кухня не была бы сейчас полна дыма.',
      explanation: 'Выключение плиты в прошлом (had turned off) -> дым на кухне сейчас (now): wouldn\'t be.'
    }
  ]
};
