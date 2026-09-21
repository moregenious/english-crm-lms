/**
 * Seed Data for Step into the Future
 * Includes Windows Explorer 10 Months x 8 Lessons Hierarchy per Textbook
 */

export const MONTH_NAMES = [
  { num: 1, id: "01-september", name: "01. Сентябрь (September)" },
  { num: 2, id: "02-october", name: "02. Октябрь (October)" },
  { num: 3, id: "03-november", name: "03. Ноябрь (November)" },
  { num: 4, id: "04-december", name: "04. Декабрь (December)" },
  { num: 5, id: "05-january", name: "05. Январь (January)" },
  { num: 6, id: "06-february", name: "06. Февраль (February)" },
  { num: 7, id: "07-march", name: "07. Март (March)" },
  { num: 8, id: "08-april", name: "08. Апрель (April)" },
  { num: 9, id: "09-may", name: "09. Май (May)" },
  { num: 10, id: "10-june", name: "10. Июнь (June)" }
];

export const SAMPLE_PN_CH_DATES = [
  // 01. Сентябрь
  ["2026-09-07", "2026-09-10", "2026-09-14", "2026-09-17", "2026-09-21", "2026-09-24", "2026-09-28", "2026-10-01"],
  // 02. Октябрь
  ["2026-10-05", "2026-10-08", "2026-10-12", "2026-10-15", "2026-10-19", "2026-10-22", "2026-10-26", "2026-10-29"],
  // 03. Ноябрь
  ["2026-11-02", "2026-11-05", "2026-11-09", "2026-11-12", "2026-11-16", "2026-11-19", "2026-11-23", "2026-11-26"],
  // 04. Декабрь
  ["2026-11-30", "2026-12-03", "2026-12-07", "2026-12-10", "2026-12-14", "2026-12-17", "2026-12-21", "2026-12-24"],
  // 05. Январь (после мини-каникул!)
  ["2027-01-11", "2027-01-14", "2027-01-18", "2027-01-21", "2027-01-25", "2027-01-28", "2027-02-01", "2027-02-04"],
  // 06. Февраль
  ["2027-02-08", "2027-02-11", "2027-02-15", "2027-02-18", "2027-02-22", "2027-02-25", "2027-03-01", "2027-03-04"],
  // 07. Март
  ["2027-03-08", "2027-03-11", "2027-03-15", "2027-03-18", "2027-03-22", "2027-03-25", "2027-03-29", "2027-04-01"],
  // 08. Апрель
  ["2027-04-05", "2027-04-08", "2027-04-12", "2027-04-15", "2027-04-19", "2027-04-22", "2027-04-26", "2027-04-29"],
  // 09. Май
  ["2027-05-03", "2027-05-06", "2027-05-10", "2027-05-13", "2027-05-17", "2027-05-20", "2027-05-24", "2027-05-27"],
  // 10. Июнь
  ["2027-05-31", "2027-06-03", "2027-06-07", "2027-06-10", "2027-06-14", "2027-06-17", "2027-06-21", "2027-06-24"]
];

function buildSeedSchedule() {
  const grp1 = [];
  SAMPLE_PN_CH_DATES.forEach((mDates, mIdx) => {
    const mNum = mIdx + 1;
    mDates.forEach((dateStr, lIdx) => {
      const lNum = lIdx + 1;
      const d = new Date(dateStr);
      const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
      const dayOfWeek = days[d.getDay()] || 'Понедельник';
      const isCompleted = (mNum === 1 && lNum <= 6);

      grp1.push({
        id: `sch-grp-1-m${mNum}-l${lNum}`,
        targetType: "group",
        groupId: "grp-1",
        studentId: null,
        teacherId: "tch-2",
        monthNumber: mNum,
        lessonNumber: lNum,
        dayOfWeek,
        time: "16:00 - 17:00",
        date: dateStr,
        topic: mNum === 1 && lNum === 6 ? "Unit 6: Past Continuous vs Past Simple" : `Урок ${lNum}: Материалы ${mNum} месяца`,
        status: isCompleted ? "completed" : "planned",
        format: "Очно (Кабинет 2)"
      });
    });
  });
  return grp1;
}

