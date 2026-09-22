/**
 * Teacher Personal Cabinet View - Groups, Personal Schedule, Lesson Plans, Homework & Student Phone Management
 */

import { store, formatPhoneForDisplay } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { openAttendanceModal } from '../components/attendanceModal.js';
import { LessonPlansView } from './lessonPlansView.js';

export const TeacherCabinet = {
  render(container) {
    const teacherUser = auth.getCurrentUser();
    const teacherId = teacherUser.id;
    const teacher = store.getTeacherById(teacherId) || store.getTeachers()[0];

    const myGroups = store.getGroups({ teacherId: teacher.id });
    const mySchedule = store.getSchedule({ teacherId: teacher.id });

    // Calculate current week dates
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];
    const weekDateStrings = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      weekDateStrings.push(`${dayStr}.${monthStr}`);
      weekDateStrings.push(`${dayStr}.${monthStr}.${yearStr}`);
      weekDateStrings.push(`${yearStr}-${monthStr}-${dayStr}`);
      weekDays.push({
        dayName: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'][i],
        formattedDDMM: `${dayStr}.${monthStr}`
      });
    }

    const currentWeekSchedule = mySchedule.filter(l => {
      if (!l || !l.date) return false;
      const cleanDate = l.date.trim();
      return weekDateStrings.includes(cleanDate);
    });

    const dayOrder = { 'Понедельник': 1, 'Вторник': 2, 'Среда': 3, 'Четверг': 4, 'Пятница': 5, 'Суббота': 6, 'Воскресенье': 7 };
    currentWeekSchedule.sort((a, b) => {
      const dayDiff = (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99);
      if (dayDiff !== 0) return dayDiff;
      return (a.time || '').localeCompare(b.time || '');
    });

    // Collect all students from teacher's groups and direct lessons
    let allTeacherStudents = [];
    myGroups.forEach(g => {
      allTeacherStudents.push(...store.getStudentsByGroupId(g.id));
    });
    mySchedule.forEach(l => {
      if (l.studentId) {
        const st = store.getStudentById(l.studentId);
        if (st && !allTeacherStudents.some(s => s.id === st.id)) {
          allTeacherStudents.push(st);
        }
      }
    });

    const teacherStudentIds = allTeacherStudents.map(s => s.id);
    const allPurchases = store.getPurchases ? store.getPurchases() : [];
    const teacherPurchases = allPurchases.filter(p => teacherStudentIds.includes(p.studentId) || myGroups.some(g => g.id === p.groupId));

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>Кабинет Преподавателя</h1>
          <p>Добро пожаловать, ${teacher.fullName}! Ваши учебные группы, расписание, планы уроков, домашние задания и новые слова.</p>
        </div>
        <div class="section-actions">
          <a href="#lesson-plans" class="btn btn-secondary">
            📚 Планы уроков и материалы
          </a>
          <button class="btn btn-primary" id="btn-teacher-award-points">
            ⭐ Начислить / Вычесть баллы
          </button>
          <button type="button" class="btn btn-logout-header btn-app-logout" title="Выйти на главный экран входа">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Выйти</span>
          </button>
        </div>
      </div>

      <!-- Teacher Info Card -->
      <div class="card" style="margin-bottom: var(--space-6); background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: ${teacher.avatarColor || '#0d9488'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
              ${teacher.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <h2 style="color: #fff; font-size: var(--font-size-lg);">${teacher.fullName}</h2>
              <p style="color: #94a3b8; font-size: var(--font-size-sm);">${teacher.specialization}</p>
              <div style="font-size:0.75rem; color:#38bdf8; margin-top:2px;">
                Логин для входа: <strong>${teacher.login || '—'}</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: var(--space-4);">
            <div style="background: rgba(255,255,255,0.08); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.25rem; font-weight: 700; color: #a855f7;">${myGroups.length}</div>
              <div style="font-size: var(--font-size-xs); color: #94a3b8;">Моих групп</div>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.25rem; font-weight: 700; color: #38bdf8;">${allTeacherStudents.length}</div>
              <div style="font-size: var(--font-size-xs); color: #94a3b8;">Учеников</div>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: var(--space-3) var(--space-5); border-radius: var(--radius-md); text-align: center;">
              <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">${currentWeekSchedule.length}</div>
              <div style="font-size: var(--font-size-xs); color: #94a3b8;">Уроков на этой неделе</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Plans Banner -->
      <div class="card" style="margin-bottom: var(--space-6); background: var(--color-bg-card); border-left: 4px solid var(--color-success); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-3);">
        <div>
          <h3 style="font-size:var(--font-size-md); font-weight:700;">📚 Управление планами уроков и ДЗ</h3>
          <p class="text-xs text-muted" style="margin-top:2px;">Загружайте аудиозаписи, Word-документы и новые слова. Они откроются ученикам сразу после нажатия «✓ Провести урок».</p>
        </div>
        <a href="#lesson-plans" class="btn btn-primary btn-sm">
          Перейти к планам уроков ➔
        </a>
      </div>

      <!-- Two Column Layout: My Schedule & Student Cards -->
      <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: var(--space-6);" class="dashboard-columns">
        <!-- Left: My Personal Schedule for Current Week -->
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-2);">
            <div>
              <h3 class="card-title">📅 Расписание на эту неделю</h3>
              <p class="card-subtitle">Период: <strong>${weekDays[0].formattedDDMM} — ${weekDays[6].formattedDDMM}</strong> (${currentWeekSchedule.length} уроков)</p>
            </div>
            <a href="#schedule" class="btn btn-ghost btn-sm" style="font-size: var(--font-size-xs); border: 1px solid var(--color-border);">
              Все 80 уроков в расписании ➔
            </a>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${currentWeekSchedule.length === 0 ? `
              <div class="empty-state" style="padding: var(--space-6) 0;">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-title">На этой неделе уроков нет</div>
                <div class="empty-state-desc">На период с ${weekDays[0].formattedDDMM} по ${weekDays[6].formattedDDMM} уроков не запланировано. Для просмотра всего годового плана перейдите в раздел «Расписание».</div>
              </div>
            ` : currentWeekSchedule.map(l => {
              const isGroup = !!l.groupId;
              const group = isGroup ? store.getGroupById(l.groupId) : null;
              const student = !isGroup ? store.getStudentById(l.studentId) : null;
              const groupStudents = isGroup ? store.getStudentsByGroupId(l.groupId) : [];
              const plan = store.getLessonPlanByScheduleId(l.id) || (group ? store.getLessonPlans({ groupId: group.id }).find(p => !p.isConducted) : null);

              return `
                <div class="lesson-card status-${l.status}">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="font-weight: 700; font-size: var(--font-size-sm);">
                      🗓️ ${l.dayOfWeek}, ${l.time}
                    </div>
                    <span class="badge badge-${l.status}">
                      ${l.status === 'planned' ? 'Запланирован (ДЗ закрыто)' : l.status === 'completed' ? '✓ Проведен (ДЗ открыто)' : 'Отменен'}
                    </span>
                  </div>

                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-2);">
                    <div>
                      <div style="font-weight: 700; font-size: var(--font-size-base); color: var(--color-text-main);">
                        ${isGroup ? `👥 ${group ? group.name : 'Группа'}` : `👤 ${student ? student.fullName : '—'}`}
                      </div>
                      <div class="text-xs text-muted">
                        ${isGroup ? `Групповой урок (${groupStudents.length} уч.) • ${group?.classroom || ''}` : `Индивидуально (${student?.grade || ''})`}
                      </div>
                    </div>
                    ${(group || student) ? `<span class="badge badge-level level-${(group?.level || student?.level || 'beginner').toLowerCase()}">${group?.level || student?.level}</span>` : ''}
                  </div>

                  <div style="margin-top: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--color-bg-app); border-radius: var(--radius-md); font-size: var(--font-size-xs);">
                    <div><strong>Учебник:</strong> ${group?.textbook || student?.textbook || 'Не указан'}</div>
                    <div><strong>Тема:</strong> ${l.topic} (${l.format})</div>
                    ${plan ? `
                      <div style="margin-top:4px; padding-top:4px; border-top:1px dashed var(--color-border); color:var(--color-primary);">
                        📝 ДЗ: ${plan.homework?.text ? (plan.homework.text.slice(0, 60) + '...') : 'Не задано'} • 🔤 Слов: ${plan.vocabulary?.length || 0} • 📎 Файлов: ${plan.files?.length || 0}
                      </div>
                    ` : ''}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px dashed var(--color-border-subtle);">
                    <!-- Teacher Status Control Pill Buttons -->
                    <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                      <span class="text-xs text-muted" style="font-weight: 600; margin-right: 2px;">Статус:</span>
                      <button class="btn btn-xs ${l.status === 'completed' ? 'btn-primary' : 'btn-outline'} btn-teacher-status-btn" data-id="${l.id}" data-status="completed" title="Отметить как проведенный" style="${l.status === 'completed' ? 'background:var(--color-success); border-color:var(--color-success);' : 'color:var(--color-success);'}">
                        ✓ Проведен
                      </button>
                      <button class="btn btn-xs ${l.status === 'cancelled' ? 'btn-primary' : 'btn-outline'} btn-teacher-status-btn" data-id="${l.id}" data-status="cancelled" title="Отменить урок" style="${l.status === 'cancelled' ? 'background:var(--color-danger); border-color:var(--color-danger);' : 'color:var(--color-danger);'}">
                        ✕ Отменен
                      </button>
                      <button class="btn btn-xs ${l.status === 'planned' ? 'btn-secondary' : 'btn-ghost'} btn-teacher-status-btn" data-id="${l.id}" data-status="planned" title="Вернуть в запланированные">
                        ⏳ Запланирован
                      </button>
                    </div>

                    <div style="display: flex; gap: var(--space-2); align-items: center;">
                      <button class="btn btn-xs btn-primary btn-teacher-attendance" data-id="${l.id}" title="Отметить посещаемость">
                        👥 Посещаемость
                      </button>
                      ${plan ? `
                        <button class="btn btn-xs btn-secondary btn-teacher-edit-plan" data-plan-id="${plan.id}">
                          ✏️ ДЗ и слова
                        </button>
                      ` : ''}
                      <button class="btn btn-xs btn-ghost btn-teacher-edit-lesson" data-id="${l.id}" title="Редактировать параметры урока">
                        ✏️ Урок
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: My Students Directory & Phone Management -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🎒 Мои ученики и телефоны (${allTeacherStudents.length})</h3>
              <p class="card-subtitle">Номера телефонов для авторизации по SMS</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3); max-height: 520px; overflow-y: auto;">
            ${allTeacherStudents.length === 0 ? `
              <div class="text-sm text-muted text-center" style="padding: var(--space-6) 0;">
                Закрепленных учеников нет
              </div>
            ` : allTeacherStudents.map(st => {
              const grp = store.getGroupById(st.groupId);
              return `
                <div style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-3); background: var(--color-bg-subtle);">
                  <div style="display: flex; align-items: flex-start; justify-content: space-between;">
                    <div>
                      <div style="font-weight: 700; font-size: var(--font-size-sm);">${st.fullName}</div>
                      <div class="text-xs text-muted">${st.grade} • ${st.shift} смена • ${st.school}</div>
                      ${grp ? `<div class="badge badge-planned" style="font-size:0.65rem; margin-top:2px;">👥 ${grp.name}</div>` : ''}
                    </div>
                    <span class="student-points-badge">⭐ ${st.totalPoints || 0}</span>
                  </div>

                  <div style="margin-top: var(--space-2); padding: var(--space-2); background: #ffffff; border-radius: var(--radius-md); border: 1px dashed var(--color-border); font-size: var(--font-size-xs);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span>📱 <strong>Телефон ученика (SMS-вход):</strong></span>
                      <strong style="color:var(--color-primary);">${st.phone || '<span style="color:var(--color-danger)">Не указан</span>'}</strong>
                    </div>
                  </div>

                  <div style="margin-top: var(--space-2); display: flex; justify-content: flex-end; align-items: center; gap: var(--space-2);">
                    <button class="btn btn-sm btn-secondary btn-teacher-edit-phone" data-id="${st.id}" style="padding: 2px 8px; font-size: 0.75rem;">
                      📱 Номер
                    </button>
                    <button class="btn btn-sm btn-outline-primary btn-teacher-student-details" data-id="${st.id}" style="padding: 2px 8px; font-size: 0.75rem;">
                      Карточка
                    </button>
                    <button class="btn btn-sm btn-ghost btn-teacher-delete-student" data-id="${st.id}" title="Удалить ученика" style="padding: 2px 6px; font-size: 0.8rem; color:var(--color-danger);">
                      🗑️
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Student Purchases Section in Teacher Cabinet -->
      <div class="card" style="margin-top: var(--space-6);">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
          <div>
            <h3 class="card-title">🛍️ Покупки моих учеников в магазине</h3>
            <p class="card-subtitle">Список купленных аватаров, рамок, титулов и товаров. Вы можете отменить покупку без штрафа для ученика с автоматическим возвратом баллов.</p>
          </div>
          <a href="#shop" class="btn btn-secondary btn-sm">Перейти в магазин ➔</a>
        </div>

        <div>
          ${teacherPurchases.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-6) 0;">
              <div class="empty-state-icon">🛍️</div>
              <div class="empty-state-title">Покупок пока нет</div>
              <div class="empty-state-desc">Когда ученики совершат покупки в магазине за баллы, они отобразятся здесь.</div>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="table" style="font-size: var(--font-size-xs);">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Ученик</th>
                    <th>Товар</th>
                    <th>Тип</th>
                    <th>Списано</th>
                    <th>Статус</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  ${teacherPurchases.map(pur => {
                    const st = store.getStudentById(pur.studentId);
                    const isCompleted = pur.status === 'completed';
                    return `
                      <tr>
                        <td>${new Date(pur.date).toLocaleDateString('ru-RU')}</td>
                        <td><strong>${st ? st.fullName : pur.studentName || '—'}</strong></td>
                        <td>${pur.itemName}</td>
                        <td>
                          <span class="badge" style="font-size:0.65rem;">
                            ${pur.itemType === 'avatar' ? '🎭 Аватар' : pur.itemType === 'frame' ? '🖼️ Рамка' : pur.itemType === 'title' ? '👑 Титул' : '📦 Товар'}
                          </span>
                        </td>
                        <td><strong style="color:#f59e0b;">${pur.price} ⭐</strong></td>
                        <td>
                          <span class="badge badge-${isCompleted ? 'completed' : 'cancelled'}">
                            ${isCompleted ? '✓ Оплачен' : '✕ Отменен'}
                          </span>
                        </td>
                        <td>
                          ${isCompleted ? `
                            <button class="btn btn-danger btn-xs btn-teacher-cancel-purchase" data-id="${pur.id}" title="Отменить покупку и вернуть ${pur.price} баллов">
                              ❌ Отменить покупку
                            </button>
                          ` : `
                            <span class="text-muted text-xs">Баллы возвращены (${pur.cancelledBy || 'отмена'})</span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents(container, teacher);
  },

  bindEvents(container, teacher) {
    container.querySelectorAll('.btn-teacher-cancel-purchase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const purId = e.currentTarget.getAttribute('data-id');
        const pur = (store.getPurchases ? store.getPurchases() : []).find(p => p.id === purId);
        if (!pur) return;
        const st = store.getStudentById(pur.studentId);
        const name = st ? st.fullName : 'ученика';
        const teacherName = teacher?.fullName || auth.getCurrentUser()?.name || 'Преподаватель';
        if (confirm(`Отменить покупку «${pur.itemName}» для ${name}?\n\nБаллы (${pur.price} ⭐) будут мгновенно возвращены на баланс ученика без штрафов.`)) {
          const res = store.cancelPurchase(purId, teacherName);
          if (res.success) {
            toast.success(res.message || `Покупка отменена! ${pur.price} ⭐ возвращены на баланс.`);
            this.render(container);
          } else {
            toast.error(res.message || 'Не удалось отменить покупку');
          }
        }
      });
    });

    container.querySelector('#btn-teacher-award-points')?.addEventListener('click', () => {
      window.location.hash = '#scoring';
      setTimeout(() => document.getElementById('btn-award-points')?.click(), 100);
    });

    container.querySelectorAll('.btn-teacher-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const newStatus = e.currentTarget.getAttribute('data-status');
        store.updateLessonStatus(id, newStatus);
        if (newStatus === 'completed') {
          toast.success('Урок отмечен как проведенный! Домашнее задание и новые слова открыты для учеников.');
        } else if (newStatus === 'cancelled') {
          toast.warning('Урок отмечен как отмененный.');
        } else {
          toast.info('Урок возвращен в статус запланированных.');
        }
        this.render(container);
      });
    });

    container.querySelectorAll('.btn-teacher-attendance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openAttendanceModal(id, () => this.render(container));
      });
    });

    container.querySelectorAll('.btn-teacher-edit-lesson').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        import('./scheduleView.js').then(module => {
          module.ScheduleView.openEditModal(id, container);
        });
      });
    });

    container.querySelectorAll('.btn-teacher-edit-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = e.currentTarget.getAttribute('data-plan-id');
        const plan = store.getLessonPlanById(planId);
        if (plan) {
          LessonPlansView.openPlanModal(plan, container);
        }
      });
    });

    container.querySelectorAll('.btn-teacher-student-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        import('./studentsView.js').then(module => {
          module.StudentsView.openProfileModal(id);
        });
      });
    });

    // Teacher quick phone edit modal
    container.querySelectorAll('.btn-teacher-edit-phone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.openEditPhoneModal(id, container);
      });
    });

    // Teacher delete student
    container.querySelectorAll('.btn-teacher-delete-student').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const st = store.getStudentById(id);
        if (confirm(`Удалить ученика "${st ? st.fullName : ''}" из базы школы?`)) {
          store.deleteStudent(id);
          toast.success('Ученик удален');
          this.render(container);
        }
      });
    });
  },

  openEditPhoneModal(studentId, container) {
    const student = store.getStudentById(studentId);
    if (!student) return;

    modal.open({
      title: `📱 Номер телефона: ${student.fullName}`,
      bodyHtml: `
        <form id="form-teacher-edit-phone">
          <div class="form-hint" style="margin-bottom:var(--space-4); background:var(--color-bg-app); padding:var(--space-3); border-radius:var(--radius-md);">
            По этому номеру ученик будет запрашивать SMS-код для входа в свой личный кабинет.
          </div>

          <div class="form-group">
            <label class="form-label">Основной номер телефона ученика <span class="required">*</span></label>
            <input type="tel" name="phone" class="form-control" value="${student.phone || ''}" placeholder="+7 (999) 000-00-00" required autofocus>
          </div>

          <div class="form-group">
            <label class="form-label">Телефон родителей (запасной для связи)</label>
            <input type="tel" name="parentPhone" class="form-control" value="${student.parentPhone || ''}" placeholder="+7 (999) 000-00-00">
          </div>
        </form>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
        <button type="submit" form="form-teacher-edit-phone" class="btn btn-primary">Сохранить номер</button>
      `,
      onOpen: () => {
        document.getElementById('form-teacher-edit-phone')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const newPhone = formData.get('phone');
          const newParentPhone = formData.get('parentPhone');

          store.updateStudent(studentId, {
            phone: newPhone,
            parentPhone: newParentPhone
          });

          modal.close();
          toast.success(`Номер для ${student.fullName} сохранен! Теперь ученик может войти по SMS.`);
          this.render(container);
        });
      }
    });
  }
};
