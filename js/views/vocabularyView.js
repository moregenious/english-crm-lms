/**
 * Vocabulary Pool View - Dedicated Vocabulary Bank partitioned by Textbooks
 * Supports multi-year learning progression, search, filtering, and transcription formatting.
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export const VocabularyView = {
  selectedTextbook: 'all',
  selectedStudentId: 'all',
  searchQuery: '',
  selectedMonth: 'all',
  sortBy: 'order', // 'order' | 'alpha-az' | 'alpha-za'
  viewMode: 'grid', // 'grid' (flashcard mode hidden per user request)
  flashcardIndex: 0,
  flashcardFlipped: false,

  render(container) {
    const activeEl = document.activeElement;
    const activeId = (activeEl && container.contains(activeEl)) ? activeEl.id : null;
    const activeStart = activeEl?.selectionStart;
    const activeEnd = activeEl?.selectionEnd;

    const role = auth.getRole();
    const isStudent = (role === auth.ROLE_STUDENT);
    const currentUser = auth.getCurrentUser();

    let studentData = null;
    let poolData = null;
    let textbooksList = [];

    if (isStudent) {
      this.selectedStudentId = auth.currentStudentId || (currentUser ? currentUser.id : null);
      poolData = store.getStudentVocabularyPool(this.selectedStudentId);
      studentData = poolData.student;
      textbooksList = poolData.textbooks || [];
    } else {
      // Teacher or Admin
      if (this.selectedStudentId !== 'all') {
        poolData = store.getStudentVocabularyPool(this.selectedStudentId);
        studentData = poolData.student;
        textbooksList = poolData.textbooks || [];
      } else {
        poolData = store.getTextbookVocabularyPool();
        textbooksList = poolData.textbooks || [];
      }
    }

    // Default selected textbook to student's current textbook if set to 'all' and student has one
    if (this.selectedTextbook === 'all' && studentData?.textbook && textbooksList.includes(studentData.textbook)) {
      this.selectedTextbook = studentData.textbook;
    } else if (this.selectedTextbook !== 'all' && !textbooksList.includes(this.selectedTextbook)) {
      this.selectedTextbook = textbooksList[0] || 'all';
    }

    // Get words based on selected textbook
    let words = [];
    if (isStudent || this.selectedStudentId !== 'all') {
      if (this.selectedTextbook === 'all') {
        words = poolData.allWords || [];
      } else {
        words = poolData.poolByTextbook?.[this.selectedTextbook] || [];
      }
    } else {
      if (this.selectedTextbook === 'all') {
        words = poolData.allWords || [];
      } else {
        words = poolData.poolByTextbook?.[this.selectedTextbook] || [];
      }
    }

    // Apply search filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      words = words.filter(w =>
        (w.word && w.word.toLowerCase().includes(q)) ||
        (w.transcription && w.transcription.toLowerCase().includes(q)) ||
        (w.translation && w.translation.toLowerCase().includes(q)) ||
        (w.example && w.example.toLowerCase().includes(q))
      );
    }

    // Apply month filter
    if (this.selectedMonth !== 'all') {
      const m = Number(this.selectedMonth);
      words = words.filter(w => Number(w.monthNumber) === m);
    }

    // Apply sorting
    if (this.sortBy === 'alpha-az') {
      words.sort((a, b) => (a.word || '').localeCompare(b.word || ''));
    } else if (this.sortBy === 'alpha-za') {
      words.sort((a, b) => (b.word || '').localeCompare(a.word || ''));
    }

    // Compute metrics
    const totalWords = words.length;
    const allStudents = !isStudent ? store.getStudents() : [];

    container.innerHTML = `
      <div class="vocabulary-view-container">
        <!-- Section Header -->
        <div class="section-header" style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-3);">
          <div class="section-title-wrap">
            <h1 style="display: flex; align-items: center; gap: 8px;">
              <span>📖</span>
              <span>Словарь (Vocabulary Pool)</span>
            </h1>
            <p>
              ${isStudent
                ? 'Ваш персональный банк слов по всем учебникам. Новые слова открываются сразу после уроков!'
                : 'Централизованный пул словарного запаса. Слова вгружаются автоматически после проведения занятий.'}
            </p>
          </div>

          <div>
            ${!isStudent ? `
              <button type="button" class="btn btn-sm btn-success" id="btn-add-custom-word">
                ➕ Добавить слово
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Teacher / Admin Student Selector Bar -->
        ${!isStudent ? `
          <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
              <div style="display: flex; align-items: center; gap: var(--space-2); flex: 1; min-width: 260px;">
                <label style="font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text-main); white-space: nowrap;">
                  👤 Ученик:
                </label>
                <select id="vocab-student-select" class="form-control form-control-sm" style="max-width: 320px;">
                  <option value="all" ${this.selectedStudentId === 'all' ? 'selected' : ''}>— Все учебники школы (Общий банк) —</option>
                  ${allStudents.map(s => `
                    <option value="${s.id}" ${this.selectedStudentId === s.id ? 'selected' : ''}>
                      ${s.fullName} (${s.textbook || 'Без учебника'})
                    </option>
                  `).join('')}
                </select>
              </div>

              ${studentData ? `
                <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
                  Текущий учебник: <strong style="color: var(--color-primary);">${studentData.textbook || 'Не указан'}</strong>
                  ${studentData.textbooksStudied?.length > 1 ? ` • Изучено учебников: <strong>${studentData.textbooksStudied.length}</strong>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Metric Stat Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4);">
          <div class="card" style="padding: var(--space-3); border-radius: var(--radius-lg); background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe;">
            <div style="font-size: var(--font-size-xs); font-weight: 600; color: #1e40af; text-transform: uppercase;">Всего слов в пуле</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: #1e3a8a; margin-top: 4px;">${totalWords}</div>
            <div style="font-size: var(--font-size-xs); color: #3b82f6;">по выбранному фильтру</div>
          </div>

          <div class="card" style="padding: var(--space-3); border-radius: var(--radius-lg); background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0;">
            <div style="font-size: var(--font-size-xs); font-weight: 600; color: #065f46; text-transform: uppercase;">Выбранный раздел</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #047857; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${this.selectedTextbook === 'all' ? 'Все учебники' : this.selectedTextbook}">
              ${this.selectedTextbook === 'all' ? '🌐 Все учебники' : this.selectedTextbook}
            </div>
            <div style="font-size: var(--font-size-xs); color: #10b981;">активный фильтр слов</div>
          </div>

          <div class="card" style="padding: var(--space-3); border-radius: var(--radius-lg); background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border: 1px solid #f5d0fe;">
            <div style="font-size: var(--font-size-xs); font-weight: 600; color: #86198f; text-transform: uppercase;">Учебников в пуле</div>
            <div style="font-size: 1.75rem; font-weight: 800; color: #701a75; margin-top: 4px;">${textbooksList.length}</div>
            <div style="font-size: var(--font-size-xs); color: #a21caf;">разделы сохранены по годам</div>
          </div>
        </div>

        <!-- Textbook Navigation Tabs (Multi-Year Preservation) -->
        <div class="card" style="margin-bottom: var(--space-4); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--color-border); background: var(--color-bg-surface);">
          <div style="padding: var(--space-2) var(--space-3); background: #f8fafc; border-bottom: 1px solid var(--color-border); font-size: var(--font-size-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
            📚 Разделы по учебникам (сохраняются при переходе на новые уровни):
          </div>
          <div class="vocab-textbook-tabs" style="display: flex; overflow-x: auto; padding: var(--space-2) var(--space-3); gap: var(--space-2); scrollbar-width: thin;">
            <button type="button" class="btn btn-sm ${this.selectedTextbook === 'all' ? 'btn-primary' : 'btn-outline'} vocab-tb-tab-btn" data-textbook="all" style="white-space: nowrap; border-radius: 9999px;">
              🌐 Все учебники (${poolData.allWords ? poolData.allWords.length : 0})
            </button>

            ${textbooksList.map(tbName => {
              const count = poolData.poolByTextbook?.[tbName]?.length || 0;
              const isActive = this.selectedTextbook === tbName;
              const isCurrent = (studentData && studentData.textbook === tbName);
              return `
                <button type="button" class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'} vocab-tb-tab-btn" data-textbook="${tbName}" style="white-space: nowrap; border-radius: 9999px; display: flex; align-items: center; gap: 6px;">
                  <span>📖 ${tbName}</span>
                  <span class="badge" style="font-size: 0.7rem; padding: 2px 6px; background: ${isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0'}; color: ${isActive ? '#ffffff' : '#334155'};">
                    ${count}
                  </span>
                  ${isCurrent ? '<span title="Текущий учебник" style="font-size: 0.75rem;">⭐</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Filter, Search, and Sorting Bar -->
        <div class="card" style="margin-bottom: var(--space-4); padding: var(--space-3); border-radius: var(--radius-lg); border: 1px solid var(--color-border); background: var(--color-bg-surface);">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: var(--space-3); align-items: center;">
            <!-- Search -->
            <div style="position: relative;">
              <input type="text" id="vocab-search-input" class="form-control form-control-sm" placeholder="🔍 Поиск по слову, транскрипции или переводу..." value="${this.searchQuery}" style="padding-left: 32px;">
              <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; color: var(--color-text-muted);">🔎</span>
              ${this.searchQuery ? `
                <button type="button" id="btn-clear-vocab-search" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 14px; cursor: pointer; color: #94a3b8;">✕</button>
              ` : ''}
            </div>

            <!-- Month Filter -->
            <div>
              <select id="vocab-month-select" class="form-control form-control-sm">
                <option value="all" ${this.selectedMonth === 'all' ? 'selected' : ''}>Все месяцы (1..10)</option>
                <option value="1" ${this.selectedMonth === '1' ? 'selected' : ''}>01. Сентябрь</option>
                <option value="2" ${this.selectedMonth === '2' ? 'selected' : ''}>02. Октябрь</option>
                <option value="3" ${this.selectedMonth === '3' ? 'selected' : ''}>03. Ноябрь</option>
                <option value="4" ${this.selectedMonth === '4' ? 'selected' : ''}>04. Декабрь</option>
                <option value="5" ${this.selectedMonth === '5' ? 'selected' : ''}>05. Январь</option>
                <option value="6" ${this.selectedMonth === '6' ? 'selected' : ''}>06. Февраль</option>
                <option value="7" ${this.selectedMonth === '7' ? 'selected' : ''}>07. Март</option>
                <option value="8" ${this.selectedMonth === '8' ? 'selected' : ''}>08. Апрель</option>
                <option value="9" ${this.selectedMonth === '9' ? 'selected' : ''}>09. Май</option>
                <option value="10" ${this.selectedMonth === '10' ? 'selected' : ''}>10. Июнь</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <select id="vocab-sort-select" class="form-control form-control-sm">
                <option value="order" ${this.sortBy === 'order' ? 'selected' : ''}>По порядку уроков</option>
                <option value="alpha-az" ${this.sortBy === 'alpha-az' ? 'selected' : ''}>Алфавит A ➔ Z</option>
                <option value="alpha-za" ${this.sortBy === 'alpha-za' ? 'selected' : ''}>Алфавит Z ➔ A</option>
              </select>
            </div>
          </div>
        </div>

        <!-- MAIN CONTENT: Card Grid View -->
        ${this.renderGridMode(words, isStudent)}
      </div>
    `;

    this.attachEvents(container);

    if (activeId) {
      const el = container.querySelector('#' + activeId);
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof activeStart === 'number' && typeof activeEnd === 'number') {
          try { el.setSelectionRange(activeStart, activeEnd); } catch (_) {}
        }
      }
    }
  },

  renderGridMode(words, isStudent) {
    if (words.length === 0) {
      return `
        <div class="empty-state card" style="padding: var(--space-8) var(--space-4); text-align: center; border-radius: var(--radius-lg); background: var(--color-bg-surface); border: 1px solid var(--color-border);">
          <div style="font-size: 3rem; margin-bottom: var(--space-2);">📖</div>
          <h3>В этом разделе пока нет слов</h3>
          <p class="text-muted" style="max-width: 520px; margin: 0 auto;">
            Слова автоматически поступают в пул после проведения каждого урока по учебнику.
            Как только преподаватель отметит занятие проведенным (или оно завершится по расписанию), вся лексика появится здесь.
          </p>
        </div>
      `;
    }

    return `
      <div class="vocab-words-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-3);">
        ${words.map(w => {
          const tr = w.transcription ? (w.transcription.startsWith('[') ? w.transcription : `[${w.transcription}]`) : '';
          return `
            <div class="vocab-word-card card" style="border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); border: 1px solid var(--color-border); background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.15s ease, box-shadow 0.15s ease;">
              <div>
                <!-- Format: (Disappear [dɪsəˈpɪə] - исчезать, she suddenly disappeared.) -->
                <div style="font-size: var(--font-size-base); line-height: 1.5; color: var(--color-text-main);">
                  <strong style="font-size: 1.15rem; color: var(--color-primary);">${w.word}</strong>
                  ${tr ? `<span style="font-weight: 500; color: #64748b; font-family: monospace; margin-left: 4px;">${tr}</span>` : ''}
                  <span style="color: #94a3b8; margin: 0 4px;">—</span>
                  <span style="font-weight: 600; color: var(--color-text-main);">${w.translation}</span>${w.example ? `, <span style="font-style: italic; color: #475569;">${w.example}</span>` : ''}
                </div>
              </div>

              <!-- Bottom Row: Textbook & Lesson Metadata -->
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.08); font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 10px;">
                <span class="badge" style="background:#eff6ff; color:#1e40af; font-size:0.68rem; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${w.textbook || 'General'}
                </span>
                <span>
                  Месяц ${w.monthNumber || 1} • Урок ${w.lessonNumber || 1}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Retained in code for future use (per user instruction)
  renderFlashcardsMode(words, isStudent) {
    if (words.length === 0) return '';
    const currentWord = words[this.flashcardIndex] || words[0];
    const isMastered = Boolean(currentWord.isMastered);
    const tr = currentWord.transcription ? (currentWord.transcription.startsWith('[') ? currentWord.transcription : `[${currentWord.transcription}]`) : '';

    return `
      <div class="flashcards-container" style="max-width: 620px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: var(--space-4);">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); color: var(--color-text-muted);">
          <span>Карточка <strong>${this.flashcardIndex + 1}</strong> из <strong>${words.length}</strong></span>
          <span class="badge" style="background:#e0e7ff; color:#3730a3;">${currentWord.textbook || 'General'}</span>
        </div>

        <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
          <div style="height: 100%; width: ${Math.round(((this.flashcardIndex + 1) / words.length) * 100)}%; background: var(--color-primary); transition: width 0.3s ease;"></div>
        </div>

        <div class="vocab-flashcard-box ${this.flashcardFlipped ? 'flipped' : ''}" id="flashcard-card-element" style="width: 100%; min-height: 280px; background: #ffffff; border-radius: var(--radius-xl); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 2px solid var(--color-border); display: flex; flex-direction: column; justify-content: space-between; padding: var(--space-6); cursor: pointer; position: relative;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background:#f1f5f9; color:#475569; font-size: 0.75rem;">
              Месяц ${currentWord.monthNumber || 1} • Урок ${currentWord.lessonNumber || 1}
            </span>
          </div>

          <div style="text-align: center; margin: var(--space-4) 0;">
            ${!this.flashcardFlipped ? `
              <div style="font-size: 2.25rem; font-weight: 800; color: var(--color-primary); letter-spacing: -0.02em;">
                ${currentWord.word}
              </div>
              ${tr ? `<div style="font-size: 1.1rem; color: #64748b; font-family: monospace; margin-top: 4px;">${tr}</div>` : ''}
              <div style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-top: 8px;">
                👆 Нажмите на карточку, чтобы увидеть перевод
              </div>
            ` : `
              <div style="font-size: 2rem; font-weight: 800; color: var(--color-text-main);">
                ${currentWord.translation}
              </div>
              ${currentWord.example ? `
                <div style="font-size: var(--font-size-sm); color: #475569; font-style: italic; margin-top: 12px; background: #f8fafc; padding: 10px 16px; border-radius: var(--radius-md); border-left: 3px solid var(--color-primary);">
                  "${currentWord.example}"
                </div>
              ` : ''}
            `}
          </div>

          <div style="text-align: center; border-top: 1px dashed var(--color-border); padding-top: var(--space-3); font-size: var(--font-size-xs); color: var(--color-text-muted);">
            🔄 Нажмите в любом месте для переворота карточки
          </div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: var(--space-3);">
          <button type="button" class="btn btn-outline" id="btn-flashcard-prev" ${this.flashcardIndex === 0 ? 'disabled' : ''}>
            ⬅ Предыдущее
          </button>
          <button type="button" class="btn btn-outline" id="btn-flashcard-next" ${this.flashcardIndex === words.length - 1 ? 'disabled' : ''}>
            Следующее ➡
          </button>
        </div>
      </div>
    `;
  },

  attachEvents(container) {
    // Student selector (Teacher / Admin)
    const studentSelect = container.querySelector('#vocab-student-select');
    if (studentSelect) {
      studentSelect.addEventListener('change', (e) => {
        this.selectedStudentId = e.target.value;
        this.render(container);
      });
    }

    // Textbook navigation tabs
    container.querySelectorAll('.vocab-tb-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedTextbook = btn.dataset.textbook;
        this.render(container);
      });
    });

    // Search input
    const searchInput = container.querySelector('#vocab-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(container);
      });
    }

    const btnClearSearch = container.querySelector('#btn-clear-vocab-search');
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        this.searchQuery = '';
        this.render(container);
      });
    }

    // Month filter
    const monthSelect = container.querySelector('#vocab-month-select');
    if (monthSelect) {
      monthSelect.addEventListener('change', (e) => {
        this.selectedMonth = e.target.value;
        this.render(container);
      });
    }

    // Sort select
    const sortSelect = container.querySelector('#vocab-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.render(container);
      });
    }

    // Add Custom Word Button (Teacher / Admin)
    const btnAddWord = container.querySelector('#btn-add-custom-word');
    if (btnAddWord) {
      btnAddWord.addEventListener('click', () => {
        this.showAddWordModal(container);
      });
    }
  },

  // Retained in code for future use (per user instruction)
  toggleWordMastered(wordText, textbookName, container) {
    const role = auth.getRole();
    const isStudent = (role === auth.ROLE_STUDENT);
    const targetStudentId = isStudent
      ? auth.currentStudentId
      : (this.selectedStudentId !== 'all' ? this.selectedStudentId : null);

    if (!targetStudentId) {
      toast.info('Выберите конкретного ученика для сохранения статуса запоминания');
      return;
    }

    const currentStatus = store.toggleWordMastered(targetStudentId, textbookName, wordText);
    toast.success(currentStatus ? `Слово "${wordText}" выучено! 🎉` : `Слово "${wordText}" возвращено в повторение`);
    if (container) this.render(container);
  },

  showAddWordModal(container) {
    const textbooks = Object.keys(store.state.textbookLessons || {});
    const defaultTb = this.selectedTextbook !== 'all' ? this.selectedTextbook : (textbooks[0] || 'English World 3');

    modal.open({
      title: '➕ Добавить слово в словарь',
      content: `
        <form id="form-add-vocab-word">
          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label" style="font-weight:600;">Учебник:</label>
            <select name="textbook" class="form-control" required>
              ${textbooks.map(tb => `<option value="${tb}" ${tb === defaultTb ? 'selected' : ''}>${tb}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label" style="font-weight:600;">Английское слово (Word):</label>
            <input type="text" name="word" class="form-control" placeholder="e.g. Disappear" required />
          </div>

          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label" style="font-weight:600;">Транскрипция (Transcription):</label>
            <input type="text" name="transcription" class="form-control" placeholder="e.g. [dɪsəˈpɪə]" />
          </div>

          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label" style="font-weight:600;">Русский перевод (Translation):</label>
            <input type="text" name="translation" class="form-control" placeholder="e.g. исчезать" required />
          </div>

          <div class="form-group" style="margin-bottom: var(--space-3);">
            <label class="form-label" style="font-weight:600;">Пример в предложении (Example):</label>
            <input type="text" name="example" class="form-control" placeholder="e.g. she suddenly disappeared." />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
            <div class="form-group">
              <label class="form-label">Номер месяца (1..10):</label>
              <input type="number" name="monthNumber" class="form-control" value="1" min="1" max="10" />
            </div>
            <div class="form-group">
              <label class="form-label">Номер урока (1..8):</label>
              <input type="number" name="lessonNumber" class="form-control" value="1" min="1" max="8" />
            </div>
          </div>
        </form>
      `,
      buttons: [
        { label: 'Отмена', type: 'secondary', close: true },
        {
          label: 'Сохранить',
          type: 'primary',
          close: false,
          handler: () => {
            const form = document.getElementById('form-add-vocab-word');
            if (!form.reportValidity()) return;

            const formData = new FormData(form);
            const tb = formData.get('textbook');
            const word = formData.get('word');
            let transcription = formData.get('transcription') || '';
            if (transcription && !transcription.startsWith('[')) {
              transcription = `[${transcription}]`;
            }
            const translation = formData.get('translation');
            const example = formData.get('example');
            const monthNumber = formData.get('monthNumber');
            const lessonNumber = formData.get('lessonNumber');

            store.addCustomWordToPool(tb, {
              word,
              transcription,
              translation,
              example,
              monthNumber,
              lessonNumber
            });

            toast.success(`Слово "${word}" успешно добавлено в пул ${tb}!`);
            modal.close();
            this.render(container);
          }
        }
      ]
    });
  }
};
