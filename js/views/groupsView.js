/**
 * Groups Management View - Study Groups, Rosters, Group Scheduling, and Group Details
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export const GroupsView = {
  filterLevel: 'all',
  filterShift: 'all',
  filterTeacher: 'all',
  searchQuery: '',

  render(container) {
    const activeEl = document.activeElement;
    const activeId = (activeEl && container.contains(activeEl)) ? activeEl.id : null;
    const activeStart = activeEl?.selectionStart;
    const activeEnd = activeEl?.selectionEnd;

    const isAdmin = auth.isAdmin();
    const isTeacher = auth.isTeacher();
    const currentTeacherId = isTeacher ? auth.getCurrentUser()?.id : null;

    const teachers = store.getTeachers();
    const groups = store.getGroups({
      level: this.filterLevel,
      shift: this.filterShift,
      teacherId: isTeacher ? currentTeacherId : (this.filterTeacher !== 'all' ? this.filterTeacher : null),
      search: this.searchQuery
    });

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>Учебные группы</h1>
          <p>Формирование групп, расписание, учебники, закрепленные учителя и прогресс уроков</p>
        </div>
        <div class="section-actions">
          ${(isAdmin || isTeacher) ? `
            <button class="btn btn-primary" id="btn-add-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="12" y2="12"></line></svg>
              Создать группу
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="filter-bar">
        <div class="filter-item">
          <label class="form-label">Уровень:</label>
          <select id="filter-group-level" class="form-control">
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
          <select id="filter-group-shift" class="form-control">
            <option value="all" ${this.filterShift === 'all' ? 'selected' : ''}>Все смены</option>
            <option value="Первая" ${this.filterShift === 'Первая' ? 'selected' : ''}>1 смена</option>
            <option value="Вторая" ${this.filterShift === 'Вторая' ? 'selected' : ''}>2 смена</option>
          </select>
        </div>

        ${!isTeacher ? `
          <div class="filter-item">
            <label class="form-label">Преподаватель:</label>
            <select id="filter-group-teacher" class="form-control">
              <option value="all" ${this.filterTeacher === 'all' ? 'selected' : ''}>Все преподаватели</option>
              ${teachers.map(t => `<option value="${t.id}" ${this.filterTeacher === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
            </select>
          </div>
        ` : ''}

        <div class="filter-item" style="flex-grow: 1;">
          <label class="form-label">Поиск группы:</label>
          <input type="text" id="input-group-search" class="form-control" placeholder="Поиск по названию, кабинету или описанию..." value="${this.searchQuery}">
        </div>
      </div>

      <!-- Groups Grid Container -->
      <div id="groups-grid-container">
        ${groups.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div class="empty-state-title">Группы не найдены</div>
            <div class="empty-state-desc">Попробуйте изменить параметры поиска или создайте новую учебную группу.</div>
            ${(isAdmin || isTeacher) ? `<button class="btn btn-primary btn-sm" id="btn-empty-add-group">Создать группу</button>` : ''}
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-5);">
            ${groups.map(g => this.renderGroupCard(g, isAdmin || isTeacher)).join('')}
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

  renderGroupCard(group, isAdmin) {
    const teacher = store.getTeacherById(group.teacherId);
    const students = store.getStudentsByGroupId(group.id);
    const lessons = store.getSchedule({ groupId: group.id });
    const levelClass = 'level-' + group.level.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const shiftClass = group.shift === 'Первая' ? 'badge-shift-1' : 'badge-shift-2';

    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;" data-group-id="${group.id}">
        <div>
          <!-- Header -->
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3);">
            <div>
              <h3 style="font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-main);">${group.name}</h3>
              <div class="text-xs text-muted" style="margin-top: 2px;">${group.description || 'Учебная группа'}</div>
            </div>
            <span class="badge badge-level ${levelClass}">${group.level}</span>
          </div>

          <!-- Group Meta Specs -->
          <div class="student-card-details" style="margin-bottom: var(--space-4);">
            <div class="detail-row">
              <span class="detail-label">Преподаватель:</span>
              <span class="detail-val">${teacher ? teacher.fullName : '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Учебник:</span>
              <span class="detail-val truncate" style="max-width: 190px;" title="${group.textbook}">${group.textbook || '—'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Смена / Локация:</span>
              <span class="detail-val">
                <span class="badge ${shiftClass}" style="font-size:0.7rem;">${group.shift}</span>
                <span class="text-xs text-muted">• ${group.classroom}</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Уроков в неделю:</span>
              <span class="detail-val font-bold">${lessons.length}</span>
            </div>
          </div>

          <!-- Enrolled Students Roster -->
          <div style="margin-bottom: var(--space-4);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
              <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">
                Состав группы (${students.length} чел.):
              </span>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
              ${students.length === 0 ? `
                <span class="text-xs text-muted">В группе пока нет учеников</span>
              ` : students.map(st => `
                <div class="badge" style="background: var(--color-bg-app); border: 1px solid var(--color-border); font-size: 0.75rem; color: var(--color-text-main); font-weight: 500;" title="${st.grade} • ${st.school}">
                  👤 ${st.fullName} (${st.grade})
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-3); margin-top: auto;">
          <button class="btn btn-secondary btn-sm btn-group-details" data-id="${group.id}">
            Профиль группы
          </button>

          <div style="display: flex; gap: var(--space-2);">
            ${(isAdmin || isTeacher) ? `
              <button class="btn btn-ghost btn-sm btn-edit-group" data-id="${group.id}" title="Редактировать">✏️</button>
              <button class="btn btn-ghost btn-sm btn-delete-group" data-id="${group.id}" style="color: var(--color-danger)" title="Удалить">🗑️</button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  updateGridOnly(container) {
    const isAdmin = auth.isAdmin();
    const isTeacher = auth.isTeacher();
    const currentTeacherId = isTeacher ? auth.getCurrentUser()?.id : null;
    const groups = store.getGroups({
      level: this.filterLevel,
      shift: this.filterShift,
      teacherId: isTeacher ? currentTeacherId : (this.filterTeacher !== 'all' ? this.filterTeacher : null),
      search: this.searchQuery
    });
    const gridContainer = container.querySelector('#groups-grid-container');
    if (gridContainer) {
      gridContainer.innerHTML = groups.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <div class="empty-state-title">Группы не найдены</div>
          <div class="empty-state-desc">Попробуйте изменить параметры поиска или создайте новую учебную группу.</div>
          ${(isAdmin || isTeacher) ? `<button class="btn btn-primary btn-sm" id="btn-empty-add-group">Создать группу</button>` : ''}
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-5);">
          ${groups.map(g => this.renderGroupCard(g, isAdmin || isTeacher)).join('')}
        </div>
      `;
      this.bindCardEvents(container);
    }
  },

  bindCardEvents(container) {
    container.querySelector('#btn-empty-add-group')?.addEventListener('click', () => this.openAddModal(container));

    container.querySelectorAll('.btn-group-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openDetailsModal(id);
      });
    });

    container.querySelectorAll('.btn-edit-group').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditModal(id, container);
      });
    });

    container.querySelectorAll('.btn-delete-group').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const grp = store.getGroupById(id);
        if (confirm(`Удалить группу "${grp ? grp.name : ''}"? Ученики группы будут откреплены.`)) {
          store.deleteGroup(id);
          toast.success('Группа удалена');
          this.render(container);
        }
      });
    });
  },

  bindEvents(container) {
    container.querySelector('#filter-group-level')?.addEventListener('change', (e) => {
      this.filterLevel = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-group-shift')?.addEventListener('change', (e) => {
      this.filterShift = e.target.value;
      this.render(container);
    });

    container.querySelector('#filter-group-teacher')?.addEventListener('change', (e) => {
      this.filterTeacher = e.target.value;
      this.render(container);
    });

    container.querySelector('#input-group-search')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateGridOnly(container);
    });

    container.querySelector('#btn-add-group')?.addEventListener('click', () => this.openAddModal(container));

    this.bindCardEvents(container);
  },

  openAddModal(container) {
    const teachers = store.getTeachers();
    const students = store.getStudents();
    const textbooks = store.getTextbooks();
    const isTeacher = auth.isTeacher();
    const currentTeacherId = isTeacher ? auth.getCurrentUser()?.id : null;

    modal.open({
      title: 'Создать новую учебную группу',
      bodyHtml: `
        <form id="form-add-group">
          <div class="form-group">
            <label class="form-label">Название группы <span class="required">*</span></label>
            <input type="text" name="name" class="form-control" placeholder="например, Teens Pre-Intermediate (Группа A)" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Уровень английского</label>
              <select name="level" id="select-group-level" class="form-control">
                <option value="Beginner">Beginner (Начальный)</option>
                <option value="Elementary">Elementary (Элементарный)</option>
                <option value="Pre-Intermediate" selected>Pre-Intermediate (Ниже среднего)</option>
                <option value="Intermediate">Intermediate (Средний)</option>
                <option value="Upper-Intermediate">Upper-Intermediate (Выше среднего)</option>
                <option value="Advanced">Advanced (Продвинутый)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Преподаватель группы <span class="required">*</span></label>
              <select name="teacherId" class="form-control" required>
                ${teachers.map(t => `<option value="${t.id}" ${isTeacher && currentTeacherId === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Основной учебник группы <span class="required">*</span></label>
              <select name="textbookSelect" id="select-group-textbook" class="form-control" required>
                <option value="">-- Выберите учебник платформы --</option>
                ${textbooks.map(tb => `<option value="${tb}">📚 ${tb}</option>`).join('')}
                <option value="__custom__">➕ Добавить новый учебник на платформу...</option>
              </select>
              <div id="custom-textbook-wrap" style="margin-top: 6px; display: none;">
                <input type="text" name="customTextbook" id="input-custom-textbook" class="form-control" placeholder="Введите название учебника (например, English World 3)">
              </div>
              <span class="text-xs text-muted" style="margin-top: 4px; display: block;">
                Годовой план уроков (80 занятий), темы и ДЗ группы будут распределены по этому учебнику
              </span>
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
              <label class="form-label">Кабинет / Формат</label>
              <input type="text" name="classroom" class="form-control" placeholder="Кабинет 2 или Онлайн (Zoom)">
            </div>
            <div class="form-group">
              <label class="form-label">Описание группы</label>
              <input type="text" name="description" class="form-control" placeholder="Возраст, цели, особенности">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Добавить учеников в группу (можно также назначить позже):</label>
            <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2);">
              ${students.map(s => {
                const currentGroup = store.getGroupById(s.groupId);
                return `
                  <label style="display: flex; align-items: center; gap: var(--space-2); padding: 4px; font-size: var(--font-size-xs); cursor: pointer;">
                    <input type="checkbox" name="selectedStudents" value="${s.id}">
                    <span>${s.fullName} (${s.grade}, ${s.level})</span>
                    ${currentGroup ? `<span class="text-muted" style="margin-left:auto;">[в: ${currentGroup.name}]</span>` : ''}
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-add-group" class="btn btn-primary">Создать группу</button>
      `,
      onOpen: () => {
        const textbookSelect = document.getElementById('select-group-textbook');
        const customWrap = document.getElementById('custom-textbook-wrap');
        const customInput = document.getElementById('input-custom-textbook');

        textbookSelect?.addEventListener('change', (e) => {
          if (e.target.value === '__custom__') {
            customWrap.style.display = 'block';
            customInput?.focus();
          } else {
            customWrap.style.display = 'none';
          }
        });

        document.getElementById('form-add-group')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const form = e.target;
          const formData = new FormData(form);

          let chosenTextbook = formData.get('textbookSelect');
          if (chosenTextbook === '__custom__') {
            chosenTextbook = formData.get('customTextbook')?.trim();
            if (!chosenTextbook) {
              toast.error('Пожалуйста, введите название нового учебника');
              return;
            }
          }

          if (!chosenTextbook) {
            toast.error('Пожалуйста, выберите основной учебник для группы');
            return;
          }

          const groupData = {
            name: formData.get('name'),
            level: formData.get('level'),
            teacherId: formData.get('teacherId'),
            textbook: chosenTextbook,
            shift: formData.get('shift'),
            classroom: formData.get('classroom'),
            description: formData.get('description')
          };

          const newGroup = store.addGroup(groupData);

          // Assign selected students
          const selectedStudentIds = formData.getAll('selectedStudents');
          selectedStudentIds.forEach(stId => {
            store.updateStudent(stId, {
              groupId: newGroup.id,
              level: newGroup.level,
              textbook: newGroup.textbook
            });
          });

          modal.close();
          toast.success(`Группа "${newGroup.name}" создана с программой учебника "${newGroup.textbook}"!`);
          this.render(container);
        });
      }
    });
  },

  openEditModal(groupId, container) {
    const group = store.getGroupById(groupId);
    if (!group) return;

    const teachers = store.getTeachers();
    const students = store.getStudents();
    const textbooks = store.getTextbooks();
    const currentTb = group.textbook || '';
    const isKnownTb = textbooks.includes(currentTb);

    modal.open({
      title: `Редактирование: ${group.name}`,
      bodyHtml: `
        <form id="form-edit-group">
          <div class="form-group">
            <label class="form-label">Название группы <span class="required">*</span></label>
            <input type="text" name="name" class="form-control" value="${group.name}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Уровень английского</label>
              <select name="level" class="form-control">
                <option value="Beginner" ${group.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                <option value="Elementary" ${group.level === 'Elementary' ? 'selected' : ''}>Elementary</option>
                <option value="Pre-Intermediate" ${group.level === 'Pre-Intermediate' ? 'selected' : ''}>Pre-Intermediate</option>
                <option value="Intermediate" ${group.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Upper-Intermediate" ${group.level === 'Upper-Intermediate' ? 'selected' : ''}>Upper-Intermediate</option>
                <option value="Advanced" ${group.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Преподаватель группы</label>
              <select name="teacherId" class="form-control">
                ${teachers.map(t => `<option value="${t.id}" ${group.teacherId === t.id ? 'selected' : ''}>${t.fullName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Основной учебник группы <span class="required">*</span></label>
              <select name="textbookSelect" id="select-edit-group-textbook" class="form-control" required>
                <option value="">-- Выберите учебник платформы --</option>
                ${textbooks.map(tb => `<option value="${tb}" ${currentTb === tb ? 'selected' : ''}>📚 ${tb}</option>`).join('')}
                <option value="__custom__" ${!isKnownTb && currentTb ? 'selected' : ''}>➕ Добавить новый учебник на платформу...</option>
              </select>
              <div id="edit-custom-textbook-wrap" style="margin-top: 6px; display: ${!isKnownTb && currentTb ? 'block' : 'none'};">
                <input type="text" name="customTextbook" id="input-edit-custom-textbook" class="form-control" placeholder="Введите название учебника" value="${!isKnownTb ? currentTb : ''}">
              </div>
              <span class="text-xs text-muted" style="margin-top: 4px; display: block;">
                При смене учебника темы уроков группы и домашние задания учеников обновятся
              </span>
            </div>
            <div class="form-group">
              <label class="form-label">Смена</label>
              <select name="shift" class="form-control">
                <option value="Первая" ${group.shift === 'Первая' ? 'selected' : ''}>Первая смена</option>
                <option value="Вторая" ${group.shift === 'Вторая' ? 'selected' : ''}>Вторая смена</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Кабинет</label>
              <input type="text" name="classroom" class="form-control" value="${group.classroom || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Описание</label>
              <input type="text" name="description" class="form-control" value="${group.description || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Состав учеников в группе:</label>
            <div style="max-height: 140px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-2);">
              ${students.map(s => `
                <label style="display: flex; align-items: center; gap: var(--space-2); padding: 4px; font-size: var(--font-size-xs); cursor: pointer;">
                  <input type="checkbox" name="selectedStudents" value="${s.id}" ${s.groupId === group.id ? 'checked' : ''}>
                  <span>${s.fullName} (${s.grade})</span>
                  ${s.groupId && s.groupId !== group.id ? `<span class="text-muted" style="margin-left:auto;">[в другой группе]</span>` : ''}
                </label>
              `).join('')}
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-group" class="btn btn-primary">Сохранить</button>
      `,
      onOpen: () => {
        const textbookSelect = document.getElementById('select-edit-group-textbook');
        const customWrap = document.getElementById('edit-custom-textbook-wrap');
        const customInput = document.getElementById('input-edit-custom-textbook');

        textbookSelect?.addEventListener('change', (e) => {
          if (e.target.value === '__custom__') {
            customWrap.style.display = 'block';
            customInput?.focus();
          } else {
            customWrap.style.display = 'none';
          }
        });

        document.getElementById('form-edit-group')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);

          let chosenTextbook = formData.get('textbookSelect');
          if (chosenTextbook === '__custom__') {
            chosenTextbook = formData.get('customTextbook')?.trim();
            if (!chosenTextbook) {
              toast.error('Пожалуйста, укажите название учебника');
              return;
            }
          }

          store.updateGroup(groupId, {
            name: formData.get('name'),
            level: formData.get('level'),
            teacherId: formData.get('teacherId'),
            textbook: chosenTextbook,
            shift: formData.get('shift'),
            classroom: formData.get('classroom'),
            description: formData.get('description')
          });

          // Sync student group assignments
          const selectedStudentIds = formData.getAll('selectedStudents');
          students.forEach(st => {
            if (selectedStudentIds.includes(st.id)) {
              if (st.groupId !== groupId) {
                store.updateStudent(st.id, {
                  groupId,
                  level: formData.get('level'),
                  textbook: chosenTextbook
                });
              }
            } else if (st.groupId === groupId) {
              store.updateStudent(st.id, { groupId: null });
            }
          });

          modal.close();
          toast.success(`Группа "${group.name}" обновлена!`);
          this.render(container);
        });
      }
    });
  },

  openDetailsModal(groupId) {
    const group = store.getGroupById(groupId);
    if (!group) return;

    const teacher = store.getTeacherById(group.teacherId);
    const students = store.getStudentsByGroupId(groupId);
    const lessons = store.getSchedule({ groupId });

    modal.open({
      title: `Группа: ${group.name}`,
      bodyHtml: `
        <div style="display: flex; flex-direction: column; gap: var(--space-5);">
          <!-- Overview Card -->
          <div style="background: var(--color-bg-app); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="font-size: var(--font-size-md); font-weight: 700;">${group.name}</h3>
                <div class="text-xs text-muted">${group.description || 'Учебная группа'} • ${group.shift} смена • ${group.classroom}</div>
              </div>
              <span class="badge badge-level level-${group.level.toLowerCase()}">${group.level}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-top: var(--space-3); font-size: var(--font-size-xs);">
              <div><strong>Преподаватель:</strong> ${teacher ? teacher.fullName : '—'}</div>
              <div><strong>Учебник:</strong> ${group.textbook || '—'}</div>
            </div>
          </div>

          <!-- Students List -->
          <div>
            <h4 style="margin-bottom: var(--space-3); font-size: var(--font-size-sm);">🎒 Ученики в группе (${students.length})</h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 180px; overflow-y: auto;">
              ${students.length === 0 ? '<div class="text-xs text-muted">В группе пока нет учеников</div>' : students.map(st => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bg-app); border-radius: var(--radius-md); font-size: var(--font-size-xs);">
                  <div>
                    <span class="font-semibold">${st.fullName}</span> (${st.grade}, ${st.school})
                    <div class="text-muted">${st.parentName || ''} • ${st.phone || ''}</div>
                  </div>
                  <span class="student-points-badge">⭐ ${st.totalPoints || 0}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Group Lessons -->
          <div>
            <h4 style="margin-bottom: var(--space-3); font-size: var(--font-size-sm);">📅 Расписание занятий группы</h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${lessons.length === 0 ? '<div class="text-xs text-muted">Занятия еще не назначены</div>' : lessons.map(l => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--color-bg-app); border-radius: var(--radius-md); font-size: var(--font-size-xs);">
                  <div>
                    <strong>${l.dayOfWeek} ${l.time}</strong> — ${l.topic}
                    <div class="text-muted">${l.format}</div>
                  </div>
                  <span class="badge badge-${l.status}">${l.status === 'planned' ? 'Запланирован' : l.status === 'completed' ? 'Проведен' : 'Отменен'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Закрыть</button>
      `
    });
  }
};