export const INITIAL_DATA = {
  admin: {
    login: "linikitajulia@gmail.com",
    email: "linikitajulia@gmail.com",
    password: "5074",
    name: "Администратор (Юлия)",
    phone: "+7 (900) 000-00-01"
  },

  teachers: [
    {
      id: "tch-1",
      login: "elena",
      password: "123",
      fullName: "Елена Васильевна Смирнова",
      phone: "+7 (903) 555-01-22",
      email: "elena.smirnova@englishteam.ru",
      specialization: "IELTS Prep, Upper-Intermediate & Старшие классы",
      status: "active",
      avatarColor: "#4f46e5"
    },
    {
      id: "tch-2",
      login: "dmitriy",
      password: "123",
      fullName: "Дмитрий Алексеевич Ковалев",
      phone: "+7 (916) 444-18-90",
      email: "dmitriy.kovalev@englishteam.ru",
      specialization: "General English, Pre-Intermediate & Средняя школа",
      status: "active",
      avatarColor: "#0d9488"
    },
    {
      id: "tch-3",
      login: "anna",
      password: "123",
      fullName: "Анна Сергеевна Белова",
      phone: "+7 (925) 777-33-41",
      email: "anna.belova@englishteam.ru",
      specialization: "Kids, Starters, Elementary & Игровые методики",
      status: "active",
      avatarColor: "#d97706"
    }
  ],

  groups: [
    {
      id: "grp-1",
      name: "Teens Pre-Intermediate (Группа A)",
      level: "Pre-Intermediate",
      textbook: "Solutions Pre-Intermediate 3rd Edition",
      teacherId: "tch-2",
      scheduleDays: ["Понедельник", "Четверг"],
      scheduleTime: "16:00 - 17:00",
      classroom: "Кабинет 2",
      shift: "Первая",
      status: "active"
    },
    {
      id: "grp-2",
      name: "IELTS Advanced Intensive",
      level: "Upper-Intermediate",
      textbook: "English File Upper-Intermediate 4th Ed",
      teacherId: "tch-1",
      scheduleDays: ["Вторник", "Пятница"],
      scheduleTime: "17:15 - 18:45",
      classroom: "Кабинет 1",
      shift: "Вторая",
      status: "active"
    },
    {
      id: "grp-3",
      name: "Kids Primary Starters",
      level: "Beginner",
      textbook: "Go Getter 3 & Round-Up 2",
      teacherId: "tch-3",
      scheduleDays: ["Среда", "Суббота"],
      scheduleTime: "10:00 - 11:00",
      classroom: "Кабинет 3",
      shift: "Первая",
      status: "active"
    }
  ],

  students: [
    {
      id: "stu-1",
      groupId: "grp-1",
      fullName: "Александр Морозов",
      phone: "+7 (915) 111-22-33",
      parentName: "Морозова Елена Павловна (Мама)",
      parentPhone: "+7 (915) 111-22-34",
      grade: "8-Б",
      school: "Лицей №8",
      shift: "Первая",
      level: "Pre-Intermediate",
      textbook: "Solutions Pre-Intermediate 3rd Edition",
      totalPoints: 240,
      createdAt: "2025-09-01T10:00:00.000Z",
      status: "active",
      notes: "Отличная мотивация к грамматике и разговорной речи. Ходит в группу A."
    },
    {
      id: "stu-2",
      groupId: "grp-2",
      fullName: "Мария Соколова",
      phone: "+7 (926) 222-33-44",
      parentName: "Соколов Андрей Викторович (Папа)",
      parentPhone: "+7 (926) 222-33-45",
      grade: "11-А",
      school: "Школа №23",
      shift: "Первая",
      level: "Upper-Intermediate",
      textbook: "English File Upper-Intermediate 4th Ed",
      totalPoints: 480,
      createdAt: "2025-08-20T12:00:00.000Z",
      status: "active",
      notes: "Готовится к сдаче IELTS для поступления в зарубежный вуз."
    },
    {
      id: "stu-3",
      groupId: "grp-3",
      fullName: "Максим Кузнецов",
      phone: "+7 (903) 333-44-55",
      parentName: "Кузнецова Ирина Олеговна (Мама)",
      parentPhone: "+7 (903) 333-44-56",
      grade: "3-В",
      school: "Гимназия №1",
      shift: "Первая",
      level: "Beginner",
      textbook: "Go Getter 3 & Round-Up 2",
      totalPoints: 190,
      createdAt: "2026-01-15T09:00:00.000Z",
      status: "active",
      notes: "Любит аудиозадания и интерактивные игры со словами."
    },
    {
      id: "stu-4",
      groupId: "grp-1",
      fullName: "Дарья Воронина",
      phone: "+7 (977) 444-55-66",
      parentName: "Воронин Сергей Михайлович (Папа)",
      parentPhone: "+7 (977) 444-55-67",
      grade: "8-А",
      school: "Лицей №8",
      shift: "Первая",
      level: "Pre-Intermediate",
      textbook: "Solutions Pre-Intermediate 3rd Edition",
      totalPoints: 310,
      createdAt: "2025-09-01T10:00:00.000Z",
      status: "active",
      notes: "Учится в одной группе с Александром Морозовым."
    },
    {
      id: "stu-5",
      groupId: "grp-3",
      fullName: "Артем Новиков",
      phone: "+7 (985) 555-66-77",
      parentName: "Новикова Ольга Сергеевна (Мама)",
      parentPhone: "+7 (985) 555-66-78",
      grade: "4-Б",
      school: "Школа №12",
      shift: "Первая",
      level: "Beginner",
      textbook: "Go Getter 3 & Round-Up 2",
      totalPoints: 135,
      createdAt: "2026-03-01T16:00:00.000Z",
      status: "active",
      notes: "Занимается в группе Kids с Максимом."
    },
    {
      id: "stu-6",
      groupId: "grp-2",
      fullName: "София Лебедева",
      phone: "+7 (999) 666-77-88",
      parentName: "Лебедева Наталья Юрьевна (Мама)",
      parentPhone: "+7 (999) 666-77-89",
      grade: "11-А",
      school: "Гимназия №15",
      shift: "Первая",
      level: "Upper-Intermediate",
      textbook: "English File Upper-Intermediate 4th Ed",
      totalPoints: 530,
      createdAt: "2025-08-15T11:00:00.000Z",
      status: "active",
      notes: "Подготовка к олимпиадам и выпускным экзаменам в группе с Марией."
    }
  ],

  schedule: buildSeedSchedule(),

  // Hierarchical Windows Explorer Lesson Plans: Textbook -> 10 Months -> 8 Lessons -> Files/HW/Vocab
  textbookLessons: {
    "Solutions Pre-Intermediate 3rd Edition": {
      1: { // 01. Сентябрь
        1: {
          topic: "Diagnostic Test & Unit 1A Feelings and Emotions",
          isConducted: true,
          homework: { text: "Student's Book p. 6 ex. 1-3. Выучить прилагательные чувств.", deadline: "к Уроку 2" },
          vocabulary: [
            { word: "anxious", transcription: "[ˈæŋkʃəs]", translation: "тревожный, беспокойный", example: "He felt anxious before the exam." },
            { word: "relieved", transcription: "[rɪˈliːvd]", translation: "испытывающий облегчение", example: "She was relieved to hear the good news." }
          ],
          files: [{ id: "f-1-1", name: "Feelings_Flashcards.pdf", type: "pdf", target: "teacher_admin", url: "/uploads/Unit_6_Past_Continuous_Worksheet.docx", size: "85 KB" }]
        },
        2: {
          topic: "Unit 1B Present Simple vs Present Continuous",
          isConducted: true,
          homework: { text: "Workbook p. 8 ex. 1-4. Составить 6 предложений со state verbs.", deadline: "к Уроку 3" },
          vocabulary: [
            { word: "temporary", transcription: "[ˈtemprəri]", translation: "временный", example: "I am staying in a hotel temporarily." },
            { word: "permanent", transcription: "[ˈpɜːmənənt]", translation: "постоянный", example: "They live in a permanent house." }
          ],
          files: []
        },
        3: {
          topic: "Unit 2A Landscapes & Nature Vocabulary",
          isConducted: true,
          homework: { text: "Workbook p. 12 ex. 2. Описать пейзаж на картинке.", deadline: "к Уроку 4" },
          vocabulary: [
            { word: "breathtaking", transcription: "[ˈbreθteɪkɪŋ]", translation: "захватывающий дух", example: "The mountain view was breathtaking." }
          ],
          files: []
        },
        4: {
          topic: "Unit 2B Past Simple: Regular & Irregular Verbs",
          isConducted: true,
          homework: { text: "Таблица неправильных глаголов 1-20. Workbook p. 14.", deadline: "к Уроку 5" },
          vocabulary: [
            { word: "occurred", translation: "произошло, случилось", example: "The event occurred in 1999." }
          ],
          files: []
        },
        5: {
          topic: "Unit 2C Storytelling & Linking Words",
          isConducted: true,
          homework: { text: "Написать короткий рассказ (60-80 слов) с использованием suddenly и meanwhile.", deadline: "к Уроку 6" },
          vocabulary: [
            { word: "meanwhile", translation: "тем временем", example: "Meanwhile, she prepared dinner." }
          ],
          files: []
        },
        6: {
          topic: "Unit 6: Past Continuous vs Past Simple & Dialogue Simulation",
          isConducted: true,
          homework: {
            text: "Workbook стр. 48 упр. 1-4. Прослушать аудиотрек Track 24 (диалог) с замедлением при необходимости и заполнить пропуски в рабочей тетради. Составить 5 предложений с новыми словами.",
            deadline: "к следующему уроку (Среда, 17:15)"
          },
          vocabulary: [
            { word: "interrupted", translation: "прерванный / внезапно остановленный", example: "I was reading when the phone rang." },
            { word: "suddenly", translation: "внезапно, вдруг", example: "Suddenly the lights went out in the room." },
            { word: "meanwhile", translation: "тем временем, пока", example: "Meanwhile, my friend was waiting outside." },
            { word: "witness", translation: "свидетель / очевидец", example: "The witness saw the whole accident." },
            { word: "alibi", translation: "алиби / подтверждение", example: "He had an alibi for that evening." }
          ],
          files: [
            { id: "f-6-1", name: "Track_24_Unit6_Listening.wav", type: "audio", target: "student", url: "/uploads/Track_24_Unit6_Listening.wav", size: "705 KB" },
            { id: "f-6-2", name: "Unit_6_Past_Continuous_Worksheet.docx", type: "document", target: "teacher_admin", url: "/uploads/Unit_6_Past_Continuous_Worksheet.docx", size: "12 KB" }
          ]
        },
        7: {
          topic: "Speaking Club: Travel Experience & Dialogue Simulation",
          isConducted: false,
          homework: { text: "Подготовить устный рассказ о путешествии (1-2 мин). Workbook p. 50 ex. 2.", deadline: "к Уроку 8" },
          vocabulary: [
            { word: "itinerary", translation: "маршрут путешествия", example: "We planned our itinerary." },
            { word: "departure", translation: "отправление", example: "Check the departure screen." }
          ],
          files: [{ id: "f-7-1", name: "Track_25_Airport_Dialogue.wav", type: "audio", target: "student", url: "/uploads/Track_24_Unit6_Listening.wav", size: "705 KB" }]
        },
        8: {
          topic: "Monthly Review Quiz & Grammar Wrap-up",
          isConducted: false,
          homework: { text: "Повторить все правила Сентября для перехода к Октябрю.", deadline: "к началу Октября" },
          vocabulary: [],
          files: []
        }
      }
    },

    "English File Upper-Intermediate 4th Ed": {
      1: { // 01. Сентябрь
        1: {
          topic: "IELTS Essay Structure & Academic Vocabulary",
          isConducted: true,
          homework: {
            text: "Написать эссе IELTS Task 2 на тему 'Technology in Education' (250-280 слов). Использовать не менее 4 академических связок из словаря.",
            deadline: "к следующему уроку (Четверг, 16:00)"
          },
          vocabulary: [
            { word: "furthermore", translation: "более того, кроме того", example: "Furthermore, online learning provides flexibility." },
            { word: "consequently", translation: "следовательно, в результате", example: "Consequently, students improve their digital skills." },
            { word: "detrimental", translation: "пагубный, вредный", example: "Excessive screen time can have a detrimental effect." },
            { word: "substantiate", translation: "обосновывать, доказывать", example: "You must substantiate your arguments with evidence." }
          ],
          files: [
            { id: "f-ef-1", name: "IELTS_Writing_Task2_Template.docx", type: "document", target: "teacher_admin", url: "/uploads/Unit_6_Past_Continuous_Worksheet.docx", size: "15 KB" }
          ]
        },
        2: {
          topic: "Reading Part 3 & Advanced Grammar Discussion",
          isConducted: false,
          homework: { text: "IELTS Reading Practice Test 1. Стр. 18-21.", deadline: "к следующему уроку" },
          vocabulary: [
            { word: "ubiquitous", translation: "вездесущий, повсеместный", example: "Smartphones are ubiquitous today." }
          ],
          files: []
        }
      }
    },

    "Go Getter 3 & Round-Up 2": {
      1: { // 01. Сентябрь
        1: {
          topic: "Present Simple: Daily Routine & Animal Quizzes",
          isConducted: true,
          homework: {
            text: "Нарисовать распорядок дня своего любимого питомца и подписать 5 действий на английском языке (Go Getter 3 p. 24).",
            deadline: "к следующему уроку (Пятница, 09:30)"
          },
          vocabulary: [
            { word: "wake up", translation: "просыпаться", example: "My cat wakes up at 7 AM." },
            { word: "have breakfast", translation: "завтракать", example: "We have breakfast together." },
            { word: "chase", translation: "догонять, гнаться", example: "Dogs like to chase balls." }
          ],
          files: [
            { id: "f-gg-1", name: "Daily_Routine_Song.wav", type: "audio", target: "student", url: "/uploads/Track_24_Unit6_Listening.wav", size: "705 KB" }
          ]
        }
      }
    },

    "Project 4": {
      1: { // 01. Сентябрь
        1: {
          topic: "Unit 1: Past and Present & School Life",
          isConducted: true,
          homework: {
            text: "Project 4 Student's Book p. 8 ex. 1-4. Workbook p. 6.",
            deadline: "к следующему уроку"
          },
          vocabulary: [
            { word: "curriculum", translation: "учебный план / программа", example: "Our curriculum includes science and arts." },
            { word: "compulsory", translation: "обязательный", example: "Math is a compulsory subject." }
          ],
          files: [
            { id: "f-prj-1", name: "Project4_Unit1_Listening.wav", type: "audio", target: "student", url: "/uploads/Track_24_Unit6_Listening.wav", size: "705 KB" }
          ]
        },
        2: {
          topic: "Unit 1B: Life Stories & Past Simple Narrative",
          isConducted: false,
          homework: { text: "Workbook p. 8. Составить 5 предложений в Past Simple.", deadline: "к Уроку 3" },
          vocabulary: [
            { word: "biography", translation: "биография", example: "He wrote an exciting biography." }
          ],
          files: []
        }
      }
    },

    "English World 3": {
      1: { // 01. Сентябрь
        1: {
          topic: "Unit 1: Welcome to Class 3 & Reading Adventure",
          isConducted: true,
          homework: {
            text: "English World 3 Pupil's Book p. 10. Прочитать текст 'The Secret Island' и выучить 4 новых слова.",
            deadline: "к следующему уроку"
          },
          vocabulary: [
            { word: "adventure", transcription: "[ədˈventʃə]", translation: "приключение", example: "They went on an exciting adventure." },
            { word: "island", transcription: "[ˈaɪlənd]", translation: "остров", example: "The island was green and quiet." },
            { word: "explore", transcription: "[ɪkˈsplɔː]", translation: "исследовать / изучать", example: "Children love to explore new places." },
            { word: "captain", transcription: "[ˈkæptɪn]", translation: "капитан", example: "The captain steered the ship." }
          ],
          files: [
            { id: "f-ew3-1", name: "EnglishWorld3_Track_01.wav", type: "audio", target: "student", url: "/uploads/Track_24_Unit6_Listening.wav", size: "705 KB" }
          ]
        },
        2: {
          topic: "Unit 1 Grammar: Present Continuous with Actions",
          isConducted: false,
          homework: { text: "Workbook p. 6-7 ex. 1-3. Описать картинку в тетради.", deadline: "к Уроку 3" },
          vocabulary: [
            { word: "sailing", transcription: "[ˈseɪlɪŋ]", translation: "плавание под парусом", example: "They are sailing across the lake." }
          ],
          files: []
        }
      }
    },

    "English World 4": {
      1: { // 01. Сентябрь
        1: {
          topic: "Unit 1: The Mountain Expedition & Exploration",
          isConducted: true,
          homework: {
            text: "English World 4 Pupil's Book p. 8. Читать историю и выучить новые слова.",
            deadline: "к следующему уроку"
          },
          vocabulary: [
            { word: "expedition", transcription: "[ˌekspəˈdɪʃn]", translation: "экспедиция, поход", example: "The team prepared for a long mountain expedition." },
            { word: "summit", transcription: "[ˈsʌmɪt]", translation: "вершина горы", example: "They finally reached the summit at sunrise." },
            { word: "courageous", transcription: "[kəˈreɪdʒəs]", translation: "отважный, смелый", example: "The courageous climber helped his teammates." },
            { word: "compass", transcription: "[ˈkʌmpəs]", translation: "компас", example: "Always check your compass in the forest." }
          ],
          files: []
        },
        2: {
          topic: "Unit 1 Grammar: Past Continuous & Simple Past",
          isConducted: false,
          homework: { text: "Workbook p. 10 ex. 1-4. Упражнения на времена глагола.", deadline: "к Уроку 3" },
          vocabulary: [
            { word: "backpack", transcription: "[ˈbækpæk]", translation: "рюкзак", example: "Pack warm clothes in your backpack." },
            { word: "valley", transcription: "[ˈvæli]", translation: "долина", example: "A beautiful river flowed through the valley." }
          ],
          files: []
        }
      }
    }
  },

  pointRecords: [
    {
      id: "pt-1",
      studentId: "stu-1",
      teacherId: "tch-2",
      type: "add",
      date: "2026-09-08T15:30:00.000Z",
      points: 20,
      category: "Домашнее задание",
      comment: "Workbook Unit 6 выполнена без ошибок."
    },
    {
      id: "pt-2",
      studentId: "stu-1",
      teacherId: "tch-2",
      type: "add",
      date: "2026-09-10T16:15:00.000Z",
      points: 15,
      category: "Активность",
      comment: "Хорошая работа на уроке и диалог."
    },
    {
      id: "pt-3",
      studentId: "stu-4",
      teacherId: "tch-2",
      type: "add",
      date: "2026-09-08T15:30:00.000Z",
      points: 30,
      category: "Спикинг / Speaking",
      comment: "Спикинг: свободный связный рассказ о путешествиях."
    },
    {
      id: "pt-4",
      studentId: "stu-4",
      teacherId: "tch-2",
      type: "add",
      date: "2026-09-10T16:15:00.000Z",
      points: 20,
      category: "Домашнее задание",
      comment: "Домашнее задание сдано вовремя и в полном объёме."
    },
    {
      id: "pt-5",
      studentId: "stu-2",
      teacherId: "tch-1",
      type: "add",
      date: "2026-09-09T17:00:00.000Z",
      points: 50,
      category: "Экзамен",
      comment: "Пробный IELTS Reading + Listening: Band 7.5."
    },
    {
      id: "pt-6",
      studentId: "stu-6",
      teacherId: "tch-1",
      type: "add",
      date: "2026-09-09T17:00:00.000Z",
      points: 45,
      category: "Экзамен",
      comment: "Mock IELTS Essay Band 7.0, отличные связки и лексика."
    },
    {
      id: "pt-7",
      studentId: "stu-3",
      teacherId: "tch-3",
      type: "add",
      date: "2026-09-10T10:30:00.000Z",
      points: 25,
      category: "Словарный запас",
      comment: "Словарный диктант Daily Routines — 10 из 10 слов верно!"
    },
    {
      id: "pt-8",
      studentId: "stu-5",
      teacherId: "tch-3",
      type: "deduct",
      date: "2026-09-10T10:00:00.000Z",
      points: -10,
      category: "Опоздание",
      comment: "Опоздание на урок на 15 минут без предупреждения."
    },
    {
      id: "pt-9",
      studentId: "stu-5",
      teacherId: "tch-3",
      type: "add",
      date: "2026-09-12T11:00:00.000Z",
      points: 20,
      category: "Активность",
      comment: "Хороший ответ у доски."
    }
  ]
};
