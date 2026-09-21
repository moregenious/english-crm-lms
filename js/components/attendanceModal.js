/**
 * Lesson Attendance Modal Component with Multi-Select Support
 */

import { store } from '../store.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { renderStudentAvatarHtml } from './avatarCustomization.js';

export function openAttendanceModal(lessonOrId, onSave = null) {
  const lesson = typeof lessonOrId === 'string' ? store.getLessonById(lessonOrId) : lessonOrId;
  if (!lesson) {
    toast.error('Урок не найден');
    return;
  }

  const isGroup = !!lesson.groupId;
  const group = isGroup ? store.getGroupById(lesson.groupId) : null;
  const students = isGroup 
    ? store.getStudentsByGroupId(lesson.groupId)
    : (lesson.studentId ? [store.getStudentById(lesson.studentId)].filter(Boolean) : []);

  if (students.length === 0) {
    toast.warning('В этой группе нет зарегистрированных учеников.');
    return;
  }

  // Current attendance map: { [studentId]: 'present' | 'absent' }
  // If not previously recorded, default to all present
  const initialAttendance = store.getLessonAttendance(lesson.id);
  const draft = {};
  students.forEach(s => {
    if (initialAttendance && initialAttendance[s.id] !== undefined) {
      draft[s.id] = initialAttendance[s.id];
    } else {
      draft[s.id] = 'present';
    }
  });

  function getStats() {
    const total = students.length;
    const presentCount = students.filter(s => draft[s.id] === 'present').length;
    const percent = total > 0 ? Math.round((presentCount / total) * 100) : 0;
    return { total, presentCount, percent };
  }

  function renderListHtml() {
    const { total, presentCount, percent } = getStats();

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-app); padding:var(--space-3) var(--space-4); border-radius:var(--radius-lg); border:1px solid var(--color-border); margin-bottom:var(--space-4); flex-wrap:wrap; gap:8px;">
        <div style="font-size:var(--font-size-sm); font-weight:700; color:var(--color-text-main);">
          Присутствуют: <span style="color:var(--color-success); font-size:1.1rem;" id="att-present-count">${presentCount}</span> из ${total} (${percent}%)
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn btn-sm btn-secondary" id="btn-att-select-all" style="font-size:0.78rem; padding:4px 10px;">
            ✅ Отметить всех
          </button>
          <button type="button" class="btn btn-sm btn-ghost" id="btn-att-clear-all" style="font-size:0.78rem; padding:4px 10px; color:var(--color-danger);">
            ❌ Снять отметки
          </button>
        </div>
      </div>

      <div class="attendance-students-list" style="display:flex; flex-direction:column; gap:8px; max-height:360px; overflow-y:auto; padding-right:4px;">
        ${students.map(s => {
          const isPresent = draft[s.id] === 'present';
          return `
            <div class="attendance-student-row ${isPresent ? 'is-present' : 'is-absent'}" data-student-id="${s.id}" style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-radius:var(--radius-md); border:1.5px solid ${isPresent ? 'rgba(34, 197, 94, 0.4)' : 'var(--color-border)'}; background:${isPresent ? 'rgba(34, 197, 94, 0.05)' : 'var(--color-bg-card)'}; cursor:pointer; transition:all 0.15s ease;">
              <div style="display:flex; align-items:center; gap:12px;">
                <input type="checkbox" class="att-checkbox" data-student-id="${s.id}" ${isPresent ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer; accent-color:var(--color-success);" />
                ${renderStudentAvatarHtml(s, { size: 'sm' })}
                <div>
                  <div style="font-weight:700; font-size:var(--font-size-sm); color:var(--color-text-main);">
                    ${s.fullName}
                  </div>
                  <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
                    ${s.studentTitle ? `<span class="student-title-badge light" style="font-size:0.65rem; padding:1px 6px;">${s.studentTitle}</span>` : ''}
                    <span style="font-size:0.72rem; color:var(--color-text-muted);">${s.grade} • ${s.school}</span>
                  </div>
                </div>
              </div>

              <div>
                <span class="badge ${isPresent ? 'badge-completed' : 'badge-cancelled'}" style="font-size:0.75rem; padding:4px 10px; font-weight:700;">
                  ${isPresent ? '✓ Присутствует' : '✕ Отсутствует'}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  const bodyHtml = `
    <div>
      <div style="margin-bottom:var(--space-4); padding-bottom:var(--space-3); border-bottom:1px solid var(--color-border-subtle);">
        <div style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-sm); color:var(--color-primary); font-weight:700;">
          <span>📅 ${lesson.dayOfWeek || ''} ${lesson.date || ''} • ⏰ ${lesson.time || ''}</span>
          <span>•</span>
          <span>👥 ${group ? group.name : 'Индивидуально'}</span>
        </div>
        <div style="font-size:var(--font-size-md); font-weight:800; color:var(--color-text-main); margin-top:4px;">
          ${lesson.topic || 'Занятие по расписанию'}
        </div>
      </div>

      <div id="attendance-list-mount">
        ${renderListHtml()}
      </div>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-secondary" id="btn-cancel-attendance">Отмена</button>
    <button type="button" class="btn btn-primary" id="btn-save-attendance">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>Сохранить посещаемость</span>
    </button>
  `;

  modal.open({
    title: `👥 Отметка посещаемости урока`,
    bodyHtml,
    footerHtml,
    onOpen: () => {
      const mount = document.getElementById('attendance-list-mount');

      function updateUI() {
        if (mount) {
          mount.innerHTML = renderListHtml();
          bindRowEvents();
        }
      }

      function bindRowEvents() {
        // Toggle by clicking anywhere on the row
        document.querySelectorAll('.attendance-student-row').forEach(row => {
          row.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return; // let checkbox handler handle it
            const sid = row.getAttribute('data-student-id');
            if (sid) {
              draft[sid] = draft[sid] === 'present' ? 'absent' : 'present';
              updateUI();
            }
          });
        });

        // Toggle checkbox
        document.querySelectorAll('.att-checkbox').forEach(cb => {
          cb.addEventListener('change', (e) => {
            const sid = e.target.getAttribute('data-student-id');
            if (sid) {
              draft[sid] = e.target.checked ? 'present' : 'absent';
              updateUI();
            }
          });
        });

        // Select All Present
        document.getElementById('btn-att-select-all')?.addEventListener('click', () => {
          students.forEach(s => { draft[s.id] = 'present'; });
          updateUI();
        });

        // Clear All (Absent)
        document.getElementById('btn-att-clear-all')?.addEventListener('click', () => {
          students.forEach(s => { draft[s.id] = 'absent'; });
          updateUI();
        });
      }

      bindRowEvents();

      document.getElementById('btn-cancel-attendance')?.addEventListener('click', () => {
        modal.close();
      });

      document.getElementById('btn-save-attendance')?.addEventListener('click', () => {
        store.saveLessonAttendance(lesson.id, draft);
        const { presentCount, total } = getStats();
        toast.success(`Посещаемость сохранена: ${presentCount} из ${total} присутствовали.`);
        modal.close();

        if (onSave && typeof onSave === 'function') {
          onSave(draft);
        }
      });
    }
  });
}
