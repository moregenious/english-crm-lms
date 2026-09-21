/**
 * Mini-Games & Grammar Trainers Hub View
 * Step into the future English LMS
 * 
 * 1. Vocabulary Quiz (10 questions, 4 options, streak 3x 10/10 -> "знаток слов")
 * 2. Irregular Verbs (100 verbs, spaced repetition rotation 4/6, streak 3x 10/10 -> "знаток irregular")
 * 3. Conditionals (160 sentences in 4 modes: Type 1, 2, 3, Mixed, streak 3x 10/10 -> "знаток conditional", all modes -> "архитектор условий")
 * 4. Tenses Identification Quiz (5 tiers: Easy -> Middle -> Hard -> Impossible -> Rampage, streak 3x 10/10 -> "повелитель времён", Rampage -> "гений времён")
 * 5. Sentence Builder (40 sentences with interactive word chips, streak 3x 10/10 -> "мастер предложений")
 * 6. Preposition Catcher (60 preposition tasks with grammar rules, streak 3x 10/10 -> "повелитель предлогов")
 * 7. Phrasal Verbs Trainer (60 phrasal tasks with idioms and contexts, streak 3x 10/10 -> "знаток phrasal verbs")
 * 8. Error Detective (50 targeted mistake sentences with explanations, streak 3x 10/10 -> "грамматический детектив")
 * 9. Synonyms & Antonyms Sprint (85 timed 15s blitz questions in pure English, streak 3x 10/10 -> "спринтер слов")
 * 10. Meta Milestone (Earn 5 secret titles -> "легенда мини-игр")
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { IRREGULAR_VERBS } from '../data/irregularVerbsData.js';
import { CONDITIONALS_DATA } from '../data/conditionalsData.js';
import { TENSES_CONFIG, TENSE_LEVELS, TENSES_SENTENCES } from '../data/tensesData.js';
import { SENTENCE_BUILDER_DATA } from '../data/sentenceBuilderData.js';
import { PREPOSITIONS_DATA } from '../data/prepositionsData.js';
import { PHRASAL_VERBS_DATA } from '../data/phrasalVerbsData.js';
import { FIND_MISTAKE_DATA } from '../data/findMistakeData.js';
import { SYNONYMS_ANTONYMS_DATA } from '../data/synonymsAntonymsData.js';

export const GamesView = {
  activeTab: 'words', // 'words' | 'irregular' | 'conditionals' | 'tenses' | 'builder' | 'prepositions' | 'phrasal' | 'mistakes' | 'synonyms'
  activeConditionalMode: 'type1', // 'type1' | 'type2' | 'type3' | 'mixed'
  activeTenseLevel: 'easy', // 'easy' | 'middle' | 'hard' | 'impossible' | 'rampage'

  // Temporary runtime state per round
  wordsState: null,
  irregularState: null,
  conditionalsState: null,
  tensesState: null,
  builderState: null,
  prepositionsState: null,
  phrasalState: null,
  mistakesState: null,
  synonymsState: null,

  // Helper to get active student ID
  getActiveStudentId() {
    const user = auth.getCurrentUser();
    if (auth.isStudent()) {
      return auth.currentStudentId || user?.id;
    }
    return null;
  },

  render(container) {
    const isStudent = auth.isStudent();
    const studentId = this.getActiveStudentId();
    const student = isStudent && studentId ? store.getStudentById(studentId) : null;
    const progress = isStudent && studentId ? store.getStudentGameProgress(studentId) : {
      weeklyPoints: 0,
      weeklyLimit: 100,
      wordsStreak: 0,
      irregularStreak: 0,
      conditionalStreak: 0,
      tensesStreak: 0,
      builderStreak: 0,
      prepositionsStreak: 0,
      phrasalStreak: 0,
      mistakesStreak: 0,
      synonymsStreak: 0,
      unlockedSecretTitles: []
    };

    const weeklyPercent = Math.min(100, Math.round((progress.weeklyPoints / progress.weeklyLimit) * 100));

    container.innerHTML = `
      <div class="games-view-container">
        <!-- Header & Stats Bar -->
        <div class="card games-header-card" style="margin-bottom: var(--space-4); background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: #ffffff; border: none; box-shadow: var(--shadow-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.8rem;">🎮</span>
                <div>
                  <h2 style="margin: 0; font-size: 1.35rem; color: #ffffff; font-weight: 800;">
                    Мини-игры и тренажеры английского
                  </h2>
                  <p style="margin: 0; font-size: 0.8rem; color: #c7d2fe;">
                    ${isStudent ? 'Тренируй словарный запас и грамматику, зарабатывай баллы в профиль и открывай секретные титулы!' : 'Режим преподавателя: тренировка и проверка заданий. Подсчёт ведется только внутри игр.'}
                  </p>
                </div>
              </div>
            </div>

            <!-- Weekly Points Progress Bar OR Teacher Mode Badge -->
            ${isStudent ? `
            <div class="games-weekly-cap-box" style="background: rgba(255, 255, 255, 0.12); padding: 10px 16px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.2); min-width: 260px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px;">
                <span>⭐ Недельный лимит:</span>
                <span style="color: #fef08a; font-size: 0.95rem;">${progress.weeklyPoints} / ${progress.weeklyLimit} баллов</span>
              </div>
              <div style="width: 100%; height: 8px; background: rgba(0, 0, 0, 0.25); border-radius: 4px; overflow: hidden;">
                <div style="width: ${weeklyPercent}%; height: 100%; background: linear-gradient(90deg, #facc15, #f59e0b); border-radius: 4px; transition: width 0.4s ease;"></div>
              </div>
              <div style="font-size: 0.68rem; color: #e0e7ff; margin-top: 4px; text-align: right;">
                ${progress.weeklyPoints >= progress.weeklyLimit ? '🎉 Лимит на эту неделю достигнут! Можно играть для тренировки.' : `Осталось заработать: ${progress.weeklyLimit - progress.weeklyPoints} ⭐`}
              </div>
            </div>
            ` : `
            <div class="games-weekly-cap-box" style="background: rgba(255, 255, 255, 0.12); padding: 10px 16px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.2); min-width: 260px;">
              <div style="font-size: 0.9rem; font-weight: 700; color: #fef08a; display: flex; align-items: center; gap: 6px;">
                <span>🎓 Режим преподавателя</span>
              </div>
              <div style="font-size: 0.72rem; color: #e0e7ff; margin-top: 4px;">
                Доступны все тренажеры и уровни сложности. Баллы в профиль не начисляются.
              </div>
            </div>
            `}
          </div>

          ${isStudent ? `
          <!-- Streaks and Secret Titles Bar (Compact multi-game view) -->
          <div style="display: flex; gap: 8px; margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid rgba(255, 255, 255, 0.15); flex-wrap: wrap; align-items: center;">
            <div style="font-size: 0.75rem; color: #c7d2fe; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <span title="Серии побед 10/10 подряд">🔥 Серии:</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Слова">🔤 ${progress.wordsStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Неправильные глаголы">⚡ ${progress.irregularStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Условные предложения">⚖️ ${progress.conditionalStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Времена">⏱️ ${progress.tensesStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Конструктор предложений">🧩 ${progress.builderStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Ловец предлогов">🎯 ${progress.prepositionsStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Фразовые глаголы">🚀 ${progress.phrasalStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Найди ошибку">🕵️ ${progress.mistakesStreak || 0}/3</span>
              <span style="background: rgba(255,255,255,0.15); padding: 1px 6px; border-radius: 6px;" title="Синонимы и Антонимы">⚡ ${progress.synonymsStreak || 0}/3</span>
            </div>

            <!-- Unlocked Secret Titles Chips -->
            <div style="margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <span style="font-size: 0.72rem; color: #fef08a; font-weight: 700;">🏆 Секретные титулы:</span>
              ${progress.unlockedSecretTitles.length === 0 ? `
                <span style="font-size: 0.72rem; color: rgba(255,255,255,0.6); font-style: italic;">Пока не открыты (0 из 12)</span>
              ` : progress.unlockedSecretTitles.map(t => `
                <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                  👑 ${t}
                </span>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Game Navigation Tabs: 9 Modern Interactive Games -->
        <div class="games-tabs-bar" style="display: flex; gap: 8px; margin-bottom: var(--space-4); overflow-x: auto; padding-bottom: 6px; flex-wrap: wrap;">
          <button type="button" class="btn ${this.activeTab === 'words' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="words" style="min-width: 140px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>🔤 Слова</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'irregular' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="irregular" style="min-width: 160px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>⚡ Глаголы V1-V3</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'conditionals' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="conditionals" style="min-width: 160px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>⚖️ Conditionals</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'tenses' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="tenses" style="min-width: 140px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>⏱️ Времена</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="builder" style="min-width: 160px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>🧩 Конструктор</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'prepositions' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="prepositions" style="min-width: 150px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>🎯 Предлоги</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'phrasal' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="phrasal" style="min-width: 155px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>🚀 Фразовые</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'mistakes' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="mistakes" style="min-width: 150px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>🕵️ Найди ошибку</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'synonyms' ? 'btn-primary' : 'btn-secondary'} tab-game-btn" data-game="synonyms" style="min-width: 165px; font-weight: 700; border-radius: var(--radius-lg);">
            <span>⚡ Синонимы / Ант.</span>
          </button>
        </div>

        <!-- Active Game Container Mount -->
        <div id="active-game-mount"></div>
      </div>
    `;

    this.mountActiveGame(container, studentId);
    this.bindTabEvents(container);
  },

  bindTabEvents(container) {
    container.querySelectorAll('.tab-game-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.game;
        // Reset sub-state for freshly selected game
        if (this.activeTab === 'words') this.wordsState = null;
        if (this.activeTab === 'irregular') this.irregularState = null;
        if (this.activeTab === 'conditionals') this.conditionalsState = null;
        if (this.activeTab === 'tenses') this.tensesState = null;
        if (this.activeTab === 'builder') this.builderState = null;
        if (this.activeTab === 'prepositions') this.prepositionsState = null;
        if (this.activeTab === 'phrasal') this.phrasalState = null;
        if (this.activeTab === 'mistakes') this.mistakesState = null;
        if (this.activeTab === 'synonyms') {
          if (this.synonymsState?.timer) clearInterval(this.synonymsState.timer);
          this.synonymsState = null;
        }

        this.render(container);
      });
    });
  },

  mountActiveGame(container, studentId) {
    const mount = container.querySelector('#active-game-mount');
    if (!mount) return;

    if (this.activeTab === 'words') {
      this.renderWordsGame(mount, studentId);
    } else if (this.activeTab === 'irregular') {
      this.renderIrregularGame(mount, studentId);
    } else if (this.activeTab === 'conditionals') {
      this.renderConditionalsGame(mount, studentId);
    } else if (this.activeTab === 'tenses') {
      this.renderTensesGame(mount, studentId);
    } else if (this.activeTab === 'builder') {
      this.renderBuilderGame(mount, studentId);
    } else if (this.activeTab === 'prepositions') {
      this.renderPrepositionsGame(mount, studentId);
    } else if (this.activeTab === 'phrasal') {
      this.renderPhrasalGame(mount, studentId);
    } else if (this.activeTab === 'mistakes') {
      this.renderMistakesGame(mount, studentId);
    } else if (this.activeTab === 'synonyms') {
      this.renderSynonymsGame(mount, studentId);
    }
  },

  // =========================================================================
  // 1. GAME: Vocabulary Quiz (10 вопросов, 4 варианта перевода, 1 верный)
  // =========================================================================

  initWordsRound(studentId) {
    const rawWords = store.getPrioritizedVocabularyForGame(studentId, 10);
    const poolData = store.getStudentVocabularyPool(studentId);

    // Build candidate translations pool for unique distractors
    const translationPool = new Set();
    (poolData.allWords || []).forEach(w => {
      if (w && w.translation && w.translation.trim()) {
        translationPool.add(w.translation.trim());
      }
    });

    if (store.state.textbookVocabularyPool) {
      Object.values(store.state.textbookVocabularyPool).forEach(list => {
        if (Array.isArray(list)) {
          list.forEach(w => {
            if (w && w.translation && w.translation.trim()) {
              translationPool.add(w.translation.trim());
            }
          });
        }
      });
    }

    const fallbackTranslations = [
      'исчезать', 'приключение', 'вызов, испытание', 'знания', 'праздновать',
      'воображать', 'открывать, исследовать', 'защищать', 'улучшать', 'вдохновлять',
      'путешествие', 'победа', 'успех', 'терпение', 'открытие', 'внимание',
      'развитие', 'надежда', 'память', 'мечта', 'свобода', 'будущее',
      'согласие', 'решение', 'подарок', 'беседа', 'прощение', 'возможность',
      'достижение', 'сокровище', 'мудрость', 'радость', 'опыт', 'дружба',
      'путешественник', 'чудо', 'природа', 'награда', 'волнение', 'тайна'
    ];
    fallbackTranslations.forEach(t => translationPool.add(t));

    const candidateTranslationsList = Array.from(translationPool);
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const questions = rawWords.map((w, idx) => {
      const correctTr = w.translation ? w.translation.trim() : 'перевод';
      const trDisplay = w.transcription ? (w.transcription.startsWith('[') ? w.transcription : `[${w.transcription}]`) : '';

      // Pick 3 unique distractors that differ from correct translation
      const availableDistractors = candidateTranslationsList.filter(
        t => t.toLowerCase().trim() !== correctTr.toLowerCase().trim()
      );
      const chosenDistractors = shuffle(availableDistractors).slice(0, 3);

      // Combine 1 correct and 3 distractors, then shuffle
      const options = shuffle([correctTr, ...chosenDistractors]);

      return {
        id: idx + 1,
        word: w.word ? w.word.trim() : 'Word',
        transcription: trDisplay,
        translation: correctTr,
        example: w.example ? w.example.trim() : '',
        textbook: w.textbook || '',
        monthNumber: w.monthNumber || null,
        lessonNumber: w.lessonNumber || null,
        options,
        userAnswer: null,
        isCorrect: null
      };
    });

    this.wordsState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderWordsGame(mount, studentId) {
    if (!this.wordsState || this.wordsState.isFinished) {
      this.initWordsRound(studentId);
    }

    const state = this.wordsState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    const letterBadges = ['A', 'B', 'C', 'D'];

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid var(--color-primary); box-shadow: var(--shadow-md);">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-primary); display: flex; align-items: center; gap: 6px;">
              <span>🔤</span> <span>Тест по словам: выберите правильный перевод</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              Слова с последнего урока и тем. 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #bae6fd;">
              Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-words" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #0284c7, #2563eb); transition: width 0.3s ease;"></div>
        </div>

        <!-- Question Card -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #bae6fd; border-radius: var(--radius-xl); padding: var(--space-5); text-align: center; margin-bottom: var(--space-4); position: relative;">
          ${q.textbook ? `
            <div style="display: inline-block; background: #ffffff; color: #0369a1; padding: 2px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; margin-bottom: 8px; border: 1px solid #bae6fd;">
              📚 ${q.textbook}${q.lessonNumber ? ` • Урок ${q.lessonNumber}` : ''}
            </div>
          ` : ''}

          <div style="font-size: 0.8rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
            🇬🇧 Английское слово:
          </div>

          <div style="font-size: 2.3rem; font-weight: 800; color: #0c4a6e; margin: 4px 0;">
            ${q.word}
          </div>

          ${q.transcription ? `
            <div style="font-size: 1.15rem; font-family: monospace; font-weight: 600; color: #0369a1; margin-bottom: 4px;">
              ${q.transcription}
            </div>
          ` : ''}

          <div style="margin-top: 8px; font-size: var(--font-size-xs); color: #075985;">
            Выберите верный русский перевод из 4 вариантов:
          </div>
        </div>

        <!-- Options Grid: 2x2 on desktop, 1-column on mobile -->
        <div class="words-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map((opt, idx) => `
            <button type="button" class="btn btn-secondary btn-word-opt" data-opt="${opt}" style="padding: var(--space-3) var(--space-4); font-size: 1.05rem; font-weight: 700; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: flex-start; gap: 12px; min-height: 52px; text-align: left; transition: all 0.2s ease;">
              <span class="opt-badge" style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--color-bg-app); color: var(--color-primary); font-size: 0.85rem; font-weight: 800; border: 1px solid var(--color-border); flex-shrink: 0;">${letterBadges[idx]}</span>
              <span style="flex: 1;">${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next / Finish Button -->
        <div id="words-feedback-box" style="min-height: 52px; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div id="words-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
            <button type="button" class="btn btn-primary" id="btn-next-word" style="display: none; margin-left: auto;">
              <span>${currentNum === totalQ ? 'Завершить игру ➔' : 'Следующее слово ➔'}</span>
            </button>
          </div>
          <div id="words-example" style="display: none;"></div>
        </div>
      </div>
    `;

    this.bindWordsEvents(mount, studentId);
  },

  bindWordsEvents(mount, studentId) {
    const state = this.wordsState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#words-msg');
    const exampleEl = mount.querySelector('#words-example');
    const nextBtn = mount.querySelector('#btn-next-word');

    mount.querySelector('#btn-restart-words')?.addEventListener('click', () => {
      this.initWordsRound(studentId);
      this.renderWordsGame(mount, studentId);
    });

    mount.querySelectorAll('.btn-word-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return; // already answered

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen.toLowerCase().trim() === q.translation.toLowerCase().trim());

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          const badge = btn.querySelector('.opt-badge');
          if (badge) {
            badge.style.background = '#ffffff';
            badge.style.color = '#16a34a';
            badge.textContent = '✓';
          }
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Великолепно! Правильный перевод: <strong>${q.translation}</strong></span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';
          const badge = btn.querySelector('.opt-badge');
          if (badge) {
            badge.style.background = '#ffffff';
            badge.style.color = '#dc2626';
            badge.textContent = '✕';
          }

          // Highlight correct option
          mount.querySelectorAll('.btn-word-opt').forEach(b => {
            if (b.dataset.opt.toLowerCase().trim() === q.translation.toLowerCase().trim()) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
              const bBadge = b.querySelector('.opt-badge');
              if (bBadge) {
                bBadge.style.background = '#ffffff';
                bBadge.style.color = '#16a34a';
                bBadge.textContent = '✓';
              }
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильный перевод: <strong>${q.translation}</strong></span>`;
        }

        // Show example sentence if present
        if (q.example && exampleEl) {
          exampleEl.style.display = 'block';
          exampleEl.innerHTML = `
            <div style="background: rgba(14, 165, 233, 0.08); border-left: 3px solid #0284c7; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; color: var(--color-text-main);">
              💡 Пример: <em>«${q.example}»</em>
            </div>
          `;
        }

        // Disable options
        mount.querySelectorAll('.btn-word-opt').forEach(b => b.style.pointerEvents = 'none');

        // Reveal next button
        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderWordsGame(mount, studentId);
      } else {
        this.finishWordsGame(mount, studentId);
      }
    });
  },

  finishWordsGame(mount, studentId) {
    const state = this.wordsState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'words', 'Тест по словам') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'words', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Безупречный результат!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '📖'}</div>
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 правильных переводов
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #0284c7; font-weight: 700; margin-top: var(--space-3);">
          📖 Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-words-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-words-again')?.addEventListener('click', () => {
          modal.close();
          this.initWordsRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 2. GAME: Irregular Verbs (100 Неправильных глаголов)
  // =========================================================================

  initIrregularRound(studentId) {
    const progress = store.getStudentGameProgress(studentId);
    const recentIds = progress.irregularRecentIds || [];

    // Spaced repetition rotation: ~4 from recent, ~6 from non-recent
    const recentPool = IRREGULAR_VERBS.filter(v => recentIds.includes(v.id));
    const newPool = IRREGULAR_VERBS.filter(v => !recentIds.includes(v.id));

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const pickedRecent = shuffle(recentPool).slice(0, 4);
    const neededNew = 10 - pickedRecent.length;
    const pickedNew = shuffle(newPool).slice(0, neededNew);

    let roundVerbs = shuffle([...pickedRecent, ...pickedNew]);
    if (roundVerbs.length < 10) {
      roundVerbs = shuffle(IRREGULAR_VERBS).slice(0, 10);
    }

    // Generate 4 plausible multiple choices for (V2, V3) for each question
    const questions = roundVerbs.map(verb => {
      const correctPair = `${verb.v2} — ${verb.v3}`;

      // Generate 3 plausible distractors from other verbs
      const otherVerbs = shuffle(IRREGULAR_VERBS.filter(v => v.id !== verb.id)).slice(0, 3);
      const distractors = otherVerbs.map(ov => `${ov.v2} — ${ov.v3}`);

      // Also create a false regular distractor e.g. base + ed
      const baseClean = verb.v1.split('/')[0].trim();
      const fakeEd = baseClean.endsWith('e') ? baseClean + 'd' : baseClean + 'ed';
      distractors[0] = `${fakeEd} — ${fakeEd}`;

      const options = shuffle([correctPair, ...distractors]);

      return {
        verb,
        correctPair,
        options,
        userAnswer: null,
        isCorrect: null
      };
    });

    this.irregularState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderIrregularGame(mount, studentId) {
    if (!this.irregularState || this.irregularState.isFinished) {
      this.initIrregularRound(studentId);
    }

    const state = this.irregularState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #8b5cf6; box-shadow: var(--shadow-md); max-width: 720px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; color: #6d28d9; display: flex; align-items: center; gap: 6px;">
              <span>⚡</span> <span>Тренажер: 100 Неправильных глаголов</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="background: #ede9fe; color: #5b21b6; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem;">
            Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
          </div>
        </div>

        <!-- Question Card -->
        <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1.5px solid #ddd6fe; border-radius: var(--radius-xl); padding: var(--space-5); text-align: center; margin-bottom: var(--space-4);">
          <div style="font-size: 0.8rem; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.5px;">
            Форма V1 (Infinitive):
          </div>
          <div style="font-size: 2.2rem; font-weight: 800; color: #4c1d95; margin: 4px 0;">
            ${q.verb.v1}
          </div>
          <div style="font-size: 1.05rem; font-weight: 600; color: #6b21a8;">
            🇷🇺 Перевод: «${q.verb.translation}»
          </div>
          <div style="margin-top: 10px; font-size: var(--font-size-xs); color: #5b21b6;">
            Выберите правильные <strong>2-ю (Past Simple)</strong> и <strong>3-ю (Past Participle)</strong> формы:
          </div>
        </div>

        <!-- Options Grid -->
        <div class="irregular-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map((opt, idx) => `
            <button type="button" class="btn btn-secondary btn-irregular-opt" data-opt="${opt}" style="padding: var(--space-3); font-size: 1rem; font-weight: 700; border-radius: var(--radius-lg); text-align: center; justify-content: center;">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div id="irregular-feedback" style="min-height: 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div id="irregular-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
          <button type="button" class="btn btn-primary" id="btn-next-irregular" style="display: none; margin-left: auto;">
            <span>Следующий глагол ➔</span>
          </button>
        </div>
      </div>
    `;

    this.bindIrregularEvents(mount, studentId);
  },

  bindIrregularEvents(mount, studentId) {
    const state = this.irregularState;
    const q = state.questions[state.currentIndex];
    const feedbackEl = mount.querySelector('#irregular-msg');
    const nextBtn = mount.querySelector('#btn-next-irregular');

    mount.querySelectorAll('.btn-irregular-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return; // already answered

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen === q.correctPair);

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Великолепно! Все 3 формы: <strong>${q.verb.v1} — ${q.verb.v2} — ${q.verb.v3}</strong></span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';

          // Highlight the correct one in green
          mount.querySelectorAll('.btn-irregular-opt').forEach(b => {
            if (b.dataset.opt === q.correctPair) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильно: <strong>${q.verb.v1} — ${q.verb.v2} — ${q.verb.v3}</strong></span>`;
        }

        // Disable options
        mount.querySelectorAll('.btn-irregular-opt').forEach(b => b.style.pointerEvents = 'none');

        // Show Next button
        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      state.currentIndex++;
      if (state.currentIndex < state.questions.length) {
        this.renderIrregularGame(mount, studentId);
      } else {
        this.finishIrregularGame(mount, studentId);
      }
    });
  },

  finishIrregularGame(mount, studentId) {
    const state = this.irregularState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'irregular', 'Неправильные глаголы') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'irregular', state.score, 10, {
      verbIds: state.questions.map(q => q.verb.id)
    }) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;

    let modalTitle = isPerfect ? '⚡ 10 из 10! Идеальный результат!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎯' : '📚'}</div>
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 правильных ответов
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #6d28d9; font-weight: 700; margin-top: var(--space-3);">
          ⚡ Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-irregular-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-irregular-again')?.addEventListener('click', () => {
          modal.close();
          this.initIrregularRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 3. GAME: Conditionals (Условные предложения 4 режима)
  // =========================================================================

  initConditionalsRound(studentId) {
    const mode = this.activeConditionalMode || 'type1';
    const pool = CONDITIONALS_DATA[mode] || CONDITIONALS_DATA.type1;

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(pool).slice(0, 10).map(q => ({
      ...q,
      userAnswer: null,
      isCorrect: null
    }));

    this.conditionalsState = {
      mode,
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderConditionalsGame(mount, studentId) {
    if (!this.conditionalsState || this.conditionalsState.isFinished || this.conditionalsState.mode !== this.activeConditionalMode) {
      this.initConditionalsRound(studentId);
    }

    const state = this.conditionalsState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;

    const modeLabels = {
      type1: 'Type 1 (First Conditional)',
      type2: 'Type 2 (Second Conditional)',
      type3: 'Type 3 (Third Conditional)',
      mixed: 'Mixed Type (Смешанный тип)'
    };

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #0284c7; box-shadow: var(--shadow-md); max-width: 760px; margin: 0 auto;">
        
        <!-- Mode Switcher Tabs -->
        <div style="display: flex; gap: 6px; margin-bottom: var(--space-4); overflow-x: auto;">
          ${['type1', 'type2', 'type3', 'mixed'].map(m => `
            <button type="button" class="btn btn-sm ${this.activeConditionalMode === m ? 'btn-primary' : 'btn-secondary'} btn-cond-mode" data-mode="${m}" style="font-weight: 700; border-radius: var(--radius-md);">
              ${modeLabels[m]}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; color: #0369a1; display: flex; align-items: center; gap: 6px;">
              <span>⚖️</span> <span>${modeLabels[this.activeConditionalMode]}</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              3 игры подряд на 10/10 открывают секретный титул!
            </p>
          </div>
          <div style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem;">
            Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
          </div>
        </div>

        <!-- Sentence Card -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #bae6fd; border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-4);">
          <div style="font-size: 1.25rem; font-weight: 700; color: #0c4a6e; line-height: 1.5; margin-bottom: 8px;">
            ${q.prompt.replace('___', '<span class="gap-blank" style="text-decoration: underline; text-decoration-thickness: 3px; color: #0284c7; padding: 0 4px;">______</span>')}
          </div>
          <div style="font-size: 0.9rem; color: #0369a1; font-style: italic;">
            🇷🇺 ${q.translation}
          </div>
        </div>

        <!-- Options -->
        <div class="conditionals-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map(opt => `
            <button type="button" class="btn btn-secondary btn-cond-opt" data-opt="${opt}" style="padding: var(--space-3); font-size: 1rem; font-weight: 700; border-radius: var(--radius-lg); text-align: center; justify-content: center;">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Explanation & Next Button -->
        <div id="cond-feedback-box" style="min-height: 52px; display: flex; flex-direction: column; gap: 8px;">
          <div id="cond-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
          <div id="cond-explanation" style="display: none; background: #f8fafc; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px 12px; font-size: var(--font-size-xs); color: var(--color-text-secondary); line-height: 1.5;"></div>
          <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
            <button type="button" class="btn btn-primary" id="btn-next-cond" style="display: none;">
              <span>Следующее предложение ➔</span>
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindConditionalsEvents(mount, studentId);
  },

  bindConditionalsEvents(mount, studentId) {
    const state = this.conditionalsState;
    const q = state.questions[state.currentIndex];
    const feedbackEl = mount.querySelector('#cond-msg');
    const explEl = mount.querySelector('#cond-explanation');
    const nextBtn = mount.querySelector('#btn-next-cond');

    // Mode Switch buttons
    mount.querySelectorAll('.btn-cond-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeConditionalMode = btn.dataset.mode;
        this.conditionalsState = null;
        this.renderConditionalsGame(mount, studentId);
      });
    });

    // Options click
    mount.querySelectorAll('.btn-cond-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return;

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen === q.correct);

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Абсолютно верно! 🎉</span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';

          mount.querySelectorAll('.btn-cond-opt').forEach(b => {
            if (b.dataset.opt === q.correct) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильный ответ: <strong>${q.correct}</strong></span>`;
        }

        // Show Explanation
        if (explEl && q.explanation) {
          explEl.style.display = 'block';
          explEl.innerHTML = `💡 <strong>Объяснение правила:</strong> ${q.explanation}`;
        }

        mount.querySelectorAll('.btn-cond-opt').forEach(b => b.style.pointerEvents = 'none');
        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      state.currentIndex++;
      if (state.currentIndex < state.questions.length) {
        this.renderConditionalsGame(mount, studentId);
      } else {
        this.finishConditionalsGame(mount, studentId);
      }
    });
  },

  finishConditionalsGame(mount, studentId) {
    const state = this.conditionalsState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'conditionals', `Conditionals (${state.mode})`) : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'conditionals', state.score, 10, { mode: state.mode || this.activeConditionalMode }) : { newTitleUnlocked: null, currentStreak: 0 };

    let secretTitleBanner = '';
    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 раунда условных предложений подряд на 10/10! Титул добавлен в твой профиль.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">⚖️</div>
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #0284c7; font-weight: 700; margin-top: var(--space-3);">
          Серия побед 10/10: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-cond-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: state.score === 10 ? '🎉 10 из 10 в Conditionals!' : 'Раунд завершен!',
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-cond-again')?.addEventListener('click', () => {
          modal.close();
          this.initConditionalsRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 4. GAME: Tenses Quiz (5 Ступеней сложности: Easy -> Middle -> Hard -> Impossible -> Rampage)
  // =========================================================================

  initTensesRound(studentId, levelId) {
    const levelConfig = TENSE_LEVELS.find(l => l.id === levelId) || TENSE_LEVELS[0];
    const allowedTenses = levelConfig.tenses;

    // Filter sentences that match the allowed tenses for this level
    const pool = TENSES_SENTENCES.filter(s => allowedTenses.includes(s.tense));

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(pool).slice(0, 10).map(s => {
      // 4 choices for tense name
      const correctTenseObj = TENSES_CONFIG[s.tense];
      const otherTenses = allowedTenses.filter(t => t !== s.tense);
      const randomOthers = shuffle(otherTenses).slice(0, 3).map(t => TENSES_CONFIG[t]);
      const options = shuffle([correctTenseObj, ...randomOthers]);

      return {
        sentence: s,
        correctTense: correctTenseObj,
        options,
        userAnswer: null,
        isCorrect: null
      };
    });

    this.tensesState = {
      levelId,
      levelConfig,
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderTensesGame(mount, studentId) {
    const isStudent = auth.isStudent();
    const progress = isStudent && studentId ? store.getStudentGameProgress(studentId) : null;
    const unlockedLevels = isStudent ? (progress?.unlockedTenseLevels || ['easy']) : ['easy', 'middle', 'hard', 'impossible', 'rampage'];

    // If currently on level selection or no active quiz
    if (!this.tensesState || this.tensesState.isFinished) {
      this.renderTensesLevelSelect(mount, studentId, unlockedLevels);
      return;
    }

    const state = this.tensesState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #ea580c; box-shadow: var(--shadow-md); max-width: 760px; margin: 0 auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-tenses-back-levels" title="Выбрать другой уровень">
              ⬅ К уровням
            </button>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; color: #c2410c; display: flex; align-items: center; gap: 6px;">
                <span>${state.levelConfig.icon}</span> <span>${state.levelConfig.name}</span>
              </h3>
              <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
                ${state.levelConfig.desc}
              </p>
            </div>
          </div>

          <div style="background: #ffedd5; color: #c2410c; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem;">
            Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
          </div>
        </div>

        <!-- Sentence Card with highlighted verb phrase -->
        <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 1.5px solid #fed7aa; border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-4); text-align: center;">
          <div style="font-size: 0.8rem; font-weight: 700; color: #c2410c; text-transform: uppercase; margin-bottom: 6px;">
            Определите грамматическое время в предложении:
          </div>
          <div style="font-size: 1.35rem; font-weight: 800; color: #7c2d12; line-height: 1.5; margin-bottom: 8px;">
            ${q.sentence.sentence.replace(q.sentence.highlight, `<span style="background: #fed7aa; color: #9a3412; padding: 2px 6px; border-radius: 4px; text-decoration: underline; text-decoration-color: #ea580c;">${q.sentence.highlight}</span>`)}
          </div>
          <div style="font-size: 0.95rem; color: #9a3412; font-style: italic;">
            🇷🇺 ${q.sentence.translation}
          </div>
        </div>

        <!-- Options: 4 Tense Choices -->
        <div class="tenses-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map(tObj => `
            <button type="button" class="btn btn-secondary btn-tense-opt" data-tense-id="${tObj.id}" style="padding: var(--space-3); font-size: 1rem; font-weight: 700; border-radius: var(--radius-lg); text-align: center; justify-content: center;">
              <span>${tObj.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Explanation -->
        <div id="tense-feedback-box" style="min-height: 52px; display: flex; flex-direction: column; gap: 8px;">
          <div id="tense-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
          <div id="tense-explanation" style="display: none; background: #f8fafc; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 8px 12px; font-size: var(--font-size-xs); color: var(--color-text-secondary); line-height: 1.5;"></div>
          <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
            <button type="button" class="btn btn-primary" id="btn-next-tense" style="display: none;">
              <span>Следующее предложение ➔</span>
            </button>
          </div>
        </div>

      </div>
    `;

    this.bindTensesEvents(mount, studentId);
  },

  renderTensesLevelSelect(mount, studentId, unlockedLevels) {
    mount.innerHTML = `
      <div class="card" style="padding: var(--space-5); max-width: 800px; margin: 0 auto; border: 2px solid #ea580c;">
        <div style="text-align: center; margin-bottom: var(--space-5);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">⏱️</div>
          <h3 style="margin: 0; font-size: 1.25rem; color: #c2410c; font-weight: 800;">
            Определение времён английского языка
          </h3>
          <p style="margin: 4px auto 0 auto; font-size: var(--font-size-sm); color: var(--color-text-secondary); max-width: 540px;">
            Пройдите 5 ступеней сложности от Easy до легендарного Rampage. Чтобы открыть следующий уровень, наберите минимум <strong>8 из 10 баллов</strong>!
          </p>
        </div>

        <!-- 5 Tier Level Cards -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${TENSE_LEVELS.map((lvl, index) => {
            const isUnlocked = unlockedLevels.includes(lvl.id);
            const isLast = lvl.id === 'rampage';
            return `
              <div class="tense-level-card ${isUnlocked ? 'unlocked' : 'locked'}" style="background: ${isUnlocked ? '#ffffff' : 'rgba(0,0,0,0.03)'}; border: 1.5px solid ${isUnlocked ? '#ea580c' : 'var(--color-border)'}; border-radius: var(--radius-lg); padding: var(--space-4); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <div style="font-size: 1.8rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: ${isUnlocked ? '#ffedd5' : '#e2e8f0'}; border-radius: 50%;">
                    ${isUnlocked ? lvl.icon : '🔒'}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.05rem; font-weight: 800; color: ${isUnlocked ? '#7c2d12' : '#64748b'};">${lvl.name}</span>
                      ${isLast ? `<span style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 10px;">ФИНАЛЬНЫЙ ТИТУЛ</span>` : ''}
                      ${isUnlocked ? `<span class="badge badge-completed" style="font-size: 0.65rem;">Доступен</span>` : `<span class="badge" style="background:#64748b; color:#fff; font-size:0.65rem;">Заблокирован</span>`}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: ${isUnlocked ? 'var(--color-text-secondary)' : 'var(--color-text-muted)'}; margin-top: 2px;">
                      ${lvl.desc}
                    </div>
                    ${!isUnlocked ? `
                      <div style="font-size: 0.72rem; color: #dc2626; font-weight: 600; margin-top: 2px;">
                        Требуется набрать >= 8/10 на предыдущем уровне (${TENSE_LEVELS[index - 1]?.name})
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div>
                  ${isUnlocked ? `
                    <button type="button" class="btn btn-primary btn-start-tense-level" data-level="${lvl.id}" style="font-weight: 700; padding: 8px 18px; border-radius: var(--radius-full);">
                      ▶ Играть
                    </button>
                  ` : `
                    <button type="button" class="btn btn-secondary" disabled style="opacity: 0.6; border-radius: var(--radius-full); cursor: not-allowed;">
                      🔒 Заблокировано
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    mount.querySelectorAll('.btn-start-tense-level').forEach(btn => {
      btn.addEventListener('click', () => {
        const lvlId = btn.dataset.level;
        this.initTensesRound(studentId, lvlId);
        this.renderTensesGame(mount, studentId);
      });
    });
  },

  bindTensesEvents(mount, studentId) {
    const state = this.tensesState;
    const q = state.questions[state.currentIndex];
    const feedbackEl = mount.querySelector('#tense-msg');
    const explEl = mount.querySelector('#tense-explanation');
    const nextBtn = mount.querySelector('#btn-next-tense');

    mount.querySelector('#btn-tenses-back-levels')?.addEventListener('click', () => {
      this.tensesState = null;
      this.renderTensesGame(mount, studentId);
    });

    mount.querySelectorAll('.btn-tense-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return;

        const chosenTenseId = btn.dataset.tenseId;
        q.userAnswer = chosenTenseId;
        q.isCorrect = (chosenTenseId === q.sentence.tense);

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Точно в цель! Это <strong>${q.correctTense.name}</strong> (${q.correctTense.formula})</span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';

          mount.querySelectorAll('.btn-tense-opt').forEach(b => {
            if (b.dataset.tenseId === q.sentence.tense) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильное время: <strong>${q.correctTense.name}</strong> (${q.correctTense.formula})</span>`;
        }

        if (explEl && q.sentence.explanation) {
          explEl.style.display = 'block';
          explEl.innerHTML = `💡 <strong>Почему это время:</strong> ${q.sentence.explanation}`;
        }

        mount.querySelectorAll('.btn-tense-opt').forEach(b => b.style.pointerEvents = 'none');
        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      state.currentIndex++;
      if (state.currentIndex < state.questions.length) {
        this.renderTensesGame(mount, studentId);
      } else {
        this.finishTensesGame(mount, studentId);
      }
    });
  },

  finishTensesGame(mount, studentId) {
    const state = this.tensesState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'tenses', `Определение времён (${state.levelConfig.name})`) : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'tenses', state.score, 10, {
      level: state.levelId
    }) : { newTitleUnlocked: null, currentStreak: 0, levelUnlocked: null };

    let unlockBanner = '';
    if (gameResult.levelUnlocked) {
      const nextLvlObj = TENSE_LEVELS.find(l => l.id === gameResult.levelUnlocked);
      unlockBanner += `
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">🔓</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Разблокирован новый уровень: «${nextLvlObj ? nextLvlObj.name : gameResult.levelUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Вы набрали ${state.score} из 10 баллов и открыли следующую ступень сложности!
          </div>
        </div>
      `;
    }

    if (gameResult.newTitleUnlocked) {
      unlockBanner += `
        <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.5rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.25rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Поздравляем! Ты выполнил особое условие и разблокировал этот титул в кастомизации своего профиля!
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${unlockBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">⏱️</div>
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 6px;">
          Уровень «${state.levelConfig.name}» пройден!
        </h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-3);">
          Ваш результат: <strong>${state.score} из 10</strong> правильных ответов
        </p>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #c2410c; font-weight: 700; margin-top: var(--space-3);">
          ⏱️ Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-tense-again" style="width: 100%;">
        ⬅ К списку уровней времён
      </button>
    `;

    modal.open({
      title: 'Результаты раунда',
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-tense-again')?.addEventListener('click', () => {
          modal.close();
          this.tensesState = null;
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 5. GAME: Sentence Builder (Конструктор предложений)
  // =========================================================================

  initBuilderRound(studentId) {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const selectedSentences = shuffle(SENTENCE_BUILDER_DATA).slice(0, 10);

    const questions = selectedSentences.map((s, index) => {
      const chips = s.words.map((w, wIdx) => ({
        id: `${index}-${wIdx}`,
        word: w
      }));

      return {
        id: s.id,
        ru: s.ru,
        en: s.en,
        hint: s.hint,
        availableChips: shuffle(chips),
        assembledChips: [],
        isAnswered: false,
        isCorrect: null
      };
    });

    this.builderState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderBuilderGame(mount, studentId) {
    if (!this.builderState || this.builderState.isFinished) {
      this.initBuilderRound(studentId);
    }

    const state = this.builderState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid var(--color-primary); box-shadow: var(--shadow-md); max-width: 780px; margin: 0 auto;">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-primary); display: flex; align-items: center; gap: 6px;">
              <span>🧩</span> <span>Конструктор предложений</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              Соберите английское предложение из перемешанных слов. 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #bae6fd;">
              Задание ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-builder" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #0284c7, #4f46e5); transition: width 0.3s ease;"></div>
        </div>

        <!-- Prompt Card with Russian translation -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1.5px solid #bae6fd; border-radius: var(--radius-xl); padding: var(--space-4) var(--space-5); text-align: center; margin-bottom: var(--space-4);">
          <div style="font-size: 0.8rem; font-weight: 700; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">
            Переведите и соберите предложение:
          </div>
          <div style="font-size: 1.35rem; font-weight: 800; color: #0c4a6e; line-height: 1.5;">
            🇷🇺 «${q.ru}»
          </div>
        </div>

        <!-- Assembly Zone (Selected words) -->
        <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>Собранное предложение (нажмите на слово, чтобы вернуть в пул):</span>
          <span style="color: var(--color-primary);">${q.assembledChips.length} / ${q.assembledChips.length + q.availableChips.length} слов</span>
        </div>
        <div class="builder-assembly-area ${q.assembledChips.length === 0 ? 'empty' : ''}" id="builder-assembly">
          ${q.assembledChips.length === 0 ? `
            <span>Кликайте по словам из блока ниже, чтобы собрать предложение...</span>
          ` : q.assembledChips.map(c => `
            <button type="button" class="word-chip in-assembly" data-chip-id="${c.id}" ${q.isAnswered ? 'disabled' : ''} title="Кликните, чтобы убрать">
              <span>${c.word}</span>
              <span style="font-size: 0.7rem; opacity: 0.8;">✕</span>
            </button>
          `).join('')}
        </div>

        <!-- Word Pool (Remaining words to pick) -->
        <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
          Доступные слова:
        </div>
        <div class="builder-pool-area" id="builder-pool">
          ${q.availableChips.length === 0 ? `
            <span style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic;">Все слова расставлены! Нажмите «Проверить» ниже.</span>
          ` : q.availableChips.map(c => `
            <button type="button" class="word-chip" data-chip-id="${c.id}" ${q.isAnswered ? 'disabled' : ''}>
              <span>${c.word}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Control Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: var(--space-4); min-height: 48px;">
          <div id="builder-feedback" style="font-weight: 700; font-size: 0.95rem; flex: 1;"></div>
          <div style="display: flex; gap: 8px;">
            ${!q.isAnswered ? `
              <button type="button" class="btn btn-secondary btn-sm" id="btn-reset-builder-chips" ${q.assembledChips.length === 0 ? 'disabled' : ''}>
                ↩ Сбросить
              </button>
              <button type="button" class="btn btn-primary" id="btn-check-builder" ${q.assembledChips.length === 0 ? 'disabled' : ''}>
                ✓ Проверить
              </button>
            ` : `
              <button type="button" class="btn btn-primary" id="btn-next-builder">
                <span>${currentNum === totalQ ? 'Завершить игру ➔' : 'Следующее предложение ➔'}</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindBuilderEvents(mount, studentId);
  },

  bindBuilderEvents(mount, studentId) {
    const state = this.builderState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#builder-feedback');

    mount.querySelector('#btn-restart-builder')?.addEventListener('click', () => {
      this.initBuilderRound(studentId);
      this.renderBuilderGame(mount, studentId);
    });

    // Add chip from pool to assembly
    mount.querySelectorAll('#builder-pool .word-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.isAnswered) return;
        const chipId = btn.dataset.chipId;
        const chipIndex = q.availableChips.findIndex(c => c.id === chipId);
        if (chipIndex !== -1) {
          const [chip] = q.availableChips.splice(chipIndex, 1);
          q.assembledChips.push(chip);
          this.renderBuilderGame(mount, studentId);
        }
      });
    });

    // Remove chip from assembly back to pool
    mount.querySelectorAll('#builder-assembly .word-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.isAnswered) return;
        const chipId = btn.dataset.chipId;
        const chipIndex = q.assembledChips.findIndex(c => c.id === chipId);
        if (chipIndex !== -1) {
          const [chip] = q.assembledChips.splice(chipIndex, 1);
          q.availableChips.push(chip);
          this.renderBuilderGame(mount, studentId);
        }
      });
    });

    // Reset assembly
    mount.querySelector('#btn-reset-builder-chips')?.addEventListener('click', () => {
      if (q.isAnswered) return;
      q.availableChips.push(...q.assembledChips);
      q.assembledChips = [];
      this.renderBuilderGame(mount, studentId);
    });

    // Check answer
    mount.querySelector('#btn-check-builder')?.addEventListener('click', () => {
      if (q.isAnswered || q.assembledChips.length === 0) return;

      q.isAnswered = true;
      const assembledText = q.assembledChips.map(c => c.word).join(' ').toLowerCase().trim();
      const expectedClean = q.en.toLowerCase().replace(/[.?!,;:]/g, '').trim();
      const assembledClean = assembledText.replace(/[.?!,;:]/g, '').trim();

      q.isCorrect = (assembledClean === expectedClean);

      if (q.isCorrect) {
        state.score++;
        feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Великолепно! Предложение собрано абсолютно верно! 🎉</span>`;
      } else {
        feedbackEl.innerHTML = `
          <div style="color: #dc2626;">✕ Не совсем верно.</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-top: 2px;">
            Правильный вариант: <strong>${q.en}</strong>
            ${q.hint ? `<br>💡 <em>${q.hint}</em>` : ''}
          </div>
        `;
      }

      this.renderBuilderGame(mount, studentId);
      const newFeedback = mount.querySelector('#builder-feedback');
      if (newFeedback) newFeedback.innerHTML = feedbackEl.innerHTML;
    });

    // Next question
    mount.querySelector('#btn-next-builder')?.addEventListener('click', () => {
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderBuilderGame(mount, studentId);
      } else {
        this.finishBuilderGame(mount, studentId);
      }
    });
  },

  finishBuilderGame(mount, studentId) {
    const state = this.builderState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'builder', 'Конструктор предложений') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'builder', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Идеальный конструктор!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '🧩'}</div>
        <h3 style="font-size: 1.3rem; color: var(--color-primary); margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 предложений собрано верно
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #0284c7; font-weight: 700; margin-top: var(--space-3);">
          🧩 Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-builder-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-builder-again')?.addEventListener('click', () => {
          modal.close();
          this.initBuilderRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 6. GAME: Prepositions Catcher (Ловец предлогов)
  // =========================================================================

  initPrepositionsRound(studentId) {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(PREPOSITIONS_DATA).slice(0, 10).map(q => ({
      ...q,
      userAnswer: null,
      isCorrect: null
    }));

    this.prepositionsState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderPrepositionsGame(mount, studentId) {
    if (!this.prepositionsState || this.prepositionsState.isFinished) {
      this.initPrepositionsRound(studentId);
    }

    const state = this.prepositionsState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    const sentenceHtml = q.sentence.replace('___', `<span class="preposition-blank" id="prep-target-blank">${q.userAnswer ? q.userAnswer : '___'}</span>`);

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #0891b2; box-shadow: var(--shadow-md); max-width: 760px; margin: 0 auto;">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: #0e7490; display: flex; align-items: center; gap: 6px;">
              <span>🎯</span> <span>Ловец предлогов (Prepositions)</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              Выберите подходящий по контексту предлог. 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #ecfeff; color: #0e7490; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #a5f3fc;">
              Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-prepositions" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #0891b2, #0284c7); transition: width 0.3s ease;"></div>
        </div>

        <!-- Sentence Card with Missing Preposition Blank -->
        <div style="background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%); border: 1.5px solid #a5f3fc; border-radius: var(--radius-xl); padding: var(--space-5); text-align: center; margin-bottom: var(--space-4);">
          <div style="font-size: 0.8rem; font-weight: 700; color: #0e7490; text-transform: uppercase; margin-bottom: 6px;">
            Вставьте правильный предлог:
          </div>
          <div style="font-size: 1.45rem; font-weight: 800; color: #164e63; line-height: 1.6; margin-bottom: 8px;">
            ${sentenceHtml}
          </div>
          <div style="font-size: 1rem; color: #0891b2; font-style: italic;">
            🇷🇺 «${q.translation}»
          </div>
        </div>

        <!-- Options: 4 Prepositions -->
        <div class="prepositions-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map(opt => `
            <button type="button" class="btn btn-secondary btn-prep-opt" data-opt="${opt}" style="padding: var(--space-3); font-size: 1.15rem; font-weight: 800; border-radius: var(--radius-lg); text-align: center; justify-content: center; min-height: 52px;">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div id="prep-feedback-box" style="min-height: 52px; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div id="prep-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
            <button type="button" class="btn btn-primary" id="btn-next-prep" style="display: none; margin-left: auto;">
              <span>${currentNum === totalQ ? 'Завершить игру ➔' : 'Следующее предложение ➔'}</span>
            </button>
          </div>
          <div id="prep-rule-box" style="display: none; background: rgba(8, 145, 178, 0.08); border-left: 3px solid #0891b2; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; color: #164e63;"></div>
        </div>
      </div>
    `;

    this.bindPrepositionsEvents(mount, studentId);
  },

  bindPrepositionsEvents(mount, studentId) {
    const state = this.prepositionsState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#prep-msg');
    const ruleBox = mount.querySelector('#prep-rule-box');
    const nextBtn = mount.querySelector('#btn-next-prep');
    const blankEl = mount.querySelector('#prep-target-blank');

    mount.querySelector('#btn-restart-prepositions')?.addEventListener('click', () => {
      this.initPrepositionsRound(studentId);
      this.renderPrepositionsGame(mount, studentId);
    });

    mount.querySelectorAll('.btn-prep-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return;

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen.toLowerCase().trim() === q.correct.toLowerCase().trim());

        if (blankEl) {
          blankEl.textContent = chosen;
        }

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          if (blankEl) {
            blankEl.style.color = '#16a34a';
            blankEl.style.borderBottomColor = '#16a34a';
          }
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Точно! Предлог «${q.correct}» идеально подходит!</span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';
          if (blankEl) {
            blankEl.style.color = '#dc2626';
            blankEl.style.borderBottomColor = '#dc2626';
          }

          // Highlight correct option
          mount.querySelectorAll('.btn-prep-opt').forEach(b => {
            if (b.dataset.opt.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильный предлог: <strong>${q.correct}</strong></span>`;
        }

        if (q.rule && ruleBox) {
          ruleBox.style.display = 'block';
          ruleBox.innerHTML = `💡 <strong>Правило:</strong> ${q.rule}`;
        }

        mount.querySelectorAll('.btn-prep-opt').forEach(b => b.style.pointerEvents = 'none');

        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderPrepositionsGame(mount, studentId);
      } else {
        this.finishPrepositionsGame(mount, studentId);
      }
    });
  },

  finishPrepositionsGame(mount, studentId) {
    const state = this.prepositionsState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'prepositions', 'Ловец предлогов') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'prepositions', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Идеальный ловец предлогов!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '🎯'}</div>
        <h3 style="font-size: 1.3rem; color: #0e7490; margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 правильных предлогов
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #0e7490; font-weight: 700; margin-top: var(--space-3);">
          🎯 Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-prep-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-prep-again')?.addEventListener('click', () => {
          modal.close();
          this.initPrepositionsRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 7. GAME: Phrasal Verbs Trainer (Фразовые глаголы)
  // =========================================================================

  initPhrasalRound(studentId) {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(PHRASAL_VERBS_DATA).slice(0, 10).map(q => ({
      ...q,
      userAnswer: null,
      isCorrect: null
    }));

    this.phrasalState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderPhrasalGame(mount, studentId) {
    if (!this.phrasalState || this.phrasalState.isFinished) {
      this.initPhrasalRound(studentId);
    }

    const state = this.phrasalState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    const isContext = q.type === 'context';
    const sentenceHtml = isContext ? q.sentence.replace('___', `<span class="preposition-blank">${q.userAnswer ? q.userAnswer : '___'}</span>`) : '';

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #ec4899; box-shadow: var(--shadow-md); max-width: 760px; margin: 0 auto;">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: #be185d; display: flex; align-items: center; gap: 6px;">
              <span>🚀</span> <span>Тренажер фразовых глаголов</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              ${isContext ? 'Подберите правильную частицу к глаголу.' : 'Выберите точный перевод фразового глагола.'} 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #fdf2f8; color: #be185d; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #fbcfe8;">
              Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-phrasal" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #ec4899, #db2777); transition: width 0.3s ease;"></div>
        </div>

        <!-- Question Card -->
        <div style="background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border: 1.5px solid #fbcfe8; border-radius: var(--radius-xl); padding: var(--space-5); text-align: center; margin-bottom: var(--space-4);">
          ${isContext ? `
            <div style="font-size: 0.8rem; font-weight: 700; color: #be185d; text-transform: uppercase; margin-bottom: 6px;">
              Вставьте частицу во фразовый глагол (${q.verb}):
            </div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #831843; line-height: 1.6; margin-bottom: 8px;">
              ${sentenceHtml}
            </div>
            <div style="font-size: 1rem; color: #be185d; font-style: italic;">
              🇷🇺 «${q.translation}»
            </div>
          ` : `
            <div style="font-size: 0.8rem; font-weight: 700; color: #be185d; text-transform: uppercase; margin-bottom: 6px;">
              Значение фразового глагола:
            </div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #831843; margin-bottom: 8px;">
              ${q.phrasal}
            </div>
            <div style="font-size: 0.95rem; color: #9d174d;">
              ${q.question}
            </div>
          `}
        </div>

        <!-- Options Grid -->
        <div class="phrasal-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map(opt => `
            <button type="button" class="btn btn-secondary btn-phrasal-opt" data-opt="${opt}" style="padding: var(--space-3); font-size: 1.05rem; font-weight: 700; border-radius: var(--radius-lg); text-align: center; justify-content: center; min-height: 52px;">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div id="phrasal-feedback-box" style="min-height: 52px; display: flex; flex-direction: column; justify-content: center; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div id="phrasal-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
            <button type="button" class="btn btn-primary" id="btn-next-phrasal" style="display: none; margin-left: auto;">
              <span>${currentNum === totalQ ? 'Завершить игру ➔' : 'Следующий вопрос ➔'}</span>
            </button>
          </div>
          <div id="phrasal-info-box" style="display: none; background: rgba(236, 72, 153, 0.08); border-left: 3px solid #ec4899; padding: 8px 12px; border-radius: 4px; font-size: 0.85rem; color: #831843;"></div>
        </div>
      </div>
    `;

    this.bindPhrasalEvents(mount, studentId);
  },

  bindPhrasalEvents(mount, studentId) {
    const state = this.phrasalState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#phrasal-msg');
    const infoBox = mount.querySelector('#phrasal-info-box');
    const nextBtn = mount.querySelector('#btn-next-phrasal');

    mount.querySelector('#btn-restart-phrasal')?.addEventListener('click', () => {
      this.initPhrasalRound(studentId);
      this.renderPhrasalGame(mount, studentId);
    });

    mount.querySelectorAll('.btn-phrasal-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return;

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen.toLowerCase().trim() === q.correct.toLowerCase().trim());

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Верно! Отличное знание фразового глагола!</span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';

          mount.querySelectorAll('.btn-phrasal-opt').forEach(b => {
            if (b.dataset.opt.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильный ответ: <strong>${q.correct}</strong></span>`;
        }

        if (infoBox) {
          infoBox.style.display = 'block';
          infoBox.innerHTML = `💡 ${q.meaning || q.example || ''}`;
        }

        mount.querySelectorAll('.btn-phrasal-opt').forEach(b => b.style.pointerEvents = 'none');

        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderPhrasalGame(mount, studentId);
      } else {
        this.finishPhrasalGame(mount, studentId);
      }
    });
  },

  finishPhrasalGame(mount, studentId) {
    const state = this.phrasalState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'phrasal', 'Фразовые глаголы') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'phrasal', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Идеальный знаток фразовых глаголов!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '🚀'}</div>
        <h3 style="font-size: 1.3rem; color: #be185d; margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 правильных ответов
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #be185d; font-weight: 700; margin-top: var(--space-3);">
          🚀 Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-phrasal-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-phrasal-again')?.addEventListener('click', () => {
          modal.close();
          this.initPhrasalRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 8. GAME: Find the Mistake (Найди ошибку)
  // =========================================================================

  initMistakesRound(studentId) {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(FIND_MISTAKE_DATA).slice(0, 10).map(q => ({
      ...q,
      clickedIndex: null,
      isResolved: false,
      isCorrect: null,
      mistakeAttempts: 0
    }));

    this.mistakesState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
  },

  renderMistakesGame(mount, studentId) {
    if (!this.mistakesState || this.mistakesState.isFinished) {
      this.initMistakesRound(studentId);
    }

    const state = this.mistakesState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #10b981; box-shadow: var(--shadow-md); max-width: 780px; margin: 0 auto;">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: #047857; display: flex; align-items: center; gap: 6px;">
              <span>🕵️</span> <span>Грамматический детектив: Найди ошибку</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              В предложении допущена ровно одна ошибка. Кликните по ошибочному слову! 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #a7f3d0;">
              Предложение ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-mistakes" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; margin-bottom: var(--space-4);">
          <div style="width: ${progressPercent}%; height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.3s ease;"></div>
        </div>

        <!-- Interactive Sentence Tokens Wrap -->
        <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px; text-align: center;">
          Нажмите на слово, в котором допущена грамматическая ошибка:
        </div>
        <div class="mistake-tokens-wrap">
          ${q.tokens.map((word, idx) => {
            const isErrorTarget = idx === q.errorIndex;
            let statusClass = '';
            if (q.isResolved && isErrorTarget) statusClass = 'selected-error';

            return `
              <button type="button" class="mistake-word-btn ${statusClass}" data-token-idx="${idx}" ${q.isResolved ? 'disabled' : ''}>
                <span>${word}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Feedback & Rule Explanation Card -->
        <div id="mistake-feedback-box" style="min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div id="mistake-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
            <button type="button" class="btn btn-primary" id="btn-next-mistake" style="display: none; margin-left: auto;">
              <span>${currentNum === totalQ ? 'Завершить игру ➔' : 'Следующее предложение ➔'}</span>
            </button>
          </div>
          <div id="mistake-explanation-card" style="display: none; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.88rem; color: #064e3b; line-height: 1.5;"></div>
        </div>
      </div>
    `;

    this.bindMistakesEvents(mount, studentId);
  },

  bindMistakesEvents(mount, studentId) {
    const state = this.mistakesState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#mistake-msg');
    const expCard = mount.querySelector('#mistake-explanation-card');
    const nextBtn = mount.querySelector('#btn-next-mistake');

    mount.querySelector('#btn-restart-mistakes')?.addEventListener('click', () => {
      this.initMistakesRound(studentId);
      this.renderMistakesGame(mount, studentId);
    });

    mount.querySelectorAll('.mistake-word-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.isResolved) return;

        const idx = Number(btn.dataset.tokenIdx);
        q.clickedIndex = idx;

        if (idx === q.errorIndex) {
          // Found the mistake!
          q.isResolved = true;
          if (q.mistakeAttempts === 0) {
            state.score++;
            q.isCorrect = true;
          }

          btn.classList.add('selected-error');
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Точно! Ошибка найдена в слове «${q.tokens[idx]}»!</span>`;

          if (expCard) {
            expCard.style.display = 'block';
            expCard.innerHTML = `
              <div style="font-weight: 800; margin-bottom: 2px;">
                ❌ Ошибка: <span style="color: #dc2626; text-decoration: line-through;">${q.errorWord}</span> ➔ ✅ Правильно: <span style="color: #16a34a;">${q.correction}</span>
              </div>
              <div style="font-size: 0.84rem; opacity: 0.9;">💡 <strong>Правило:</strong> ${q.explanation}</div>
            `;
          }

          mount.querySelectorAll('.mistake-word-btn').forEach(b => b.disabled = true);

          if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
            nextBtn.focus();
          }
        } else {
          // Wrong token clicked
          q.mistakeAttempts++;
          btn.classList.add('wrong-choice');
          setTimeout(() => btn.classList.remove('wrong-choice'), 600);

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ В слове «${q.tokens[idx]}» ошибки нет. Ищите дальше!</span>`;

          // If failed twice, reveal the error
          if (q.mistakeAttempts >= 2) {
            q.isResolved = true;
            q.isCorrect = false;

            const correctBtn = mount.querySelector(`.mistake-word-btn[data-token-idx="${q.errorIndex}"]`);
            if (correctBtn) correctBtn.classList.add('selected-error');

            feedbackEl.innerHTML = `<span style="color: #dc2626;">Ошибка была в слове «${q.tokens[q.errorIndex]}».</span>`;

            if (expCard) {
              expCard.style.display = 'block';
              expCard.innerHTML = `
                <div style="font-weight: 800; margin-bottom: 2px;">
                  ❌ Ошибка: <span style="color: #dc2626; text-decoration: line-through;">${q.errorWord}</span> ➔ ✅ Правильно: <span style="color: #16a34a;">${q.correction}</span>
                </div>
                <div style="font-size: 0.84rem; opacity: 0.9;">💡 <strong>Правило:</strong> ${q.explanation}</div>
              `;
            }

            mount.querySelectorAll('.mistake-word-btn').forEach(b => b.disabled = true);

            if (nextBtn) {
              nextBtn.style.display = 'inline-flex';
              nextBtn.focus();
            }
          }
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderMistakesGame(mount, studentId);
      } else {
        this.finishMistakesGame(mount, studentId);
      }
    });
  },

  finishMistakesGame(mount, studentId) {
    const state = this.mistakesState;
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'mistakes', 'Найди ошибку') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'mistakes', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Безупречный детектив ошибок!' : 'Раунд завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '🕵️'}</div>
        <h3 style="font-size: 1.3rem; color: #047857; margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 найденных ошибок с первой попытки
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #047857; font-weight: 700; margin-top: var(--space-3);">
          🕵️ Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-mistakes-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-mistakes-again')?.addEventListener('click', () => {
          modal.close();
          this.initMistakesRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  },

  // =========================================================================
  // 9. GAME: Synonyms & Antonyms Sprint (Синонимы и Антонимы)
  // =========================================================================

  initSynonymsRound(studentId) {
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const questions = shuffle(SYNONYMS_ANTONYMS_DATA).slice(0, 10).map(q => ({
      ...q,
      userAnswer: null,
      isCorrect: null,
      timedOut: false
    }));

    if (this.synonymsState?.timer) {
      clearInterval(this.synonymsState.timer);
    }

    this.synonymsState = {
      questions,
      currentIndex: 0,
      score: 0,
      isFinished: false,
      timeLeft: 15,
      timer: null
    };
  },

  renderSynonymsGame(mount, studentId) {
    if (!this.synonymsState || this.synonymsState.isFinished) {
      this.initSynonymsRound(studentId);
    }

    const state = this.synonymsState;
    const totalQ = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const q = state.questions[state.currentIndex];
    const progressPercent = Math.round((currentNum / totalQ) * 100);

    const isSynonym = q.mode === 'synonym';
    const modeBadgeBg = isSynonym ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    const modeTitle = isSynonym ? '🟢 Подберите СИНОНИМ (близкое по смыслу слово):' : '🟣 Подберите АНТОНИМ (противоположное по смыслу слово):';

    mount.innerHTML = `
      <div class="card game-play-card" style="padding: var(--space-5); border: 2px solid #8b5cf6; box-shadow: var(--shadow-md); max-width: 760px; margin: 0 auto;">
        <!-- Sub-header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: #7c3aed; display: flex; align-items: center; gap: 6px;">
              <span>⚡</span> <span>Спринт: Синонимы и Антонимы</span>
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              Быстрый блиц! Выберите правильное соответствие за 15 секунд. 3 победы 10/10 подряд открывают секретный титул!
            </p>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: #f5f3ff; color: #7c3aed; padding: 4px 12px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; border: 1px solid #ddd6fe;">
              Вопрос ${currentNum} из ${totalQ} • Счет: ${state.score}
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-restart-synonyms" title="Начать заново">
              🔄 Заново
            </button>
          </div>
        </div>

        <!-- Sprint Countdown Timer Bar -->
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
          <span>⏱️ Время на ответ:</span>
          <span id="sprint-timer-sec" style="color: #7c3aed; font-weight: 800;">15 сек</span>
        </div>
        <div class="sprint-timer-track">
          <div class="sprint-timer-fill" id="sprint-timer-bar" style="width: 100%;"></div>
        </div>

        <!-- Target Word Card -->
        <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 1.5px solid #ddd6fe; border-radius: var(--radius-xl); padding: var(--space-5); text-align: center; margin-bottom: var(--space-4);">
          <div style="display: inline-block; background: ${modeBadgeBg}; color: #ffffff; font-size: 0.8rem; font-weight: 800; padding: 4px 14px; border-radius: var(--radius-full); margin-bottom: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            ${modeTitle}
          </div>
          <div style="font-size: 2.6rem; font-weight: 800; color: #4c1d95; margin: 4px 0; letter-spacing: 0.5px;">
            ${q.word}
          </div>
        </div>

        <!-- Options: 4 Word Choices (Pure English, no giveaway translations) -->
        <div class="synonyms-options-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: var(--space-4);">
          ${q.options.map(opt => `
            <button type="button" class="btn btn-secondary btn-synonym-opt" data-opt="${opt}" style="padding: var(--space-3) var(--space-4); font-size: 1.1rem; font-weight: 700; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; min-height: 56px; text-align: center;">
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <!-- Feedback & Next Button -->
        <div id="synonyms-feedback-box" style="min-height: 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div id="synonyms-msg" style="font-weight: 700; font-size: 0.95rem;"></div>
          <button type="button" class="btn btn-primary" id="btn-next-synonyms" style="display: none; margin-left: auto;">
            <span>${currentNum === totalQ ? 'Завершить спринт ➔' : 'Следующее слово ➔'}</span>
          </button>
        </div>
      </div>
    `;

    this.bindSynonymsEvents(mount, studentId);
  },

  bindSynonymsEvents(mount, studentId) {
    const state = this.synonymsState;
    const q = state.questions[state.currentIndex];
    const totalQ = state.questions.length;
    const feedbackEl = mount.querySelector('#synonyms-msg');
    const nextBtn = mount.querySelector('#btn-next-synonyms');
    const timerSecEl = mount.querySelector('#sprint-timer-sec');
    const timerBarEl = mount.querySelector('#sprint-timer-bar');

    mount.querySelector('#btn-restart-synonyms')?.addEventListener('click', () => {
      if (state.timer) clearInterval(state.timer);
      this.initSynonymsRound(studentId);
      this.renderSynonymsGame(mount, studentId);
    });

    // Start 15s Timer
    if (state.timer) clearInterval(state.timer);
    state.timeLeft = 15;

    const stopTimer = () => {
      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
    };

    state.timer = setInterval(() => {
      state.timeLeft -= 0.1;
      if (state.timeLeft <= 0) {
        stopTimer();
        state.timeLeft = 0;
        if (!q.userAnswer) {
          q.timedOut = true;
          q.userAnswer = 'timeout';
          q.isCorrect = false;

          if (timerSecEl) timerSecEl.textContent = 'Время вышло!';
          if (timerBarEl) timerBarEl.style.width = '0%';

          mount.querySelectorAll('.btn-synonym-opt').forEach(b => {
            b.style.pointerEvents = 'none';
            if (b.dataset.opt.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          if (feedbackEl) {
            feedbackEl.innerHTML = `<span style="color: #dc2626;">⏱️ Время вышло! Правильный ответ: <strong>${q.correct} (${q.correctRu})</strong></span>`;
          }

          if (nextBtn) {
            nextBtn.style.display = 'inline-flex';
            nextBtn.focus();
          }
        }
      } else {
        const sec = Math.ceil(state.timeLeft);
        if (timerSecEl) timerSecEl.textContent = `${sec} сек`;
        if (timerBarEl) timerBarEl.style.width = `${(state.timeLeft / 15) * 100}%`;
      }
    }, 100);

    // Option Click Handlers
    mount.querySelectorAll('.btn-synonym-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (q.userAnswer) return;
        stopTimer();

        const chosen = btn.dataset.opt;
        q.userAnswer = chosen;
        q.isCorrect = (chosen.toLowerCase().trim() === q.correct.toLowerCase().trim());

        if (q.isCorrect) {
          state.score++;
          btn.style.background = '#22c55e';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#16a34a';
          feedbackEl.innerHTML = `<span style="color: #16a34a;">✓ Идеально! <strong>${q.correct}</strong> (${q.correctRu})</span>`;
        } else {
          btn.style.background = '#ef4444';
          btn.style.color = '#ffffff';
          btn.style.borderColor = '#dc2626';

          mount.querySelectorAll('.btn-synonym-opt').forEach(b => {
            if (b.dataset.opt.toLowerCase().trim() === q.correct.toLowerCase().trim()) {
              b.style.background = '#22c55e';
              b.style.color = '#ffffff';
              b.style.borderColor = '#16a34a';
            }
          });

          feedbackEl.innerHTML = `<span style="color: #dc2626;">✕ Ошибка! Правильно: <strong>${q.correct} (${q.correctRu})</strong></span>`;
        }

        mount.querySelectorAll('.btn-synonym-opt').forEach(b => b.style.pointerEvents = 'none');

        if (nextBtn) {
          nextBtn.style.display = 'inline-flex';
          nextBtn.focus();
        }
      });
    });

    nextBtn?.addEventListener('click', () => {
      stopTimer();
      if (state.currentIndex < totalQ - 1) {
        state.currentIndex++;
        this.renderSynonymsGame(mount, studentId);
      } else {
        this.finishSynonymsGame(mount, studentId);
      }
    });
  },

  finishSynonymsGame(mount, studentId) {
    const state = this.synonymsState;
    if (state.timer) clearInterval(state.timer);
    state.isFinished = true;

    const isStudent = auth.isStudent();
    const awardResult = isStudent && studentId ? store.awardGamePoints(studentId, state.score, 'synonyms', 'Синонимы и Антонимы') : { pointsAwarded: 0, weeklyTotal: 0 };
    const gameResult = isStudent && studentId ? store.recordGameResult(studentId, 'synonyms', state.score, 10) : { newTitleUnlocked: null, currentStreak: 0 };

    const isPerfect = state.score === 10;
    const modalTitle = isPerfect ? '🎯 10 из 10! Невероятная скорость и точность!' : 'Спринт завершен!';
    let secretTitleBanner = '';

    if (gameResult.newTitleUnlocked) {
      secretTitleBanner = `
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-md);">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">👑</div>
          <div style="font-size: 1.15rem; font-weight: 800;">Открыт секретный титул «${gameResult.newTitleUnlocked}»!</div>
          <div style="font-size: var(--font-size-xs); margin-top: 4px; opacity: 0.95;">
            Ты прошел 3 игры подряд на 100%! Теперь этот титул доступен в кастомизации твоего профиля.
          </div>
        </div>
      `;
    }

    const bodyHtml = `
      <div style="text-align: center; padding: var(--space-4);">
        ${secretTitleBanner}
        <div style="font-size: 2.5rem; margin-bottom: 4px;">${isPerfect ? '🎉' : '⚡'}</div>
        <h3 style="font-size: 1.3rem; color: #7c3aed; margin-bottom: 6px;">
          Ваш результат: ${state.score} из 10 правильных ответов
        </h3>

        ${isStudent ? `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 320px; margin: var(--space-3) auto;">
          <div style="font-size: 1.5rem; font-weight: 800; color: #f59e0b;">+${awardResult.pointsAwarded} ⭐</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Начислено в профиль (Лимит недели: ${awardResult.weeklyTotal} / 100 ⭐)
          </div>
        </div>

        <div style="font-size: var(--font-size-sm); color: #7c3aed; font-weight: 700; margin-top: var(--space-3);">
          ⚡ Серия побед 10/10 подряд: <strong>${gameResult.currentStreak} из 3</strong>
        </div>
        ` : `
        <div style="background: var(--color-bg-app); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 340px; margin: var(--space-3) auto;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #6366f1;">🎓 Режим преподавателя</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 2px;">
            Подсчёт ведётся только внутри игры (без начисления в профиль)
          </div>
        </div>
        `}
      </div>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-primary" id="btn-modal-synonyms-again" style="width: 100%;">
        🔄 Играть ещё раз
      </button>
    `;

    modal.open({
      title: modalTitle,
      bodyHtml,
      footerHtml,
      onOpen: () => {
        document.getElementById('btn-modal-synonyms-again')?.addEventListener('click', () => {
          modal.close();
          this.initSynonymsRound(studentId);
          this.render(mount.closest('.games-view-container').parentElement);
        });
      }
    });
  }

};
