/**
 * Teachers Management View - Teacher profiles, contacts, specializations and staff credentials
 * Registration of teachers is strictly managed by the Administrator.
 */

import { store, formatPhoneForDisplay } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export const TeachersView = {
  render(container) {
    const isAdmin = auth.isAdmin();
    const teachers = store.getTeachers();
    const schedule = store.getSchedule();

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>Преподаватели</h1>
          <p>Штат педагогов, учетные записи сотрудников, специализации и закрепленные группы</p>
        </div>
        <div class="section-actions">
          ${isAdmin ? `
            <button class="btn btn-primary" id="btn-add-teacher">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Зарегистрировать преподавателя
            </button>
          ` : ''}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-5);">
        ${teachers.map(t => {
          // Find unique students taught by this teacher
          const teacherLessons = schedule.filter(s => s.teacherId === t.id);
          const studentIds = [...new Set(teacherLessons.map(l => l.studentId))];
          const assignedStudents = studentIds.map(id => store.getStudentById(id)).filter(Boolean);

          return `
            <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-4);">
                  <div style="width: 52px; height: 52px; border-radius: var(--radius-full); background-color: ${t.avatarColor || '#4f46e5'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; flex-shrink: 0;">
                    ${t.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 style="font-size: var(--font-size-md); font-weight: 700; color: var(--color-text-main);">${t.fullName}</h3>
                    <div class="badge badge-planned" style="margin-top: 4px;">Преподаватель</div>
                  </div>
                </div>

                <div class="student-card-details" style="margin-bottom: var(--space-4);">
                  <div class="detail-row">
                    <span class="detail-label">Специализация:</span>
                    <span class="detail-val truncate" style="max-width: 190px;" title="${t.specialization}">${t.specialization || 'General English'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Телефон:</span>
                    <span class="detail-val">${t.phone ? `<a href="tel:${t.phone}">${t.phone}</a>` : '—'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-val">${t.email ? `<a href="mailto:${t.email}">${t.email}</a>` : '—'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Уроков в неделю:</span>
                    <span class="detail-val font-bold">${teacherLessons.length}</span>
                  </div>
                </div>

                <!-- Teacher Login Credentials Box (Visible to Admin) -->
                ${isAdmin ? `
                  <div style="margin-bottom: var(--space-4); padding: var(--space-2) var(--space-3); background: var(--color-primary-subtle); border-radius: var(--radius-md); font-size: var(--font-size-xs); border: 1px dashed var(--color-primary);">
                    <div style="font-weight: 700; color: var(--color-primary-text); margin-bottom: 2px;">🔑 Учетные данные для входа:</div>
                    <div style="display:flex; justify-content:space-between;">
                      <span>Логин: <strong>${t.login || t.phone || '—'}</strong></span>
                      <span>Пароль: <strong>${t.password || '123'}</strong></span>
                    </div>
                  </div>
                ` : ''}

                <!-- Assigned Students List -->
                <div style="margin-bottom: var(--space-4);">
                  <div style="font-size: var(--font-size-xs); font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: var(--space-2);">
                    Ученики в группе (${assignedStudents.length}):
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                    ${assignedStudents.length === 0 ? '<span class="text-xs text-muted">Пока нет прикрепленных занятий</span>' : assignedStudents.map(st => `
                      <span class="badge badge-level level-${st.level.toLowerCase()}" style="font-size: 0.7rem;" title="${st.level} • ${st.grade}">
                        ${st.fullName} (${st.grade})
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>

              ${isAdmin ? `
                <div style="display: flex; justify-content: flex-end; gap: var(--space-2); border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-3); margin-top: auto;">
                  <button class="btn btn-secondary btn-sm btn-edit-teacher" data-id="${t.id}">Редактировать</button>
                  <button class="btn btn-ghost btn-sm btn-delete-teacher" data-id="${t.id}" style="color: var(--color-danger)">Удалить</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.bindEvents(container);
  },

  bindEvents(container) {
    container.querySelector('#btn-add-teacher')?.addEventListener('click', () => this.openAddModal(container));

    container.querySelectorAll('.btn-edit-teacher').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditModal(id, container);
      });
    });

    container.querySelectorAll('.btn-delete-teacher').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tch = store.getTeacherById(id);
        if (confirm(`Удалить преподавателя "${tch ? tch.fullName : ''}"?`)) {
          store.deleteTeacher(id);
          toast.success('Преподаватель удален');
          this.render(container);
        }
      });
    });
  },

  openAddModal(container) {
    modal.open({
      title: 'Зарегистрировать преподавателя',
      bodyHtml: `
        <form id="form-add-teacher">
          <div class="form-hint" style="margin-bottom:var(--space-3); background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md);">
            🔒 Регистрация преподавателей выполняется Администратором. Вы сами задаете логин и пароль для входа педагога.
          </div>

          <div class="form-group">
            <label class="form-label">ФИО преподавателя <span class="required">*</span></label>
            <input type="text" name="fullName" class="form-control" placeholder="например, Виктория Олеговна Семенова" required autofocus>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Логин для входа <span class="required">*</span></label>
              <input type="text" name="login" class="form-control" placeholder="например, viktoria" required>
            </div>
            <div class="form-group">
              <label class="form-label">Пароль <span class="required">*</span></label>
              <input type="text" name="password" class="form-control" value="123" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" name="phone" class="form-control" placeholder="+7 (999) 000-00-00">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="email" class="form-control" placeholder="teacher@school.ru">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Специализация / Направления</label>
            <input type="text" name="specialization" class="form-control" placeholder="например, IELTS, Starters, Грамматика">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-add-teacher" class="btn btn-primary">Зарегистрировать</button>
      `,
      onOpen: () => {
        document.getElementById('form-add-teacher')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.addTeacher(data);
          modal.close();
          toast.success(`Преподаватель ${data.fullName} успешно зарегистрирован!`);
          this.render(container);
        });
      }
    });
  },

  openEditModal(id, container) {
    const teacher = store.getTeacherById(id);
    if (!teacher) return;

    modal.open({
      title: `Редактировать: ${teacher.fullName}`,
      bodyHtml: `
        <form id="form-edit-teacher">
          <div class="form-group">
            <label class="form-label">ФИО преподавателя <span class="required">*</span></label>
            <input type="text" name="fullName" class="form-control" value="${teacher.fullName}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Логин для входа</label>
              <input type="text" name="login" class="form-control" value="${teacher.login || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Пароль</label>
              <input type="text" name="password" class="form-control" value="${teacher.password || '123'}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Телефон</label>
              <input type="tel" name="phone" class="form-control" value="${teacher.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" name="email" class="form-control" value="${teacher.email || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Специализация</label>
            <input type="text" name="specialization" class="form-control" value="${teacher.specialization || ''}">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-edit-teacher" class="btn btn-primary">Сохранить</button>
      `,
      onOpen: () => {
        document.getElementById('form-edit-teacher')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData.entries());
          store.updateTeacher(id, data);
          modal.close();
          toast.success('Профиль и учетные данные преподавателя обновлены');
          this.render(container);
        });
      }
    });
  }
};
