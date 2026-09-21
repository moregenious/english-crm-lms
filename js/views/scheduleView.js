/**
 * Schedule Management View - Yearly 10-Month Matrix (80 Lessons), Group Duplication, Weekly Grid & Table Views
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { openAttendanceModal } from '../components/attendanceModal.js';

export const ScheduleView = {
  viewMode: 'matrix', // 'matrix' | 'grid' | 'table'
  filterTeacher: 'all',
  filterGroup: 'all',
  filterStatus: 'all',
  days: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],

  render(container) {
    const isAdmin = auth.isAdmin();
    const isTeacher = auth.isTeacher();
    const currentTeacherId = isTeacher ? auth.getCurrentUser()?.id : null;

    const teachers = store.getTeachers();
    const groups = store.getGroups();

    // Default to first group if in matrix mode and 'all' is selected
    if (this.viewMode === 'matrix' && this.filterGroup === 'all' && groups.length > 0) {
      this.filterGroup = groups[0].id;
    }

    let schedule = store.getSchedule({
      teacherId: isTeacher ? currentTeacherId : (this.filterTeacher !== 'all' ? this.filterTeacher : null),
      groupId: this.filterGroup !== 'all' ? this.filterGroup : null,
      status: this.filterStatus !== 'all' ? this.filterStatus : null
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>📅 Расписание занятий</h1>
          <p>Годовой табель (10 месяцев по 8 уроков), январские каникулы, копирование расписания и учет посещаемости</p>
        </div>
        <div class="section-actions" style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          ${(isAdmin || isTeacher) ? `
            <button class="btn btn-ghost" id="btn-add-lesson" style="border: 1px solid var(--color-border);" title="Добавить единичный урок">
              ➕ Разовый урок
            </button>
          ` : ''}
          ${isAdmin ? `
            <button class="btn btn-primary" id="btn-generate-yearly" title="Сгенерировать 80 уроков на весь год">
              ✨ Сгенерировать на весь год
            </button>
            <button class="btn btn-secondary" id="btn-copy-schedule" title="Скопировать даты в другую группу со сменой времени">
              📋 Скопировать в другую группу
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Schedule Toolbar -->
      <div class="schedule-controls">
        <div class="filter-bar" style="margin: 0; padding: var(--space-3) var(--space-4); display:flex; flex-wrap:wrap; gap:var(--space-3); align-items:center;">
          <div class="filter-item">
            <label class="form-label" style="margin:0; font-size:var(--font-size-xs); font-weight:600;">Группа:</label>
            <select id="filter-schedule-group" class="form-control" style="font-weight:600; min-width: 180px;">
              ${this.viewMode !== 'matrix' ? `<option value="all" ${this.filterGroup === 'all' ? 'selected' : ''}>Все группы</option>` : ''}
              ${groups.map(g => `<option value="${g.id}" ${this.filterGroup === g.id ? 'selected' : ''}>${g.name} (${g.level})</option>`).join('')}
            </select>
          </div>

          ${!isTeacher ? `
            <div class="filter-item">
              <label class="form-label" style="margin:0; font-size:var(--font-size-xs);">Преподаватель:</label>
              <select id="filter-schedule-teacher" class="form-control">
                <option value="all" ${this.filterTeacher === 'all' ? 'selected' : ''}>Все преподаватели</option>
                ${teachers.map(t => `<option value="${t.id}" ${this.filterTeacher === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <div class="filter-item">
            <label class="form-label" style="margin:0; font-size:var(--font-size-xs);">Статус:</label>
            <select id="filter-schedule-status" class="form-control">
              <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>Все статусы</option>
              <option value="planned" ${this.filterStatus === 'planned' ? 'selected' : ''}>Запланирован</option>
              <option value="completed" ${this.filterStatus === 'completed' ? 'selected' : ''}>Проведен</option>
              <option value="cancelled" ${this.filterStatus === 'cancelled' ? 'selected' : ''}>Отменен</option>
            </select>
          </div>
        </div>

        <div class="view-mode-toggle">
          <button class="view-mode-btn ${this.viewMode === 'matrix' ? 'active' : ''}" id="btn-view-matrix" title="Табель на 10 месяцев по 8 уроков">
            📅 Годовой табель (10 мес × 8 ур)
          </button>
          <button class="view-mode-btn ${this.viewMode === 'grid' ? 'active' : ''}" id="btn-view-grid" title="Сетка по дням недели">
            🗓️ Недельная сетка
          </button>
          <button class="view-mode-btn ${this.viewMode === 'table' ? 'active' : ''}" id="btn-view-table" title="Список уроков">
            📋 Список уроков
          </button>
        </div>
      </div>

      <!-- Main Schedule Content Area -->
      ${this.renderActiveView(schedule, isAdmin, isTeacher)}
    `;

    this.bindEvents(container);
  },

  renderActiveView(schedule, isAdmin, isTeacher) {
    if (this.viewMode === 'matrix') {
      return this.renderMatrixView(this.filterGroup, isAdmin, isTeacher);
    } else if (this.viewMode === 'grid') {
      return this.renderWeeklyGrid(schedule, isAdmin, isTeacher);
    } else {
      return this.renderTableView(schedule, isAdmin, isTeacher);
    }
  },

  /**
   * Render the 10-month x 8-lesson yearly schedule matrix
   */
  renderMatrixView(groupId, isAdmin) {
    const group = store.getGroupById(groupId);
    if (!group) {
      return `
        <div class="card" style="text-align:center; padding:var(--space-8); color:var(--color-text-secondary);">
          <div style="font-size:2.5rem; margin-bottom:var(--space-2);">📅</div>
          <h3>Выберите группу для просмотра годового табеля</h3>
          <p>Годовое расписание формируется для каждой группы на 10 месяцев (сентябрь - июнь по 8 уроков в месяц).</p>
        </div>
      `;
    }

    const teacher = store.getTeacherById(group.teacherId);
    const students = store.getStudentsByGroupId(group.id);
    const matrix = store.getYearlyScheduleMatrix(group.id);

    // Calculate total stats
    let totalLessonsCount = 0;
    let completedCount = 0;
    let plannedCount = 0;
    let cancelledCount = 0;

    matrix.forEach(m => {
      m.lessons.forEach(l => {
        totalLessonsCount++;
        if (l.status === 'completed') completedCount++;
        else if (l.status === 'cancelled') cancelledCount++;
        else plannedCount++;
      });
    });

    const completionRate = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

    return `
      <!-- Group Quick Info Banner -->
      <div class="schedule-matrix-card">
        <div class="matrix-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-4); margin-bottom:var(--space-4); padding-bottom:var(--space-3); border-bottom:1px solid var(--color-border-subtle);">
          <div>
            <div style="display:flex; align-items:center; gap:var(--space-2); margin-bottom:4px;">
              <h2 style="margin:0; font-size:1.35rem; color:var(--color-text-primary);">👥 Группа: ${group.name}</h2>
              <span class="badge badge-level level-${group.level.toLowerCase()}">${group.level}</span>
              <span class="badge" style="background:var(--color-bg-app); border:1px solid var(--color-border);">${group.shift} смена</span>
            </div>
            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); display:flex; gap:var(--space-4); flex-wrap:wrap; margin-top:4px;">
              <span>📚 Учебник: <strong>${group.textbook || 'Не назначен'}</strong></span>
              <span>👨‍🏫 Преподаватель: <strong>${teacher ? teacher.fullName : 'Не назначен'}</strong></span>
              <span>⏰ Стандартное время: <strong>${group.scheduleTime || '16:00 - 17:00'}</strong></span>
              <span>📍 Кабинет: <strong>${group.classroom || 'Кабинет 2'}</strong></span>
              <span>👥 Учеников: <strong>${students.length}</strong></span>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:var(--space-3);">
            <div style="text-align:right;">
              <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">Годовой прогресс</div>
              <div style="font-size:1.1rem; font-weight:700; color:var(--color-primary-600);">${completedCount} / ${totalLessonsCount} уроков (${completionRate}%)</div>
            </div>
            ${isAdmin ? `
              <button class="btn btn-sm btn-primary btn-matrix-quick-gen" data-group-id="${group.id}" title="Перегенерировать расписание">
                ⚡ Перегенерировать
              </button>
              <button class="btn btn-sm btn-secondary btn-matrix-quick-copy" data-group-id="${group.id}" title="Скопировать даты в другую группу со сменой времени">
                📋 Скопировать
              </button>
            ` : ''}
          </div>
        </div>

        <!-- January Holiday Notice Banner -->
        <div class="matrix-info-banner">
          <div class="banner-icon">❄️</div>
          <div class="banner-text">
            <strong>Январские мини-каникулы:</strong> Занятия в январе возобновляются с <strong>11 января</strong>. Вся сетка дней недели автоматически сдвинута с учетом новогодних праздников. Вы можете вручную отредактировать любую дату, кликнув на ячейку.
          </div>
        </div>

        <!-- 10 Month x 8 Lesson Table -->
        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="col-month" style="width: 140px;">Месяц</th>
                <th class="col-lesson">Урок 1</th>
                <th class="col-lesson">Урок 2</th>
                <th class="col-lesson">Урок 3</th>
                <th class="col-lesson">Урок 4</th>
                <th class="col-lesson">Урок 5</th>
                <th class="col-lesson">Урок 6</th>
                <th class="col-lesson">Урок 7</th>
                <th class="col-lesson">Урок 8</th>
                <th class="col-summary" style="width: 120px; text-align:center;">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              ${matrix.map(row => {
                const isJan = row.monthIndex === 5;
                const monthCompleted = row.lessons.filter(l => l.status === 'completed').length;
                const monthTotal = row.lessons.length;

                return `
                  <tr class="${isJan ? 'matrix-row-january' : ''}">
                    <td class="col-month">
                      <div class="month-name font-semibold" style="display:flex; align-items:center; gap:4px;">
                        <span>${row.monthNumber}. ${row.monthName}</span>
                        ${isJan ? '<span title="Зимние каникулы до 11.01">❄️</span>' : ''}
                      </div>
                      <div class="text-xs text-muted">8 уроков</div>
                    </td>

                    ${[1, 2, 3, 4, 5, 6, 7, 8].map(lessonNum => {
                      const lesson = row.lessons.find(l => (l.lessonNumber === lessonNum || l.lessonNumberInMonth === lessonNum));
                      const mIdx = row.monthNumber || row.monthIndex || 1;

                      if (!lesson || !lesson.date) {
                        return `
                          <td class="matrix-cell empty-slot" data-group-id="${group.id}" data-month-index="${mIdx}" data-lesson-num="${lessonNum}">
                            <div class="empty-cell-btn" title="Добавить урок">+</div>
                          </td>
                        `;
                      }

                      const statusClass = `status-${lesson.status || 'planned'}`;
                      const statusIcon = lesson.status === 'completed' ? '✓' : (lesson.status === 'cancelled' ? '✕' : '⏳');
                      const cellDay = lesson.dayOfWeekShort || lesson.shortDay || lesson.dayOfWeek?.slice(0, 2).toLowerCase() || '';

                      return `
                        <td class="matrix-cell ${statusClass}" data-lesson-id="${lesson.id}" data-group-id="${group.id}" data-month-index="${mIdx}" data-lesson-num="${lessonNum}" title="Урок ${lessonNum} • ${lesson.dayOfWeek || ''} ${lesson.date} • ${lesson.time || ''}\nТема: ${lesson.topic || ''}\nСтатус: ${lesson.status === 'completed' ? 'Проведен' : (lesson.status === 'cancelled' ? 'Отменен' : 'Запланирован')}">
                          <div class="matrix-cell-date">${lesson.date || lesson.displayDate || '—'}</div>
                          <div class="matrix-cell-day">${cellDay}</div>
                          <div class="matrix-cell-status-badge">
                            <span class="status-dot"></span>
                            <span class="status-icon">${statusIcon}</span>
                          </div>
                        </td>
                      `;
                    }).join('')}

                    <td class="col-summary" style="text-align:center;">
                      <div class="text-xs font-semibold" style="color:var(--color-primary-600);">${monthCompleted}/${monthTotal}</div>
                      <div class="progress-bar-wrap" style="height:6px; background:var(--color-border-subtle); border-radius:3px; margin-top:4px; overflow:hidden;">
                        <div style="height:100%; width:${monthTotal > 0 ? (monthCompleted/monthTotal)*100 : 0}%; background:var(--color-success); border-radius:3px;"></div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-4); padding-top:var(--space-3); border-top:1px solid var(--color-border-subtle); font-size:var(--font-size-xs); color:var(--color-text-secondary); flex-wrap:wrap; gap:var(--space-3);">
          <div style="display:flex; gap:var(--space-4); align-items:center;">
            <span style="font-weight:600;">Обозначения:</span>
            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--color-primary-500); display:inline-block;"></span> ⏳ Запланирован</span>
            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--color-success); display:inline-block;"></span> ✓ Проведен</span>
            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:10px; height:10px; border-radius:50%; background:var(--color-danger); display:inline-block;"></span> ✕ Отменен</span>
          </div>
          <div>
            💡 <em>Нажмите на любую ячейку для изменения даты, времени, статуса или темы урока.</em>
          </div>
        </div>
      </div>
    `;
  },

  pluralizeLessons(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'урок';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'урока';
    return 'уроков';
  },

  getCurrentWeekDates() {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    return this.days.map((dayName, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      return {
        dayIndex: i,
        dayName,
        date: d,
        formattedDDMM: `${dayStr}.${monthStr}`,
        formattedFull: `${dayStr}.${monthStr}.${yearStr}`,
        isoDate: `${yearStr}-${monthStr}-${dayStr}`,
        isToday: d.toDateString() === now.toDateString()
      };
    });
  },

  renderWeeklyGrid(schedule, isAdmin, isTeacher) {
    const weekDays = this.getCurrentWeekDates();
    const weekStart = weekDays[0].formattedDDMM;
    const weekEnd = weekDays[6].formattedDDMM;

    return `
      <div style="margin-bottom: var(--space-3); display: flex; justify-content: space-between; align-items: center; background: var(--color-bg-surface); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--color-border); flex-wrap: wrap; gap: var(--space-2);">
        <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
          <span>🗓️ Текущая календарная неделя:</span>
          <span class="badge badge-primary" style="font-size: 0.8rem; padding: 4px 10px;">${weekStart} — ${weekEnd}</span>
        </div>
        <div class="text-xs text-muted">
          Показаны только уроки текущей недели. Для просмотра всех 80 уроков используйте «Годовой табель».
        </div>
      </div>

      <div class="calendar-week-grid">
        ${weekDays.map(dayInfo => {
          const dayLessons = schedule.filter(s => {
            if (!s) return false;
            if (s.date) {
              const cleanDate = s.date.trim();
              return cleanDate === dayInfo.formattedDDMM || 
                     cleanDate === dayInfo.formattedFull || 
                     cleanDate === dayInfo.isoDate;
            }
            return false;
          });

          dayLessons.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

          return `
            <div class="calendar-day-col" style="${dayInfo.isToday ? 'border: 2px solid var(--color-primary);' : ''}">
              <div class="day-col-header" style="${dayInfo.isToday ? 'background: rgba(99, 102, 241, 0.08);' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div class="day-col-title" style="${dayInfo.isToday ? 'color: var(--color-primary); font-weight: 800;' : ''}">${dayInfo.dayName}</div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: ${dayInfo.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)'};">${dayInfo.formattedDDMM}</div>
                </div>
                <div class="day-col-subtitle" style="margin-top: 2px;">
                  ${dayLessons.length} ${this.pluralizeLessons(dayLessons.length)} ${dayInfo.isToday ? '• <strong style="color:var(--color-primary)">Сегодня</strong>' : ''}
                </div>
              </div>
              <div class="day-col-events">
                ${dayLessons.length === 0 ? `
                  <div style="text-align:center; padding:var(--space-6) 0; color:var(--color-text-muted); font-size:var(--font-size-xs);">
                    Нет занятий
                  </div>
                ` : dayLessons.map(l => this.renderLessonCard(l, isAdmin, isTeacher)).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderLessonCard(lesson, isAdmin, isTeacher) {
    const isGroup = !!lesson.groupId;
    const group = isGroup ? store.getGroupById(lesson.groupId) : null;
    const student = !isGroup ? store.getStudentById(lesson.studentId) : null;
    const teacher = store.getTeacherById(lesson.teacherId);
    const groupStudents = isGroup ? store.getStudentsByGroupId(lesson.groupId) : [];

    const statusBadge = {
      planned: '<span class="badge badge-planned">⏳ Запланирован</span>',
      completed: '<span class="badge badge-completed">✓ Проведен</span>',
      cancelled: '<span class="badge badge-cancelled">✕ Отменен</span>'
    }[lesson.status] || lesson.status;

    return `
      <div class="lesson-card status-${lesson.status}" data-lesson-id="${lesson.id}">
        <div class="lesson-time">
          <span>⏰ ${lesson.time} ${lesson.date ? `(${lesson.date})` : ''}</span>
          ${statusBadge}
        </div>

        <div class="lesson-student-name">
          ${isGroup ? `👥 ${group ? group.name : 'Группа удалена'}` : `👤 ${student ? student.fullName : 'Ученик удален'}`}
        </div>

        <div class="text-xs text-muted" style="margin-top:2px;">
          ${isGroup ? `
            <span class="badge badge-level level-${group ? group.level.toLowerCase() : 'beginner'}" style="font-size:0.65rem;">${group ? group.level : ''}</span>
            <span style="font-size:0.7rem; color:var(--color-text-secondary); display:block; margin-top:2px;">
              Состав: ${groupStudents.length} уч. (${groupStudents.map(s => s.fullName.split(' ')[0]).join(', ')})
            </span>
          ` : `
            ${student ? `<span class="badge badge-level level-${student.level.toLowerCase()}" style="font-size:0.65rem;">${student.level}</span>` : ''}
          `}
        </div>

        <div class="lesson-teacher-name" style="margin-top:4px;">
          👨‍🏫 ${teacher ? teacher.fullName.split(' ')[0] + ' ' + teacher.fullName.split(' ')[1] : '—'}
        </div>

        <div class="lesson-topic" title="${lesson.topic}">
          📝 ${lesson.topic || 'Тема занятия'}
        </div>

        <div class="text-xs text-muted" style="margin-top:4px;">
          📍 ${lesson.format || 'Кабинет 2'}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-3); padding-top:var(--space-2); border-top:1px dashed var(--color-border-subtle); flex-wrap:wrap; gap:4px;">
          <div style="display:flex; gap:4px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-xs ${lesson.status === 'completed' ? 'btn-primary' : 'btn-ghost'} btn-set-status" data-id="${lesson.id}" data-status="completed" title="Отметить как проведенный" style="${lesson.status === 'completed' ? 'background:var(--color-success); border-color:var(--color-success);' : 'color:var(--color-success);'} padding:2px 6px;">✓ Проведен</button>
            <button class="btn btn-xs ${lesson.status === 'cancelled' ? 'btn-primary' : 'btn-ghost'} btn-set-status" data-id="${lesson.id}" data-status="cancelled" title="Отменить урок" style="${lesson.status === 'cancelled' ? 'background:var(--color-danger); border-color:var(--color-danger);' : 'color:var(--color-danger);'} padding:2px 6px;">✕ Отмена</button>
            <button class="btn btn-xs ${lesson.status === 'planned' ? 'btn-secondary' : 'btn-ghost'} btn-set-status" data-id="${lesson.id}" data-status="planned" title="Вернуть в запланированные" style="font-size:0.7rem; padding:2px 6px;">⏳ Запланирован</button>
          </div>

          <div style="display:flex; gap:4px; align-items:center;">
            <button class="btn btn-ghost btn-xs btn-open-attendance" data-id="${lesson.id}" style="padding:2px 6px; font-weight:600; color:var(--color-primary);" title="Отметить посещаемость">👥 Посещаемость</button>
            ${(isAdmin || isTeacher) ? `
              <button class="btn btn-ghost btn-xs btn-edit-lesson" data-id="${lesson.id}" style="padding:2px 6px;" title="Редактировать">✏️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderTableView(schedule, isAdmin, isTeacher) {
    return `
      <div class="card" style="padding: 0; overflow:hidden;">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Дата / День / Время</th>
                <th>Группа / Ученик</th>
                <th>Уровень / Учебник</th>
                <th>Преподаватель</th>
                <th>Тема урока</th>
                <th>Формат</th>
                <th>Статус</th>
                <th style="text-align: right;">Действия</th>
              </tr>
            </thead>
            <tbody>
              ${schedule.map(l => {
                const isGroup = !!l.groupId;
                const group = isGroup ? store.getGroupById(l.groupId) : null;
                const student = !isGroup ? store.getStudentById(l.studentId) : null;
                const teacher = store.getTeacherById(l.teacherId);
                const level = isGroup ? group?.level : student?.level;
                const textbook = isGroup ? group?.textbook : student?.textbook;

                return `
                  <tr>
                    <td>
                      <div class="font-semibold">${l.date ? `${l.date} • ` : ''}${l.dayOfWeek}</div>
                      <div class="text-xs text-muted">${l.time}</div>
                    </td>
                    <td>
                      <div class="font-semibold">${isGroup ? `👥 ${group ? group.name : '—'}` : `👤 ${student ? student.fullName : '—'}`}</div>
                      <div class="text-xs text-muted">${isGroup ? `${store.getStudentsByGroupId(l.groupId).length} учеников` : (student ? student.grade : '')}</div>
                    </td>
                    <td>
                      ${level ? `<span class="badge badge-level level-${level.toLowerCase()}">${level}</span>` : '—'}
                      <div class="text-xs text-muted truncate" style="max-width:140px;" title="${textbook}">${textbook || ''}</div>
                    </td>
                    <td>${teacher ? teacher.fullName : '—'}</td>
                    <td>${l.topic}</td>
                    <td><span class="text-xs">${l.format}</span></td>
                    <td>
                      <select class="form-control select-lesson-status" data-id="${l.id}" style="font-size:var(--font-size-xs); padding:0.2rem 0.4rem; width:auto;">
                        <option value="planned" ${l.status === 'planned' ? 'selected' : ''}>⏳ Запланирован</option>
                        <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>✓ Проведен</option>
                        <option value="cancelled" ${l.status === 'cancelled' ? 'selected' : ''}>✕ Отменен</option>
                      </select>
                    </td>
                    <td style="text-align: right; white-space: nowrap;">
                      <button class="btn btn-ghost btn-sm btn-open-attendance" data-id="${l.id}" title="Отметить посещаемость" style="color:var(--color-primary); padding:2px 6px;">👥</button>
                      ${(isAdmin || isTeacher) ? `
                        <button class="btn btn-ghost btn-sm btn-edit-lesson" data-id="${l.id}" title="Редактировать">✏️</button>
                      ` : ''}
                      ${isAdmin ? `
                        <button class="btn btn-ghost btn-sm btn-delete-lesson" data-id="${l.id}" style="color:var(--color-danger)" title="Удалить">🗑️</button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    container.querySelector('#btn-view-matrix')?.addEventListener('click', () => {
      this.viewMode = 'matrix';
      this.render(container);
    });

    container.querySelector('#btn-view-grid')?.addEventListener('click', () => {
      this.viewMode = 'grid';
      this.render(container);
    });

    container.querySelector('#btn-view-table')?.addEventListener('click', () => {
      this.viewMode = 'table';
      this.render(container);
    });

    container.querySelector('#filter-schedule-group')?.addEventListener('change', (e) => {
      this.filterGroup = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-schedule-teacher')?.addEventListener('change', (e) => {
      this.filterTeacher = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-schedule-status')?.addEventListener('change', (e) => {
      this.filterStatus = e.target.value;
      this.render(container);
    });

    container.querySelector('#btn-generate-yearly')?.addEventListener('click', () => {
      this.openGenerateYearlyModal(container);
    });

    container.querySelector('.btn-matrix-quick-gen')?.addEventListener('click', (e) => {
      const groupId = e.currentTarget.getAttribute('data-group-id');
      this.openGenerateYearlyModal(container, groupId);
    });

    container.querySelector('#btn-copy-schedule')?.addEventListener('click', () => {
      this.openCopyScheduleModal(container);
    });

    container.querySelector('.btn-matrix-quick-copy')?.addEventListener('click', (e) => {
      const groupId = e.currentTarget.getAttribute('data-group-id');
      this.openCopyScheduleModal(container, groupId);
    });

    container.querySelector('#btn-add-lesson')?.addEventListener('click', () => this.openAddModal(container));

    // Matrix cell click for editing or creating
    container.querySelectorAll('.matrix-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const lessonId = cell.getAttribute('data-lesson-id');
        const groupId = cell.getAttribute('data-group-id');
        const monthIndex = parseInt(cell.getAttribute('data-month-index'), 10);
        const lessonNum = parseInt(cell.getAttribute('data-lesson-num'), 10);

        if (lessonId) {
          const lesson = store.getLessonById(lessonId);
          this.openCellEditModal(lesson, container);
        } else {
          // Empty slot, create new lesson for this slot
          this.openCellCreateModal(groupId, monthIndex, lessonNum, container);
        }
      });
    });

    container.querySelectorAll('.btn-set-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const status = e.currentTarget.getAttribute('data-status');
        store.updateLessonStatus(id, status);
        if (status === 'completed') {
          toast.success('Урок отмечен как проведенный!');
        } else if (status === 'cancelled') {
          toast.warning('Урок отменен.');
        } else {
          toast.info('Урок возвращен в статус запланированных.');
        }
        this.render(container);
      });
    });

    container.querySelectorAll('.select-lesson-status').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const status = e.target.value;
        store.updateLessonStatus(id, status);
        if (status === 'completed') {
          toast.success('Урок отмечен как проведенный!');
        } else if (status === 'cancelled') {
          toast.warning('Урок отменен.');
        } else {
          toast.info('Урок возвращен в статус запланированных.');
        }
        this.render(container);
      });
    });

    container.querySelectorAll('.btn-open-attendance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        openAttendanceModal(id, () => this.render(container));
      });
    });

    container.querySelectorAll('.btn-edit-lesson').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditModal(id, container);
      });
    });

    container.querySelectorAll('.btn-delete-lesson').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('Удалить урок из расписания?')) {
          store.deleteLesson(id);
          toast.success('Урок удален');
          this.render(container);
        }
      });
    });
  },

  /**
   * Modal: Generate Yearly Schedule for a Group (80 lessons across 10 months)
   */
  openGenerateYearlyModal(container, preselectedGroupId = null) {
    const groups = store.getGroups();
    const teachers = store.getTeachers();
    const defaultGroup = preselectedGroupId ? store.getGroupById(preselectedGroupId) : (groups[0] || null);

    let currentCalculatedDates = store.calculateDefaultYearlyDates({
      startDate: '07.09',
      dayPair: 'пн-чт',
      holidayStart: '25.12',
      holidayEnd: '10.01',
      baseYear: 2026
    });

    modal.open({
      title: '✨ Генератор годового расписания (10 месяцев / 80 уроков)',
      bodyHtml: `
        <form id="form-generate-yearly" style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div class="matrix-info-banner" style="margin-bottom:0;">
            <div class="banner-icon">🎯</div>
            <div class="banner-text">
              Задайте <strong>дату начала занятий</strong> (например, 07.09), выберите <strong>дни недели</strong> и <strong>период зимних каникул</strong> (с 25.12 по 10.01). Программа автоматически сгенерирует 80 уроков с возобновлением занятий с 11.01 и окончанием в июне.
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Целевая учебная группа <span class="required">*</span></label>
              <select name="groupId" id="gen-group-select" class="form-control font-semibold" required>
                ${groups.map(g => `<option value="${g.id}" ${(defaultGroup && defaultGroup.id === g.id) ? 'selected' : ''}>👥 ${g.name} (${g.level}, ${g.shift} смена)</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Преподаватель <span class="required">*</span></label>
              <select name="teacherId" id="gen-teacher-select" class="form-control" required>
                ${teachers.map(t => `<option value="${t.id}" ${(defaultGroup && defaultGroup.teacherId === t.id) ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- 1. Start Date Section -->
          <div class="form-group" style="background: var(--color-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <label class="form-label" style="font-weight: 700; color: var(--color-text-primary); display:flex; justify-content:space-between;">
              <span>📅 Дата начала учебного года (первое занятие):</span>
              <span class="text-xs text-muted">Формат: ДД.ММ или ДД.ММ.ГГГГ</span>
            </label>
            <div style="display:flex; gap:var(--space-3); align-items:center; flex-wrap:wrap;">
              <input type="text" name="startDate" id="gen-start-date" class="form-control font-semibold" value="07.09" placeholder="07.09" style="max-width: 140px;" required>
              <div style="display:flex; gap:var(--space-1); flex-wrap:wrap;">
                <button type="button" class="btn btn-xs btn-outline start-date-preset active" data-date="07.09">07.09 (Пн)</button>
                <button type="button" class="btn btn-xs btn-outline start-date-preset" data-date="08.09">08.09 (Вт)</button>
                <button type="button" class="btn btn-xs btn-outline start-date-preset" data-date="09.09">09.09 (Ср)</button>
                <button type="button" class="btn btn-xs btn-outline start-date-preset" data-date="01.09">01.09</button>
                <button type="button" class="btn btn-xs btn-outline start-date-preset" data-date="14.09">14.09</button>
              </div>
            </div>
          </div>

          <!-- 2. Day Pairs & Checkboxes -->
          <div class="form-group" style="background: var(--color-bg-subtle); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <label class="form-label" style="font-weight: 700; color: var(--color-text-primary);">
              🗓️ Связка дней проведения уроков:
            </label>
            <div class="day-pair-presets" style="display:flex; gap:var(--space-2); flex-wrap:wrap; margin-bottom:var(--space-3);">
              <button type="button" class="btn btn-sm btn-outline preset-day-btn active" data-pair="пн-чт">Пн - Чт</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="вт-пт">Вт - Пт</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="ср-пт">Ср - Пт</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="ср-сб">Ср - Сб</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="пн-ср">Пн - Ср</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="вт-чт">Вт - Чт</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="сб-вс">Сб - Вс</button>
              <button type="button" class="btn btn-sm btn-outline preset-day-btn" data-pair="пн-ср-пт">Пн - Ср - Пт</button>
            </div>
            
            <div style="display:flex; gap:var(--space-3); align-items:center; flex-wrap:wrap; font-size:var(--font-size-xs); color:var(--color-text-secondary); border-top:1px dashed var(--color-border); padding-top:var(--space-2);">
              <span style="font-weight:600;">Или выберите дни вручную:</span>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="1" checked> Пн</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="2"> Вт</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="3"> Ср</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="4" checked> Чт</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="5"> Пт</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="6"> Сб</label>
              <label style="display:inline-flex; align-items:center; gap:3px; cursor:pointer;"><input type="checkbox" class="cb-day" value="0"> Вс</label>
            </div>
            <input type="hidden" name="dayPair" id="gen-day-pair" value="пн-чт">
          </div>

          <!-- 3. Winter Holidays Section -->
          <div class="form-group" style="background: rgba(14, 165, 233, 0.06); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid rgba(14, 165, 233, 0.25);">
            <label class="form-label" style="font-weight: 700; color: var(--color-text-primary); display:flex; align-items:center; gap:6px;">
              <span>❄️ Период зимних мини-каникул:</span>
            </label>
            <div class="form-row" style="margin-bottom:4px;">
              <div class="form-group" style="flex:1; margin:0;">
                <label class="form-label" style="font-size:var(--font-size-xs); margin:0 0 2px 0;">Начало каникул:</label>
                <input type="text" name="holidayStart" id="gen-holiday-start" class="form-control font-semibold" value="25.12" placeholder="25.12" required>
                <small class="text-xs text-muted">Последний урок перед каникулами: 24.12</small>
              </div>
              <div class="form-group" style="flex:1; margin:0;">
                <label class="form-label" style="font-size:var(--font-size-xs); margin:0 0 2px 0;">Окончание каникул:</label>
                <input type="text" name="holidayEnd" id="gen-holiday-end" class="form-control font-semibold" value="10.01" placeholder="10.01" required>
                <small class="text-xs text-muted" style="color:var(--color-primary-600); font-weight:600;">Занятия возобновляются с 11.01</small>
              </div>
            </div>
          </div>

          <!-- 4. Time & Format -->
          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Время занятий <span class="required">*</span></label>
              <input type="text" name="time" id="gen-time-input" class="form-control font-semibold" value="${defaultGroup?.scheduleTime || '16:00 - 17:00'}" placeholder="16:00 - 17:00" required>
              <div style="display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;">
                <button type="button" class="btn btn-xs btn-ghost time-preset-btn" data-time="09:30 - 10:30">09:30-10:30</button>
                <button type="button" class="btn btn-xs btn-ghost time-preset-btn" data-time="15:00 - 16:00">15:00-16:00</button>
                <button type="button" class="btn btn-xs btn-ghost time-preset-btn" data-time="16:00 - 17:00">16:00-17:00</button>
                <button type="button" class="btn btn-xs btn-ghost time-preset-btn" data-time="17:15 - 18:15">17:15-18:15</button>
                <button type="button" class="btn btn-xs btn-ghost time-preset-btn" data-time="18:30 - 19:30">18:30-19:30</button>
              </div>
            </div>

            <div class="form-group" style="flex:1;">
              <label class="form-label">Формат / Кабинет</label>
              <input type="text" name="format" id="gen-format-input" class="form-control" value="${defaultGroup?.classroom || 'Кабинет 2'}" placeholder="Кабинет 2">
            </div>
          </div>

          <!-- 5. Live Generated Preview of Dates -->
          <div class="form-group">
            <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700;">Предварительный просмотр 10 месяцев × 8 уроков:</span>
              <span id="gen-preview-badge" class="badge" style="background:var(--color-primary-50); color:var(--color-primary-700); border:1px solid var(--color-primary-200); font-weight:600;">80 уроков на год</span>
            </label>
            <div id="gen-preview-matrix-container" style="max-height: 280px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2); background: var(--color-bg-subtle);">
              <!-- Will be rendered dynamically -->
            </div>
          </div>

          <div class="form-group">
            <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer;">
              <input type="checkbox" name="replaceExisting" value="true" checked>
              <span style="font-weight:600; font-size:var(--font-size-sm); color:var(--color-danger);">Заменить существующее расписание выбранной группы</span>
            </label>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="button" id="btn-submit-generate-yearly" class="btn btn-primary" style="font-weight:700; padding:var(--space-2) var(--space-4);">⚡ Сгенерировать 80 уроков на год</button>
      `,
      onOpen: () => {
        const startDateInput = document.getElementById('gen-start-date');
        const dayPairButtons = document.querySelectorAll('.preset-day-btn');
        const dayPairInput = document.getElementById('gen-day-pair');
        const holidayStartInput = document.getElementById('gen-holiday-start');
        const holidayEndInput = document.getElementById('gen-holiday-end');
        const groupSelect = document.getElementById('gen-group-select');
        const teacherSelect = document.getElementById('gen-teacher-select');
        const formatInput = document.getElementById('gen-format-input');
        const timeInput = document.getElementById('gen-time-input');
        const previewContainer = document.getElementById('gen-preview-matrix-container');
        const dayCheckboxes = document.querySelectorAll('.cb-day');

        const getSelectedDays = () => {
          const checked = [];
          dayCheckboxes.forEach(cb => {
            if (cb.checked) checked.push(parseInt(cb.value, 10));
          });
          return checked.length ? checked : null;
        };

        const updatePreview = () => {
          const startDate = (startDateInput ? startDateInput.value.trim() : '') || '07.09';
          const dayPair = dayPairInput ? dayPairInput.value : 'пн-чт';
          const customWeekdays = getSelectedDays();
          const holidayStart = (holidayStartInput ? holidayStartInput.value.trim() : '') || '25.12';
          const holidayEnd = (holidayEndInput ? holidayEndInput.value.trim() : '') || '10.01';

          currentCalculatedDates = store.calculateDefaultYearlyDates({
            startDate,
            dayPair,
            customWeekdays,
            holidayStart,
            holidayEnd,
            baseYear: 2026
          });

          if (!previewContainer) return;

          const firstLesson = currentCalculatedDates[0]?.lessons[0];
          const lastBeforeHol = currentCalculatedDates[3]?.lessons[7];
          const firstAfterHol = currentCalculatedDates[4]?.lessons[0];
          const finalLesson = currentCalculatedDates[9]?.lessons[7];

          previewContainer.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--color-text-secondary); margin-bottom:6px; padding:4px 8px; background:var(--color-bg-card); border-radius:4px; border:1px solid var(--color-border-subtle); flex-wrap:wrap; gap:4px;">
              <span>🏁 Старт: <strong>${firstLesson ? `${firstLesson.date} (${firstLesson.dayOfWeekShort})` : '—'}</strong></span>
              <span>❄️ До каникул: <strong>${lastBeforeHol ? `${lastBeforeHol.date} (${lastBeforeHol.dayOfWeekShort})` : '—'}</strong></span>
              <span>🌟 Возобновление: <strong>${firstAfterHol ? `${firstAfterHol.date} (${firstAfterHol.dayOfWeekShort})` : '—'}</strong></span>
              <span>🎓 Финал года: <strong>${finalLesson ? `${finalLesson.date} (${finalLesson.dayOfWeekShort})` : '—'}</strong></span>
            </div>

            <table class="data-table" style="font-size: 0.75rem; margin: 0; width: 100%;">
              <thead>
                <tr>
                  <th style="padding: 4px 6px;">Месяц</th>
                  ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<th style="padding: 4px 6px; text-align:center;">Ур ${n}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${currentCalculatedDates.map(m => {
                  const isJan = (m.monthNumber === 5 || m.monthIndex === 5);
                  const isDec = (m.monthNumber === 4);
                  const lessonList = m.lessons || m.dates || [];
                  return `
                    <tr style="${isJan ? 'background: rgba(14, 165, 233, 0.08);' : ''}">
                      <td style="padding: 4px 6px; font-weight: 600;">
                        ${m.monthName || `${m.monthNumber}. Месяц`} ${isJan ? '❄️' : ''}
                      </td>
                      ${lessonList.map((d, lIdx) => {
                        const isLastBeforeBreak = (isDec && lIdx === 7);
                        const isFirstAfterBreak = (isJan && lIdx === 0);
                        let cellBg = 'var(--color-bg-card)';
                        let cellBorder = 'var(--color-border)';
                        if (isLastBeforeBreak) {
                          cellBg = '#fef3c7';
                          cellBorder = '#f59e0b';
                        } else if (isFirstAfterBreak) {
                          cellBg = '#e0f2fe';
                          cellBorder = '#0284c7';
                        }
                        return `
                          <td style="padding: 4px 6px; text-align:center;">
                            <span style="display:inline-block; padding: 2px 4px; background: ${cellBg}; border-radius: 3px; border: 1px solid ${cellBorder}; font-family: monospace;" title="Урок ${lIdx+1} • ${d.dayOfWeek}">
                              ${d.date || d.shortDisplay || ''} <small style="color:var(--color-primary-600); font-weight:600;">${d.dayOfWeekShort || d.shortDay || ''}</small>
                            </span>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `;
        };

        // Start date presets
        document.querySelectorAll('.start-date-preset').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.start-date-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (startDateInput) startDateInput.value = btn.getAttribute('data-date');
            updatePreview();
          });
        });

        startDateInput?.addEventListener('input', updatePreview);

        // Day pair clicks
        const pairDaysMap = {
          'пн-чт': [1, 4],
          'вт-пт': [2, 5],
          'ср-пт': [3, 5],
          'ср-сб': [3, 6],
          'пн-ср': [1, 3],
          'вт-чт': [2, 4],
          'сб-вс': [6, 0],
          'пн-ср-пт': [1, 3, 5]
        };

        dayPairButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            dayPairButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const pair = btn.getAttribute('data-pair');
            if (dayPairInput) dayPairInput.value = pair;

            // Sync checkboxes
            const activeDays = pairDaysMap[pair] || [1, 4];
            dayCheckboxes.forEach(cb => {
              cb.checked = activeDays.includes(parseInt(cb.value, 10));
            });

            updatePreview();
          });
        });

        // Checkboxes change
        dayCheckboxes.forEach(cb => {
          cb.addEventListener('change', () => {
            dayPairButtons.forEach(b => b.classList.remove('active'));
            updatePreview();
          });
        });

        // Holiday inputs change
        holidayStartInput?.addEventListener('input', updatePreview);
        holidayEndInput?.addEventListener('input', updatePreview);

        // Time preset clicks
        document.querySelectorAll('.time-preset-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (timeInput) timeInput.value = btn.getAttribute('data-time');
          });
        });

        groupSelect?.addEventListener('change', (e) => {
          const g = store.getGroupById(e.target.value);
          if (g) {
            if (teacherSelect && g.teacherId) teacherSelect.value = g.teacherId;
            if (formatInput && g.classroom) formatInput.value = g.classroom;
            if (timeInput && g.scheduleTime) timeInput.value = g.scheduleTime;
          }
        });

        updatePreview();

        const submitAction = () => {
          const form = document.getElementById('form-generate-yearly');
          const formData = form ? new FormData(form) : null;
          const groupId = (formData ? formData.get('groupId') : groupSelect?.value) || defaultGroup?.id;
          const teacherId = (formData ? formData.get('teacherId') : teacherSelect?.value) || null;
          const time = (formData ? formData.get('time') : timeInput?.value) || '16:00 - 17:00';
          const format = (formData ? formData.get('format') : formatInput?.value) || 'Кабинет 2';
          const startDate = (formData ? formData.get('startDate') : startDateInput?.value) || '07.09';
          const dayPair = (formData ? formData.get('dayPair') : dayPairInput?.value) || 'пн-чт';
          const customWeekdays = getSelectedDays();
          const holidayStart = (formData ? formData.get('holidayStart') : holidayStartInput?.value) || '25.12';
          const holidayEnd = (formData ? formData.get('holidayEnd') : holidayEndInput?.value) || '10.01';

          const created = store.generateYearlyScheduleForGroup({
            groupId,
            teacherId,
            time,
            format,
            startDate,
            dayPair,
            customWeekdays,
            holidayStart,
            holidayEnd,
            baseYear: 2026,
            replaceExisting: true
          });

          modal.close();
          toast.success(`Годовое расписание на ${created ? created.length : 80} уроков успешно создано!`);
          this.filterGroup = groupId;
          this.viewMode = 'matrix';
          this.render(container);
        };

        document.getElementById('form-generate-yearly')?.addEventListener('submit', (e) => {
          e.preventDefault();
          submitAction();
        });

        document.getElementById('btn-submit-generate-yearly')?.addEventListener('click', (e) => {
          e.preventDefault();
          submitAction();
        });
      }
    });
  },

  /**
   * Modal: Duplicate / Copy schedule from Group A to Group B with time customization
   */
  openCopyScheduleModal(container, preselectedSourceGroupId = null) {
    const groups = store.getGroups();
    const teachers = store.getTeachers();

    const sourceGroup = preselectedSourceGroupId ? store.getGroupById(preselectedSourceGroupId) : (groups[0] || null);
    const targetGroup = groups.find(g => g.id !== sourceGroup?.id) || groups[1] || groups[0];

    modal.open({
      title: '📋 Дублирование / Копирование расписания в другую группу',
      bodyHtml: `
        <form id="form-copy-schedule" style="display:flex; flex-direction:column; gap:var(--space-4);">
          <div class="matrix-info-banner" style="margin-bottom:0;">
            <div class="banner-icon">🔄</div>
            <div class="banner-text">
              Все 80 дат занятий (10 месяцев по 8 уроков) и дни недели копируются из исходной группы. Вы можете легко <strong>задать новое время занятий</strong> для новой группы.
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Исходная группа (откуда берем даты) <span class="required">*</span></label>
              <select name="sourceGroupId" id="copy-source-group" class="form-control" required>
                ${groups.map(g => `<option value="${g.id}" ${(sourceGroup && sourceGroup.id === g.id) ? 'selected' : ''}>👥 ${g.name} (${g.level}) [${store.getSchedule({ groupId: g.id }).length} уроков]</option>`).join('')}
              </select>
            </div>

            <div class="form-group" style="flex:1;">
              <label class="form-label">Целевая группа (куда копируем) <span class="required">*</span></label>
              <select name="targetGroupId" id="copy-target-group" class="form-control" required>
                ${groups.map(g => `<option value="${g.id}" ${(targetGroup && targetGroup.id === g.id) ? 'selected' : ''}>👥 ${g.name} (${g.level}, ${g.shift} смена)</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Новое время занятий для целевой группы <span class="required">*</span></label>
              <input type="text" name="newTime" id="copy-time-input" class="form-control" value="${targetGroup?.scheduleTime || '18:00 - 19:00'}" placeholder="например, 18:00 - 19:00" required>
              <div style="display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;">
                <button type="button" class="btn btn-xs btn-ghost copy-time-preset" data-time="09:30 - 10:30">09:30-10:30</button>
                <button type="button" class="btn btn-xs btn-ghost copy-time-preset" data-time="15:00 - 16:00">15:00-16:00</button>
                <button type="button" class="btn btn-xs btn-ghost copy-time-preset" data-time="17:15 - 18:15">17:15-18:15</button>
                <button type="button" class="btn btn-xs btn-ghost copy-time-preset" data-time="18:30 - 19:30">18:30-19:30</button>
              </div>
            </div>

            <div class="form-group" style="flex:1;">
              <label class="form-label">Преподаватель целевой группы</label>
              <select name="newTeacherId" id="copy-teacher-select" class="form-control">
                ${teachers.map(t => `<option value="${t.id}" ${(targetGroup && targetGroup.teacherId === t.id) ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Кабинет / Формат</label>
            <input type="text" name="newFormat" class="form-control" value="${targetGroup?.classroom || 'Кабинет 3'}" placeholder="Кабинет 3">
          </div>

          <div class="form-group">
            <label style="display:flex; align-items:center; gap:var(--space-2); cursor:pointer;">
              <input type="checkbox" name="replaceExisting" value="true" checked>
              <span style="font-weight:600; font-size:var(--font-size-sm); color:var(--color-danger);">Заменить существующие уроки в целевой группе</span>
            </label>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="button" id="btn-submit-copy-schedule" class="btn btn-primary">📋 Скопировать 80 уроков с новым временем</button>
      `,
      onOpen: () => {
        const timeInput = document.getElementById('copy-time-input');
        const targetSelect = document.getElementById('copy-target-group');
        const teacherSelect = document.getElementById('copy-teacher-select');
        const sourceSelect = document.getElementById('copy-source-group');

        document.querySelectorAll('.copy-time-preset').forEach(btn => {
          btn.addEventListener('click', () => {
            if (timeInput) timeInput.value = btn.getAttribute('data-time');
          });
        });

        targetSelect?.addEventListener('change', (e) => {
          const g = store.getGroupById(e.target.value);
          if (g) {
            if (teacherSelect && g.teacherId) teacherSelect.value = g.teacherId;
            if (timeInput && g.scheduleTime) timeInput.value = g.scheduleTime;
          }
        });

        const copyAction = () => {
          const sourceGroupId = sourceSelect?.value;
          const targetGroupId = targetSelect?.value;
          const newTime = timeInput?.value || '18:00 - 19:00';
          const newTeacherId = teacherSelect?.value || null;
          const newFormat = document.querySelector('input[name="newFormat"]')?.value || 'Кабинет 3';

          if (sourceGroupId === targetGroupId) {
            toast.error('Исходная и целевая группа не могут совпадать!');
            return;
          }

          const copied = store.copyScheduleToGroup({
            sourceGroupId,
            targetGroupId,
            newTime,
            newTeacherId,
            newFormat,
            replaceExisting: true
          });

          modal.close();
          toast.success(`Успешно скопировано ${copied ? copied.length : 80} уроков в новую группу со временем ${newTime}!`);
          this.filterGroup = targetGroupId;
          this.viewMode = 'matrix';
          this.render(container);
        };

        document.getElementById('form-copy-schedule')?.addEventListener('submit', (e) => {
          e.preventDefault();
          copyAction();
        });

        document.getElementById('btn-submit-copy-schedule')?.addEventListener('click', (e) => {
          e.preventDefault();
          copyAction();
        });
      }
    });
  },

  /**
   * Modal: Fast cell editor for an existing lesson
   */
  openCellEditModal(lesson, container) {
    const group = lesson.groupId ? store.getGroupById(lesson.groupId) : null;
    const teacher = store.getTeacherById(lesson.teacherId);
    const teachers = store.getTeachers();

    modal.open({
      title: `📝 Урок: ${lesson.date || ''} (${lesson.dayOfWeek}) - ${group ? group.name : ''}`,
      bodyHtml: `
        <form id="form-edit-cell" style="display:flex; flex-direction:column; gap:var(--space-3);">
          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Дата урока (ДД.ММ или ДД/ММ) <span class="required">*</span></label>
              <input type="text" name="date" class="form-control" value="${lesson.date || ''}" placeholder="07.09" required>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">День недели <span class="required">*</span></label>
              <select name="dayOfWeek" class="form-control" required>
                ${this.days.map(d => `<option value="${d}" ${lesson.dayOfWeek === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Время <span class="required">*</span></label>
              <input type="text" name="time" class="form-control" value="${lesson.time || ''}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Преподаватель</label>
              <select name="teacherId" class="form-control">
                ${teachers.map(t => `<option value="${t.id}" ${lesson.teacherId === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Статус урока <span class="required">*</span></label>
              <select name="status" class="form-control font-semibold">
                <option value="planned" ${lesson.status === 'planned' ? 'selected' : ''}>⏳ Запланирован</option>
                <option value="completed" ${lesson.status === 'completed' ? 'selected' : ''}>✓ Проведен</option>
                <option value="cancelled" ${lesson.status === 'cancelled' ? 'selected' : ''}>✕ Отменен</option>
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Кабинет / Формат</label>
              <input type="text" name="format" class="form-control" value="${lesson.format || 'Кабинет 2'}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Тема урока</label>
            <input type="text" name="topic" class="form-control" value="${lesson.topic || ''}" placeholder="Unit 1: Hello & Greetings">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-ghost" id="btn-delete-cell-lesson" style="color:var(--color-danger); margin-right:auto;">🗑️ Удалить</button>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-cell-attendance" style="margin-right:auto; color:var(--color-primary); font-weight:600;">👥 Посещаемость</button>
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-cell" class="btn btn-primary">Сохранить</button>
      `,
      onOpen: () => {
        document.getElementById('btn-cell-attendance')?.addEventListener('click', () => {
          openAttendanceModal(lesson.id, () => {
            this.render(container);
          });
        });

        document.getElementById('btn-delete-cell-lesson')?.addEventListener('click', () => {
          if (confirm('Удалить этот урок из табеля?')) {
            store.deleteLesson(lesson.id);
            modal.close();
            toast.success('Урок удален');
            this.render(container);
          }
        });

        document.getElementById('form-edit-cell')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.updateLesson(lesson.id, data);
          modal.close();
          toast.success('Урок успешно обновлен');
          this.render(container);
        });
      }
    });
  },

  /**
   * Modal: Fast cell creator for an empty slot in matrix
   */
  openCellCreateModal(groupId, monthIndex, lessonNum, container) {
    const group = store.getGroupById(groupId);
    const teacher = group ? store.getTeacherById(group.teacherId) : null;
    const teachers = store.getTeachers();

    const monthNames = ['', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'];
    const currentMonthName = monthNames[monthIndex] || 'Месяц';

    modal.open({
      title: `➕ Добавить урок ${lessonNum} (${currentMonthName}) для группы ${group?.name || ''}`,
      bodyHtml: `
        <form id="form-create-cell" style="display:flex; flex-direction:column; gap:var(--space-3);">
          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Дата урока (ДД.ММ) <span class="required">*</span></label>
              <input type="text" name="date" class="form-control" placeholder="например, 14.09" required>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">День недели <span class="required">*</span></label>
              <select name="dayOfWeek" class="form-control" required>
                ${this.days.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Время <span class="required">*</span></label>
              <input type="text" name="time" class="form-control" value="${group?.scheduleTime || '16:00 - 17:00'}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex:1;">
              <label class="form-label">Преподаватель</label>
              <select name="teacherId" class="form-control">
                ${teachers.map(t => `<option value="${t.id}" ${(group && group.teacherId === t.id) ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="flex:1;">
              <label class="form-label">Формат / Кабинет</label>
              <input type="text" name="format" class="form-control" value="${group?.classroom || 'Кабинет 2'}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Тема урока</label>
            <input type="text" name="topic" class="form-control" value="Урок ${lessonNum}: Тема занятия" placeholder="Тема урока">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-create-cell" class="btn btn-primary">Добавить урок</button>
      `,
      onOpen: () => {
        document.getElementById('form-create-cell')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          data.groupId = groupId;
          data.monthIndex = monthIndex;
          data.lessonNumberInMonth = lessonNum;
          data.status = 'planned';

          store.addLesson(data);
          modal.close();
          toast.success('Урок добавлен в расписание');
          this.render(container);
        });
      }
    });
  },

  openAddModal(container) {
    const teachers = store.getTeachers();
    const groups = store.getGroups();
    const students = store.getStudents();

    modal.open({
      title: 'Назначить разовый урок в расписание',
      bodyHtml: `
        <form id="form-add-lesson">
          <div class="form-group">
            <label class="form-label">Тип занятия <span class="required">*</span></label>
            <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-2);">
              <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                <input type="radio" name="targetType" value="group" checked id="radio-type-group">
                <span class="font-semibold">👥 Учебная группа</span>
              </label>
              <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
                <input type="radio" name="targetType" value="individual" id="radio-type-indiv">
                <span class="font-semibold">👤 Индивидуально</span>
              </label>
            </div>
          </div>

          <div class="form-group" id="wrap-select-group">
            <label class="form-label">Выберите группу <span class="required">*</span></label>
            <select name="groupId" id="select-lesson-group" class="form-control">
              ${groups.map(g => `<option value="${g.id}">${g.name} (${g.level}, ${g.shift} смена)</option>`).join('')}
            </select>
          </div>

          <div class="form-group" id="wrap-select-student" style="display: none;">
            <label class="form-label">Выберите ученика <span class="required">*</span></label>
            <select name="studentId" class="form-control">
              ${students.map(s => `<option value="${s.id}">${s.fullName} (${s.grade}, ${s.level})</option>`).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Дата (например, 15.09)</label>
              <input type="text" name="date" class="form-control" placeholder="15.09">
            </div>
            <div class="form-group">
              <label class="form-label">День недели <span class="required">*</span></label>
              <select name="dayOfWeek" class="form-control" required>
                ${this.days.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Время <span class="required">*</span></label>
              <input type="text" name="time" class="form-control" placeholder="16:00 - 17:00" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Преподаватель <span class="required">*</span></label>
              <select name="teacherId" id="select-lesson-teacher" class="form-control" required>
                ${teachers.map(t => `<option value="${t.id}">${t.fullName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Формат / Кабинет</label>
              <input type="text" name="format" id="input-lesson-format" class="form-control" placeholder="Кабинет 2">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Тема занятия / Модуль</label>
            <input type="text" name="topic" class="form-control" placeholder="например, Unit 5: Past Perfect & Reading Club" required>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-add-lesson" class="btn btn-primary">Поставить в расписание</button>
      `,
      onOpen: () => {
        const radioGroup = document.getElementById('radio-type-group');
        const radioIndiv = document.getElementById('radio-type-indiv');
        const wrapGroup = document.getElementById('wrap-select-group');
        const wrapStudent = document.getElementById('wrap-select-student');
        const selectGroup = document.getElementById('select-lesson-group');
        const selectTeacher = document.getElementById('select-lesson-teacher');
        const inputFormat = document.getElementById('input-lesson-format');

        radioGroup?.addEventListener('change', () => {
          wrapGroup.style.display = 'block';
          wrapStudent.style.display = 'none';
        });

        radioIndiv?.addEventListener('change', () => {
          wrapGroup.style.display = 'none';
          wrapStudent.style.display = 'block';
        });

        selectGroup?.addEventListener('change', (e) => {
          const g = store.getGroupById(e.target.value);
          if (g) {
            if (selectTeacher && g.teacherId) selectTeacher.value = g.teacherId;
            if (inputFormat && g.classroom) inputFormat.value = g.classroom;
          }
        });

        document.getElementById('form-add-lesson')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          data.status = 'planned';
          store.addLesson(data);
          modal.close();
          toast.success('Урок добавлен в расписание!');
          this.render(container);
        });
      }
    });
  },

  openEditModal(id, container) {
    const lesson = store.getLessonById(id);
    if (!lesson) return;

    const teachers = store.getTeachers();
    const groups = store.getGroups();
    const students = store.getStudents();

    modal.open({
      title: 'Редактировать урок',
      bodyHtml: `
        <form id="form-edit-lesson">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Группа (если групповой)</label>
              <select name="groupId" class="form-control">
                <option value="">-- Индивидуально --</option>
                ${groups.map(g => `<option value="${g.id}" ${lesson.groupId === g.id ? 'selected' : ''}>👥 ${g.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ученик (если индивидуальный)</label>
              <select name="studentId" class="form-control">
                <option value="">-- Для всей группы --</option>
                ${students.map(s => `<option value="${s.id}" ${lesson.studentId === s.id ? 'selected' : ''}>👤 ${s.fullName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Дата (например, 15.09)</label>
              <input type="text" name="date" class="form-control" value="${lesson.date || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">День недели</label>
              <select name="dayOfWeek" class="form-control">
                ${this.days.map(d => `<option value="${d}" ${lesson.dayOfWeek === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Время</label>
              <input type="text" name="time" class="form-control" value="${lesson.time}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Преподаватель</label>
              <select name="teacherId" class="form-control">
                ${teachers.map(t => `<option value="${t.id}" ${lesson.teacherId === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Формат</label>
              <input type="text" name="format" class="form-control" value="${lesson.format}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Тема урока</label>
            <input type="text" name="topic" class="form-control" value="${lesson.topic}">
          </div>

          <div class="form-group">
            <label class="form-label">Статус</label>
            <select name="status" class="form-control">
              <option value="planned" ${lesson.status === 'planned' ? 'selected' : ''}>Запланирован</option>
              <option value="completed" ${lesson.status === 'completed' ? 'selected' : ''}>Проведен</option>
              <option value="cancelled" ${lesson.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
            </select>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-lesson" class="btn btn-primary">Сохранить</button>
      `,
      onOpen: () => {
        document.getElementById('form-edit-lesson')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.updateLesson(id, data);
          modal.close();
          toast.success('Урок обновлен');
          this.render(container);
        });
      }
    });
  }
};

