/**
 * Students Management View - Full CRUD, Search, Filter by Group/Level, and Student Details
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { renderStudentAvatarHtml } from '../components/avatarCustomization.js';

export const StudentsView = {
  filterGroup: 'all',
  filterLevel: 'all',
  filterShift: 'all',
  searchQuery: '',

  render(container) {
    const activeEl = document.activeElement;
    const activeId = (activeEl && container.contains(activeEl)) ? activeEl.id : null;
    const activeStart = activeEl?.selectionStart;
    const activeEnd = activeEl?.selectionEnd;

    const isAdmin = auth.isAdmin();
    const groups = store.getGroups();
    const students = store.getStudents({
      groupId: this.filterGroup,
      level: this.filterLevel,
      shift: this.filterShift,
      search: this.searchQuery
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>Ученики</h1>
          <p>База учащихся, распределение по учебным группам, контактные данные и успеваемость</p>
        </div>
        <div class="section-actions">
          ${isAdmin ? `
            <button class="btn btn-primary" id="btn-add-student">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Добавить ученика
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="form-label">Группа:</label>
          <select id="filter-student-group" class="form-control">
            <option value="all" ${this.filterGroup === 'all' ? 'selected' : ''}>Все группы</option>
            ${groups.map(g => `<option value="${g.id}" ${this.filterGroup === g.id ? 'selected' : ''}>${g.name} (${g.level})</option>`).join('')}
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label">Уровень:</label>
          <select id="filter-student-level" class="form-control">
            <option value="all" ${this.filterLevel === 'all' ? 'selected' : ''}>Все уровни</option>
            <option value="Beginner" ${this.filterLevel === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Elementary" ${this.filterLevel === 'Elementary' ? 'selected' : ''}>Elementary</option>
            <option value="Pre-Intermediate" ${this.filterLevel === 'Pre-Intermediate' ? 'selected' : ''}>Pre-Intermediate</option>
            <option value="Intermediate" ${this.filterLevel === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Upper-Intermediate" ${this.filterLevel === 'Upper-Intermediate' ? 'selected' : ''}>Upper-Intermediate</option>
            <option value="Advanced" ${this.filterLevel === 'Advanced' ? 'selected' : ''}>Advanced</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label">Смена:</label>
          <select id="filter-student-shift" class="form-control">
            <option value="all" ${this.filterShift === 'all' ? 'selected' : ''}>Все смены</option>
            <option value="Первая" ${this.filterShift === 'Первая' ? 'selected' : ''}>1 смена</option>
            <option value="Вторая" ${this.filterShift === 'Вторая' ? 'selected' : ''}>2 смена</option>
          </select>
        </div>

        <div class="filter-item" style="margin-left: auto;">
          <input type="search" id="input-student-search" class="form-control" placeholder="Поиск по имени, школе..." value="${this.searchQuery}" style="width: 240px;" autocomplete="off">
        </div>
      </div>

      <!-- Students Cards Grid -->
      <div id="students-grid-container">
        ${students.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">Ученики не найдены</div>
            <div class="empty-state-desc">Попробуйте изменить параметры поиска или добавьте нового ученика.</div>
            ${isAdmin ? `<button class="btn btn-primary btn-sm" id="btn-empty-add-student">Добавить ученика</button>` : ''}
          </div>
        ` : `
          <div class="students-grid">
            ${students.map(s => this.renderStudentCard(s, isAdmin)).join('')}
          </div>
        `}
      </div>
    `;

    this.bindEvents(container);

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

  renderStudentCard(student, isAdmin) {
    const levelClass = 'level-' + student.level.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const shiftClass = student.shift === 'Первая' ? 'badge-shift-1' : 'badge-shift-2';
    const group = store.getGroupById(student.groupId);
    const currMonth = store.getCurrentAcademicMonth();
    const payment = store.getPayment(student.id, currMonth.key);
    const isPaid = payment && payment.status === 'paid';
    const attStats = store.getStudentAttendanceStats(student.id);

    return `
      <div class="student-card" data-student-id="${student.id}">
        <div>
          <div class="student-card-header">
            <div style="display:flex; align-items:center; gap:var(--space-3);">
              ${renderStudentAvatarHtml(student, { size: 'md' })}
              <div class="student-meta">
                <div class="student-name">${student.fullName}</div>
                ${student.studentTitle ? `
                  <div style="margin: 2px 0;">
                    <span class="student-title-badge light" style="font-size:0.68rem; padding: 1px 8px;">
                      ${student.studentTitle}
                    </span>
                  </div>
                ` : ''}
                <div class="student-grade-school">${student.grade} • ${student.school || 'Школа не указана'}</div>
              </div>
            </div>
            <div class="student-points-badge">⭐ ${student.totalPoints || 0}</div>
          </div>

          <div class="student-card-details">
            <div class="detail-row">
              <span class="detail-label">Группа:</span>
              <span class="detail-val truncate" style="max-width: 180px; font-weight:700; color:var(--color-primary);" title="${group ? group.name : 'Индивидуально'}">
                👥 ${group ? group.name : 'Индивидуально'}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Уровень:</span>
              <span class="badge badge-level ${levelClass}">${student.level}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Смена:</span>
              <span class="badge ${shiftClass}">${student.shift} смена</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Посещаемость:</span>
              <span class="detail-val" style="font-weight:700; color:${attStats.percentage >= 80 ? 'var(--color-success)' : 'var(--color-warning-text)'};">
                ${attStats.percentage}% (${attStats.attended}/${attStats.total})
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Оплата (${currMonth.shortName}):</span>
              <span class="badge ${isPaid ? 'badge-completed' : 'badge-cancelled'}" style="font-size:0.7rem; padding:1px 8px;">
                ${isPaid ? '✓ Оплачено' : '⏳ Не оплачено'}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Учебник:</span>
              <span class="detail-val truncate" style="max-width: 170px;" title="${student.textbook}">${student.textbook || '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Телефон:</span>
              <span class="detail-val">${student.phone || '—'}</span>
            </div>
          </div>
        </div>

        <div class="student-card-footer">
          <button class="btn btn-secondary btn-sm btn-view-profile" data-id="${student.id}">
            Карточка ученика
          </button>
          
          <div style="display:flex; gap:var(--space-2);">
            ${isAdmin ? `
              <button class="btn btn-ghost btn-sm btn-edit-student" data-id="${student.id}" title="Редактировать">✏️</button>
              <button class="btn btn-ghost btn-sm btn-delete-student" data-id="${student.id}" title="Удалить" style="color:var(--color-danger)">🗑️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  updateGridOnly(container) {
    const isAdmin = auth.isAdmin();
    const students = store.getStudents({
      groupId: this.filterGroup,
      level: this.filterLevel,
      shift: this.filterShift,
      search: this.searchQuery
    });
    const gridContainer = container.querySelector('#students-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = students.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Ученики не найдены</div>
          <div class="empty-state-desc">Попробуйте изменить параметры поиска или добавьте нового ученика.</div>
          ${isAdmin ? `<button class="btn btn-primary btn-sm" id="btn-empty-add-student">Добавить ученика</button>` : ''}
        </div>
      ` : `
        <div class="students-grid">
          ${students.map(s => this.renderStudentCard(s, isAdmin)).join('')}
        </div>
      `;
      this.bindCardEvents(container);
    }
  },

  bindCardEvents(container) {
    container.querySelector('#btn-empty-add-student')?.addEventListener('click', () => this.openAddModal(container));

    container.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openProfileModal(id);
      });
    });

    container.querySelectorAll('.btn-edit-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditModal(id, container);
      });
    });

    container.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const st = store.getStudentById(id);
        if (confirm(`Удалить ученика "${st ? st.fullName : ''}"?`)) {
          store.deleteStudent(id);
          toast.success('Ученик удален');
          this.render(container);
        }
      });
    });
  },

  bindEvents(container) {
    container.querySelector('#filter-student-group')?.addEventListener('change', (e) => {
      this.filterGroup = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-student-level')?.addEventListener('change', (e) => {
      this.filterLevel = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-student-shift')?.addEventListener('change', (e) => {
      this.filterShift = e.target.value;
      this.render(container);
    });

    container.querySelector('#input-student-search')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateGridOnly(container);
    });

    container.querySelector('#btn-add-student')?.addEventListener('click', () => this.openAddModal(container));

    this.bindCardEvents(container);
  },

  openAddModal(container) {
    const groups = store.getGroups();

    modal.open({
      title: 'Добавить нового ученика',
      bodyHtml: `
        <form id="form-add-student">
          <div class="form-group">
            <label class="form-label">ФИО ученика <span class="required">*</span></label>
            <input type="text" name="fullName" class="form-control" placeholder="например, Александр Иванов" required>
          </div>

          <div class="form-group">
            <label class="form-label">Учебная группа</label>
            <select name="groupId" id="select-student-group" class="form-control">
              <option value="">-- Без группы (Индивидуально) --</option>
              ${groups.map(g => `<option value="${g.id}">${g.name} (${g.level})</option>`).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Телефон ученика</label>
              <input type="tel" name="phone" class="form-control" placeholder="+7 (999) 000-00-00">
            </div>
            <div class="form-group">
              <label class="form-label">Класс (цифра и буква)</label>
              <input type="text" name="grade" class="form-control" placeholder="например, 8-Б">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Школа (номер / название)</label>
              <input type="text" name="school" class="form-control" placeholder="например, Гимназия №15">
            </div>
            <div class="form-group">
              <label class="form-label">Смена в школе</label>
              <select name="shift" class="form-control">
                <option value="Первая">Первая смена</option>
                <option value="Вторая">Вторая смена</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Уровень английского языка</label>
              <select name="level" id="input-student-level" class="form-control">
                <option value="Beginner">Beginner (Начальный)</option>
                <option value="Elementary">Elementary (Элементарный)</option>
                <option value="Pre-Intermediate" selected>Pre-Intermediate (Ниже среднего)</option>
                <option value="Intermediate">Intermediate (Средний)</option>
                <option value="Upper-Intermediate">Upper-Intermediate (Выше среднего)</option>
                <option value="Advanced">Advanced (Продвинутый)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Текущий учебник</label>
              <input type="text" name="textbook" id="input-student-textbook" list="textbooks-datalist" class="form-control" placeholder="например, English world 1">
              <datalist id="textbooks-datalist">
                ${store.getTextbooks().map(tb => `<option value="${tb}">`).join('')}
              </datalist>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Информация о родителях (ФИО, статус)</label>
              <input type="text" name="parentName" class="form-control" placeholder="например, Иванова Ольга (Мама)">
            </div>
            <div class="form-group">
              <label class="form-label">Телефон родителей</label>
              <input type="tel" name="parentPhone" class="form-control" placeholder="+7 (999) 111-22-33">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Начальные баллы</label>
            <input type="number" name="totalPoints" class="form-control" value="0" min="0">
          </div>

          <div class="form-group">
            <label class="form-label">Педагогические заметки</label>
            <textarea name="notes" class="form-control" rows="2" placeholder="Особенности ученика, цели обучения..."></textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-add-student" class="btn btn-primary">Сохранить ученика</button>
      `,
      onOpen: () => {
        // Auto-fill level and textbook from group on change
        document.getElementById('select-student-group')?.addEventListener('change', (e) => {
          const grp = store.getGroupById(e.target.value);
          if (grp) {
            const levelSelect = document.getElementById('input-student-level');
            const textbookInput = document.getElementById('input-student-textbook');
            if (levelSelect) levelSelect.value = grp.level;
            if (textbookInput) textbookInput.value = grp.textbook;
          }
        });

        document.getElementById('form-add-student')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.addStudent(data);
          modal.close();
          toast.success(`Ученик ${data.fullName} добавлен!`);
          this.render(container);
        });
      }
    });
  },

  openEditModal(studentId, container) {
    const student = store.getStudentById(studentId);
    if (!student) return;

    const groups = store.getGroups();

    modal.open({
      title: `Редактирование: ${student.fullName}`,
      bodyHtml: `
        <form id="form-edit-student">
          <div class="form-group">
            <label class="form-label">ФИО ученика <span class="required">*</span></label>
            <input type="text" name="fullName" class="form-control" value="${student.fullName}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Учебная группа</label>
            <select name="groupId" class="form-control">
              <option value="">-- Без группы (Индивидуально) --</option>
              ${groups.map(g => `<option value="${g.id}" ${student.groupId === g.id ? 'selected' : ''}>${g.name} (${g.level})</option>`).join('')}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Телефон ученика</label>
              <input type="tel" name="phone" class="form-control" value="${student.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Класс</label>
              <input type="text" name="grade" class="form-control" value="${student.grade || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Школа</label>
              <input type="text" name="school" class="form-control" value="${student.school || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Смена</label>
              <select name="shift" class="form-control">
                <option value="Первая" ${student.shift === 'Первая' ? 'selected' : ''}>Первая смена</option>
                <option value="Вторая" ${student.shift === 'Вторая' ? 'selected' : ''}>Вторая смена</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Уровень английского</label>
              <select name="level" class="form-control">
                <option value="Beginner" ${student.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                <option value="Elementary" ${student.level === 'Elementary' ? 'selected' : ''}>Elementary</option>
                <option value="Pre-Intermediate" ${student.level === 'Pre-Intermediate' ? 'selected' : ''}>Pre-Intermediate</option>
                <option value="Intermediate" ${student.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Upper-Intermediate" ${student.level === 'Upper-Intermediate' ? 'selected' : ''}>Upper-Intermediate</option>
                <option value="Advanced" ${student.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Текущий учебник</label>
              <input type="text" name="textbook" list="edit-textbooks-datalist" class="form-control" value="${student.textbook || ''}">
              <datalist id="edit-textbooks-datalist">
                ${store.getTextbooks().map(tb => `<option value="${tb}">`).join('')}
              </datalist>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Родитель (ФИО)</label>
              <input type="text" name="parentName" class="form-control" value="${student.parentName || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Телефон родителей</label>
              <input type="tel" name="parentPhone" class="form-control" value="${student.parentPhone || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Заметки</label>
            <textarea name="notes" class="form-control" rows="2">${student.notes || ''}</textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-student" class="btn btn-primary">Сохранить изменения</button>
      `,
      onOpen: () => {
        document.getElementById('form-edit-student')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.updateStudent(studentId, data);
          modal.close();
          toast.success('Данные ученика обновлены');
          this.render(container);
        });
      }
    });
  },

  openProfileModal(studentId) {
    const student = store.getStudentById(studentId);
    if (!student) return;

    const group = store.getGroupById(student.groupId);
    const pointsHistory = store.getPointRecords(studentId);
    const lessons = store.getSchedule({ studentId });
    const purchases = store.getPurchases ? store.getPurchases({ studentId }) : [];

    const academicMonths = store.getAcademicMonthsList();
    const currentMonth = store.getCurrentAcademicMonth();
    const monthlyLeaderboard = store.getGroupMonthlyLeaderboard(student.groupId, currentMonth.year, currentMonth.monthIndex);
    const myRankObj = monthlyLeaderboard.find(l => l.studentId === student.id);
    const profileAttStats = store.getStudentAttendanceStats(studentId);
    const profilePayment = store.getPayment(studentId, currentMonth.key);
    const profileIsPaid = profilePayment && profilePayment.status === 'paid';

    modal.open({
      title: `Профиль ученика: ${student.fullName}`,
      bodyHtml: `
        <div style="display:flex; flex-direction:column; gap:var(--space-5);">
          <!-- Summary Header -->
          <div style="display:flex; align-items:center; justify-content:space-between; background:var(--color-bg-app); padding:var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--color-border); gap: var(--space-4); flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:var(--space-4);">
              ${renderStudentAvatarHtml(student, { size: 'lg' })}
              <div>
                <div style="font-size:var(--font-size-lg); font-weight:700;">${student.fullName}</div>
                ${student.studentTitle ? `
                  <div style="margin: 2px 0;">
                    <span class="student-title-badge light" style="font-size:0.72rem; padding: 2px 10px;">
                      ${student.studentTitle}
                    </span>
                  </div>
                ` : ''}
                <div class="text-sm text-muted">${student.grade} • ${student.school} • ${student.shift} смена</div>
                <div class="badge badge-planned" style="margin-top:4px;">👥 ${group ? group.name : 'Индивидуальное обучение'}${group?.scheduleTime ? ` • ⏰ ${group.scheduleTime}` : ''}</div>
              </div>
            </div>
            <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <div style="font-size:1.35rem; font-weight:800; color:var(--color-warning-text);" title="Баланс для покупок в магазине">⭐ ${student.totalPoints || 0}</div>
              <div style="font-size:0.75rem; color:var(--color-text-secondary); font-weight:600;">
                Заработанно за всё время: <strong style="color:var(--color-text-main);">${student.lifetimePoints != null ? student.lifetimePoints : (student.totalPoints || 0)} ⭐</strong>
              </div>
              <span class="badge badge-level level-${student.level.toLowerCase()}">${student.level}</span>
            </div>
          </div>

          <!-- Payment & Attendance Summary Card -->
          <div class="card" style="padding:var(--space-4); background:var(--color-bg-app); border:1px solid var(--color-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3); flex-wrap:wrap; gap:8px;">
              <h4 style="margin:0; font-size:var(--font-size-sm); color:var(--color-text-main);">💳 Оплата и Посещаемость</h4>
              <span class="badge ${profileIsPaid ? 'badge-completed' : 'badge-cancelled'}" style="font-size:0.75rem; padding:3px 10px; font-weight:700;">
                ${currentMonth.name}: ${profileIsPaid ? '✓ Оплачено' : '⏳ Не оплачено'}
              </span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); font-size:var(--font-size-sm);">
              <div><strong>Посещаемость:</strong> <span style="font-weight:700; color:${profileAttStats.percentage >= 80 ? '#16a34a' : '#ea580c'};">${profileAttStats.percentage}%</span> (${profileAttStats.attended} из ${profileAttStats.total} уроков)</div>
              <div><strong>Пропусков:</strong> <span style="font-weight:700; color:${profileAttStats.missed > 0 ? '#dc2626' : 'inherit'};">${profileAttStats.missed}</span></div>
            </div>
          </div>

          <!-- Academic & Textbook Info -->
          <div class="card" style="padding:var(--space-4);">
            <h4 style="margin-bottom:var(--space-3); font-size:var(--font-size-sm);">📚 Учебные материалы и контакты</h4>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); font-size:var(--font-size-sm);">
              <div><strong>Учебник:</strong> ${student.textbook || 'Не указан'}</div>
              <div><strong>Телефон:</strong> ${student.phone ? `<a href="tel:${student.phone}">${student.phone}</a>` : '—'}</div>
              <div><strong>Родители:</strong> ${student.parentName || '—'}</div>
              <div><strong>Тел. родителей:</strong> ${student.parentPhone ? `<a href="tel:${student.parentPhone}">${student.parentPhone}</a>` : '—'}</div>
            </div>
            ${student.notes ? `
              <div style="margin-top:var(--space-3); padding-top:var(--space-3); border-top:1px solid var(--color-border-subtle); font-size:var(--font-size-xs); color:var(--color-text-secondary);">
                <strong>Педагогические заметки:</strong> ${student.notes}
              </div>
            ` : ''}
          </div>

          <!-- Monthly Group Performance -->
          <div class="card" style="padding:var(--space-4); background:linear-gradient(180deg, #f8faff 0%, #ffffff 100%); border:1px solid #e0e7ff;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
              <h4 style="margin:0; font-size:var(--font-size-sm); color:var(--color-primary); display:flex; align-items:center; gap:6px;">
                🏆 Результат в группе за Сентябрь 2026
              </h4>
              ${myRankObj ? `
                <span class="badge ${myRankObj.rank === 1 ? 'badge-completed' : myRankObj.rank === 2 ? 'badge-planned' : 'badge'}" style="${myRankObj.rank === 1 ? 'background:#ca8a04; color:#fff;' : ''}">
                  ${myRankObj.rank === 1 ? '🥇 1 место в группе' : myRankObj.rank === 2 ? '🥈 2 место в группе' : myRankObj.rank === 3 ? '🥉 3 место в группе' : `${myRankObj.rank}-е место в группе`}
                </span>
              ` : ''}
            </div>
            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">
              ${myRankObj ? `
                Чистый итог месяца: <strong style="color:var(--color-primary); font-size:0.9rem;">${myRankObj.netMonthlyPoints >= 0 ? `+${myRankObj.netMonthlyPoints}` : myRankObj.netMonthlyPoints} ⭐</strong>
                (Начислено: <span style="color:#16a34a; font-weight:600;">+${myRankObj.addedPoints}</span>, Списано: <span style="color:#dc2626; font-weight:600;">-${myRankObj.deductedPoints}</span>, Операций: ${myRankObj.operationsCount})
              ` : 'Нет данных об участии в группе'}
            </div>
          </div>

          <!-- Points History -->
          <div>
            <h4 style="margin-bottom:var(--space-3); font-size:var(--font-size-sm);">⭐ История баллов и тестов (${pointsHistory.length})</h4>
            ${pointsHistory.length === 0 ? `
              <div class="text-sm text-muted">Пока нет начисленных баллов.</div>
            ` : `
              <div class="points-timeline" style="max-height: 180px; overflow-y:auto;">
                ${pointsHistory.map(p => {
                  const isPositive = (p.points || 0) >= 0;
                  return `
                    <div class="point-item">
                      <div class="point-score-tag" style="${isPositive ? '' : 'background:#fee2e2; color:#991b1b;'}">
                        ${isPositive ? `+${p.points}` : p.points}
                      </div>
                      <div class="point-item-content">
                        <div class="point-item-header">
                          <span class="point-category" style="${isPositive ? '' : 'color:#b91c1c;'}">${p.category}</span>
                          <span class="point-date">${new Date(p.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div class="point-comment">${p.comment || p.category || (isPositive ? 'Поощрение за урок' : 'Вычет баллов')}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Purchases in Shop -->
          <div>
            <h4 style="margin-bottom:var(--space-3); font-size:var(--font-size-sm); display:flex; justify-content:space-between; align-items:center;">
              <span>🛍️ Покупки в магазине</span>
              <span class="text-xs text-muted">${purchases.length} шт.</span>
            </h4>
            ${purchases.length === 0 ? `
              <div class="text-sm text-muted">Ученик пока ничего не покупал в магазине.</div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:var(--space-2); max-height:160px; overflow-y:auto;">
                ${purchases.map(pur => `
                  <div style="padding:var(--space-2) var(--space-3); background:var(--color-bg-app); border-radius:var(--radius-md); font-size:var(--font-size-xs); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                      <span style="font-weight:700;">${pur.itemType === 'avatar' ? '🎭' : pur.itemType === 'frame' ? '🖼️' : pur.itemType === 'title' ? '👑' : '📦'} ${pur.itemName}</span>
                      <span class="text-muted" style="margin-left:6px;">(${new Date(pur.date).toLocaleDateString('ru-RU')})</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-weight:700; color:#f59e0b;">${pur.price} ⭐</span>
                      <span class="badge badge-${pur.status === 'completed' ? 'completed' : 'cancelled'}" style="font-size:0.7rem;">
                        ${pur.status === 'completed' ? '✓ Куплено' : '✕ Отменено'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- 2 Nearest Lessons -->
          <div>
            <h4 style="margin-bottom:var(--space-3); font-size:var(--font-size-sm); display:flex; justify-content:space-between; align-items:center;">
              <span>📅 Ближайшие занятия</span>
              <span class="text-xs text-muted">2 ближайших урока</span>
            </h4>
            ${(() => {
              const nearest = lessons.filter(l => l.status === 'planned').slice(0, 2);
              if (nearest.length === 0) {
                return '<div class="text-sm text-muted">Нет запланированных занятий на ближайшее время.</div>';
              }
              return `
                <div style="display:flex; flex-direction:column; gap:var(--space-2);">
                  ${nearest.map(l => {
                    const teacher = store.getTeacherById(l.teacherId);
                    return `
                      <div style="padding:var(--space-3); background:var(--color-bg-app); border-radius:var(--radius-md); font-size:var(--font-size-xs); display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--color-primary);">
                        <div>
                          <strong>⏰ ${l.dayOfWeek} ${l.time} ${l.date ? `(${l.date})` : ''}</strong> — ${l.topic}
                          <div class="text-muted" style="margin-top:2px;">${l.groupId ? `Групповой урок • ` : `Индивидуальный • `} Преподаватель: ${teacher ? teacher.fullName : '—'} • ${l.format}</div>
                        </div>
                        <span class="badge badge-planned">⏳ Запланирован</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            })()}
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Закрыть</button>
      `
    });
  }
};
