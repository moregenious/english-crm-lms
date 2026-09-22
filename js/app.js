/**
 * Main Application Orchestrator - Step into the Future
 * Includes Groups, Schedule, Scoring, Phone SMS Auth, and Lesson Plans & Materials
 */

import { store } from './store.js';
import { auth } from './auth.js';
import { modal } from './components/modal.js';
import { toast } from './components/toast.js';
import { onCloudStatusChange } from './firebase.js';

// Views
import { AuthView } from './views/authView.js';
import { AdminDashboard } from './views/adminDashboard.js';
import { GroupsView } from './views/groupsView.js';
import { StudentsView } from './views/studentsView.js';
import { TeachersView } from './views/teachersView.js';
import { ScheduleView } from './views/scheduleView.js';
import { ScoringView } from './views/scoringView.js';
import { LessonPlansView } from './views/lessonPlansView.js';
import { TeacherCabinet } from './views/teacherCabinet.js';
import { StudentCabinet } from './views/studentCabinet.js';
import { VocabularyView } from './views/vocabularyView.js';
import { PaymentsView } from './views/paymentsView.js';
import { GamesView } from './views/gamesView.js';
import { ShopView } from './views/shopView.js';

class App {
  constructor() {
    this.currentHash = window.location.hash || '#dashboard';
    this.init();
  }

  init() {
    window.app = this;
    modal.init();

    // Re-render when store changes
    store.subscribe(() => {
      if (auth.isAuthenticated()) {
        this.renderCurrentView();
        this.updateSidebarBadges();
        this.updateMobileBottomBar();
      }
    });

    // Re-render when auth changes
    auth.subscribe(() => {
      this.updateAppLayout();
      this.updateSidebarNavigation();
      this.updateMobileBottomBar();
      this.updateHeaderProfile();
      this.navigateBasedOnRole();
    });

    // Handle hash route change
    window.addEventListener('hashchange', () => {
      this.currentHash = window.location.hash || (auth.isAuthenticated() ? '#dashboard' : '#login');
      this.updateSidebarActiveState();
      this.updateMobileBottomBarActive();
      this.renderCurrentView();
    });

    this.bindHeaderAndSidebarEvents();
    this.updateAppLayout();
    this.updateSidebarNavigation();
    this.updateMobileBottomBar();
    this.updateHeaderProfile();
    this.navigateBasedOnRole();

    // Listen to Firebase cloud synchronization status
    onCloudStatusChange((status) => {
      this.updateCloudSyncBadge(status);
    });
  }

  updateCloudSyncBadge(status) {
    const badge = document.getElementById('cloud-sync-indicator');
    if (!badge) return;

    badge.className = `cloud-sync-badge ${status}`;
    const textEl = badge.querySelector('.cloud-sync-text');
    if (!textEl) return;

    switch (status) {
      case 'connected':
        textEl.textContent = '☁️ Онлайн база';
        badge.title = 'Облачная база Firestore активна. Все устройства (ПК, телефоны) синхронизированы в реальном времени.';
        break;
      case 'saving':
        textEl.textContent = '☁️ Сохранение...';
        badge.title = 'Сохранение изменений в облачную базу данных...';
        break;
      case 'connecting':
        textEl.textContent = '☁️ Подключение...';
        badge.title = 'Подключение к Firebase Firestore...';
        break;
      case 'offline':
      case 'error':
        textEl.textContent = '⚡ Офлайн (кэш)';
        badge.title = 'Работа в локальном режиме. Убедитесь, что Firestore Database активирована в тестовом режиме в консоли Firebase.';
        break;
      default:
        textEl.textContent = '☁️ Онлайн база';
    }
  }

  updateAppLayout() {
    const sidebar = document.querySelector('.app-sidebar');
    const header = document.querySelector('.top-header');
    const bottomBar = document.getElementById('mobile-bottom-bar');
    const isAuth = auth.isAuthenticated();

    if (sidebar) sidebar.style.display = isAuth ? '' : 'none';
    if (header) header.style.display = isAuth ? '' : 'none';
    if (bottomBar) bottomBar.style.display = isAuth ? '' : 'none';
  }

