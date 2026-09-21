/**
 * Payments Management View - Monthly Tuition Fees, 1-Click Status Toggles, Multi-Select Bulk Actions & Statistics
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { toast } from '../components/toast.js';
import { renderStudentAvatarHtml } from '../components/avatarCustomization.js';

export const PaymentsView = {
  selectedMonthKey: null,
  filterGroup: 'all',
  searchQuery: '',
  selectedStudentIds: new Set(),

  init() {
    if (!this.selectedMonthKey) {
      this.selectedMonthKey = store.getCurrentAcademicMonth().key;
    }
  },

  getFilteredStudents() {
    let students = store.getStudents();
    if (this.filterGroup !== 'all') {
      students = students.filter(s => s.groupId === this.filterGroup);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      students = students.filter(s => 
        s.fullName.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.school && s.school.toLowerCase().includes(q))
      );
    }
    return students;
  },

  renderRowsHtml(students, currentMonth) {
    if (students.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align:center; padding: var(--space-8); color: var(--color-text-muted);">
            Ученики по заданным фильтрам не найдены.
          </td>
        </tr>
      `;
    }

    return students.map(s => {
      const group = store.getGroupById(s.groupId);
      const payment = store.getPayment(s.id, this.selectedMonthKey);
      const isPaid = payment.status === 'paid';
      const isSelected = this.selectedStudentIds.has(s.id);

      return `
        <tr class="${isSelected ? 'selected-row' : ''}" style="${isPaid ? '' : 'background: rgba(254, 242, 242, 0.4);'}">
          <td style="text-align: center;">
            <input type="checkbox" class="payment-student-cb" data-student-id="${s.id}" ${isSelected ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;" />
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              ${renderStudentAvatarHtml(s, { size: 'sm' })}
              <div>
                <div style="font-weight: 700; color: var(--color-text-main); font-size: var(--font-size-sm);">
                  ${s.fullName}
                </div>
                ${s.studentTitle ? `<div style="margin-top:2px;"><span class="student-title-badge light" style="font-size:0.65rem; padding: 1px 8px;">${s.studentTitle}</span></div>` : ''}
                <div class="text-xs text-muted">${s.grade} • ${s.school}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: var(--font-size-xs); color: var(--color-primary);">
              👥 ${group ? group.name : 'Индивидуально'}
            </div>
            <div class="text-xs text-muted" style="margin-top:2px;">
              📚 ${s.textbook || group?.textbook || '—'}
            </div>
          </td>
          <td>
            <div style="font-size: var(--font-size-xs); font-weight: 600;">
              ${s.phone ? `<a href="tel:${s.phone}" style="color:inherit; text-decoration:none;">📞 ${s.phone}</a>` : '—'}
            </div>
            <div class="text-xs text-muted" style="margin-top:2px;">
              ${s.parentName || 'Родитель не указан'}
            </div>
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-sm btn-toggle-payment ${isPaid ? 'is-paid' : 'is-unpaid'}" data-student-id="${s.id}" style="padding: 6px 14px; font-weight: 700; border-radius: var(--radius-full); cursor: pointer; transition: all 0.2s ease; border: 1.5px solid ${isPaid ? '#16a34a' : '#ef4444'}; background: ${isPaid ? '#dcfce7' : '#fee2e2'}; color: ${isPaid ? '#15803d' : '#b91c1c'};" title="Нажмите, чтобы переключить статус оплаты">
              ${isPaid ? '✓ Оплачено' : '⏳ Не оплачено'}
            </button>
          </td>
          <td>
            <div style="font-size: var(--font-size-xs); color: var(--color-text-main); font-weight: 600;">
              ${isPaid && payment.paidAt ? `Отметка: ${new Date(payment.paidAt).toLocaleDateString('ru-RU')}` : '<span style="color:#ef4444;">Предупреждение в профиле включено</span>'}
            </div>
            <div class="text-xs text-muted" style="margin-top:2px;">
              ${payment.notes || (isPaid ? 'Оплата зафиксирована' : 'Ожидание поступления')}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  render(container) {
    const activeEl = document.activeElement;
    const activeId = (activeEl && container.contains(activeEl)) ? activeEl.id : null;
    const activeStart = activeEl?.selectionStart;
    const activeEnd = activeEl?.selectionEnd;

    this.init();
    const months = store.getAcademicMonthsList();
    const currentMonth = months.find(m => m.key === this.selectedMonthKey) || months[0];
    const groups = store.getGroups();

    const students = this.getFilteredStudents();
    const summary = store.getMonthPaymentsSummary(this.selectedMonthKey, this.filterGroup);

    container.innerHTML = `
      <div class="section-header">
        <div class="section-title-wrap">
          <h1>💳 Оплата обучения</h1>
          <p>Контроль ежемесячной оплаты занятий, статусы платежей учащихся и автоматические напоминания</p>
        </div>
      </div>

      <!-- Overview Stats Cards -->
      <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: var(--space-6);">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e0e7ff; color:#4338ca;">👥</div>
          <div>
            <div class="stat-value" id="stat-total-students">${summary.total}</div>
            <div class="stat-label">Всего учеников в выборке</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#dcfce7; color:#16a34a;">✓</div>
          <div>
            <div class="stat-value" id="stat-paid-count" style="color:#16a34a;">${summary.paidCount} (${summary.percent}%)</div>
            <div class="stat-label" id="stat-paid-label">Оплачено за ${currentMonth.shortName}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background:#fee2e2; color:#dc2626;">⏳</div>
          <div>
            <div class="stat-value" id="stat-unpaid-count" style="color:#dc2626;">${summary.unpaidCount}</div>
            <div class="stat-label">Ожидают оплаты (долг)</div>
          </div>
        </div>
      </div>

      <!-- Filters & Actions Bar -->
      <div class="filter-bar" style="margin-bottom: var(--space-4); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center;">
        <div class="filter-item">
          <label class="form-label" style="margin:0; font-size:var(--font-size-xs); font-weight:700;">📅 Месяц:</label>
          <select id="select-payment-month" class="form-control" style="font-weight:600; min-width: 170px;">
            ${months.map(m => `
              <option value="${m.key}" ${m.key === this.selectedMonthKey ? 'selected' : ''}>
                ${m.name}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label" style="margin:0; font-size:var(--font-size-xs); font-weight:700;">👥 Группа:</label>
          <select id="select-payment-group" class="form-control" style="min-width: 170px;">
            <option value="all" ${this.filterGroup === 'all' ? 'selected' : ''}>Все группы</option>
            ${groups.map(g => `<option value="${g.id}" ${this.filterGroup === g.id ? 'selected' : ''}>${g.name} (${g.level})</option>`).join('')}
          </select>
        </div>

        <div class="filter-item">
          <input type="search" id="input-payment-search" class="form-control" placeholder="Поиск по имени ученика..." value="${this.searchQuery}" style="width: 220px;" autocomplete="off">
        </div>

        <!-- Bulk Action Controls -->
        <div style="margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: 600;" id="bulk-counter-label">
            Выбрано: ${this.selectedStudentIds.size}
          </span>
          <button type="button" class="btn btn-sm btn-primary" id="btn-bulk-mark-paid" style="background:#16a34a; border-color:#16a34a; font-size:0.78rem; padding:6px 12px;" ${this.selectedStudentIds.size === 0 ? 'disabled' : ''}>
            ✓ Отметить: Оплачено
          </button>
          <button type="button" class="btn btn-sm btn-secondary" id="btn-bulk-mark-unpaid" style="font-size:0.78rem; padding:6px 12px;" ${this.selectedStudentIds.size === 0 ? 'disabled' : ''}>
            ✕ Снять оплату
          </button>
        </div>
      </div>

      <!-- Table of Students & Payment Statuses -->
      <div class="card" style="padding: 0; overflow: hidden; box-shadow: var(--shadow-sm);">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">
                  <input type="checkbox" id="checkbox-select-all-payments" ${students.length > 0 && students.every(s => this.selectedStudentIds.has(s.id)) ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;" />
                </th>
                <th>Ученик</th>
                <th>Группа / Учебник</th>
                <th>Контакты</th>
                <th style="text-align: center;">Статус оплаты за ${currentMonth.shortName}</th>
                <th>Дата / Заметка</th>
              </tr>
            </thead>
            <tbody id="payments-table-body">
              ${this.renderRowsHtml(students, currentMonth)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);

    if (activeId) {
      const el = container.querySelector('#' + activeId);
      if (el && typeof el.focus === 'function') {
        el.focus();
        if (typeof activeStart === 'number' && typeof activeEnd === 'number') {
          try {
            el.setSelectionRange(activeStart, activeEnd);
          } catch (_) {}
        }
      }
    }
  },

  updateTableOnly(container) {
    const months = store.getAcademicMonthsList();
    const currentMonth = months.find(m => m.key === this.selectedMonthKey) || months[0];
    const students = this.getFilteredStudents();

    const tbody = container.querySelector('#payments-table-body');
    if (tbody) {
      tbody.innerHTML = this.renderRowsHtml(students, currentMonth);
    }

    // Update stats counters
    const summary = store.getMonthPaymentsSummary(this.selectedMonthKey, this.filterGroup);
    const elTotal = container.querySelector('#stat-total-students');
    const elPaid = container.querySelector('#stat-paid-count');
    const elUnpaid = container.querySelector('#stat-unpaid-count');
    if (elTotal) elTotal.textContent = summary.total;
    if (elPaid) elPaid.textContent = `${summary.paidCount} (${summary.percent}%)`;
    if (elUnpaid) elUnpaid.textContent = summary.unpaidCount;

    // Update select-all checkbox
    const chkAll = container.querySelector('#checkbox-select-all-payments');
    if (chkAll) {
      chkAll.checked = students.length > 0 && students.every(s => this.selectedStudentIds.has(s.id));
    }

    this.updateBulkToolbar(container);
    this.bindRowEvents(container);
  },

  bindEvents(container) {
    // Search query: update ONLY the table body to keep input focus and keyboard stable
    const searchInput = container.querySelector('#input-payment-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.updateTableOnly(container);
      });
    }

    // Month filter
    container.querySelector('#select-payment-month')?.addEventListener('change', (e) => {
      this.selectedMonthKey = e.target.value;
      this.selectedStudentIds.clear();
      this.render(container);
    });

    // Group filter
    container.querySelector('#select-payment-group')?.addEventListener('change', (e) => {
      this.filterGroup = e.target.value;
      this.selectedStudentIds.clear();
      this.render(container);
    });

    // Select all checkbox
    container.querySelector('#checkbox-select-all-payments')?.addEventListener('change', (e) => {
      const students = this.getFilteredStudents();
      if (e.target.checked) {
        students.forEach(s => this.selectedStudentIds.add(s.id));
      } else {
        this.selectedStudentIds.clear();
      }
      this.updateTableOnly(container);
    });

    // Bulk Mark Paid
    container.querySelector('#btn-bulk-mark-paid')?.addEventListener('click', () => {
      if (this.selectedStudentIds.size === 0) return;
      const ids = Array.from(this.selectedStudentIds);
      store.bulkSetPaymentStatus(ids, this.selectedMonthKey, 'paid');
      toast.success(`Оплата отмечена для ${ids.length} учеников! 💳`);
      this.selectedStudentIds.clear();
      this.updateTableOnly(container);
    });

    // Bulk Mark Unpaid
    container.querySelector('#btn-bulk-mark-unpaid')?.addEventListener('click', () => {
      if (this.selectedStudentIds.size === 0) return;
      const ids = Array.from(this.selectedStudentIds);
      store.bulkSetPaymentStatus(ids, this.selectedMonthKey, 'unpaid');
      toast.info(`Статус "Не оплачено" установлен для ${ids.length} учеников.`);
      this.selectedStudentIds.clear();
      this.updateTableOnly(container);
    });

    this.bindRowEvents(container);
  },

  bindRowEvents(container) {
    // 1-Click Toggle Payment Status
    container.querySelectorAll('.btn-toggle-payment').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = e.currentTarget.getAttribute('data-student-id');
        if (!studentId) return;

        const current = store.getPayment(studentId, this.selectedMonthKey);
        const newStatus = current.status === 'paid' ? 'unpaid' : 'paid';
        store.setPaymentStatus(studentId, this.selectedMonthKey, newStatus);

        const st = store.getStudentById(studentId);
        if (newStatus === 'paid') {
          toast.success(`Оплата зафиксирована: ${st?.fullName || 'Ученик'}`);
        } else {
          toast.info(`Статус изменен на "Не оплачено": ${st?.fullName || 'Ученик'}`);
        }

        this.updateTableOnly(container);
      });
    });

    // Individual checkbox selection
    container.querySelectorAll('.payment-student-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const sid = e.target.getAttribute('data-student-id');
        if (e.target.checked) {
          this.selectedStudentIds.add(sid);
        } else {
          this.selectedStudentIds.delete(sid);
        }
        const tr = cb.closest('tr');
        if (tr) {
          tr.classList.toggle('selected-row', e.target.checked);
        }
        const students = this.getFilteredStudents();
        const chkAll = container.querySelector('#checkbox-select-all-payments');
        if (chkAll) {
          chkAll.checked = students.length > 0 && students.every(s => this.selectedStudentIds.has(s.id));
        }
        this.updateBulkToolbar(container);
      });
    });
  },

  updateBulkToolbar(container) {
    const count = this.selectedStudentIds.size;
    const label = container.querySelector('#bulk-counter-label');
    const btnPaid = container.querySelector('#btn-bulk-mark-paid');
    const btnUnpaid = container.querySelector('#btn-bulk-mark-unpaid');
    if (label) label.textContent = `Выбрано: ${count}`;
    if (btnPaid) btnPaid.disabled = count === 0;
    if (btnUnpaid) btnUnpaid.disabled = count === 0;
  }
};
