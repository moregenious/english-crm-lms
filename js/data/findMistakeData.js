/**
 * Find the Mistake Game Dataset (50 sentences with intentional errors)
 */

export const FIND_MISTAKE_DATA = [
  {
    "id": "fm-1",
    "sentence": "He go to school by bus every morning.",
    "tokens": [
      "He",
      "go",
      "to",
      "school",
      "by",
      "bus",
      "every",
      "morning."
    ],
    "errorIndex": 1,
    "errorWord": "go",
    "correction": "goes",
    "explanation": "В Present Simple с местоимениями He/She/It глагол получает окончание -s/-es: He goes to school."
  },
  {
    "id": "fm-2",
    "sentence": "I am agree with your opinion about this movie.",
    "tokens": [
      "I",
      "am",
      "agree",
      "with",
      "your",
      "opinion",
      "about",
      "this",
      "movie."
    ],
    "errorIndex": 1,
    "errorWord": "am",
    "correction": "I agree (без am)",
    "explanation": "Типичная калька: 'agree' — это уже глагол (соглашаться), поэтому глагол to be ('am') здесь не нужен. Правильно: I agree."
  },
  {
    "id": "fm-3",
    "sentence": "She didn't went to the cinema yesterday.",
    "tokens": [
      "She",
      "didn't",
      "went",
      "to",
      "the",
      "cinema",
      "yesterday."
    ],
    "errorIndex": 2,
    "errorWord": "went",
    "correction": "go",
    "explanation": "В отрицании Past Simple вспомогательный глагол didn't уже берет на себя прошедшее время. Основной глагол стоит в V1: didn't go."
  },
  {
    "id": "fm-4",
    "sentence": "There is many books on the wooden shelf.",
    "tokens": [
      "There",
      "is",
      "many",
      "books",
      "on",
      "the",
      "wooden",
      "shelf."
    ],
    "errorIndex": 1,
    "errorWord": "is",
    "correction": "are",
    "explanation": "Слово books — во множественном числе, поэтому требуется оборот 'There are many books'."
  },
  {
    "id": "fm-5",
    "sentence": "He has lived in London since five years.",
    "tokens": [
      "He",
      "has",
      "lived",
      "in",
      "London",
      "since",
      "five",
      "years."
    ],
    "errorIndex": 5,
    "errorWord": "since",
    "correction": "for",
    "explanation": "Для указания длительности периода (five years) используется FOR. Предлог SINCE указывает только на точку отсчета (since 2019)."
  },
  {
    "id": "fm-6",
    "sentence": "She don't like drinking cold milk in winter.",
    "tokens": [
      "She",
      "don't",
      "like",
      "drinking",
      "cold",
      "milk",
      "in",
      "winter."
    ],
    "errorIndex": 1,
    "errorWord": "don't",
    "correction": "doesn't",
    "explanation": "В 3-м лице единственного числа (She) используется doesn't, а не don't."
  },
  {
    "id": "fm-7",
    "sentence": "I have seen him yesterday at the bus stop.",
    "tokens": [
      "I",
      "have",
      "seen",
      "him",
      "yesterday",
      "at",
      "the",
      "bus",
      "stop."
    ],
    "errorIndex": 1,
    "errorWord": "have",
    "correction": "saw (Past Simple)",
    "explanation": "С точным указателем прошедшего времени 'yesterday' Present Perfect запрещен, используется Past Simple: I saw him."
  },
  {
    "id": "fm-8",
    "sentence": "He explained me the grammar rule very clearly.",
    "tokens": [
      "He",
      "explained",
      "me",
      "the",
      "grammar",
      "rule",
      "very",
      "clearly."
    ],
    "errorIndex": 2,
    "errorWord": "me",
    "correction": "to me",
    "explanation": "Глагол explain требует предлога: explain TO someone (He explained to me the rule)."
  },
  {
    "id": "fm-9",
    "sentence": "How much people came to the concert yesterday?",
    "tokens": [
      "How",
      "much",
      "people",
      "came",
      "to",
      "the",
      "concert",
      "yesterday."
    ],
    "errorIndex": 1,
    "errorWord": "much",
    "correction": "many",
    "explanation": "People — исчисляемое существительное во множественном числе, поэтому используется How many."
  },
  {
    "id": "fm-10",
    "sentence": "She plays piano very well every evening.",
    "tokens": [
      "She",
      "plays",
      "piano",
      "very",
      "well",
      "every",
      "evening."
    ],
    "errorIndex": 2,
    "errorWord": "piano",
    "correction": "the piano",
    "explanation": "С музыкальными инструментами используется определенный артикль THE: play the piano, play the guitar."
  },
  {
    "id": "fm-11",
    "sentence": "We are looking forward to meet you soon.",
    "tokens": [
      "We",
      "are",
      "looking",
      "forward",
      "to",
      "meet",
      "you",
      "soon."
    ],
    "errorIndex": 5,
    "errorWord": "meet",
    "correction": "meeting",
    "explanation": "В выражении look forward to частица 'to' — предлог, поэтому после нее используется герундий: look forward to meeting."
  },
  {
    "id": "fm-12",
    "sentence": "He is more taller than his older brother.",
    "tokens": [
      "He",
      "is",
      "more",
      "taller",
      "than",
      "his",
      "older",
      "brother."
    ],
    "errorIndex": 2,
    "errorWord": "more",
    "correction": "taller (без more)",
    "explanation": "Двойная сравнительная степень — грубая ошибка. У коротких прилагательных степень образуется суффиксом -er: taller."
  },
  {
    "id": "fm-13",
    "sentence": "I look forward to hear from you soon.",
    "tokens": [
      "I",
      "look",
      "forward",
      "to",
      "hear",
      "from",
      "you",
      "soon."
    ],
    "errorIndex": 4,
    "errorWord": "hear",
    "correction": "hearing",
    "explanation": "Look forward to требует формы с -ing: to hearing from you."
  },
  {
    "id": "fm-14",
    "sentence": "She told that she was very tired.",
    "tokens": [
      "She",
      "told",
      "that",
      "she",
      "was",
      "very",
      "tired."
    ],
    "errorIndex": 1,
    "errorWord": "told",
    "correction": "said",
    "explanation": "Глагол tell требует указания адресата (told ME that...). Если адресата нет, используется said that..."
  },
  {
    "id": "fm-15",
    "sentence": "I am waiting you near the entrance.",
    "tokens": [
      "I",
      "am",
      "waiting",
      "you",
      "near",
      "the",
      "entrance."
    ],
    "errorIndex": 3,
    "errorWord": "you",
    "correction": "for you",
    "explanation": "Глагол wait всегда требует предлога FOR: waiting for you."
  },
  {
    "id": "fm-16",
    "sentence": "He doesn't knows the answer to this question.",
    "tokens": [
      "He",
      "doesn't",
      "knows",
      "the",
      "answer",
      "to",
      "this",
      "question."
    ],
    "errorIndex": 2,
    "errorWord": "knows",
    "correction": "know",
    "explanation": "После вспомогательного глагола doesn't смысловой глагол стоит без окончания -s: doesn't know."
  },
  {
    "id": "fm-17",
    "sentence": "My informations about the flight was correct.",
    "tokens": [
      "My",
      "informations",
      "about",
      "the",
      "flight",
      "was",
      "correct."
    ],
    "errorIndex": 1,
    "errorWord": "informations",
    "correction": "information",
    "explanation": "Слово information в английском языке ВСЕГДА неисчисляемое и не имеет формы множественного числа."
  },
  {
    "id": "fm-18",
    "sentence": "She has visited Paris three years ago.",
    "tokens": [
      "She",
      "has",
      "visited",
      "Paris",
      "three",
      "years",
      "ago."
    ],
    "errorIndex": 1,
    "errorWord": "has",
    "correction": "visited (Past Simple)",
    "explanation": "Слово 'ago' указывает на завершенное прошлое время Past Simple, Present Perfect недопустим."
  },
  {
    "id": "fm-19",
    "sentence": "I must to finish my homework tonight.",
    "tokens": [
      "I",
      "must",
      "to",
      "finish",
      "my",
      "homework",
      "tonight."
    ],
    "errorIndex": 2,
    "errorWord": "to",
    "correction": "finish (без to)",
    "explanation": "После модального глагола must частица 'to' НЕ ставится: I must finish."
  },
  {
    "id": "fm-20",
    "sentence": "They was playing football when it started raining.",
    "tokens": [
      "They",
      "was",
      "playing",
      "football",
      "when",
      "it",
      "started",
      "raining."
    ],
    "errorIndex": 1,
    "errorWord": "was",
    "correction": "were",
    "explanation": "С местоимением They в прошедшем времени согласуется глагол were: They were playing."
  },
  {
    "id": "fm-21",
    "sentence": "Everyone have their own unique opinion.",
    "tokens": [
      "Everyone",
      "have",
      "their",
      "own",
      "unique",
      "opinion."
    ],
    "errorIndex": 1,
    "errorWord": "have",
    "correction": "has",
    "explanation": "Местоимения everyone, everybody грамматически единственного числа: Everyone has."
  },
  {
    "id": "fm-22",
    "sentence": "I am studying English during three months.",
    "tokens": [
      "I",
      "am",
      "studying",
      "English",
      "during",
      "three",
      "months."
    ],
    "errorIndex": 4,
    "errorWord": "during",
    "correction": "for",
    "explanation": "Для обозначения периода времени с числом (three months) используется FOR, а during используется с существительными (during the lesson)."
  },
  {
    "id": "fm-23",
    "sentence": "He can to swim very fast across the lake.",
    "tokens": [
      "He",
      "can",
      "to",
      "swim",
      "very",
      "fast",
      "across",
      "the",
      "lake."
    ],
    "errorIndex": 2,
    "errorWord": "to",
    "correction": "swim (без to)",
    "explanation": "После модального глагола can частица 'to' никогда не ставится: He can swim."
  },
  {
    "id": "fm-24",
    "sentence": "The weather was very cold on yesterday.",
    "tokens": [
      "The",
      "weather",
      "was",
      "very",
      "cold",
      "on",
      "yesterday."
    ],
    "errorIndex": 5,
    "errorWord": "on",
    "correction": "yesterday (без on)",
    "explanation": "Перед словами yesterday, today, tomorrow предлоги времени НЕ ставятся."
  },
  {
    "id": "fm-25",
    "sentence": "She suggested to go to the park.",
    "tokens": [
      "She",
      "suggested",
      "to",
      "go",
      "to",
      "the",
      "park."
    ],
    "errorIndex": 2,
    "errorWord": "to",
    "correction": "going",
    "explanation": "После глагола suggest используется форма с -ing (герундий): suggested going, либо придаточное предложение."
  },
  {
    "id": "fm-26",
    "sentence": "I bought two breads from the local bakery.",
    "tokens": [
      "I",
      "bought",
      "two",
      "breads",
      "from",
      "the",
      "local",
      "bakery."
    ],
    "errorIndex": 3,
    "errorWord": "breads",
    "correction": "loaves of bread",
    "explanation": "Bread — неисчисляемое слово. Две буханки хлеба: two loaves of bread."
  },
  {
    "id": "fm-27",
    "sentence": "She has been knowing him for ten years.",
    "tokens": [
      "She",
      "has",
      "been",
      "knowing",
      "him",
      "for",
      "ten",
      "years."
    ],
    "errorIndex": 3,
    "errorWord": "knowing",
    "correction": "known",
    "explanation": "Глагол know относится к stative verbs (глаголам состояния) и не используется в Continuous: has known."
  },
  {
    "id": "fm-28",
    "sentence": "He is listening music on his new headphones.",
    "tokens": [
      "He",
      "is",
      "listening",
      "music",
      "on",
      "his",
      "new",
      "headphones."
    ],
    "errorIndex": 3,
    "errorWord": "music",
    "correction": "to music",
    "explanation": "Listen всегда требует предлога TO: listening to music."
  },
  {
    "id": "fm-29",
    "sentence": "There aren't some apples left in the basket.",
    "tokens": [
      "There",
      "aren't",
      "some",
      "apples",
      "left",
      "in",
      "the",
      "basket."
    ],
    "errorIndex": 2,
    "errorWord": "some",
    "correction": "any",
    "explanation": "В отрицательных предложениях вместо 'some' используется 'any': aren't any apples."
  },
  {
    "id": "fm-30",
    "sentence": "She is married with a kind police officer.",
    "tokens": [
      "She",
      "is",
      "married",
      "with",
      "a",
      "kind",
      "police",
      "officer."
    ],
    "errorIndex": 3,
    "errorWord": "with",
    "correction": "to",
    "explanation": "Женат/замужем за кем-то: married TO someone (не with)."
  },
  {
    "id": "fm-31",
    "sentence": "Although it was raining, but we went outside.",
    "tokens": [
      "Although",
      "it",
      "was",
      "raining,",
      "but",
      "we",
      "went",
      "outside."
    ],
    "errorIndex": 4,
    "errorWord": "but",
    "correction": "убрать but",
    "explanation": "В сложном предложении со словом Although союз BUT избыточен и является грамматической ошибкой."
  },
  {
    "id": "fm-32",
    "sentence": "He does not has a valid passport yet.",
    "tokens": [
      "He",
      "does",
      "not",
      "has",
      "a",
      "valid",
      "passport",
      "yet."
    ],
    "errorIndex": 3,
    "errorWord": "has",
    "correction": "have",
    "explanation": "После does not используется начальная форма глагола have: does not have."
  },
  {
    "id": "fm-33",
    "sentence": "I gave him some good advices yesterday.",
    "tokens": [
      "I",
      "gave",
      "him",
      "some",
      "good",
      "advices",
      "yesterday."
    ],
    "errorIndex": 5,
    "errorWord": "advices",
    "correction": "advice (или pieces of advice)",
    "explanation": "Слово advice в английском неисчисляемое, окончания -s у него не бывает."
  },
  {
    "id": "fm-34",
    "sentence": "He asked me where did I live.",
    "tokens": [
      "He",
      "asked",
      "me",
      "where",
      "did",
      "I",
      "live."
    ],
    "errorIndex": 4,
    "errorWord": "did",
    "correction": "where I lived",
    "explanation": "В косвенном вопросе порядок слов прямой, вспомогательный глагол did не используется: where I lived."
  },
  {
    "id": "fm-35",
    "sentence": "She can dances very gracefully on stage.",
    "tokens": [
      "She",
      "can",
      "dances",
      "very",
      "gracefully",
      "on",
      "stage."
    ],
    "errorIndex": 2,
    "errorWord": "dances",
    "correction": "dance",
    "explanation": "После модального глагола can глагол стоит в инфинитиве без окончаний: can dance."
  },
  {
    "id": "fm-36",
    "sentence": "The news were very surprising for everyone.",
    "tokens": [
      "The",
      "news",
      "were",
      "very",
      "surprising",
      "for",
      "everyone."
    ],
    "errorIndex": 2,
    "errorWord": "were",
    "correction": "was",
    "explanation": "Слово news в английском всегда единственного числа: The news was surprising."
  },
  {
    "id": "fm-37",
    "sentence": "I look forward to see the new movie.",
    "tokens": [
      "I",
      "look",
      "forward",
      "to",
      "see",
      "the",
      "new",
      "movie."
    ],
    "errorIndex": 4,
    "errorWord": "see",
    "correction": "seeing",
    "explanation": "Look forward to требует окончания -ing: to seeing."
  },
  {
    "id": "fm-38",
    "sentence": "She sings more good than her sister.",
    "tokens": [
      "She",
      "sings",
      "more",
      "good",
      "than",
      "her",
      "sister."
    ],
    "errorIndex": 2,
    "errorWord": "more",
    "correction": "better (без more good)",
    "explanation": "Сравнительная степень наречия well — better, формы 'more good' не существует."
  },
  {
    "id": "fm-39",
    "sentence": "I didn't saw that tall building before.",
    "tokens": [
      "I",
      "didn't",
      "saw",
      "that",
      "tall",
      "building",
      "before."
    ],
    "errorIndex": 2,
    "errorWord": "saw",
    "correction": "see",
    "explanation": "После didn't используется V1: didn't see."
  },
  {
    "id": "fm-40",
    "sentence": "He lives in USA for three years now.",
    "tokens": [
      "He",
      "lives",
      "in",
      "USA",
      "for",
      "three",
      "years",
      "now."
    ],
    "errorIndex": 3,
    "errorWord": "USA",
    "correction": "the USA",
    "explanation": "Названия стран, состоящие из штатов/королевств/республик, требуют артикля THE: the USA, the UK."
  },
  {
    "id": "fm-41",
    "sentence": "He congratulated me with my successful exam.",
    "tokens": [
      "He",
      "congratulated",
      "me",
      "with",
      "my",
      "successful",
      "exam."
    ],
    "errorIndex": 3,
    "errorWord": "with",
    "correction": "on",
    "explanation": "Поздравлять с чем-то: congratulate ON smth (не with!)."
  },
  {
    "id": "fm-42",
    "sentence": "I am feeling myself very happy today.",
    "tokens": [
      "I",
      "am",
      "feeling",
      "myself",
      "very",
      "happy",
      "today."
    ],
    "errorIndex": 3,
    "errorWord": "myself",
    "correction": "feeling happy (без myself)",
    "explanation": "Русская калька 'чувствую себя'. В английском feel не требует возвратного местоимения: I feel happy."
  },
  {
    "id": "fm-43",
    "sentence": "Each of the students have a laptop.",
    "tokens": [
      "Each",
      "of",
      "the",
      "students",
      "have",
      "a",
      "laptop."
    ],
    "errorIndex": 4,
    "errorWord": "have",
    "correction": "has",
    "explanation": "Подлежащее 'Each' грамматически единственного числа: Each of the students has."
  },
  {
    "id": "fm-44",
    "sentence": "She made me to cry with her story.",
    "tokens": [
      "She",
      "made",
      "me",
      "to",
      "cry",
      "with",
      "her",
      "story."
    ],
    "errorIndex": 3,
    "errorWord": "to",
    "correction": "cry (без to)",
    "explanation": "В конструкции Complex Object с глаголом make частица 'to' опускается: make someone cry."
  },
  {
    "id": "fm-45",
    "sentence": "I have been in London since two weeks.",
    "tokens": [
      "I",
      "have",
      "been",
      "in",
      "London",
      "since",
      "two",
      "weeks."
    ],
    "errorIndex": 5,
    "errorWord": "since",
    "correction": "for",
    "explanation": "Для длительности используется FOR two weeks."
  },
  {
    "id": "fm-46",
    "sentence": "He is afraid from barking dogs.",
    "tokens": [
      "He",
      "is",
      "afraid",
      "from",
      "barking",
      "dogs."
    ],
    "errorIndex": 3,
    "errorWord": "from",
    "correction": "of",
    "explanation": "Бояться чего-то: to be afraid OF smth."
  },
  {
    "id": "fm-47",
    "sentence": "She has less friends than her sister.",
    "tokens": [
      "She",
      "has",
      "less",
      "friends",
      "than",
      "her",
      "sister."
    ],
    "errorIndex": 2,
    "errorWord": "less",
    "correction": "fewer",
    "explanation": "С исчисляемыми существительными (friends) используется FEWER, а less — с неисчисляемыми."
  },
  {
    "id": "fm-48",
    "sentence": "He always wakes up on 7 AM.",
    "tokens": [
      "He",
      "always",
      "wakes",
      "up",
      "on",
      "7",
      "AM."
    ],
    "errorIndex": 4,
    "errorWord": "on",
    "correction": "at",
    "explanation": "Со временем на часах используется предлог AT: at 7 AM."
  },
  {
    "id": "fm-49",
    "sentence": "Did she called you yesterday night?",
    "tokens": [
      "Did",
      "she",
      "called",
      "you",
      "yesterday",
      "night?"
    ],
    "errorIndex": 2,
    "errorWord": "called",
    "correction": "call",
    "explanation": "После вспомогательного глагола Did глагол стоит в V1: Did she call you?"
  },
  {
    "id": "fm-50",
    "sentence": "I am looking for a new work in London.",
    "tokens": [
      "I",
      "am",
      "looking",
      "for",
      "a",
      "new",
      "work",
      "in",
      "London."
    ],
    "errorIndex": 6,
    "errorWord": "work",
    "correction": "job (или new work без 'a')",
    "explanation": "Work — неисчисляемое существительное, с артиклем 'a' используется исчисляемое слово JOB (a new job)."
  }
];