  navigateBasedOnRole() {
    if (!auth.isAuthenticated()) {
      window.location.hash = '#login';
      this.renderCurrentView();
      return;
    }

    const role = auth.getRole();
    if (role === auth.ROLE_STUDENT) {
      window.location.hash = '#student-cabinet';
    } else if (role === auth.ROLE_TEACHER) {
      if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '#dashboard') {
        window.location.hash = '#teacher-cabinet';
      } else {
        this.renderCurrentView();
      }
    } else {
      if (window.location.hash === '#student-cabinet' || window.location.hash === '#login') {
        window.location.hash = '#dashboard';
      } else {
        this.renderCurrentView();
      }
    }
  }

  updateSidebarNavigation() {
    if (!auth.isAuthenticated()) return;

    const role = auth.getRole();
    const navContainer = document.getElementById('sidebar-nav-list');
    if (!navContainer) return;

    let menuHtml = '';

    if (role === auth.ROLE_ADMIN) {
      menuHtml = `
        <div class="nav-section-title">Главное меню</div>
        <a href="#dashboard" class="nav-item ${this.currentHash === '#dashboard' ? 'active' : ''}">
          <span class="nav-item-icon">📊</span>
          <span>Дашборд</span>
        </a>
        <a href="#groups" class="nav-item ${this.currentHash === '#groups' ? 'active' : ''}">
          <span class="nav-item-icon">👥</span>
          <span>Группы</span>
          <span class="nav-item-badge" id="badge-groups-count">${store.getGroups().length}</span>
        </a>
        <a href="#lesson-plans" class="nav-item ${this.currentHash === '#lesson-plans' ? 'active' : ''}">
          <span class="nav-item-icon">📚</span>
          <span>Планы уроков и ДЗ</span>
          <span class="nav-item-badge" id="badge-plans-count">${store.getLessonPlans().length}</span>
        </a>
        <a href="#students" class="nav-item ${this.currentHash === '#students' ? 'active' : ''}">
          <span class="nav-item-icon">🎒</span>
          <span>Ученики</span>
          <span class="nav-item-badge" id="badge-students-count">${store.getStudents().length}</span>
        </a>
        <a href="#teachers" class="nav-item ${this.currentHash === '#teachers' ? 'active' : ''}">
          <span class="nav-item-icon">👨‍🏫</span>
          <span>Преподаватели</span>
          <span class="nav-item-badge" id="badge-teachers-count">${store.getTeachers().length}</span>
        </a>
        <a href="#schedule" class="nav-item ${this.currentHash === '#schedule' ? 'active' : ''}">
          <span class="nav-item-icon">📅</span>
          <span>Расписание</span>
          <span class="nav-item-badge" id="badge-schedule-count">${store.getSchedule().length}</span>
        </a>
        <a href="#vocabulary" class="nav-item ${this.currentHash === '#vocabulary' ? 'active' : ''}">
          <span class="nav-item-icon">📖</span>
          <span>Словарь (Vocabulary)</span>
          <span class="nav-item-badge" id="badge-vocabulary-count">${store.getTotalVocabularyCount()}</span>
        </a>
        <a href="#scoring" class="nav-item ${this.currentHash === '#scoring' ? 'active' : ''}">
          <span class="nav-item-icon">⭐</span>
          <span>Баллы и оценки</span>
        </a>
        <a href="#payments" class="nav-item ${this.currentHash === '#payments' ? 'active' : ''}">
          <span class="nav-item-icon">💳</span>
          <span>Оплата обучения</span>
        </a>
        <a href="#games" class="nav-item ${this.currentHash === '#games' ? 'active' : ''}">
          <span class="nav-item-icon">🎮</span>
          <span>Мини-игры</span>
        </a>
        <a href="#shop" class="nav-item ${this.currentHash === '#shop' ? 'active' : ''}">
          <span class="nav-item-icon">🛍️</span>
          <span>Магазин</span>
        </a>
      `;
    } else if (role === auth.ROLE_TEACHER) {
      menuHtml = `
        <div class="nav-section-title">Кабинет Учителя</div>
        <a href="#teacher-cabinet" class="nav-item ${this.currentHash === '#teacher-cabinet' ? 'active' : ''}">
          <span class="nav-item-icon">👨‍🏫</span>
          <span>Мой кабинет</span>
        </a>
        <a href="#lesson-plans" class="nav-item ${this.currentHash === '#lesson-plans' ? 'active' : ''}">
          <span class="nav-item-icon">📚</span>
          <span>Планы уроков и ДЗ</span>
          <span class="nav-item-badge" id="badge-plans-count">${store.getLessonPlans().length}</span>
        </a>
        <a href="#groups" class="nav-item ${this.currentHash === '#groups' ? 'active' : ''}">
          <span class="nav-item-icon">👥</span>
          <span>Мои группы</span>
        </a>
        <a href="#schedule" class="nav-item ${this.currentHash === '#schedule' ? 'active' : ''}">
          <span class="nav-item-icon">📅</span>
          <span>Мое расписание</span>
        </a>
        <a href="#students" class="nav-item ${this.currentHash === '#students' ? 'active' : ''}">
          <span class="nav-item-icon">🎒</span>
          <span>Список учеников</span>
        </a>
        <a href="#vocabulary" class="nav-item ${this.currentHash === '#vocabulary' ? 'active' : ''}">
          <span class="nav-item-icon">📖</span>
          <span>Словарь (Vocabulary)</span>
          <span class="nav-item-badge" id="badge-vocabulary-count">${store.getTotalVocabularyCount()}</span>
        </a>
        <a href="#payments" class="nav-item ${this.currentHash === '#payments' ? 'active' : ''}">
          <span class="nav-item-icon">💳</span>
          <span>Оплата обучения</span>
        </a>
        <a href="#scoring" class="nav-item ${this.currentHash === '#scoring' ? 'active' : ''}">
          <span class="nav-item-icon">⭐</span>
          <span>Оценить ученика</span>
        </a>
        <a href="#games" class="nav-item ${this.currentHash === '#games' ? 'active' : ''}">
          <span class="nav-item-icon">🎮</span>
          <span>Мини-игры</span>
        </a>
        <a href="#shop" class="nav-item ${this.currentHash === '#shop' ? 'active' : ''}">
          <span class="nav-item-icon">🛍️</span>
          <span>Магазин</span>
        </a>
      `;
    } else if (role === auth.ROLE_STUDENT) {
      const studentId = auth.currentStudentId || auth.getCurrentUser()?.id;
      const studentVocabCount = store.getTotalVocabularyCountForStudent(studentId);
      menuHtml = `
        <div class="nav-section-title">Кабинет Ученика</div>
        <a href="#student-cabinet" class="nav-item ${this.currentHash === '#student-cabinet' ? 'active' : ''}">
          <span class="nav-item-icon">🎓</span>
          <span>ДЗ и Прогресс</span>
        </a>
        <a href="#vocabulary" class="nav-item ${this.currentHash === '#vocabulary' ? 'active' : ''}">
          <span class="nav-item-icon">📖</span>
          <span>Словарь (Vocabulary)</span>
          <span class="nav-item-badge" id="badge-student-vocab-count">${studentVocabCount}</span>
        </a>
        <a href="#games" class="nav-item ${this.currentHash === '#games' ? 'active' : ''}">
          <span class="nav-item-icon">🎮</span>
          <span>Мини-игры</span>
        </a>
        <a href="#shop" class="nav-item ${this.currentHash === '#shop' ? 'active' : ''}">
          <span class="nav-item-icon">🛍️</span>
          <span>Магазин бонусов</span>
        </a>
      `;
    }

    // Common exit item at the bottom of navigation
    menuHtml += `
      <div style="margin-top:auto; padding-top:var(--space-3); border-top:1px solid rgba(255,255,255,0.08);">
        <a href="javascript:void(0)" class="nav-item btn-app-logout" style="color:#f87171;" title="Выйти на главный экран входа">
          <span class="nav-item-icon">🚪</span>
          <span style="font-weight:600;">Выход на главный экран</span>
        </a>
      </div>
    `;

    navContainer.innerHTML = menuHtml;
    this.updateSidebarActiveState();
  }

  updateMobileBottomBar() {
    if (!auth.isAuthenticated()) return;

    const role = auth.getRole();
    const bottomContainer = document.getElementById('mobile-bottom-bar');
    if (!bottomContainer) return;

    let barHtml = '';

    if (role === auth.ROLE_ADMIN) {
      barHtml = `
        <a href="#dashboard" class="mobile-bottom-item ${this.currentHash === '#dashboard' ? 'active' : ''}">
          <span class="bottom-icon">📊</span>
          <span>Дашборд</span>
        </a>
        <a href="#lesson-plans" class="mobile-bottom-item ${this.currentHash === '#lesson-plans' ? 'active' : ''}">
          <span class="bottom-icon">📚</span>
          <span>Уроки/ДЗ</span>
        </a>
        <a href="#groups" class="mobile-bottom-item ${this.currentHash === '#groups' ? 'active' : ''}">
          <span class="bottom-icon">👥</span>
          <span>Группы</span>
        </a>
        <a href="#students" class="mobile-bottom-item ${this.currentHash === '#students' ? 'active' : ''}">
          <span class="bottom-icon">🎒</span>
          <span>Ученики</span>
        </a>
        <button type="button" class="mobile-bottom-item" id="btn-mobile-more" title="Все разделы">
          <span class="bottom-icon">☰</span>
          <span>Меню</span>
        </button>
      `;
    } else if (role === auth.ROLE_TEACHER) {
      barHtml = `
        <a href="#teacher-cabinet" class="mobile-bottom-item ${this.currentHash === '#teacher-cabinet' ? 'active' : ''}">
          <span class="bottom-icon">👨‍🏫</span>
          <span>Кабинет</span>
        </a>
        <a href="#lesson-plans" class="mobile-bottom-item ${this.currentHash === '#lesson-plans' ? 'active' : ''}">
          <span class="bottom-icon">📚</span>
          <span>Уроки/ДЗ</span>
        </a>
        <a href="#schedule" class="mobile-bottom-item ${this.currentHash === '#schedule' ? 'active' : ''}">
          <span class="bottom-icon">📅</span>
          <span>Расписание</span>
        </a>
        <a href="#students" class="mobile-bottom-item ${this.currentHash === '#students' ? 'active' : ''}">
          <span class="bottom-icon">🎒</span>
          <span>Ученики</span>
        </a>
        <button type="button" class="mobile-bottom-item" id="btn-mobile-more" title="Все разделы">
          <span class="bottom-icon">☰</span>
          <span>Меню</span>
        </button>
      `;
    } else if (role === auth.ROLE_STUDENT) {
      barHtml = `
        <a href="#student-cabinet" class="mobile-bottom-item ${this.currentHash === '#student-cabinet' ? 'active' : ''}">
          <span class="bottom-icon">🎓</span>
          <span>Кабинет</span>
        </a>
        <a href="#vocabulary" class="mobile-bottom-item ${this.currentHash === '#vocabulary' ? 'active' : ''}">
          <span class="bottom-icon">📖</span>
          <span>Словарь</span>
        </a>
        <a href="#games" class="mobile-bottom-item ${this.currentHash === '#games' ? 'active' : ''}">
          <span class="bottom-icon">🎮</span>
          <span>Игры</span>
        </a>
        <a href="#shop" class="mobile-bottom-item ${this.currentHash === '#shop' ? 'active' : ''}">
          <span class="bottom-icon">🛍️</span>
          <span>Шоп</span>
        </a>
        <a href="#scoring" class="mobile-bottom-item ${this.currentHash === '#scoring' ? 'active' : ''}">
          <span class="bottom-icon">⭐</span>
          <span>Рейтинг</span>
        </a>
        <button type="button" class="mobile-bottom-item btn-app-logout" style="color:#ef4444;" title="Выйти">
          <span class="bottom-icon">🚪</span>
          <span>Выход</span>
        </button>
      `;
    }

    bottomContainer.innerHTML = barHtml;
    this.updateMobileBottomBarActive();
  }

  updateMobileBottomBarActive() {
    document.querySelectorAll('.mobile-bottom-bar .mobile-bottom-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href && href === this.currentHash) {
        item.classList.add('active');
      } else if (href) {
        item.classList.remove('active');
      }
    });
  }

  updateSidebarActiveState() {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      const href = item.getAttribute('href');
      if (href === this.currentHash) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  updateSidebarBadges() {
    const badgeGroups = document.getElementById('badge-groups-count');
    const badgeStudents = document.getElementById('badge-students-count');
    const badgeTeachers = document.getElementById('badge-teachers-count');
    const badgeSchedule = document.getElementById('badge-schedule-count');
    const badgePlans = document.getElementById('badge-plans-count');
    const badgeVocab = document.getElementById('badge-vocabulary-count');
    const badgeStudentVocab = document.getElementById('badge-student-vocab-count');

    if (badgeGroups) badgeGroups.textContent = store.getGroups().length;
    if (badgeStudents) badgeStudents.textContent = store.getStudents().length;
    if (badgeTeachers) badgeTeachers.textContent = store.getTeachers().length;
    if (badgeSchedule) badgeSchedule.textContent = store.getSchedule().length;
    if (badgePlans) badgePlans.textContent = store.getLessonPlans().length;
    if (badgeVocab) badgeVocab.textContent = store.getTotalVocabularyCount();
    if (badgeStudentVocab) {
      const studentId = auth.currentStudentId || auth.getCurrentUser()?.id;
      badgeStudentVocab.textContent = store.getTotalVocabularyCountForStudent(studentId);
    }
  }

  updateHeaderProfile() {
    if (!auth.isAuthenticated()) return;

    const user = auth.getCurrentUser();
    const role = auth.getRole();

    const nameEl = document.getElementById('header-user-name');
    const roleEl = document.getElementById('header-user-role');
    const avatarEl = document.getElementById('header-user-avatar');
    const sidebarRoleBadge = document.getElementById('sidebar-role-badge');

    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) {
      if (role === 'student' && user.studentTitle) {
        roleEl.textContent = `${user.studentTitle} • ${user.roleLabel}`;
      } else {
        roleEl.textContent = user.roleLabel;
      }
    }
    if (avatarEl) {
      if (role === 'student' && user.avatarUrl) {
        if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://') || user.avatarUrl.startsWith('/') || user.avatarUrl.startsWith('data:image')) {
          avatarEl.innerHTML = `<img src="${user.avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`;
        } else {
          avatarEl.innerHTML = `<span style="font-size:1.15rem;line-height:1;">${user.avatarUrl}</span>`;
        }
      } else {
        avatarEl.textContent = user.initials;
      }
      avatarEl.style.backgroundColor = user.avatarColor || '#4f46e5';
    }

    if (sidebarRoleBadge) {
      sidebarRoleBadge.textContent = role === 'admin' ? 'Администратор' : role === 'teacher' ? 'Учитель' : 'Ученик';
    }


  }

  bindHeaderAndSidebarEvents() {
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');

    const closeSidebar = () => {
      sidebar?.classList.remove('open');
      backdrop?.classList.remove('open');
    };

    const toggleSidebar = () => {
      sidebar?.classList.toggle('open');
      backdrop?.classList.toggle('open');
    };

    toggleBtn?.addEventListener('click', toggleSidebar);
    backdrop?.addEventListener('click', closeSidebar);

    // Bottom bar 'More/Menu' button delegation
    document.addEventListener('click', (e) => {
      const moreBtn = e.target.closest('#btn-mobile-more');
      if (moreBtn) {
        e.preventDefault();
        toggleSidebar();
      }
      // Auto-close sidebar on mobile when navigating
      const navLink = e.target.closest('.sidebar-nav .nav-item');
      if (navLink && window.innerWidth <= 900) {
        closeSidebar();
      }
    });

    // Global Delegated Logout button handler
    document.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('.btn-app-logout');
      if (logoutBtn) {
        e.preventDefault();
        closeSidebar();
        auth.logout();
        toast.info('Вы вышли на главный экран');
        window.location.hash = '#login';
      }
    });


    const globalSearch = document.getElementById('global-search-input');
    globalSearch?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) {
          window.location.hash = '#students';
          setTimeout(() => {
            const input = document.getElementById('input-student-search');
            if (input) {
              input.value = q;
              input.dispatchEvent(new Event('input'));
            }
          }, 50);
        }
      }
    });
  }

  renderCurrentView() {
    const container = document.getElementById('main-view-container');
    if (!container) return;

    if (!auth.isAuthenticated() || this.currentHash === '#login') {
      this.updateAppLayout();
      AuthView.render(container);
      return;
    }

    this.updateAppLayout();
    const role = auth.getRole();
    const hash = this.currentHash;

    // Student routing
    if (role === auth.ROLE_STUDENT) {
      if (hash === '#vocabulary') {
        VocabularyView.render(container);
      } else if (hash === '#games') {
        GamesView.render(container);
      } else if (hash === '#scoring') {
        ScoringView.render(container);
      } else if (hash === '#shop') {
        ShopView.render(container);
      } else {
        StudentCabinet.render(container);
      }
      return;
    }

    // Teacher specific landing
    if (role === auth.ROLE_TEACHER && (hash === '#teacher-cabinet' || hash === '#dashboard')) {
      TeacherCabinet.render(container);
      return;
    }

    // Route dispatching
    switch (hash) {
      case '#dashboard':
        AdminDashboard.render(container);
        break;
      case '#groups':
        GroupsView.render(container);
        break;
      case '#lesson-plans':
        LessonPlansView.render(container);
        break;
      case '#students':
        StudentsView.render(container);
        break;
      case '#teachers':
        TeachersView.render(container);
        break;
      case '#schedule':
        ScheduleView.render(container);
        break;
      case '#vocabulary':
        VocabularyView.render(container);
        break;
      case '#games':
        GamesView.render(container);
        break;
      case '#shop':
        ShopView.render(container);
        break;
      case '#scoring':
        ScoringView.render(container);
        break;
      case '#teacher-cabinet':
        TeacherCabinet.render(container);
        break;
      case '#student-cabinet':
        StudentCabinet.render(container);
        break;
      case '#payments':
        PaymentsView.render(container);
        break;
      default:
        AdminDashboard.render(container);
        break;
    }

    window.scrollTo(0, 0);
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppInstance = new App();
});
