/**
 * Auth & Role Management Context for English Practice CRM & LMS
 * Supports:
 * - Students: Phone Number + SMS Verification Code (matched with database cards)
 * - Teachers & Admin: Credentials login (Registration strictly by Admin)
 */

import { store, normalizePhone, formatPhoneForDisplay } from './store.js';

class Auth {
  constructor() {
    this.ROLE_ADMIN = 'admin';
    this.ROLE_TEACHER = 'teacher';
    this.ROLE_STUDENT = 'student';

    this.currentRole = localStorage.getItem('crm_current_role') || null;
    this.currentTeacherId = localStorage.getItem('crm_current_teacher_id') || 'tch-1';
    this.currentStudentId = localStorage.getItem('crm_current_student_id') || 'stu-1';
    this.isLoggedIn = localStorage.getItem('crm_is_logged_in') === 'true';

    // Pending SMS verification storage
    this.pendingSms = null; // { phone, code, studentId, expiresAt }
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener({
          isLoggedIn: this.isLoggedIn,
          role: this.currentRole,
          user: this.getCurrentUser()
        });
      } catch (e) {
        console.error('Error in auth listener:', e);
      }
    }
  }

  isAuthenticated() {
    return this.isLoggedIn && !!this.currentRole;
  }

  // --- Student Phone SMS Authentication ---
  requestStudentSms(phoneInput) {
    const norm = normalizePhone(phoneInput);
    if (!norm || norm.length < 10) {
      return {
        success: false,
        message: 'Пожалуйста, введите корректный номер телефона (например, +7 999 111-22-33).'
      };
    }

    const student = store.findStudentByPhone(norm);
    if (!student) {
      const teacher = store.findTeacherByPhone(norm);
      if (teacher) {
        return {
          success: false,
          isTeacherPhone: true,
          teacherId: teacher.id,
          teacherName: teacher.fullName,
          message: `Номер ${formatPhoneForDisplay(phoneInput)} принадлежит преподавателю (${teacher.fullName}). Пожалуйста, переключитесь на вкладку «👨‍🏫 Сотрудникам» или нажмите «Войти как преподаватель».`
        };
      }

      return {
        success: false,
        message: `Номер ${formatPhoneForDisplay(phoneInput)} не найден в базе школы. Пожалуйста, обратитесь к вашему преподавателю или администратору, чтобы вас добавили в список учеников.`
      };
    }

    // Generate 4-digit code
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    this.pendingSms = {
      phone: norm,
      code,
      studentId: student.id,
      expiresAt
    };

    // Trigger visual simulated SMS notification
    this.showSimulatedSmsBanner(student, code);

    return {
      success: true,
      code, // returned for simulator display
      studentName: student.fullName,
      formattedPhone: formatPhoneForDisplay(norm),
      message: `Код подтверждения отправлен на номер ${formatPhoneForDisplay(norm)}`
    };
  }

  verifyStudentSms(phoneInput, inputCode) {
    const norm = normalizePhone(phoneInput);
    if (!this.pendingSms || this.pendingSms.phone !== norm) {
      return {
        success: false,
        message: 'Запрос на SMS не найден или устарел. Запросите код заново.'
      };
    }

    if (Date.now() > this.pendingSms.expiresAt) {
      this.pendingSms = null;
      return {
        success: false,
        message: 'Срок действия кода истек. Запросите новый SMS-код.'
      };
    }

    if (String(this.pendingSms.code).trim() !== String(inputCode).trim()) {
      return {
        success: false,
        message: 'Неверный SMS-код. Пожалуйста, проверьте и повторите попытку.'
      };
    }

    // Login student
    const student = store.getStudentById(this.pendingSms.studentId);
    this.pendingSms = null;

    if (!student) {
      return { success: false, message: 'Ученик не найден в системе.' };
    }

    this.currentRole = this.ROLE_STUDENT;
    this.currentStudentId = student.id;
    this.isLoggedIn = true;

    localStorage.setItem('crm_current_role', this.ROLE_STUDENT);
    localStorage.setItem('crm_current_student_id', student.id);
    localStorage.setItem('crm_is_logged_in', 'true');

    this.notify();

    return {
      success: true,
      student,
      message: `Добро пожаловать, ${student.fullName}!`
    };
  }

  // --- Staff Authentication (Admin & Teachers) ---
  loginStaff(loginOrPhone, password) {
    // 1. Check if Admin
    if (store.verifyAdmin(loginOrPhone, password)) {
      this.currentRole = this.ROLE_ADMIN;
      this.isLoggedIn = true;
      localStorage.setItem('crm_current_role', this.ROLE_ADMIN);
      localStorage.setItem('crm_is_logged_in', 'true');
      this.notify();
      return {
        success: true,
        role: this.ROLE_ADMIN,
        message: 'Вход в панель Администратора выполнен успешно'
      };
    }

    // 2. Check if Teacher
    const teacher = store.findTeacherByCredentials(loginOrPhone, password);
    if (teacher) {
      this.currentRole = this.ROLE_TEACHER;
      this.currentTeacherId = teacher.id;
      this.isLoggedIn = true;
      localStorage.setItem('crm_current_role', this.ROLE_TEACHER);
      localStorage.setItem('crm_current_teacher_id', teacher.id);
      localStorage.setItem('crm_is_logged_in', 'true');
      this.notify();
      return {
        success: true,
        role: this.ROLE_TEACHER,
        teacher,
        message: `Добро пожаловать, ${teacher.fullName}!`
      };
    }

    return {
      success: false,
      message: 'Неверный логин, телефон или пароль сотрудника. Регистрация преподавателей осуществляется только Администратором.'
    };
  }

  // --- Quick Switch / Demo Helper ---
  setRole(role, specificId = null) {
    this.currentRole = role;
    this.isLoggedIn = true;
    localStorage.setItem('crm_is_logged_in', 'true');
    localStorage.setItem('crm_current_role', role);

    if (role === this.ROLE_TEACHER && specificId) {
      this.currentTeacherId = specificId;
      localStorage.setItem('crm_current_teacher_id', specificId);
    } else if (role === this.ROLE_STUDENT && specificId) {
      this.currentStudentId = specificId;
      localStorage.setItem('crm_current_student_id', specificId);
    }

    this.notify();
  }

  logout() {
    this.isLoggedIn = false;
    this.currentRole = null;
    this.pendingSms = null;
    localStorage.removeItem('crm_is_logged_in');
    localStorage.removeItem('crm_current_role');
    this.notify();
  }

  getRole() {
    return this.currentRole;
  }

  isAdmin() {
    return this.isLoggedIn && this.currentRole === this.ROLE_ADMIN;
  }

  isTeacher() {
    return this.isLoggedIn && this.currentRole === this.ROLE_TEACHER;
  }

  isStudent() {
    return this.isLoggedIn && this.currentRole === this.ROLE_STUDENT;
  }

  getCurrentUser() {
    if (!this.isLoggedIn) {
      return {
        id: null,
        name: 'Гость',
        roleLabel: 'Не авторизован',
        avatarColor: '#64748b',
        initials: '?'
      };
    }

    if (this.currentRole === this.ROLE_ADMIN) {
      return {
        id: 'admin',
        name: 'Администратор (Юлия)',
        email: 'linikitajulia@gmail.com',
        roleLabel: 'Главный администратор',
        avatarColor: '#4f46e5',
        initials: 'ЮЛ'
      };
    } else if (this.currentRole === this.ROLE_TEACHER) {
      const teacher = store.getTeacherById(this.currentTeacherId) || store.getTeachers()[0];
      if (teacher) {
        return {
          id: teacher.id,
          name: teacher.fullName,
          roleLabel: 'Преподаватель',
          avatarColor: teacher.avatarColor || '#0d9488',
          initials: teacher.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
        };
      }
    } else if (this.currentRole === this.ROLE_STUDENT) {
      const student = store.getStudentById(this.currentStudentId) || store.getStudents()[0];
      if (student) {
        return {
          id: student.id,
          name: student.fullName,
          roleLabel: 'Ученик (' + student.level + ')',
          avatarColor: '#6366f1',
          initials: student.fullName.split(' ').map(n => n[0]).slice(0, 2).join(''),
          avatarUrl: student.avatarUrl || null,
          avatarFrame: student.avatarFrame || 'frame-none',
          studentTitle: student.studentTitle || ''
        };
      }
    }
    return {
      id: 'guest',
      name: 'Гость',
      roleLabel: 'Гость',
      avatarColor: '#64748b',
      initials: 'Г'
    };
  }

  showSimulatedSmsBanner(student, code) {
    let container = document.getElementById('sms-simulator-banner');
    if (container) container.remove();

    container = document.createElement('div');
    container.id = 'sms-simulator-banner';
    container.className = 'sms-push-banner';
    container.innerHTML = `
      <div class="sms-push-header">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:1.1rem;">💬</span>
          <strong>Сообщения • Step into the future</strong>
        </div>
        <span style="font-size:0.75rem; color:#94a3b8;">сейчас</span>
      </div>
      <div class="sms-push-body">
        Для входа в личный кабинет <strong>${student.fullName}</strong> ваш код подтверждения: <span class="sms-code-highlight">${code}</span>
      </div>
      <div style="font-size:0.7rem; color:#94a3b8; margin-top:4px;">
        (Нажмите на уведомление, чтобы автоматически вставить код)
      </div>
    `;

    document.body.appendChild(container);

    // Auto-fill code on click of banner
    container.addEventListener('click', () => {
      const input = document.getElementById('auth-sms-code');
      if (input) {
        input.value = code;
        input.focus();
        input.dispatchEvent(new Event('input'));
      }
      container.remove();
    });

    setTimeout(() => {
      if (container && container.parentNode) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)';
        setTimeout(() => container.remove(), 300);
      }
    }, 12000);
  }
}

export const auth = new Auth();
