/**
 * Lesson Plans & Materials View - Windows Explorer Folder Structure
 * Level 1: Textbooks -> Level 2: 10 Months (1..10) -> Level 3: 8 Lessons (1..8) -> Level 4: Files, HW & Vocab
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { AudioPlayer } from '../components/audioPlayer.js';
import { MONTH_NAMES } from '../data/seedData.js';

export const LessonPlansView = {
  // Explorer state
  level: 'textbooks', // 'textbooks' | 'months' | 'lessons' | 'lesson_detail'
  currentTextbook: null,
  currentMonth: null,
  currentLesson: null,

  render(container) {
    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>📚 Проводник учебных планов и материалов</h1>
          <p>Структура курсов: Учебники ➔ 10 Месяцев (Сентябрь–Июнь) ➔ 8 Уроков в месяц ➔ Файлы и ДЗ</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary" id="btn-add-new-textbook">
            + Новый учебник
          </button>
        </div>
      </div>

      <!-- Windows Explorer Container Window -->
      <div class="explorer-window card">
        <!-- Top Toolbar & Address Path Bar -->
        <div class="explorer-topbar">
          <div class="explorer-nav-buttons">
            <button type="button" class="btn btn-sm btn-ghost" id="btn-explorer-back" ${this.level === 'textbooks' ? 'disabled' : ''} title="Назад">
              ⬅ Назад
            </button>
            <button type="button" class="btn btn-sm btn-ghost" id="btn-explorer-up" ${this.level === 'textbooks' ? 'disabled' : ''} title="Вверх на уровень">
              ⬆ Вверх
            </button>
          </div>

          <div class="explorer-address-bar">
            <span class="explorer-drive-icon">💻</span>
            <div class="explorer-breadcrumbs" id="explorer-breadcrumbs">
              ${this.renderBreadcrumbs()}
            </div>
          </div>
        </div>

        <!-- Main Explorer Content Area -->
        <div class="explorer-content-area" id="explorer-body">
          ${this.renderCurrentLevelContent()}
        </div>
      </div>
    `;

    this.bindEvents(container);
    AudioPlayer.bindAll(container);
  },

  renderBreadcrumbs() {
    let crumbs = `<span class="crumb-item crumb-root" data-nav="textbooks">📚 Учебники</span>`;
    
    if (this.currentTextbook) {
      crumbs += ` <span class="crumb-sep">/</span> <span class="crumb-item crumb-textbook" data-nav="months">${this.currentTextbook}</span>`;
    }
    if (this.currentMonth) {
      const mObj = MONTH_NAMES.find(m => m.num === Number(this.currentMonth));
      const mName = mObj ? mObj.name : `Месяц ${this.currentMonth}`;
      crumbs += ` <span class="crumb-sep">/</span> <span class="crumb-item crumb-month" data-nav="lessons">${mName}</span>`;
    }
    if (this.currentLesson) {
      crumbs += ` <span class="crumb-sep">/</span> <span class="crumb-item active">📄 Урок ${this.currentLesson}</span>`;
    }

    return crumbs;
  },

  renderCurrentLevelContent() {
    if (this.currentTextbook && !store.getTextbooks().includes(this.currentTextbook)) {
      this.level = 'textbooks';
      this.currentTextbook = null;
      this.currentMonth = null;
      this.currentLesson = null;
    }
    if (this.level === 'textbooks') {
      return this.renderTextbooksLevel();
    } else if (this.level === 'months') {
      return this.renderMonthsLevel();
    } else if (this.level === 'lessons') {
      return this.renderLessonsLevel();
    } else if (this.level === 'lesson_detail') {
      return this.renderLessonDetailLevel();
    }
    return '';
  },

  // Level 1: List of Textbooks
  renderTextbooksLevel() {
    const isAdmin = auth.isAdmin();
    const textbooks = store.getTextbooks();

    return `
      <div class="explorer-view-header" style="display:flex; justify-content:space-between; align-items:center;">
        <span class="text-xs font-bold text-muted uppercase">Папки учебников и курсов (${textbooks.length})</span>
        ${isAdmin ? `<span class="text-xs text-muted">👑 Режим Администратора: полный доступ к учебникам и планам</span>` : ''}
      </div>
      <div class="explorer-grid">
        ${textbooks.map(tb => {
          const months = store.getMonthsForTextbook(tb);
          const totalConducted = months.reduce((acc, m) => acc + m.conductedCount, 0);

          return `
            <div class="explorer-item explorer-folder-card btn-open-textbook" data-textbook="${tb}" style="position:relative;">
              ${isAdmin ? `
                <button type="button" class="btn btn-ghost btn-sm btn-delete-textbook" data-textbook="${tb}" title="Удалить учебник" style="position:absolute; top:8px; right:8px; color:var(--color-danger); padding:2px 6px; z-index:2;">
                  🗑️
                </button>
              ` : ''}
              <div class="folder-big-icon">📁</div>
              <div class="explorer-item-name font-bold text-sm">${tb}</div>
              <div class="text-xs text-muted" style="margin-top:4px;">
                10 месяцев • 80 уроков
              </div>
              <div class="badge badge-planned" style="margin-top:6px; font-size:0.7rem;">
                Пройдено: ${totalConducted} / 80 уроков
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Level 2: 10 Months (01. Сентябрь ... 10. Июнь)
  renderMonthsLevel() {
    const months = store.getMonthsForTextbook(this.currentTextbook);

    return `
      <div class="explorer-view-header">
        <span class="text-xs font-bold text-muted uppercase">
          ${this.currentTextbook} ➔ 10 месяцев учебного года (Сентябрь – Июнь)
        </span>
      </div>
      <div class="explorer-grid">
        ${months.map(m => `
          <div class="explorer-item explorer-folder-card btn-open-month" data-month="${m.num}">
            <div class="folder-big-icon">📁</div>
            <div class="explorer-item-name font-bold text-sm">${m.name}</div>
            <div class="text-xs text-muted" style="margin-top:4px;">
              8 уроков • ${m.filesCount} файлов
            </div>
            <div style="margin-top:6px;">
              ${m.conductedCount > 0 ? `
                <span class="badge badge-completed" style="font-size:0.7rem;">
                  ✓ Проведено: ${m.conductedCount} / 8
                </span>
              ` : `
                <span class="badge" style="font-size:0.7rem; background:#f1f5f9; color:#64748b;">
                  8 уроков по плану
                </span>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // Level 3: 8 Lessons for the selected Month
  renderLessonsLevel() {
    const lessons = store.getLessonsForMonth(this.currentTextbook, this.currentMonth);
    const mObj = MONTH_NAMES.find(m => m.num === Number(this.currentMonth));
    const mName = mObj ? mObj.name : `Месяц ${this.currentMonth}`;

    return `
      <div class="explorer-view-header">
        <span class="text-xs font-bold text-muted uppercase">
          ${this.currentTextbook} ➔ ${mName} ➔ 8 уроков месяца
        </span>
      </div>
      <div class="explorer-grid">
        ${lessons.map(l => {
          const hasAudio = l.files && l.files.some(f => f.type === 'audio');
          const hasFiles = l.files && l.files.length > 0;
          const hasHW = l.homework && l.homework.text;

          return `
            <div class="explorer-item explorer-lesson-card btn-open-lesson ${l.isConducted ? 'conducted' : ''}" data-lesson="${l.lessonNumber}">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;">
                <div class="lesson-num-pill">Урок ${l.lessonNumber}</div>
                ${l.isConducted ? `
                  <span class="badge badge-completed" style="font-size:0.65rem;">✓ Проведен</span>
                ` : `
                  <span class="badge badge-planned" style="font-size:0.65rem;">🔒 Запланирован</span>
                `}
              </div>

              <div class="lesson-file-icon" style="margin:8px 0 4px 0;">
                ${hasAudio ? '🎧' : '📄'}
              </div>

              <div class="explorer-item-name font-bold text-sm" style="text-align:center; min-height:40px;">
                ${l.topic}
              </div>

              <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap; justify-content:center;">
                ${hasHW ? '<span class="badge" style="font-size:0.65rem; background:#fef3c7; color:#92400e;">ДЗ</span>' : ''}
                ${hasAudio ? '<span class="badge" style="font-size:0.65rem; background:#ecfdf5; color:#065f46;">Аудио</span>' : ''}
                ${l.vocabulary?.length ? `<span class="badge" style="font-size:0.65rem; background:#eff6ff; color:#1e40af;">${l.vocabulary.length} сл.</span>` : ''}
                ${l.files?.length ? `<span class="badge" style="font-size:0.65rem; background:#f8fafc; border:1px solid #cbd5e1;">${l.files.length} файл.</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // Level 4: Inside a Specific Lesson (Files, Homework, Vocabulary, Audio Player)
  renderLessonDetailLevel() {
    const lesson = store.getLessonDetails(this.currentTextbook, this.currentMonth, this.currentLesson);
    const mObj = MONTH_NAMES.find(m => m.num === Number(this.currentMonth));
    const mName = mObj ? mObj.name : `Месяц ${this.currentMonth}`;

    const files = lesson.files || [];
    
    // Separate files into Teacher/Admin (lesson plans) vs Students (HW & Audio)
    const teacherFiles = files.filter(f => f.target === 'teacher_admin');
    const studentFiles = files.filter(f => f.target !== 'teacher_admin');

    const studentAudioFiles = studentFiles.filter(f => f.type === 'audio');
    const studentDocFiles = studentFiles.filter(f => f.type !== 'audio');

    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-5);">
        <!-- Lesson Header Toolbar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-3); background:var(--color-bg-app); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--color-border);">
          <div>
            <div class="text-xs text-muted">
              ${this.currentTextbook} • ${mName} • Урок ${lesson.lessonNumber} из 8
            </div>
            <h2 style="font-size:var(--font-size-lg); font-weight:800; color:var(--color-text-main); margin-top:2px;">
              📄 ${lesson.topic}
            </h2>
          </div>

          <div style="display:flex; align-items:center; gap:var(--space-2);">
            ${lesson.isConducted ? `
              <span class="badge badge-completed" style="font-size:0.8rem; padding:6px 12px;">
                ✓ Урок проведен (Материалы открыты ученикам)
              </span>
              <button class="btn btn-ghost btn-sm" id="btn-unconduct-current-lesson" style="font-size:0.75rem;">
                ↩️ В запланированные
              </button>
            ` : `
              <span class="badge badge-planned" style="font-size:0.8rem; padding:6px 12px;">
                🔒 Запланирован (Материалы скрыты)
              </span>
              <button class="btn btn-primary btn-sm" id="btn-conduct-current-lesson">
                ✓ Провести урок
              </button>
            `}
            <button class="btn btn-secondary btn-sm" id="btn-edit-current-lesson">
              ✏️ Редактировать ДЗ и материалы
            </button>
          </div>
        </div>

        <!-- Two Column Main Layout: Left: HW & Files | Right: Vocabulary Bank -->
        <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:var(--space-5);" class="lesson-plan-grid">
          
          <!-- Left Column: Teacher Materials & Student Homework -->
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            
            <!-- SECTION 1: TEACHER & ADMIN ONLY (Lesson Plans, Word, Teacher Notes) -->
            <div class="card" style="padding:var(--space-4); border-left: 4px solid #8b5cf6; background:#faf5ff;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); flex-wrap:wrap; gap:4px;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:1.2rem;">👑</span>
                  <h3 style="font-size:var(--font-size-base); font-weight:700; color:#581c87; margin:0;">
                    Планы уроков для учителя и администратора:
                  </h3>
                </div>
                <span class="badge" style="background:#f3e8ff; color:#6b21a8; font-size:0.7rem; font-weight:700;">
                  🔒 Скрыто от учеников
                </span>
              </div>
              <p class="text-xs text-muted" style="margin-bottom:var(--space-3);">
                Методические разработки, конспекты и поурочные Word-планы. Доступны только преподавателям и администрации.
              </p>

              <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                ${teacherFiles.length === 0 ? `
                  <div class="text-xs text-muted" style="padding:var(--space-3); background:#ffffff; border-radius:var(--radius-md); border:1px dashed #d8b4fe;">
                    Планы урока пока не прикреплены. Нажмите «Редактировать» для загрузки Word-файла (.docx).
                  </div>
                ` : teacherFiles.map(f => {
                  const isWord = (f.name && (f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.name.endsWith('.docm') || f.name.endsWith('.dotx'))) || f.type === 'document';
                  const isPdf = (f.name && f.name.endsWith('.pdf')) || f.type === 'pdf';
                  const fileIcon = isWord ? '📘' : isPdf ? '📑' : '📎';
                  const fileTag = isWord ? 'План урока (Word)' : isPdf ? 'Методичка (PDF)' : 'Файл учителя';

                  return `
                    <a href="${f.url}" download="${f.name}" class="file-attachment-badge" target="_blank" style="padding:8px 12px; text-decoration:none; background:#ffffff; border-color:#e9d5ff;">
                      <span class="file-icon" style="font-size:1.35rem;">${fileIcon}</span>
                      <div style="flex:1;">
                        <div class="font-semibold text-sm" style="color:#4c1d95;">${f.name}</div>
                        <div class="text-xs text-muted">${fileTag} • ${f.size || 'Файл на сервере'}</div>
                      </div>
                      <span class="btn btn-sm btn-secondary" style="pointer-events:none; background:#f3e8ff; color:#6b21a8; border-color:#d8b4fe;">Скачать ⬇</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SECTION 2: STUDENT HOMEWORK & AUDIO & MATERIALS -->
            <div class="card" style="padding:var(--space-4); border-left: 4px solid var(--color-primary);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:1.2rem;">🎓</span>
                  <h3 style="font-size:var(--font-size-base); font-weight:700; color:var(--color-primary); margin:0;">
                    Материалы и ДЗ для учеников:
                  </h3>
                </div>
                <span class="badge badge-warning" style="font-size:0.75rem;">
                  ⏳ ${lesson.homework?.deadline || 'к следующему уроку'}
                </span>
              </div>
              
              <!-- Homework Text Description -->
              <div style="font-size:var(--font-size-sm); line-height:1.6; color:var(--color-text-main); white-space:pre-line; background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border); margin-bottom:var(--space-3);">
                ${lesson.homework?.text || '<span class="text-muted">Домашнее задание пока не заполнено</span>'}
              </div>

              <!-- Audio Files with Slowdown Player for Students -->
              <div style="margin-top:var(--space-3);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                  <span class="text-xs font-bold text-muted uppercase">🎧 Аудиозаписи к домашнему заданию (с замедлением):</span>
                </div>

                ${studentAudioFiles.length === 0 ? `
                  <div class="text-xs text-muted" style="padding:var(--space-3); background:var(--color-bg-app); border-radius:var(--radius-md); margin-bottom:var(--space-2);">
                    Аудиозаписи для учеников не прикреплены (поддерживаются MP3, WMA, WAV, M4A, OGG, FLAC и др.).
                  </div>
                ` : studentAudioFiles.map((f, i) => AudioPlayer.renderPlayerHtml(f, `player-exp-${i}`)).join('')}
              </div>

              <!-- Other Student Documents Download (Worksheets, PDFs, Images) -->
              ${studentDocFiles.length > 0 ? `
                <div style="margin-top:var(--space-3);">
                  <span class="text-xs font-bold text-muted uppercase">📎 Дополнительные файлы для учеников:</span>
                  <div style="display:flex; flex-direction:column; gap:var(--space-2); margin-top:4px;">
                    ${studentDocFiles.map(f => {
                      const isWord = (f.name && (f.name.endsWith('.docx') || f.name.endsWith('.doc'))) || f.type === 'document';
                      const isPdf = (f.name && f.name.endsWith('.pdf')) || f.type === 'pdf';
                      const fileIcon = isWord ? '📘' : isPdf ? '📑' : '🖼️';
                      const fileTag = isWord ? 'Документ Word' : isPdf ? 'PDF файл' : 'Материал';

                      return `
                        <a href="${f.url}" download="${f.name}" class="file-attachment-badge" target="_blank" style="padding:8px 12px; text-decoration:none;">
                          <span class="file-icon" style="font-size:1.35rem;">${fileIcon}</span>
                          <div style="flex:1;">
                            <div class="font-semibold text-sm" style="color:var(--color-text-main);">${f.name}</div>
                            <div class="text-xs text-muted">${fileTag} • ${f.size || 'Файл на сервере'}</div>
                          </div>
                          <span class="btn btn-sm btn-secondary" style="pointer-events:none;">Скачать ⬇</span>
                        </a>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

          </div>

          <!-- Right Column: Vocabulary Bank (Новые слова) -->
          <div class="card" style="padding:var(--space-4); display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3);">
                <h3 style="font-size:var(--font-size-base); font-weight:700; color:var(--color-text-main);">
                  🔤 Новые слова (${lesson.vocabulary ? lesson.vocabulary.length : 0})
                </h3>
                <button type="button" class="btn btn-sm btn-secondary" id="btn-quick-add-words">
                  + Изменить слова
                </button>
              </div>

              <div style="display:flex; flex-direction:column; gap:6px; max-height:420px; overflow-y:auto;">
                ${(!lesson.vocabulary || lesson.vocabulary.length === 0) ? `
                  <div class="text-xs text-muted" style="padding:var(--space-3); background:var(--color-bg-app); border-radius:var(--radius-md);">
                    Слова для этого урока еще не добавлены.
                  </div>
                ` : lesson.vocabulary.map(v => {
                  const tr = v.transcription ? (v.transcription.startsWith('[') ? v.transcription : `[${v.transcription}]`) : '';
                  return `
                  <div class="vocab-item-row" style="background:var(--color-bg-app); padding:8px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <div>
                      <span style="font-weight:700; color:var(--color-primary); font-size:var(--font-size-sm);">${v.word}</span>
                      ${tr ? `<span style="font-weight:500; color:#64748b; font-size:var(--font-size-xs); font-family:monospace; margin-left:4px;">${tr}</span>` : ''}
                      <span style="color:#94a3b8; margin:0 4px;">—</span>
                      <span style="font-weight:600; color:var(--color-text-main); font-size:var(--font-size-xs);">${v.translation}</span>
                      ${v.example ? `<span style="color:#475569; font-style:italic; font-size:var(--font-size-xs);">, ${v.example}</span>` : ''}
                    </div>
                  </div>
                `;}).join('')}
              </div>
            </div>

            <div style="margin-top:var(--space-4); padding-top:var(--space-3); border-top:1px dashed var(--color-border); font-size:var(--font-size-xs); color:var(--color-text-muted);">
              💡 <em>Слова отображаются у учеников сразу после проведения урока преподавателем.</em>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents(container) {
    // Navigation Breadcrumbs
    container.querySelector('.crumb-root')?.addEventListener('click', () => {
      this.level = 'textbooks';
      this.currentTextbook = null;
      this.currentMonth = null;
      this.currentLesson = null;
      this.render(container);
    });

    container.querySelector('.crumb-textbook')?.addEventListener('click', () => {
      this.level = 'months';
      this.currentMonth = null;
      this.currentLesson = null;
      this.render(container);
    });

    container.querySelector('.crumb-month')?.addEventListener('click', () => {
      this.level = 'lessons';
      this.currentLesson = null;
      this.render(container);
    });

    // Top Back Button
    container.querySelector('#btn-explorer-back')?.addEventListener('click', () => {
      this.goBack(container);
    });

    // Top Up Button
    container.querySelector('#btn-explorer-up')?.addEventListener('click', () => {
      this.goBack(container);
    });

    // Open Textbook
    container.querySelectorAll('.btn-open-textbook').forEach(el => {
      el.addEventListener('click', (e) => {
        // Ignore if clicked on delete button
        if (e.target.closest('.btn-delete-textbook')) return;
        this.currentTextbook = e.currentTarget.getAttribute('data-textbook');
        this.level = 'months';
        this.render(container);
      });
    });

    // Delete Textbook
    container.querySelectorAll('.btn-delete-textbook').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const tb = e.currentTarget.getAttribute('data-textbook');
        if (confirm(`Вы действительно хотите удалить учебник "${tb}" и все его планы уроков?`)) {
          store.deleteTextbook(tb);
          if (this.currentTextbook === tb) {
            this.currentTextbook = null;
            this.currentMonth = null;
            this.currentLesson = null;
            this.level = 'textbooks';
          }
          toast.success(`Учебник "${tb}" успешно удален`);
          this.render(container);
        }
      });
    });

    // Open Month
    container.querySelectorAll('.btn-open-month').forEach(el => {
      el.addEventListener('click', (e) => {
        this.currentMonth = Number(e.currentTarget.getAttribute('data-month'));
        this.level = 'lessons';
        this.render(container);
      });
    });

    // Open Lesson
    container.querySelectorAll('.btn-open-lesson').forEach(el => {
      el.addEventListener('click', (e) => {
        this.currentLesson = Number(e.currentTarget.getAttribute('data-lesson'));
        this.level = 'lesson_detail';
        this.render(container);
      });
    });

    // Conduct current lesson
    container.querySelector('#btn-conduct-current-lesson')?.addEventListener('click', () => {
      store.conductLessonByHierarchy(this.currentTextbook, this.currentMonth, this.currentLesson);
      toast.success(`Урок ${this.currentLesson} проведен! Домашнее задание и новые слова открыты для учеников.`);
      this.render(container);
    });

    // Unconduct current lesson
    container.querySelector('#btn-unconduct-current-lesson')?.addEventListener('click', () => {
      const details = store.getLessonDetails(this.currentTextbook, this.currentMonth, this.currentLesson);
      details.isConducted = false;
      store.saveLessonDetails(this.currentTextbook, this.currentMonth, this.currentLesson, details);
      toast.info(`Урок ${this.currentLesson} возвращен в запланированные.`);
      this.render(container);
    });

    // Edit current lesson modal
    container.querySelector('#btn-edit-current-lesson')?.addEventListener('click', () => {
      this.openEditLessonModal(container);
    });

    container.querySelector('#btn-quick-add-words')?.addEventListener('click', () => {
      this.openEditLessonModal(container);
    });

    // Upload quick button
    container.querySelectorAll('.btn-upload-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openEditLessonModal(container);
      });
    });

    // Add new textbook
    container.querySelector('#btn-add-new-textbook')?.addEventListener('click', () => {
      this.openAddTextbookModal(container);
    });
  },

  goBack(container) {
    if (this.level === 'lesson_detail') {
      this.level = 'lessons';
      this.currentLesson = null;
    } else if (this.level === 'lessons') {
      this.level = 'months';
      this.currentMonth = null;
    } else if (this.level === 'months') {
      this.level = 'textbooks';
      this.currentTextbook = null;
    }
    this.render(container);
  },

  openPlanModal(plan, mainContainer) {
    if (plan) {
      this.currentTextbook = plan.textbookName || plan.textbook || this.currentTextbook || store.getTextbooks()[0];
      this.currentMonth = Number(plan.monthNumber || this.currentMonth || 1);
      this.currentLesson = Number(plan.lessonNumber || this.currentLesson || 1);
    }
    this.openEditLessonModal(mainContainer);
  },

  openEditLessonModal(mainContainer) {
    const lesson = store.getLessonDetails(this.currentTextbook, this.currentMonth, this.currentLesson);
    let currentVocab = lesson.vocabulary ? [...lesson.vocabulary] : [];
    let currentFiles = lesson.files ? [...lesson.files] : [];

    modal.open({
      title: `Редактировать Урок ${lesson.lessonNumber}: ${lesson.topic}`,
      bodyHtml: `
        <form id="form-edit-hier-lesson" style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div class="form-group">
            <label class="form-label">Тема урока <span class="required">*</span></label>
            <input type="text" name="topic" class="form-control" value="${lesson.topic}" required>
          </div>

          <!-- Homework Block -->
          <div style="background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
              <label class="form-label" style="margin:0; font-weight:700;">📝 Домашнее задание</label>
              <input type="text" name="deadline" class="form-control" style="max-width:240px; font-size:var(--font-size-xs); padding:4px 8px;" placeholder="Срок сдачи (к Среде)" value="${lesson.homework?.deadline || 'к следующему уроку'}">
            </div>
            <textarea name="homeworkText" class="form-control" rows="3" placeholder="Описание домашнего задания...">${lesson.homework?.text || ''}</textarea>
          </div>

          <!-- Vocabulary Block -->
          <div style="background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); flex-wrap:wrap; gap:8px;">
              <label class="form-label" style="margin:0; font-weight:700;">🔤 Новые слова (Vocabulary)</label>
              <div style="display:flex; gap:8px; align-items:center;">
                <label class="btn btn-sm btn-outline-primary" style="margin:0; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-weight:600;" title="Загрузить документ Word (.docx) с новыми словами">
                  <input type="file" id="input-vocab-doc" accept=".docx,.doc,.txt" style="display:none;">
                  📄 Загрузить из Word (.docx)
                </label>
                <button type="button" class="btn btn-sm btn-secondary" id="btn-add-vocab-hier">+ Добавить слово</button>
              </div>
            </div>
            <div id="vocab-rows-hier" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;"></div>
          </div>

          <!-- Files Upload Area -->
          <div style="background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md); border:1px solid var(--color-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2); flex-wrap:wrap; gap:8px;">
              <label class="form-label" style="margin:0; font-weight:700;">
                📎 Файлы урока (Планы Word, Аудиозаписи, PDF, Картинки)
              </label>
              
              <!-- Category Selector for Next Uploads -->
              <div style="display:flex; align-items:center; gap:8px; background:#ffffff; padding:4px 10px; border-radius:var(--radius-md); border:1px solid var(--color-border);">
                <span class="text-xs font-bold text-muted">Категория для загрузки:</span>
                <label style="display:inline-flex; align-items:center; gap:4px; font-size:var(--font-size-xs); font-weight:600; cursor:pointer; color:#6b21a8;">
                  <input type="radio" name="upload-category-choice" value="teacher_admin"> 👑 Для учителя
                </label>
                <label style="display:inline-flex; align-items:center; gap:4px; font-size:var(--font-size-xs); font-weight:600; cursor:pointer; color:#065f46;">
                  <input type="radio" name="upload-category-choice" value="student" checked> 🎓 Для ученика (ДЗ)
                </label>
              </div>
            </div>

            <div class="file-upload-dropzone" id="file-dropzone-hier" style="cursor:pointer; border:2px dashed var(--color-primary-300); border-radius:var(--radius-md); padding:var(--space-4); text-align:center; transition:all 0.2s ease;">
              <input type="file" id="input-file-hier" multiple accept=".doc,.docx,.docm,.dotx,.rtf,.txt,.pdf,.mp3,.wav,.wma,.ogg,.oga,.m4a,.aac,.flac,.weba,.webm,.opus,.mid,.midi,.amr,.aiff,.png,.jpg,.jpeg,.webp,.gif,.svg" style="display:none;">
              <div style="font-size:1.6rem; margin-bottom:4px;">📤</div>
              <div class="text-sm font-semibold" style="color:var(--color-primary-700);">Нажмите для выбора файлов или перетащите их сюда</div>
              <div class="text-xs text-muted" style="margin-top:2px;">Документы Word (.docx, .doc), Аудио (MP3, WMA, WAV, M4A, OGG и др.), PDF, Картинки</div>
            </div>
            
            <div id="files-list-hier" style="display:flex; flex-direction:column; gap:6px; margin-top:var(--space-3);"></div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-hier-lesson" class="btn btn-primary font-semibold">Сохранить изменения</button>
      `,
      onOpen: () => {
        const vocabBox = document.getElementById('vocab-rows-hier');
        const filesBox = document.getElementById('files-list-hier');
        const dropzone = document.getElementById('file-dropzone-hier');
        const fileInput = document.getElementById('input-file-hier');

        const renderVocab = () => {
          if (!vocabBox) return;
          if (currentVocab.length === 0) {
            vocabBox.innerHTML = '<span class="text-xs text-muted">Слова пока не добавлены</span>';
            return;
          }
          vocabBox.innerHTML = currentVocab.map((v, i) => `
            <div style="display:grid; grid-template-columns: 1.1fr 1fr 1.3fr 30px; gap:6px; align-items:center;">
              <input type="text" class="form-control v-w" data-idx="${i}" placeholder="Слово (Disappear)" value="${v.word || ''}" style="font-size:var(--font-size-xs); padding:4px 8px; font-weight:600;">
              <input type="text" class="form-control v-tr" data-idx="${i}" placeholder="Транскрипция ([dɪsəˈpɪə])" value="${v.transcription || ''}" style="font-size:var(--font-size-xs); padding:4px 8px; font-family:monospace;">
              <input type="text" class="form-control v-t" data-idx="${i}" placeholder="Перевод (исчезать)" value="${v.translation || ''}" style="font-size:var(--font-size-xs); padding:4px 8px;">
              <button type="button" class="btn btn-ghost btn-sm btn-del-v" data-idx="${i}" style="color:var(--color-danger); padding:2px;" title="Удалить">✕</button>
            </div>
          `).join('');

          vocabBox.querySelectorAll('.v-w').forEach(inp => inp.addEventListener('input', e => currentVocab[e.target.dataset.idx].word = e.target.value));
          vocabBox.querySelectorAll('.v-tr').forEach(inp => inp.addEventListener('input', e => currentVocab[e.target.dataset.idx].transcription = e.target.value));
          vocabBox.querySelectorAll('.v-t').forEach(inp => inp.addEventListener('input', e => currentVocab[e.target.dataset.idx].translation = e.target.value));
          vocabBox.querySelectorAll('.btn-del-v').forEach(btn => btn.addEventListener('click', e => {
            currentVocab.splice(parseInt(e.currentTarget.dataset.idx), 1);
            renderVocab();
          }));
        };

        const renderFiles = () => {
          if (!filesBox) return;
          if (currentFiles.length === 0) {
            filesBox.innerHTML = '<span class="text-xs text-muted">Прикрепленных файлов пока нет.</span>';
            return;
          }
          filesBox.innerHTML = currentFiles.map((f, i) => {
            const isWord = (f.name && (f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.name.endsWith('.docm') || f.name.endsWith('.dotx'))) || f.type === 'document';
            const isPdf = (f.name && f.name.endsWith('.pdf')) || f.type === 'pdf';
            const isAudio = f.type === 'audio' || (f.name && (f.name.endsWith('.mp3') || f.name.endsWith('.wav') || f.name.endsWith('.wma') || f.name.endsWith('.ogg') || f.name.endsWith('.m4a') || f.name.endsWith('.flac')));
            const icon = isWord ? '📘' : isPdf ? '📑' : isAudio ? '🎧' : '🖼️';
            const isTeacherOnly = f.target === 'teacher_admin';

            return `
              <div style="display:flex; justify-content:space-between; align-items:center; background:#ffffff; border:1px solid var(--color-border); border-radius:var(--radius-md); padding:8px 12px; font-size:var(--font-size-xs); flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:180px;">
                  <span style="font-size:1.3rem;">${icon}</span>
                  <div style="min-width:0; flex:1;">
                    <div class="font-semibold" style="color:var(--color-text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</div>
                    <div class="text-muted">${f.size || ''}</div>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px;">
                  <!-- Audience Category Selector -->
                  <select class="form-control select-file-target" data-idx="${i}" style="width:auto; font-size:0.75rem; padding:3px 8px; font-weight:600; border-radius:var(--radius-md); background:${isTeacherOnly ? '#faf5ff' : '#ecfdf5'}; color:${isTeacherOnly ? '#6b21a8' : '#065f46'}; border-color:${isTeacherOnly ? '#d8b4fe' : '#a7f3d0'}; cursor:pointer;">
                    <option value="teacher_admin" ${isTeacherOnly ? 'selected' : ''}>👑 Только учитель/админ (план)</option>
                    <option value="student" ${!isTeacherOnly ? 'selected' : ''}>🎓 Доступно ученикам (ДЗ/аудио)</option>
                  </select>

                  <button type="button" class="btn btn-ghost btn-sm btn-del-f" data-idx="${i}" style="color:var(--color-danger); padding:2px 6px;" title="Удалить файл">✕</button>
                </div>
              </div>
            `;
          }).join('');

          filesBox.querySelectorAll('.select-file-target').forEach(sel => {
            sel.addEventListener('change', (e) => {
              const idx = parseInt(e.target.dataset.idx);
              if (currentFiles[idx]) {
                currentFiles[idx].target = e.target.value;
                renderFiles();
              }
            });
          });

          filesBox.querySelectorAll('.btn-del-f').forEach(btn => btn.addEventListener('click', e => {
            currentFiles.splice(parseInt(e.currentTarget.dataset.idx), 1);
            renderFiles();
          }));
        };

        renderVocab();
        renderFiles();

        document.getElementById('btn-add-vocab-hier')?.addEventListener('click', () => {
          currentVocab.push({ word: '', transcription: '', translation: '' });
          renderVocab();
        });

        // Word (.docx) vocabulary upload with interactive preview modal
        const vocabDocInput = document.getElementById('input-vocab-doc');

        const openVocabPreview = (detectedWords, filename) => {
          let previewItems = detectedWords.map((item, idx) => ({
            id: idx,
            selected: true,
            word: item.word || '',
            transcription: item.transcription || '',
            translation: item.translation || ''
          }));

          let previewDialog = document.getElementById('vocab-preview-dialog');
          if (previewDialog) {
            if (previewDialog.open) previewDialog.close();
            previewDialog.remove();
          }

          previewDialog = document.createElement('dialog');
          previewDialog.id = 'vocab-preview-dialog';
          previewDialog.className = 'app-modal';
          previewDialog.style.cssText = `
            max-width: 720px;
            width: 94vw;
            padding: 0;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl, 16px);
            background: var(--color-bg-card, #ffffff);
            color: var(--color-text-main, #1e293b);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            margin: auto;
            overflow: hidden;
          `;
          document.body.appendChild(previewDialog);

          const closePreview = () => {
            if (previewDialog.open) previewDialog.close();
            previewDialog.remove();
          };

          const renderPreviewBody = () => {
            const selectedCount = previewItems.filter(p => p.selected && p.word.trim()).length;
            const totalCount = previewItems.length;
            const allSelected = totalCount > 0 && selectedCount === totalCount;

            previewDialog.innerHTML = `
              <div style="display:flex; flex-direction:column; max-height:85vh; width:100%; overflow:hidden;">
                
                <!-- Preview Header -->
                <div style="padding:16px 20px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:flex-start; background:var(--color-bg-app, #f8fafc);">
                  <div>
                    <div style="font-size:1.05rem; font-weight:700; color:var(--color-text-main, #1e293b); display:flex; align-items:center; gap:8px;">
                      <span>📄</span> Распознанные слова
                      <span style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:12px;">${totalCount} найдено</span>
                    </div>
                    <div style="font-size:var(--font-size-xs, 0.75rem); color:var(--color-text-muted, #64748b); margin-top:3px;">
                      Документ: <b style="color:var(--color-text-main);">${filename}</b>. Отметьте нужные слова или скорректируйте их перед добавлением:
                    </div>
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm" id="btn-close-vocab-pv" style="font-size:1.2rem; line-height:1; padding:4px 8px; color:var(--color-text-muted);" title="Закрыть">✕</button>
                </div>

                <!-- Preview Controls Toolbar -->
                <div style="padding:10px 20px; border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center; background:#ffffff;">
                  <label style="display:inline-flex; align-items:center; gap:8px; font-size:var(--font-size-xs); font-weight:600; cursor:pointer; user-select:none; margin:0;">
                    <input type="checkbox" id="pv-select-all" ${allSelected ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
                    Выбрать все слова
                  </label>
                  <span style="font-size:var(--font-size-xs); font-weight:600; color:var(--color-primary-700, #0284c7);">
                    Выбрано: <b>${selectedCount}</b> из ${totalCount}
                  </span>
                </div>

                <!-- Preview Table Header -->
                <div style="display:grid; grid-template-columns: 28px 1.1fr 1fr 1.3fr 30px; gap:8px; padding:8px 20px; background:var(--color-bg-app, #f8fafc); border-bottom:1px solid var(--color-border); font-size:0.75rem; font-weight:700; color:var(--color-text-muted);">
                  <span></span>
                  <span>Слово</span>
                  <span>Транскрипция</span>
                  <span>Перевод</span>
                  <span></span>
                </div>

                <!-- Preview Words List (Scrollable) -->
                <div id="pv-list-container" style="padding:12px 20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:8px; max-height:380px;">
                  ${previewItems.length === 0 ? `
                    <div style="text-align:center; padding:32px; color:var(--color-text-muted); font-size:var(--font-size-sm);">
                      Все слова были удалены из списка предпросмотра.
                    </div>
                  ` : previewItems.map((item, idx) => `
                    <div style="display:grid; grid-template-columns: 28px 1.1fr 1fr 1.3fr 30px; gap:8px; align-items:center; background:${item.selected ? '#ffffff' : 'rgba(241, 245, 249, 0.6)'}; padding:4px 6px; border-radius:var(--radius-sm); border:1px solid ${item.selected ? 'var(--color-primary-200, #bae6fd)' : 'var(--color-border)'};">
                      <input type="checkbox" class="pv-chk" data-idx="${idx}" ${item.selected ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px; margin:auto;">
                      <input type="text" class="form-control pv-word" data-idx="${idx}" value="${item.word}" placeholder="Слово" style="font-size:var(--font-size-xs); padding:4px 8px; font-weight:600;">
                      <input type="text" class="form-control pv-trans" data-idx="${idx}" value="${item.transcription}" placeholder="Транскрипция" style="font-size:var(--font-size-xs); padding:4px 8px; font-family:monospace;">
                      <input type="text" class="form-control pv-transl" data-idx="${idx}" value="${item.translation}" placeholder="Перевод" style="font-size:var(--font-size-xs); padding:4px 8px;">
                      <button type="button" class="btn btn-ghost btn-sm pv-del" data-idx="${idx}" style="color:var(--color-danger); padding:2px;" title="Удалить из списка">✕</button>
                    </div>
                  `).join('')}
                </div>

                <!-- Preview Footer -->
                <div style="padding:14px 20px; border-top:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-app, #f8fafc);">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-vocab-pv">Отмена</button>
                  <button type="button" class="btn btn-primary btn-sm font-semibold" id="btn-apply-vocab-pv" ${selectedCount === 0 ? 'disabled' : ''}>
                    ✓ Добавить в урок (${selectedCount})
                  </button>
                </div>

              </div>
            `;

            previewDialog.querySelector('#btn-close-vocab-pv')?.addEventListener('click', closePreview);
            previewDialog.querySelector('#btn-cancel-vocab-pv')?.addEventListener('click', closePreview);

            previewDialog.querySelector('#pv-select-all')?.addEventListener('change', (e) => {
              const checked = e.target.checked;
              previewItems.forEach(p => p.selected = checked);
              renderPreviewBody();
            });

            previewDialog.querySelectorAll('.pv-chk').forEach(chk => {
              chk.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (previewItems[idx]) {
                  previewItems[idx].selected = e.target.checked;
                  renderPreviewBody();
                }
              });
            });

            previewDialog.querySelectorAll('.pv-word').forEach(inp => {
              inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (previewItems[idx]) previewItems[idx].word = e.target.value;
              });
            });

            previewDialog.querySelectorAll('.pv-trans').forEach(inp => {
              inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (previewItems[idx]) previewItems[idx].transcription = e.target.value;
              });
            });

            previewDialog.querySelectorAll('.pv-transl').forEach(inp => {
              inp.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                if (previewItems[idx]) previewItems[idx].translation = e.target.value;
              });
            });

            previewDialog.querySelectorAll('.pv-del').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                previewItems.splice(idx, 1);
                renderPreviewBody();
              });
            });

            previewDialog.querySelector('#btn-apply-vocab-pv')?.addEventListener('click', () => {
              const selectedWords = previewItems
                .filter(p => p.selected && p.word.trim())
                .map(p => ({
                  word: p.word.trim(),
                  transcription: p.transcription.trim(),
                  translation: p.translation.trim()
                }));

              if (selectedWords.length === 0) {
                toast.warning('Не выбрано ни одного слова для добавления');
                return;
              }

              let addedCount = 0;
              selectedWords.forEach(w => {
                const existingIdx = currentVocab.findIndex(v => v.word.trim().toLowerCase() === w.word.toLowerCase());
                if (existingIdx >= 0) {
                  currentVocab[existingIdx].transcription = currentVocab[existingIdx].transcription || w.transcription;
                  currentVocab[existingIdx].translation = currentVocab[existingIdx].translation || w.translation;
                } else {
                  currentVocab.push(w);
                  addedCount++;
                }
              });

              renderVocab();
              closePreview();
              toast.success(`Успешно добавлено ${selectedWords.length} слов из документа!`);
            });
          };

          let isPvBackdrop = false;
          previewDialog.addEventListener('mousedown', (e) => {
            if (e.target !== previewDialog) {
              isPvBackdrop = false;
              return;
            }
            const rect = previewDialog.getBoundingClientRect();
            const isIn =
              rect.top <= e.clientY &&
              e.clientY <= rect.top + rect.height &&
              rect.left <= e.clientX &&
              e.clientX <= rect.left + rect.width;
            isPvBackdrop = !isIn;
          });

          previewDialog.addEventListener('click', (e) => {
            if (isPvBackdrop && e.target === previewDialog) {
              closePreview();
            }
            isPvBackdrop = false;
          });

          previewDialog.addEventListener('close', () => {
            previewDialog.remove();
          });

          renderPreviewBody();
          if (!previewDialog.open) {
            previewDialog.showModal();
          }
        };

        vocabDocInput?.addEventListener('change', async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          e.target.value = '';

          toast.info(`Чтение документа "${file.name}"...`);
          try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/parse-vocab-doc', {
              method: 'POST',
              body: formData
            });

            const data = await res.json();
            if (!data.success || !data.words || data.words.length === 0) {
              toast.warning(data.error || 'В документе не найдены новые слова. Поддерживаются форматы: "Look [lʊk] смотри", "Word - Перевод" или таблица.');
              return;
            }

            openVocabPreview(data.words, file.name);
          } catch (err) {
            console.error('Docx vocab parse error:', err);
            toast.error('Ошибка при распознавании документа');
          }
        });

        const processFiles = async (filesList) => {
          if (!filesList || filesList.length === 0) return;
          const choiceRadio = document.querySelector('input[name="upload-category-choice"]:checked');
          const chosenCategory = choiceRadio ? choiceRadio.value : 'student';

          for (const file of filesList) {
            toast.info(`Загрузка: ${file.name}...`);
            try {
              // If file is Word and no explicit choice, teacher_admin is default
              const isWord = file.name && (file.name.endsWith('.docx') || file.name.endsWith('.doc') || file.name.endsWith('.docm') || file.name.endsWith('.dotx'));
              const targetToUse = choiceRadio ? chosenCategory : (isWord ? 'teacher_admin' : 'student');

              const saved = await store.uploadFileToServer(file, targetToUse);
              if (saved) {
                currentFiles.push(saved);
                renderFiles();
                toast.success(`Файл ${file.name} прикреплен к уроку!`);
              }
            } catch (err) {
              console.error('Error uploading file:', err);
              toast.error(`Ошибка загрузки ${file.name}`);
            }
          }
          if (fileInput) fileInput.value = '';
        };

        dropzone?.addEventListener('click', () => fileInput?.click());

        dropzone?.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = 'rgba(14, 165, 233, 0.12)';
          dropzone.style.borderColor = 'var(--color-primary-500)';
        });

        dropzone?.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = '';
          dropzone.style.borderColor = 'var(--color-primary-300)';
        });

        dropzone?.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = '';
          dropzone.style.borderColor = 'var(--color-primary-300)';
          if (e.dataTransfer && e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
          }
        });

        fileInput?.addEventListener('change', (e) => {
          const files = Array.from(e.target.files || []);
          processFiles(files);
        });

        document.getElementById('form-edit-hier-lesson')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          store.saveLessonDetails(this.currentTextbook, this.currentMonth, this.currentLesson, {
            topic: formData.get('topic'),
            homework: {
              text: formData.get('homeworkText'),
              deadline: formData.get('deadline')
            },
            vocabulary: currentVocab
              .filter(v => v.word && v.word.trim())
              .map(v => ({
                word: v.word.trim(),
                transcription: (v.transcription || '').trim(),
                translation: (v.translation || '').trim()
              })),
            files: currentFiles
          });

          const pv = document.getElementById('vocab-preview-dialog');
          if (pv) {
            if (pv.open) pv.close();
            pv.remove();
          }
          modal.close();
          toast.success('Материалы урока успешно сохранены!');
          this.render(mainContainer);
        });
      }
    });
  },

  openAddTextbookModal(mainContainer) {
    modal.open({
      title: 'Добавить новый учебник в систему',
      bodyHtml: `
        <form id="form-new-textbook">
          <div class="form-hint" style="margin-bottom:var(--space-3); background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md);">
            Будет автоматически создана структура из 10 месяцев (Сентябрь–Июнь) по 8 уроков в каждом месяце (всего 80 уроков).
          </div>
          <div class="form-group">
            <label class="form-label">Название учебника / Курса <span class="required">*</span></label>
            <input type="text" name="textbookName" class="form-control" placeholder="например, English File Intermediate 4th Ed" required autofocus>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-new-textbook" class="btn btn-primary">Создать учебник</button>
      `,
      onOpen: () => {
        document.getElementById('form-new-textbook')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const name = formData.get('textbookName').trim();
          if (name) {
            store.addTextbook(name);
            modal.close();
            toast.success(`Учебник "${name}" добавлен!`);
            this.render(mainContainer);
          }
        });
      }
    });
  }
};
