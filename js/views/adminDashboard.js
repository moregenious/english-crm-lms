/**
 * Admin Dashboard View - Overview, KPIs with Groups, Schedule and Quick Actions
 */

import { store } from '../store.js';
import { auth } from '../auth.js';

export const AdminDashboard = {
  render(container) {
    const analytics = store.getAnalytics();
    const schedule = store.getSchedule();
    const students = store.getStudents();
    const groups = store.getGroups();
    const recentPoints = store.getPointRecords().slice(0, 5);

    // Top students by points
    const topStudents = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0)).slice(0, 4);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>Дашборд Администратора</h1>
          <p>Общий обзор учебного процесса, групп, статистики практики и быстрые действия</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-outline-primary btn-sm" id="btn-export-data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Экспорт данных
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-reset-data">Сброс к демо-данным</button>
        </div>
      </div>

      <!-- Quick Actions Bar -->
      <div class="quick-actions-bar">
        <div class="quick-action-btn" id="action-quick-add-group">
          <div class="action-icon" style="background:#f3e8ff; color:#7e22ce;">👥</div>
          <div>
            <div class="font-semibold text-sm">Создать группу</div>
            <div class="text-xs text-muted">Формирование состава</div>
          </div>
        </div>

        <div class="quick-action-btn" id="action-quick-add-student">
          <div class="action-icon">👤</div>
          <div>
            <div class="font-semibold text-sm">Добавить ученика</div>
            <div class="text-xs text-muted">Анкета и назначение в группу</div>
          </div>
        </div>

        <div class="quick-action-btn" id="action-quick-add-lesson">
          <div class="action-icon">📅</div>
          <div>
            <div class="font-semibold text-sm">Назначить урок</div>
            <div class="text-xs text-muted">Для группы или ученика</div>
          </div>
        </div>

        <div class="quick-action-btn" id="action-quick-award-points">
          <div class="action-icon">⭐</div>
          <div>
            <div class="font-semibold text-sm">Начислить баллы</div>
            <div class="text-xs text-muted">За тесты, ДЗ и активность</div>
          </div>
        </div>
      </div>

      <!-- KPI Metrics Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Всего учеников</span>
            <span class="stat-value">${analytics.totalStudents}</span>
            <span class="stat-subtext">В ${analytics.totalGroups} учебных группах</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#f3e8ff; color:#7e22ce;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Учебных групп</span>
            <span class="stat-value">${analytics.totalGroups}</span>
            <span class="stat-subtext">Активные потоки</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Занятий в графике</span>
            <span class="stat-value">${analytics.totalLessons}</span>
            <span class="stat-subtext">${analytics.plannedLessons} запланировано</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Средний балл</span>
            <span class="stat-value">${analytics.avgPoints} ⭐</span>
            <span class="stat-subtext">На одного ученика</span>
          </div>
        </div>
      </div>

      <!-- Dashboard Main Columns -->
      <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-6);" class="dashboard-columns">
        <!-- Upcoming Lessons Section -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Ближайшие уроки
              </h3>
              <p class="card-subtitle">Расписание на текущую неделю</p>
            </div>
            <a href="#schedule" class="text-sm font-semibold">Все расписание →</a>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Время / День</th>
                  <th>Группа / Ученик</th>
                  <th>Преподаватель</th>
                  <th>Тема / Формат</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                ${schedule.slice(0, 5).map(item => {
                  const isGroup = !!item.groupId;
                  const group = isGroup ? store.getGroupById(item.groupId) : null;
                  const student = !isGroup ? store.getStudentById(item.studentId) : null;
                  const teacher = store.getTeacherById(item.teacherId);
                  const statusMap = {
                    planned: '<span class="badge badge-planned">Запланирован</span>',
                    completed: '<span class="badge badge-completed">Проведен</span>',
                    cancelled: '<span class="badge badge-cancelled">Отменен</span>'
                  };
                  return `
                    <tr>
                      <td>
                        <div class="font-semibold">${item.time}</div>
                        <div class="text-xs text-muted">${item.dayOfWeek}</div>
                      </td>
                      <td>
                        <div class="font-semibold">${isGroup ? `👥 ${group ? group.name : '—'}` : `👤 ${student ? student.fullName : '—'}`}</div>
                        <div class="text-xs text-muted">${isGroup ? `${group?.level} • ${store.getStudentsByGroupId(item.groupId).length} уч.` : student?.level}</div>
                      </td>
                      <td>${teacher ? teacher.fullName : '—'}</td>
                      <td>
                        <div>${item.topic}</div>
                        <div class="text-xs text-muted">${item.format}</div>
                      </td>
                      <td>${statusMap[item.status] || item.status}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column: Recent Points & Top Students -->
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          <!-- Top Students Card -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">🏆 Лидеры по баллам</h3>
                <p class="card-subtitle">Топ учеников практики</p>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${topStudents.map((s, idx) => {
                const grp = store.getGroupById(s.groupId);
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-border-subtle);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                      <span style="font-weight: 700; color: var(--color-text-muted); width: 16px;">#${idx + 1}</span>
                      <div>
                        <div class="font-semibold text-sm">${s.fullName}</div>
                        <div class="text-xs text-muted">${s.grade} • ${grp ? grp.name : 'Индивидуально'}</div>
                      </div>
                    </div>
                    <span class="badge badge-level level-${s.level.toLowerCase()}">${s.totalPoints} ⭐</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Recent Points Given -->
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">📝 Последние оценки</h3>
                <p class="card-subtitle">История начислений баллов</p>
              </div>
              <a href="#scoring" class="text-sm font-semibold">Журнал →</a>
            </div>
            <div class="points-timeline">
              ${recentPoints.map(p => {
                const st = store.getStudentById(p.studentId);
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
                      <div class="font-semibold text-sm">${st ? st.fullName : 'Ученик'}</div>
                      <div class="point-comment">${p.comment}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Quick Action buttons
    document.getElementById('action-quick-add-group')?.addEventListener('click', () => {
      window.location.hash = '#groups';
      setTimeout(() => document.getElementById('btn-add-group')?.click(), 100);
    });

    document.getElementById('action-quick-add-student')?.addEventListener('click', () => {
      window.location.hash = '#students';
      setTimeout(() => document.getElementById('btn-add-student')?.click(), 100);
    });

    document.getElementById('action-quick-add-lesson')?.addEventListener('click', () => {
      window.location.hash = '#schedule';
      setTimeout(() => document.getElementById('btn-add-lesson')?.click(), 100);
    });

    document.getElementById('action-quick-award-points')?.addEventListener('click', () => {
      window.location.hash = '#scoring';
      setTimeout(() => document.getElementById('btn-award-points')?.click(), 100);
    });

    // Bind Data export & reset
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(store.exportJSON());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "english_crm_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Сбросить базу данных к начальным демо-значениям?')) {
        store.resetToDefaults();
        window.location.reload();
      }
    });
  }
};
