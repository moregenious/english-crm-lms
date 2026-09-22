/**
 * Dedicated Authentication View - Student Phone SMS Verification & Staff Login
 */

import { auth } from '../auth.js';
import { store, formatPhoneForDisplay } from '../store.js';
import { toast } from '../components/toast.js';

export const AuthView = {
  activeTab: 'student', // 'student' | 'staff'
  studentStep: 1, // 1: enter phone, 2: enter sms code
  enteredPhone: '',
  timerInterval: null,
  timerSeconds: 60,

  render(container) {
    container.innerHTML = `
      <div class="auth-page-wrapper">
        <div class="auth-card">
          <!-- Logo & Header -->
          <div class="auth-card-header">
            <div class="brand-logo" style="justify-content:center; margin-bottom:var(--space-2);">
              <div class="brand-icon" style="width:40px; height:40px; font-size:1.25rem;">S</div>
              <span style="font-size:1.35rem; font-weight:800; color:var(--color-text-main);">Step into the future</span>
            </div>
            <h2 class="auth-title">Курсы английского языка</h2>
            <p class="auth-subtitle">Личный кабинет учеников и преподавателей</p>
          </div>

          <!-- Auth Tabs Switcher -->
          <div class="auth-tabs">
            <button type="button" class="auth-tab-btn ${this.activeTab === 'student' ? 'active' : ''}" id="tab-student-btn">
              🎒 Ученикам (по SMS)
            </button>
            <button type="button" class="auth-tab-btn ${this.activeTab === 'staff' ? 'active' : ''}" id="tab-staff-btn">
              👨‍🏫 Преподавателям и Администрации
            </button>
          </div>

          <!-- Tab 1: Student Phone SMS Login | Tab 2: Staff Auth -->
          ${this.activeTab === 'student' ? this.renderStudentAuth() : this.renderStaffAuth()}
        </div>
      </div>
    `;

    this.bindEvents(container);
  },

  renderStudentAuth() {
    if (this.studentStep === 1) {
      return `
        <form id="form-student-phone" class="auth-form">
          <div class="form-group">
            <label class="form-label">Номер телефона ученика <span class="required">*</span></label>
            <div style="position:relative;">
              <input type="tel" id="student-phone-input" name="phone" class="form-control" placeholder="+7 (999) 000-00-00" value="${this.enteredPhone}" required autofocus style="font-size:1.1rem; padding-left:1rem; letter-spacing:0.02em;">
            </div>
          </div>

          <div id="auth-student-error" class="auth-error-alert" style="display:none;"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:var(--space-2);">
            Получить SMS-код для входа
          </button>
        </form>
      `;
    } else {
      return `
        <form id="form-student-verify" class="auth-form">
          <div style="text-align:center; margin-bottom:var(--space-4);">
            <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">Код отправлен на номер:</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--color-text-main); margin-top:2px;">
              ${formatPhoneForDisplay(this.enteredPhone)}
            </div>
            <button type="button" id="btn-change-phone" class="btn btn-ghost btn-sm" style="margin-top:2px; font-size:var(--font-size-xs);">
              ✏️ Изменить номер
            </button>
          </div>

          <div class="form-group" style="text-align:center;">
            <label class="form-label">Введите 4-значный код из SMS <span class="required">*</span></label>
            <input type="text" id="auth-sms-code" name="code" class="form-control" placeholder="• • • •" maxlength="6" required autofocus style="font-size:1.75rem; text-align:center; letter-spacing:0.5em; font-weight:700; max-width:220px; margin:0 auto;">
          </div>

          <div id="auth-verify-error" class="auth-error-alert" style="display:none;"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:var(--space-3);">
            Войти в личный кабинет ➔
          </button>

          <div style="text-align:center; margin-top:var(--space-4); font-size:var(--font-size-xs); color:var(--color-text-muted);">
            <span id="sms-timer-text">Отправить код повторно через <strong id="sms-timer-sec">${this.timerSeconds}</strong> сек.</span>
            <button type="button" id="btn-resend-sms" class="btn btn-ghost btn-sm" style="display:none; margin:4px auto 0;">
              Отправить SMS повторно
            </button>
          </div>
        </form>
      `;
    }
  },

  renderStaffAuth() {
    return `
      <!-- Staff Credentials Form -->
      <form id="form-staff-login" class="auth-form">
        <div class="form-group">
          <label class="form-label">Email, логин или телефон <span class="required">*</span></label>
          <input type="text" id="input-staff-login" name="login" class="form-control" placeholder="например, linikitajulia@gmail.com или moregenious" required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label">Пароль <span class="required">*</span></label>
          <input type="password" id="input-staff-pass" name="password" class="form-control" placeholder="••••••••" required>
        </div>

        <div id="auth-staff-error" class="auth-error-alert" style="display:none; margin-top:var(--space-3);"></div>

        <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:var(--space-3);">
          Войти как сотрудник ➔
        </button>
      </form>
    `;
  },

  bindEvents(container) {
    // Tab switching
    container.querySelector('#tab-student-btn')?.addEventListener('click', () => {
      this.activeTab = 'student';
      this.render(container);
    });

    container.querySelector('#tab-staff-btn')?.addEventListener('click', () => {
      this.activeTab = 'staff';
      this.render(container);
    });

    // Student Step 1: Send SMS
    const formPhone = container.querySelector('#form-student-phone');
    formPhone?.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneInput = formPhone.querySelector('input[name="phone"]').value.trim();
      const errorEl = formPhone.querySelector('#auth-student-error');

      const res = auth.requestStudentSms(phoneInput);
      if (!res.success) {
        if (errorEl) {
          if (res.isTeacherPhone) {
            errorEl.innerHTML = `
              <div>${res.message}</div>
              <button type="button" class="btn btn-sm btn-secondary" id="btn-switch-staff-tab" style="margin-top:8px;">
                Перейти к входу для преподавателей ➔
              </button>
            `;
            errorEl.style.display = 'block';

            errorEl.querySelector('#btn-switch-staff-tab')?.addEventListener('click', () => {
              this.activeTab = 'staff';
              this.render(container);
            });
          } else {
            errorEl.textContent = res.message;
            errorEl.style.display = 'block';
          }
        }
        return;
      }

      this.enteredPhone = phoneInput;
      this.studentStep = 2;
      this.timerSeconds = 60;
      this.startTimer();
      this.render(container);
      toast.success(`SMS-код отправлен на номер ${res.formattedPhone}`);
    });

    // Student Step 2: Verify Code
    const formVerify = container.querySelector('#form-student-verify');
    formVerify?.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeInput = formVerify.querySelector('input[name="code"]').value.trim();
      const errorEl = formVerify.querySelector('#auth-verify-error');

      const res = auth.verifyStudentSms(this.enteredPhone, codeInput);
      if (!res.success) {
        if (errorEl) {
          errorEl.textContent = res.message;
          errorEl.style.display = 'block';
        }
        return;
      }

      this.studentStep = 1;
      if (this.timerInterval) clearInterval(this.timerInterval);
      toast.success(`Успешный вход! Добро пожаловать, ${res.student.fullName}!`);
      window.location.hash = '#student-cabinet';
    });

    // Change phone button
    container.querySelector('#btn-change-phone')?.addEventListener('click', () => {
      this.studentStep = 1;
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.render(container);
    });

    // Resend SMS button
    container.querySelector('#btn-resend-sms')?.addEventListener('click', () => {
      const res = auth.requestStudentSms(this.enteredPhone);
      if (res.success) {
        this.timerSeconds = 60;
        this.startTimer();
        this.render(container);
        toast.info('Новый SMS-код отправлен');
      }
    });


    // Staff form login
    const formStaff = container.querySelector('#form-staff-login');
    formStaff?.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = formStaff.querySelector('input[name="login"]').value.trim();
      const password = formStaff.querySelector('input[name="password"]').value.trim();
      const errorEl = formStaff.querySelector('#auth-staff-error');

      const res = auth.loginStaff(login, password);
      if (!res.success) {
        if (errorEl) {
          errorEl.textContent = res.message;
          errorEl.style.display = 'block';
        }
        return;
      }

      toast.success(res.message);
      if (res.role === auth.ROLE_ADMIN) {
        window.location.hash = '#dashboard';
      } else {
        window.location.hash = '#teacher-cabinet';
      }
    });

  },

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      const secEl = document.getElementById('sms-timer-sec');
      if (secEl) secEl.textContent = this.timerSeconds;

      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        const timerText = document.getElementById('sms-timer-text');
        const resendBtn = document.getElementById('btn-resend-sms');
        if (timerText) timerText.style.display = 'none';
        if (resendBtn) resendBtn.style.display = 'inline-block';
      }
    }, 1000);
  }
};
