/**
 * Central State Store & Persistence Layer for Step into the Future
 * Supports Windows Explorer Hierarchy: Textbook -> 10 Months (1..10) -> 8 Lessons (1..8) -> Files & Homework
 */

import { INITIAL_DATA, MONTH_NAMES } from './data/seedData.js';

const STORAGE_KEY = 'step_into_future_crm_v6';

export function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && (digits.startsWith('8') || digits.startsWith('7'))) {
    return '+7' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '+7' + digits;
  }
  return '+' + digits;
}

export function formatPhoneForDisplay(rawPhone) {
  const norm = normalizePhone(rawPhone);
  if (norm.length === 12 && norm.startsWith('+7')) {
    const d = norm.slice(2);
    return `+7 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8, 10)}`;
  }
  return rawPhone || '';
}

class Store {
  constructor() {
    this.listeners = [];
    this._serverSynced = false;
    this._isSaving = false;
    this._saveTimeout = null;
    this._lastLocalSave = 0;

    // Load local storage as initial display state only
    this.state = this.loadState();
    this.ensureVocabularyPoolSynced();

    // Immediately fetch the true authoritative server state
    this.syncWithServer(false, true);
    this.initAutoSync();
  }

  loadState() {
    let result = null;
    try {
      // Clear legacy storage keys so old test data (3 teachers, old groups) is removed from browser
      ['step_into_future_crm_v1', 'step_into_future_crm_v2', 'step_into_future_crm_v3', 'step_into_future_crm_v4', 'step_into_future_crm_v5'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed.groups && parsed.students && parsed.teachers) {
          // If cached data has more than 1 teacher, it is from the old pre-release test database - discard it!
          if (parsed.teachers.length > 1) {
            console.info('Discarding legacy multi-teacher database cache');
            result = null;
          } else {
            result = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, using initial seed data', e);
    }
    if (!result) {
      result = JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    if (!Array.isArray(result.teachers) || result.teachers.length === 0) {
      result.teachers = JSON.parse(JSON.stringify(INITIAL_DATA.teachers));
    }

    if (!Array.isArray(result.deletedTextbooks)) {
      result.deletedTextbooks = [];
    }

    result.admin = INITIAL_DATA.admin;
    if (!result.schedule) {
      result.schedule = INITIAL_DATA.schedule || [];
    }
    if (!result.payments || typeof result.payments !== 'object') {
      result.payments = {};
    }

    this.normalizeFilesTarget(result);
    this.normalizeShopAndStudentBalances(result);
    this.ensureVocabularyPoolSynced(result);
    return result;
  }

  async syncWithServer(silent = false, force = false) {
    // If local state was recently saved or a save is in progress, do not let stale server GET overwrite it,
    // UNLESS force is true (e.g. initial startup, visibilitychange or window focus)
    if (!force && (this._saveTimeout || this._isSaving || (this._lastLocalSave && Date.now() - this._lastLocalSave < 1200))) {
      return;
    }

    try {
      const res = await fetch('/api/state?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        // Live server backend (e.g. localhost server.py or Render.com)
        const serverData = await res.json();
        if (serverData && typeof serverData === 'object' && serverData.groups && serverData.teachers) {
          if (!Array.isArray(serverData.teachers) || serverData.teachers.length === 0) {
            serverData.teachers = JSON.parse(JSON.stringify(INITIAL_DATA.teachers));
          }
          if (!Array.isArray(serverData.deletedTextbooks)) {
            serverData.deletedTextbooks = [];
          }

          // Merge purchases status: if a purchase was cancelled locally, preserve it!
          if (Array.isArray(this.state?.purchases) && Array.isArray(serverData?.purchases)) {
            const localPurchasesMap = new Map(this.state.purchases.map(p => [p.id, p]));
            serverData.purchases.forEach(sp => {
              const lp = localPurchasesMap.get(sp.id);
              if (lp && lp.status === 'cancelled' && sp.status !== 'cancelled') {
                sp.status = 'cancelled';
                sp.cancelledAt = lp.cancelledAt;
                sp.cancelledBy = lp.cancelledBy;
              }
            });
          }

          this.normalizeFilesTarget(serverData);
          this.normalizeShopAndStudentBalances(serverData);
          this.ensureVocabularyPoolSynced(serverData);

          const currentStr = JSON.stringify(this.state);
          const newStr = JSON.stringify(serverData);

          this.state = serverData;
          this._serverSynced = true;

          if (currentStr !== newStr || force) {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) {}
            this.notify();
          }
        } else if (!this._serverSynced && this.state && this.state.textbookLessons && Object.keys(this.state.textbookLessons).length > 0) {
          // Server db.json is empty or uninitialized: push current client state to server once
          this._serverSynced = true;
          await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.state)
          });
        }
      } else {
        // Static hosting environment (e.g. Vercel, GitHub Pages) without Python server.py backend.
        // DO NOT continuously poll and overwrite user modifications with static db.json!
        // Only seed from /db.json if localStorage was completely empty.
        const localSaved = localStorage.getItem(STORAGE_KEY);
        if (!localSaved) {
          try {
            const dbRes = await fetch('/db.json?t=' + Date.now(), { cache: 'no-store' });
            if (dbRes.ok) {
              const seedData = await dbRes.json();
              if (seedData && typeof seedData === 'object' && seedData.groups && seedData.teachers) {
                this.normalizeFilesTarget(seedData);
                this.normalizeShopAndStudentBalances(seedData);
                this.ensureVocabularyPoolSynced(seedData);
                this.state = seedData;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                this.notify();
              }
            }
          } catch (e) {}
        }
        this._serverSynced = true;
      }
    } catch (err) {
      if (!silent) console.warn('State sync with server offline/skipped:', err);
      this._serverSynced = true;
    }
  }

  initAutoSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.syncWithServer(true, true));
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.syncWithServer(true, true);
      });
      setInterval(() => {
        if (!document.hidden) {
          this.syncWithServer(true);
        }
      }, 3000);
    }
  }

  normalizeFilesTarget(obj) {
    if (!obj || !obj.textbookLessons) return;
    for (const tb of Object.values(obj.textbookLessons)) {
      if (!tb) continue;
      for (const m of Object.values(tb)) {
        if (!m) continue;
        for (const l of Object.values(m)) {
          if (!l || !Array.isArray(l.files)) continue;
          l.files.forEach(f => {
            if (!f.target) {
              const name = (f.name || '').toLowerCase();
              const isWord = name.endsWith('.docx') || name.endsWith('.doc') || name.endsWith('.docm') || name.endsWith('.dotx') || f.type === 'document';
              f.target = isWord ? 'teacher_admin' : 'student';
            }
          });
        }
      }
    }
  }

  normalizeShopAndStudentBalances(obj) {
    if (!obj) return;
    if (!obj.shopItems || !Array.isArray(obj.shopItems)) {
      obj.shopItems = [
        {
          id: 'item-stickers',
          name: 'Стикерпак «Step into the Future»',
          description: 'Набор виниловых ярких наклеек для ноутбука, тетрадей и телефона',
          price: 120,
          category: 'staff',
          photoUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&auto=format&fit=crop&q=80',
          createdAt: '2026-09-01T10:00:00.000Z'
        },
        {
          id: 'item-notebook',
          name: 'Фирменный блокнот + ручка',
          description: 'Удобный блокнот в твердом переплете с логотипом школы для конспектов и словаря',
          price: 250,
          category: 'staff',
          photoUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
          createdAt: '2026-09-01T10:00:00.000Z'
        },
        {
          id: 'item-mug',
          name: 'Термокружка школы',
          description: 'Металлическая термокружка 450 мл, сохраняет тепло до 8 часов',
          price: 400,
          category: 'staff',
          photoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
          createdAt: '2026-09-01T10:00:00.000Z'
        },
        {
          id: 'item-lesson',
          name: 'Сертификат: Индивидуальный урок',
          description: '1 персональное занятие с преподавателем (разговорная практика или грамматика)',
          price: 600,
          category: 'staff',
          photoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80',
          createdAt: '2026-09-01T10:00:00.000Z'
        },
        {
          id: 'item-hoodie',
          name: 'Фирменная толстовка (Hoodie)',
          description: 'Теплое качественное худи оверсайз с вышивкой Step into the Future',
          price: 800,
          category: 'staff',
          photoUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
          createdAt: '2026-09-01T10:00:00.000Z'
        }
      ];
    }
    if (!obj.purchases || !Array.isArray(obj.purchases)) {
      obj.purchases = [];
    }
    if (Array.isArray(obj.students)) {
      obj.students.forEach(s => {
        if (s.totalPoints === undefined || s.totalPoints === null) {
          s.totalPoints = 0;
        }
        if (s.lifetimePoints === undefined || s.lifetimePoints === null) {
          s.lifetimePoints = Math.max(0, s.totalPoints || 0);
        }
        if (!Array.isArray(s.unlockedAvatars)) {
          s.unlockedAvatars = s.avatarUrl ? [s.avatarUrl] : [];
        }
        if (!Array.isArray(s.unlockedFrames)) {
          s.unlockedFrames = ['frame-none'];
          if (s.avatarFrame && s.avatarFrame !== 'frame-none') {
            s.unlockedFrames.push(s.avatarFrame);
          }
        }
        if (!Array.isArray(s.unlockedTitles)) {
          s.unlockedTitles = s.studentTitle ? [s.studentTitle] : [];
        }
      });
    }
  }

  saveState(immediate = false) {
    if (!this._serverSynced) {
      // Local state has not yet synced with server. Persist locally only, DO NOT overwrite server db.json!
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {}
      this.notify();
      return;
    }

    this._lastLocalSave = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();

    const doSave = async () => {
      this._saveTimeout = null;
      this._isSaving = true;
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.state)
        });
      } catch (e) {
        console.warn('Background server state save error:', e);
      } finally {
        this._isSaving = false;
      }
    };

    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
      this._saveTimeout = null;
    }

    if (immediate) {
      doSave();
    } else {
      this._saveTimeout = setTimeout(doSave, 120);
    }

    this.notify();
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
        listener(this.state);
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    }
  }

  resetToDefaults() {
    this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.normalizeFilesTarget(this.state);
    this.saveState();
  }

  // --- Auth & Lookup Helpers ---
  findStudentByPhone(phoneQuery) {
    const targetNorm = normalizePhone(phoneQuery);
    if (!targetNorm || targetNorm.length < 5) return null;

    return (this.state.students || []).find(s => {
      if (s.status !== 'active') return false;
      const sPhone = normalizePhone(s.phone);
      const sParentPhone = normalizePhone(s.parentPhone);
      return sPhone === targetNorm || sParentPhone === targetNorm;
    }) || null;
  }

  findTeacherByCredentials(loginOrPhone, password) {
    const q = (loginOrPhone || '').trim().toLowerCase();
    const qPhone = normalizePhone(loginOrPhone);

    return (this.state.teachers || []).find(t => {
      if (t.status !== 'active') return false;
      const matchLogin = t.login && t.login.toLowerCase() === q;
      const matchEmail = t.email && t.email.toLowerCase() === q;
      const matchPhone = qPhone && normalizePhone(t.phone) === qPhone;
      const matchName = t.fullName && (
        t.fullName.toLowerCase() === q ||
        t.fullName.toLowerCase().includes(q)
      );

      if ((matchLogin || matchEmail || matchPhone || matchName)) {
        const expectedPass = t.password || '123';
        // If password is empty or matches
        if (!password || String(expectedPass) === String(password).trim()) {
          return true;
        }
      }
      return false;
    }) || null;
  }

  findTeacherByPhone(phoneQuery) {
    const targetNorm = normalizePhone(phoneQuery);
    if (!targetNorm || targetNorm.length < 5) return null;

    return (this.state.teachers || []).find(t => {
      if (t.status !== 'active') return false;
      return normalizePhone(t.phone) === targetNorm;
    }) || null;
  }

  verifyAdmin(login, password) {
    const admin = this.state.admin || INITIAL_DATA.admin;
    const q = (login || '').trim().toLowerCase();
    const pass = String(password || '').trim();
    const isLoginMatch = q === 'linikitajulia@gmail.com' ||
      q === (admin.login || '').toLowerCase() ||
      q === (admin.email || '').toLowerCase() ||
      q === 'admin';
    const isPassMatch = pass === '5074' || pass === String(admin.password || '5074');
    return isLoginMatch && isPassMatch;
  }

  // --- File Upload Service ---
  async uploadFileToServer(file, targetCategory = null) {
    if (!file) return null;

    // 1. Primary: Upload file directly to backend server /api/upload
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (targetCategory) {
        formData.append('target', targetCategory);
      }
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && json.file) {
          if (targetCategory && !json.file.target) {
            json.file.target = targetCategory;
          }
          return json.file;
        }
      }
    } catch (err) {
      console.warn('Backend server /api/upload unreachable, using client-side fallback:', err);
    }

    // 2. Client-side fallback if backend server is not available
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let type = 'document';
        const name = (file.name || '').toLowerCase();
        const isAudio = name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.wma') || name.endsWith('.ogg') || name.endsWith('.oga') || name.endsWith('.m4a') || name.endsWith('.aac') || name.endsWith('.flac') || name.endsWith('.weba') || name.endsWith('.webm') || name.endsWith('.opus') || name.endsWith('.mid') || name.endsWith('.midi') || name.endsWith('.amr') || name.endsWith('.aiff') || name.endsWith('.aif');
        const isImage = name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.gif') || name.endsWith('.svg');
        const isPdf = name.endsWith('.pdf');
        const isDoc = name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.rtf') || name.endsWith('.txt') || name.endsWith('.docm') || name.endsWith('.dotx');

        if (isAudio) {
          type = 'audio';
        } else if (isImage) {
          type = 'image';
        } else if (isPdf) {
          type = 'pdf';
        } else if (isDoc) {
          type = 'document';
        }

        const sizeKb = Math.round((file.size || 0) / 1024);
        const finalTarget = targetCategory || (isDoc ? 'teacher_admin' : 'student');

        resolve({
          id: 'f-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          name: file.name,
          type,
          target: finalTarget,
          url: e.target.result,
          size: `${sizeKb} KB`
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // =========================================================================
  // Windows Explorer Hierarchy: Textbook -> 10 Months -> 8 Lessons -> Files
  // =========================================================================
  
  getTextbooks() {
    const deleted = new Set(this.state?.deletedTextbooks || []);
    const fromSeed = Object.keys(this.state?.textbookLessons || {}).filter(tb => !deleted.has(tb));
    const fromGroups = (this.state?.groups || []).map(g => g.textbook).filter(tb => tb && !deleted.has(tb));
    const fromStudents = (this.state?.students || []).map(s => s.textbook).filter(tb => tb && !deleted.has(tb));
    const combined = [...new Set([...fromSeed, ...fromGroups, ...fromStudents])];
    return combined.sort((a, b) => a.localeCompare(b, 'ru'));
  }

  addTextbook(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return false;
    if (!this.state.textbookLessons) this.state.textbookLessons = {};
    if (!this.state.textbookLessons[trimmed]) {
      this.state.textbookLessons[trimmed] = {};
    }
    if (Array.isArray(this.state.deletedTextbooks)) {
      this.state.deletedTextbooks = this.state.deletedTextbooks.filter(tb => tb !== trimmed);
    }
    this.saveState();
    return true;
  }

  deleteTextbook(name) {
    if (!name) return false;
    // 1. Remove from textbookLessons
    if (this.state.textbookLessons && this.state.textbookLessons[name]) {
      delete this.state.textbookLessons[name];
    }
    // 2. Remove from any groups that used this textbook
    if (this.state.groups) {
      this.state.groups.forEach(g => {
        if (g.textbook === name) g.textbook = '';
      });
    }
    // 3. Remove from any students that had this textbook assigned
    if (this.state.students) {
      this.state.students.forEach(s => {
        if (s.textbook === name) s.textbook = '';
      });
    }
    // 4. Remove from textbookVocabularyPool
    if (this.state.textbookVocabularyPool && this.state.textbookVocabularyPool[name]) {
      delete this.state.textbookVocabularyPool[name];
    }
    // 5. Track in deletedTextbooks so syncWithServer & INITIAL_DATA won't resurrect it
    if (!Array.isArray(this.state.deletedTextbooks)) {
      this.state.deletedTextbooks = [];
    }
    if (!this.state.deletedTextbooks.includes(name)) {
      this.state.deletedTextbooks.push(name);
    }
    this.saveState(true);
    return true;
  }

  getMonthsForTextbook(textbookName) {
    const tbData = (this.state.textbookLessons && this.state.textbookLessons[textbookName]) || {};
    
    return MONTH_NAMES.map(m => {
      const monthData = tbData[m.num] || {};
      let conductedCount = 0;
      let filesCount = 0;
      
      for (let i = 1; i <= 8; i++) {
        const lesson = monthData[i];
        if (lesson) {
          if (lesson.isConducted) conductedCount++;
          if (lesson.files) filesCount += lesson.files.length;
        }
      }

      return {
        ...m,
        conductedCount,
        totalLessons: 8,
        filesCount
      };
    });
  }

  getLessonsForMonth(textbookName, monthNumber) {
    const mNum = Number(monthNumber);
    const tbData = (this.state.textbookLessons && this.state.textbookLessons[textbookName]) || {};
    const monthData = tbData[mNum] || {};

    const lessons = [];
    for (let i = 1; i <= 8; i++) {
      const lessonData = monthData[i] || {
        topic: `Урок ${i}: Материалы темы месяца`,
        isConducted: false,
        homework: { text: "", deadline: "к следующему уроку" },
        vocabulary: [],
        files: []
      };

      lessons.push({
        lessonNumber: i,
        monthNumber: mNum,
        textbookName,
        topic: lessonData.topic,
        isConducted: lessonData.isConducted || false,
        homework: lessonData.homework || { text: "", deadline: "к следующему уроку" },
        vocabulary: lessonData.vocabulary || [],
        files: lessonData.files || []
      });
    }

    return lessons;
  }

  getLessonDetails(textbookName, monthNumber, lessonNumber) {
    const mNum = Number(monthNumber);
    const lNum = Number(lessonNumber);
    const tbData = (this.state.textbookLessons && this.state.textbookLessons[textbookName]) || {};
    const monthData = tbData[mNum] || {};

    const lessonData = monthData[lNum] || {
      topic: `Урок ${lNum}: Тема занятия`,
      isConducted: false,
      homework: { text: "", deadline: "к следующему уроку" },
      vocabulary: [],
      files: []
    };

    return {
      textbookName,
      monthNumber: mNum,
      lessonNumber: lNum,
      ...lessonData
    };
  }

  saveLessonDetails(textbookName, monthNumber, lessonNumber, data) {
    const mNum = Number(monthNumber);
    const lNum = Number(lessonNumber);

    if (!this.state.textbookLessons) this.state.textbookLessons = {};
    if (!this.state.textbookLessons[textbookName]) this.state.textbookLessons[textbookName] = {};
    if (!this.state.textbookLessons[textbookName][mNum]) this.state.textbookLessons[textbookName][mNum] = {};

    this.state.textbookLessons[textbookName][mNum][lNum] = {
      ...this.state.textbookLessons[textbookName][mNum][lNum],
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.saveState(true);
    return this.state.textbookLessons[textbookName][mNum][lNum];
  }

  conductLessonByHierarchy(textbookName, monthNumber, lessonNumber) {
    const details = this.getLessonDetails(textbookName, monthNumber, lessonNumber);
    details.isConducted = true;
    details.conductedAt = new Date().toISOString();
    this.saveLessonDetails(textbookName, monthNumber, lessonNumber, details);
    this.syncVocabularyPoolForLesson(textbookName, monthNumber, lessonNumber);
    return details;
  }

  getLatestUnlockedLessonForTextbook(textbookName) {
    if (!textbookName) return null;
    const tbData = (this.state.textbookLessons && this.state.textbookLessons[textbookName]) || {};

    let latest = null;
    // Iterate through months 1..10, then lessons 1..8
    for (let m = 1; m <= 10; m++) {
      const monthData = tbData[m];
      if (monthData) {
        for (let l = 1; l <= 8; l++) {
          const lesson = monthData[l];
          if (lesson && lesson.isConducted) {
            latest = {
              textbookName,
              monthNumber: m,
              monthName: MONTH_NAMES.find(mn => mn.num === m)?.name || `Месяц ${m}`,
              lessonNumber: l,
              ...lesson
            };
          }
        }
      }
    }
    return latest;
  }

  getLessonPlans(filter = {}) {
    const list = [];
    const tbData = this.state.textbookLessons || {};
    for (const [tbName, months] of Object.entries(tbData)) {
      if (filter.textbook && filter.textbook !== tbName) continue;
      for (const [mNum, lessons] of Object.entries(months || {})) {
        for (const [lNum, lData] of Object.entries(lessons || {})) {
          list.push({
            id: `plan-${tbName}-${mNum}-${lNum}`,
            textbook: tbName,
            textbookName: tbName,
            monthNumber: Number(mNum),
            lessonNumber: Number(lNum),
            ...lData
          });
        }
      }
    }
    return list;
  }

  getLessonPlanByScheduleId(scheduleId) {
    const lesson = this.getLessonById(scheduleId);
    if (!lesson) return null;
    const group = lesson.groupId ? this.getGroupById(lesson.groupId) : null;
    const student = lesson.studentId ? this.getStudentById(lesson.studentId) : null;
    const tbName = group?.textbook || student?.textbook;
    if (!tbName) return null;
    return this.getLatestUnlockedLessonForTextbook(tbName);
  }

  getLessonPlanById(planId) {
    if (!planId) return null;
    return this.getLessonPlans().find(p => p.id === planId) || null;
  }

  conductLesson(scheduleId) {
    return this.updateLessonStatus(scheduleId, 'completed');
  }

  exportJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  // =========================================================================
  // Dedicated Vocabulary Pool (Partitioned by Textbook & Preserved across Years)
  // =========================================================================

  /**
   * Synchronize words into the vocabulary pool when a lesson is conducted.
   * Words are partitioned by textbook and assigned to all students currently or
   * previously studying that textbook.
   */
  syncVocabularyPoolForLesson(textbookName, monthNumber, lessonNumber) {
    if (!textbookName || !monthNumber || !lessonNumber) return;
    const details = this.getLessonDetails(textbookName, monthNumber, lessonNumber);
    if (!details || !Array.isArray(details.vocabulary) || details.vocabulary.length === 0) return;

    if (!this.state.textbookVocabularyPool) {
      this.state.textbookVocabularyPool = {};
    }
    if (!this.state.textbookVocabularyPool[textbookName]) {
      this.state.textbookVocabularyPool[textbookName] = [];
    }

    const nowIso = new Date().toISOString();
    const conductedTime = details.conductedAt || nowIso;

    // 1. Sync to global textbook vocabulary pool
    details.vocabulary.forEach(v => {
      if (!v || !v.word || !v.word.trim()) return;
      const cleanWord = v.word.trim();
      const existing = this.state.textbookVocabularyPool[textbookName].find(
        item => item.word.toLowerCase().trim() === cleanWord.toLowerCase()
      );
      if (!existing) {
        this.state.textbookVocabularyPool[textbookName].push({
          id: `vocab-${textbookName}-${monthNumber}-${lessonNumber}-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          word: cleanWord,
          transcription: (v.transcription || '').trim(),
          translation: (v.translation || '').trim(),
          example: (v.example || '').trim(),
          textbook: textbookName,
          monthNumber: Number(monthNumber),
          lessonNumber: Number(lessonNumber),
          conductedAt: conductedTime,
          dateAdded: nowIso
        });
      } else {
        if (!existing.transcription && v.transcription) existing.transcription = v.transcription.trim();
        if (!existing.translation && v.translation) existing.translation = v.translation.trim();
        if (!existing.example && v.example) existing.example = v.example.trim();
        if (!existing.monthNumber) existing.monthNumber = Number(monthNumber);
        if (!existing.lessonNumber) existing.lessonNumber = Number(lessonNumber);
      }
    });

    // 2. Sync to individual student vocabulary pools
    const matchingGroups = (this.state.groups || []).filter(g => g.textbook === textbookName).map(g => g.id);

    (this.state.students || []).forEach(student => {
      const studentTextbook = student.textbook || (student.groupId ? this.getGroupById(student.groupId)?.textbook : null);
      const isCurrentlyStudying = (studentTextbook === textbookName) || (student.groupId && matchingGroups.includes(student.groupId));
      const hasStudiedBefore = Array.isArray(student.textbooksStudied) && student.textbooksStudied.includes(textbookName);

      if (isCurrentlyStudying || hasStudiedBefore) {
        if (!student.vocabularyPool) student.vocabularyPool = {};
        if (!student.vocabularyPool[textbookName]) student.vocabularyPool[textbookName] = [];
        if (!student.textbooksStudied) student.textbooksStudied = [];
        if (!student.textbooksStudied.includes(textbookName)) {
          student.textbooksStudied.push(textbookName);
        }

        details.vocabulary.forEach(v => {
          if (!v || !v.word || !v.word.trim()) return;
          const cleanWord = v.word.trim();
          const wordExists = student.vocabularyPool[textbookName].some(
            item => item.word.toLowerCase().trim() === cleanWord.toLowerCase()
          );
          if (!wordExists) {
            student.vocabularyPool[textbookName].push({
              id: `vocab-${student.id}-${textbookName}-${monthNumber}-${lessonNumber}-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              word: cleanWord,
              transcription: (v.transcription || '').trim(),
              translation: (v.translation || '').trim(),
              example: (v.example || '').trim(),
              textbook: textbookName,
              monthNumber: Number(monthNumber),
              lessonNumber: Number(lessonNumber),
              conductedAt: conductedTime,
              dateAdded: nowIso,
              isMastered: false
            });
          }
        });
      }
    });

    this.saveState();
  }

  /**
   * Retroactive deep sync: ensures all conducted lessons across all textbooks are reflected in
   * the vocabulary pool and student pools. Safe to run multiple times (idempotent).
   */
  ensureVocabularyPoolSynced(targetState = this.state) {
    if (!targetState || !targetState.textbookLessons) return;
    if (!targetState.textbookVocabularyPool) targetState.textbookVocabularyPool = {};

    const deletedSet = new Set(targetState.deletedTextbooks || []);
    const nowIso = new Date().toISOString();

    // 1. Scan all conducted lessons from textbookLessons
    for (const [tbName, months] of Object.entries(targetState.textbookLessons)) {
      if (!tbName || !months || deletedSet.has(tbName)) continue;
      if (!targetState.textbookVocabularyPool[tbName]) {
        targetState.textbookVocabularyPool[tbName] = [];
      }

      for (const [mNum, lessons] of Object.entries(months)) {
        if (!lessons) continue;
        for (const [lNum, lesson] of Object.entries(lessons)) {
          if (lesson && lesson.isConducted && Array.isArray(lesson.vocabulary) && lesson.vocabulary.length > 0) {
            lesson.vocabulary.forEach(v => {
              if (!v || !v.word || !v.word.trim()) return;
              const cleanWord = v.word.trim();
              const existing = targetState.textbookVocabularyPool[tbName].find(
                item => item.word.toLowerCase().trim() === cleanWord.toLowerCase()
              );
              if (!existing) {
                targetState.textbookVocabularyPool[tbName].push({
                  id: `vocab-${tbName}-${mNum}-${lNum}-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                  word: cleanWord,
                  transcription: (v.transcription || '').trim(),
                  translation: (v.translation || '').trim(),
                  example: (v.example || '').trim(),
                  textbook: tbName,
                  monthNumber: Number(mNum),
                  lessonNumber: Number(lNum),
                  conductedAt: lesson.conductedAt || nowIso,
                  dateAdded: nowIso
                });
              } else {
                if (!existing.transcription && v.transcription) existing.transcription = v.transcription.trim();
                if (!existing.translation && v.translation) existing.translation = v.translation.trim();
                if (!existing.example && v.example) existing.example = v.example.trim();
              }
            });
          }
        }
      }
    }

    // 2. Scan all students and assign vocabulary partitioned by textbooks they've studied
    if (Array.isArray(targetState.students)) {
      targetState.students.forEach(student => {
        if (!student.vocabularyPool) student.vocabularyPool = {};
        if (!student.textbooksStudied) student.textbooksStudied = [];

        // Determine current textbook
        let currentTb = student.textbook;
        if (!currentTb && student.groupId) {
          const g = (targetState.groups || []).find(gr => gr.id === student.groupId);
          if (g) currentTb = g.textbook;
        }

        if (currentTb && !student.textbooksStudied.includes(currentTb)) {
          student.textbooksStudied.push(currentTb);
        }

        // Include any textbook already in student's vocabularyPool
        Object.keys(student.vocabularyPool).forEach(tb => {
          if (!student.textbooksStudied.includes(tb)) {
            student.textbooksStudied.push(tb);
          }
        });

        // Ensure words from conducted lessons of these textbooks are in student's pool
        student.textbooksStudied.forEach(tbName => {
          if (!student.vocabularyPool[tbName]) student.vocabularyPool[tbName] = [];
          const tbWords = targetState.textbookVocabularyPool[tbName] || [];

          tbWords.forEach(w => {
            const exists = student.vocabularyPool[tbName].some(
              sw => sw.word.toLowerCase().trim() === w.word.toLowerCase().trim()
            );
            if (!exists) {
              student.vocabularyPool[tbName].push({
                ...w,
                id: `vocab-${student.id}-${w.id || w.word.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                isMastered: false
              });
            }
          });
        });
      });
    }
  }

  /**
   * Get student's vocabulary pool, partitioned by textbooks studied.
   */
  getStudentVocabularyPool(studentId, textbookFilter = null) {
    this.ensureVocabularyPoolSynced();
    const student = this.getStudentById(studentId);
    if (!student) {
      return {
        student: null,
        textbooks: [],
        poolByTextbook: {},
        allWords: [],
        totalWordsCount: 0,
        masteredWordsCount: 0
      };
    }

    const poolByTextbook = {};
    const studiedList = student.textbooksStudied || [];
    const pool = student.vocabularyPool || {};

    // Collect all textbooks that have words or are in studiedList
    const allTextbookKeys = Array.from(new Set([
      ...studiedList,
      ...Object.keys(pool),
      ...(student.textbook ? [student.textbook] : [])
    ])).filter(Boolean);

    let allWords = [];
    let masteredCount = 0;

    allTextbookKeys.forEach(tb => {
      let words = pool[tb] || [];
      // Fallback: if student pool for this textbook was empty but textbook has words
      if (words.length === 0 && this.state.textbookVocabularyPool && this.state.textbookVocabularyPool[tb]) {
        words = this.state.textbookVocabularyPool[tb].map(w => ({
          ...w,
          id: `vocab-${student.id}-${w.id}`,
          isMastered: false
        }));
      }

      poolByTextbook[tb] = words;
      words.forEach(w => {
        allWords.push({ ...w, textbook: tb });
        if (w.isMastered) masteredCount++;
      });
    });

    const activeTextbooks = Object.keys(poolByTextbook);

    if (textbookFilter && textbookFilter !== 'all') {
      const filteredWords = poolByTextbook[textbookFilter] || [];
      return {
        student,
        currentTextbook: student.textbook || activeTextbooks[0] || '',
        textbooks: activeTextbooks,
        selectedTextbook: textbookFilter,
        words: filteredWords,
        poolByTextbook,
        allWords,
        totalWordsCount: filteredWords.length,
        masteredWordsCount: filteredWords.filter(w => w.isMastered).length
      };
    }

    return {
      student,
      currentTextbook: student.textbook || activeTextbooks[0] || '',
      textbooks: activeTextbooks,
      selectedTextbook: 'all',
      words: allWords,
      poolByTextbook,
      allWords,
      totalWordsCount: allWords.length,
      masteredWordsCount: masteredCount
    };
  }

  /**
   * Get all textbook vocabulary pools (for Teacher & Admin views)
   */
  getTextbookVocabularyPool(textbookFilter = null) {
    this.ensureVocabularyPoolSynced();
    const deletedSet = new Set(this.state?.deletedTextbooks || []);
    const pool = this.state.textbookVocabularyPool || {};
    const availableTextbooks = Object.keys(pool).filter(tb => !deletedSet.has(tb));

    // Also include any textbooks from textbookLessons that might not have words yet
    if (this.state.textbookLessons) {
      Object.keys(this.state.textbookLessons).forEach(tb => {
        if (!availableTextbooks.includes(tb) && !deletedSet.has(tb)) availableTextbooks.push(tb);
      });
    }

    let allWords = [];
    availableTextbooks.forEach(tb => {
      const words = pool[tb] || [];
      words.forEach(w => allWords.push({ ...w, textbook: tb }));
    });

    if (textbookFilter && textbookFilter !== 'all') {
      const words = pool[textbookFilter] || [];
      return {
        textbooks: availableTextbooks,
        selectedTextbook: textbookFilter,
        words,
        poolByTextbook: pool,
        allWords,
        totalWordsCount: words.length
      };
    }

    return {
      textbooks: availableTextbooks,
      selectedTextbook: 'all',
      words: allWords,
      poolByTextbook: pool,
      allWords,
      totalWordsCount: allWords.length
    };
  }

  /**
   * Toggle or set isMastered status for a student word
   */
  toggleWordMastered(studentId, textbookName, wordText, explicitValue = null) {
    const student = this.getStudentById(studentId);
    if (!student || !student.vocabularyPool || !student.vocabularyPool[textbookName]) return false;

    const wordItem = student.vocabularyPool[textbookName].find(
      w => w.word.toLowerCase().trim() === wordText.toLowerCase().trim()
    );
    if (!wordItem) return false;

    wordItem.isMastered = explicitValue !== null ? Boolean(explicitValue) : !wordItem.isMastered;
    this.saveState();
    return wordItem.isMastered;
  }

  /**
   * Add a custom word directly to a textbook pool and/or student pool
   */
  addCustomWordToPool(textbookName, wordData, studentId = null) {
    if (!textbookName || !wordData || !wordData.word) return null;

    const cleanWord = wordData.word.trim();
    const cleanTranscription = (wordData.transcription || '').trim();
    const cleanTranslation = (wordData.translation || '').trim();
    const cleanExample = (wordData.example || '').trim();
    const nowIso = new Date().toISOString();

    if (!this.state.textbookVocabularyPool) this.state.textbookVocabularyPool = {};
    if (!this.state.textbookVocabularyPool[textbookName]) this.state.textbookVocabularyPool[textbookName] = [];

    const newWordObj = {
      id: `vocab-${textbookName}-custom-${Date.now()}`,
      word: cleanWord,
      transcription: cleanTranscription,
      translation: cleanTranslation,
      example: cleanExample,
      textbook: textbookName,
      monthNumber: Number(wordData.monthNumber) || 1,
      lessonNumber: Number(wordData.lessonNumber) || 1,
      conductedAt: nowIso,
      dateAdded: nowIso
    };

    this.state.textbookVocabularyPool[textbookName].push(newWordObj);

    if (studentId) {
      const student = this.getStudentById(studentId);
      if (student) {
        if (!student.vocabularyPool) student.vocabularyPool = {};
        if (!student.vocabularyPool[textbookName]) student.vocabularyPool[textbookName] = [];
        student.vocabularyPool[textbookName].push({
          ...newWordObj,
          id: `vocab-${student.id}-custom-${Date.now()}`,
          isMastered: false
        });
      }
    } else {
      // Sync to all students studying this textbook
      (this.state.students || []).forEach(s => {
        const studTb = s.textbook || (s.groupId ? this.getGroupById(s.groupId)?.textbook : null);
        if (studTb === textbookName || (s.textbooksStudied && s.textbooksStudied.includes(textbookName))) {
          if (!s.vocabularyPool) s.vocabularyPool = {};
          if (!s.vocabularyPool[textbookName]) s.vocabularyPool[textbookName] = [];
          s.vocabularyPool[textbookName].push({
            ...newWordObj,
            id: `vocab-${s.id}-custom-${Date.now()}`,
            isMastered: false
          });
        }
      });
    }

    this.saveState();
    return newWordObj;
  }

  getTotalVocabularyCountForStudent(studentId) {
    const data = this.getStudentVocabularyPool(studentId);
    return data.totalWordsCount || 0;
  }

  getTotalVocabularyCount() {
    const data = this.getTextbookVocabularyPool();
    return data.totalWordsCount || 0;
  }

  // --- Groups CRUD ---
  getGroups(filter = {}) {
    let list = [...(this.state.groups || [])];
    if (filter.status) {
      list = list.filter(g => g.status === filter.status);
    }
    if (filter.level && filter.level !== 'all') {
      list = list.filter(g => g.level === filter.level);
    }
    if (filter.shift && filter.shift !== 'all') {
      list = list.filter(g => g.shift === filter.shift);
    }
    if (filter.teacherId && filter.teacherId !== 'all') {
      list = list.filter(g => g.teacherId === filter.teacherId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        (g.textbook && g.textbook.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getGroupById(id) {
    return (this.state.groups || []).find(g => g.id === id) || null;
  }

  getStudentsByGroupId(groupId) {
    return this.state.students.filter(s => s.groupId === groupId && s.status === 'active');
  }

  addGroup(groupData) {
    const id = 'grp-' + Date.now();
    const textbookName = groupData.textbook?.trim() || '';
    if (textbookName) {
      this.addTextbook(textbookName);
    }
    const newGroup = {
      id,
      name: groupData.name.trim(),
      level: groupData.level || 'Pre-Intermediate',
      textbook: textbookName,
      teacherId: groupData.teacherId || '',
      shift: groupData.shift || 'Первая',
      classroom: groupData.classroom?.trim() || 'Кабинет 1',
      description: groupData.description?.trim() || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    if (!this.state.groups) this.state.groups = [];
    this.state.groups.push(newGroup);

    // Automatically generate full 80-lesson yearly schedule for this group based on its textbook
    if (textbookName) {
      this.generateYearlyScheduleForGroup({
        groupId: newGroup.id,
        time: groupData.scheduleTime || '16:00 - 17:00',
        format: newGroup.classroom || 'Кабинет 1'
      });
    }

    this.saveState();
    return newGroup;
  }

  updateGroup(id, groupData) {
    const index = this.state.groups.findIndex(g => g.id === id);
    if (index !== -1) {
      const oldTextbook = this.state.groups[index].textbook;
      const newTextbook = groupData.textbook !== undefined ? (groupData.textbook?.trim() || '') : oldTextbook;

      if (newTextbook) {
        this.addTextbook(newTextbook);
      }

      this.state.groups[index] = {
        ...this.state.groups[index],
        ...groupData,
        textbook: newTextbook
      };

      // If textbook changed, update all enrolled students and group schedule topics
      if (newTextbook && newTextbook !== oldTextbook) {
        if (this.state.students) {
          this.state.students.forEach(s => {
            if (s.groupId === id) {
              s.textbook = newTextbook;
              if (!s.textbooksStudied) s.textbooksStudied = [];
              if (oldTextbook && !s.textbooksStudied.includes(oldTextbook)) {
                s.textbooksStudied.push(oldTextbook);
              }
              if (!s.textbooksStudied.includes(newTextbook)) {
                s.textbooksStudied.push(newTextbook);
              }
              if (!s.vocabularyPool) s.vocabularyPool = {};
              if (!s.vocabularyPool[newTextbook]) s.vocabularyPool[newTextbook] = [];
            }
          });
        }
        if (this.state.schedule) {
          this.state.schedule.forEach(sch => {
            if (sch.groupId === id) {
              const mNum = sch.monthNumber || 1;
              const lNum = sch.lessonNumber || sch.lessonNumberInMonth || 1;
              const hierDetails = this.getLessonDetails(newTextbook, mNum, lNum);
              if (hierDetails && hierDetails.topic) {
                sch.topic = hierDetails.topic;
              }
            }
          });
        }
      }

      this.saveState();
      return this.state.groups[index];
    }
    return null;
  }

  deleteGroup(id) {
    this.state.groups = this.state.groups.filter(g => g.id !== id);
    this.state.students.forEach(s => {
      if (s.groupId === id) s.groupId = null;
    });
    this.state.schedule = this.state.schedule.filter(sch => sch.groupId !== id);
    this.saveState(true);
  }

  // --- Students CRUD ---
  getStudents(filter = {}) {
    let result = [...this.state.students];
    if (filter.status) {
      result = result.filter(s => s.status === filter.status);
    }
    if (filter.groupId && filter.groupId !== 'all') {
      result = result.filter(s => s.groupId === filter.groupId);
    }
    if (filter.level && filter.level !== 'all') {
      result = result.filter(s => s.level === filter.level);
    }
    if (filter.shift && filter.shift !== 'all') {
      result = result.filter(s => s.shift === filter.shift);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        (s.school && s.school.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q)) ||
        (s.parentName && s.parentName.toLowerCase().includes(q)) ||
        (s.textbook && s.textbook.toLowerCase().includes(q))
      );
    }
    return result;
  }

  getStudentById(id) {
    return this.state.students.find(s => s.id === id) || null;
  }

  addStudent(studentData) {
    const id = 'stu-' + Date.now();
    let level = studentData.level || 'Beginner';
    let textbook = studentData.textbook?.trim() || '';

    if (studentData.groupId) {
      const group = this.getGroupById(studentData.groupId);
      if (group) {
        if (!studentData.level) level = group.level;
        if (!textbook) textbook = group.textbook;
      }
    }

    const formattedPhone = formatPhoneForDisplay(studentData.phone);
    const formattedParentPhone = formatPhoneForDisplay(studentData.parentPhone);

    const newStudent = {
      id,
      groupId: studentData.groupId || null,
      fullName: studentData.fullName.trim(),
      phone: formattedPhone,
      parentName: studentData.parentName?.trim() || '',
      parentPhone: formattedParentPhone,
      grade: studentData.grade?.trim() || '',
      school: studentData.school?.trim() || '',
      shift: studentData.shift || 'Первая',
      level: level,
      textbook: textbook,
      totalPoints: Number(studentData.totalPoints) || 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      notes: studentData.notes?.trim() || '',
      avatarUrl: studentData.avatarUrl || null,
      avatarFrame: studentData.avatarFrame || 'frame-none',
      studentTitle: studentData.studentTitle || ''
    };
    this.state.students.unshift(newStudent);
    this.saveState();
    return newStudent;
  }

  updateStudentCustomization(id, customizationData = {}) {
    const student = this.getStudentById(id);
    if (!student) return null;
    const patch = {};
    if (customizationData.avatarUrl !== undefined) patch.avatarUrl = customizationData.avatarUrl;
    if (customizationData.avatarFrame !== undefined) patch.avatarFrame = customizationData.avatarFrame;
    if (customizationData.studentTitle !== undefined) patch.studentTitle = customizationData.studentTitle;
    return this.updateStudent(id, patch);
  }

  updateStudent(id, studentData) {
    const index = this.state.students.findIndex(s => s.id === id);
    if (index !== -1) {
      const oldStudent = this.state.students[index];
      const oldTextbook = oldStudent.textbook;
      const newTextbook = studentData.textbook !== undefined ? (studentData.textbook?.trim() || '') : oldTextbook;

      const updated = {
        ...oldStudent,
        ...studentData
      };
      if (studentData.phone) updated.phone = formatPhoneForDisplay(studentData.phone);
      if (studentData.parentPhone) updated.parentPhone = formatPhoneForDisplay(studentData.parentPhone);

      // Preserve multi-year textbook history
      if (!updated.textbooksStudied) updated.textbooksStudied = [...(oldStudent.textbooksStudied || [])];
      if (oldTextbook && !updated.textbooksStudied.includes(oldTextbook)) {
        updated.textbooksStudied.push(oldTextbook);
      }
      if (newTextbook && !updated.textbooksStudied.includes(newTextbook)) {
        updated.textbooksStudied.push(newTextbook);
      }
      if (!updated.vocabularyPool) updated.vocabularyPool = { ...(oldStudent.vocabularyPool || {}) };
      if (oldTextbook && !updated.vocabularyPool[oldTextbook] && oldStudent.vocabularyPool?.[oldTextbook]) {
        updated.vocabularyPool[oldTextbook] = oldStudent.vocabularyPool[oldTextbook];
      }
      if (newTextbook && !updated.vocabularyPool[newTextbook]) {
        updated.vocabularyPool[newTextbook] = [];
      }

      this.state.students[index] = updated;
      this.saveState();
      if (newTextbook && newTextbook !== oldTextbook) {
        this.ensureVocabularyPoolSynced();
      }
      return this.state.students[index];
    }
    return null;
  }

  deleteStudent(id) {
    this.state.students = this.state.students.filter(s => s.id !== id);
    this.state.schedule = this.state.schedule.filter(sch => sch.studentId !== id);
    this.state.pointRecords = this.state.pointRecords.filter(pt => pt.studentId !== id);
    this.saveState(true);
  }

  // --- Teachers CRUD ---
  getTeachers(filter = {}) {
    let result = [...this.state.teachers];
    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter(t =>
        t.fullName.toLowerCase().includes(q) ||
        (t.specialization && t.specialization.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.phone && t.phone.includes(q))
      );
    }
    return result;
  }

  getTeacherById(id) {
    return this.state.teachers.find(t => t.id === id) || null;
  }

  addTeacher(teacherData) {
    const id = 'tch-' + Date.now();
    const colors = ['#4f46e5', '#0d9488', '#d97706', '#8b5cf6', '#0284c7', '#e11d48'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const autoLogin = (teacherData.login?.trim()) || ('teacher' + Math.floor(100 + Math.random() * 900));
    const autoPassword = (teacherData.password?.trim()) || '123';

    const newTeacher = {
      id,
      login: autoLogin,
      password: autoPassword,
      fullName: teacherData.fullName.trim(),
      phone: formatPhoneForDisplay(teacherData.phone),
      email: teacherData.email?.trim() || '',
      specialization: teacherData.specialization?.trim() || 'General English',
      status: teacherData.status || 'active',
      avatarColor: teacherData.avatarColor || randomColor
    };
    this.state.teachers.push(newTeacher);
    this.saveState();
    return newTeacher;
  }

  updateTeacher(id, teacherData) {
    const index = this.state.teachers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.state.teachers[index] = {
        ...this.state.teachers[index],
        ...teacherData
      };
      if (teacherData.phone) this.state.teachers[index].phone = formatPhoneForDisplay(teacherData.phone);
      this.saveState();
      return this.state.teachers[index];
    }
    return null;
  }

  deleteTeacher(id) {
    this.state.teachers = this.state.teachers.filter(t => t.id !== id);
    this.saveState(true);
  }

  // --- Schedule CRUD ---

  /**
   * Helper: Parse lesson date & time into a Date object for automatic completion checks
   */
  parseLessonDateTime(lesson, baseYear = 2026) {
    if (!lesson || !lesson.date) return null;
    let dStr = String(lesson.date).trim();
    let year = baseYear;
    let month = 1;
    let day = 1;

    if (dStr.includes('-')) {
      const parts = dStr.split('-').map(Number);
      if (parts.length >= 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
    } else if (dStr.includes('.')) {
      const parts = dStr.split('.').map(Number);
      day = parts[0];
      month = parts[1];
      if (parts.length >= 3) {
        year = parts[2];
      } else {
        if (lesson.monthNumber) {
          year = lesson.monthNumber >= 5 ? (baseYear + 1) : baseYear;
        } else {
          year = month >= 8 ? baseYear : (baseYear + 1);
        }
      }
    } else {
      return null;
    }

    let hours = 23;
    let minutes = 59;
    if (lesson.time && typeof lesson.time === 'string') {
      const timeMatches = lesson.time.match(/(\d{1,2}):(\d{2})/g);
      if (timeMatches && timeMatches.length > 0) {
        const targetTimeStr = timeMatches[timeMatches.length - 1];
        const [h, m] = targetTimeStr.split(':').map(Number);
        hours = h;
        minutes = m;
      }
    }

    return new Date(year, month - 1, day, hours, minutes, 0);
  }

  /**
   * Automatic Completion: Lessons whose scheduled date/time has passed
   * automatically become 'completed', while preserving explicit 'cancelled' status.
   */
  autoCompletePastLessons(now = new Date()) {
    if (!this._serverSynced) return 0;
    if (!this.state || !Array.isArray(this.state.schedule)) return 0;
    let updatedCount = 0;

    this.state.schedule.forEach(lesson => {
      // ONLY auto-complete planned lessons. Explicitly cancelled lessons stay cancelled!
      if (lesson.status === 'planned') {
        const lessonD = this.parseLessonDateTime(lesson);
        if (lessonD && lessonD < now) {
          lesson.status = 'completed';
          updatedCount++;

          // Unlock corresponding textbook lesson plan if applicable
          const group = lesson.groupId ? this.getGroupById(lesson.groupId) : null;
          const student = lesson.studentId ? this.getStudentById(lesson.studentId) : null;
          const tbName = group?.textbook || student?.textbook;
          const mNum = lesson.monthNumber || lesson.monthIndex;
          const lNum = lesson.lessonNumber || lesson.lessonNumberInMonth;

          if (tbName && mNum && lNum) {
            try {
              const details = this.getLessonDetails(tbName, mNum, lNum);
              if (!details.isConducted) {
                details.isConducted = true;
                details.conductedAt = new Date().toISOString();
                if (!this.state.textbookLessons) this.state.textbookLessons = {};
                if (!this.state.textbookLessons[tbName]) this.state.textbookLessons[tbName] = {};
                if (!this.state.textbookLessons[tbName][mNum]) this.state.textbookLessons[tbName][mNum] = {};
                this.state.textbookLessons[tbName][mNum][lNum] = {
                  ...this.state.textbookLessons[tbName][mNum][lNum],
                  ...details,
                  updatedAt: new Date().toISOString()
                };
                this.syncVocabularyPoolForLesson(tbName, mNum, lNum);
              }
            } catch (err) {
              console.warn('Error syncing textbook lesson on auto-complete:', err);
            }
          }
        }
      }
    });

    if (updatedCount > 0) {
      this.saveState();
    }
    return updatedCount;
  }

  getSchedule(filter = {}) {
    if (this._serverSynced) {
      this.autoCompletePastLessons();
    }
    let result = [...this.state.schedule];

    if (filter.teacherId) {
      result = result.filter(s => s.teacherId === filter.teacherId);
    }

    if (filter.groupId && filter.groupId !== 'all') {
      result = result.filter(s => s.groupId === filter.groupId);
    }

    if (filter.studentId) {
      const student = this.getStudentById(filter.studentId);
      const studentGroupId = student ? student.groupId : null;
      result = result.filter(s =>
        s.studentId === filter.studentId ||
        (studentGroupId && s.groupId === studentGroupId)
      );
    }

    if (filter.status && filter.status !== 'all') {
      result = result.filter(s => s.status === filter.status);
    }
    if (filter.dayOfWeek && filter.dayOfWeek !== 'all') {
      result = result.filter(s => s.dayOfWeek === filter.dayOfWeek);
    }

    return result;
  }

  getLessonById(id) {
    return this.state.schedule.find(s => s.id === id) || null;
  }

  addLesson(lessonData) {
    const id = 'sch-' + Date.now();
    const isGroup = lessonData.targetType === 'group' || !!lessonData.groupId;

    const newLesson = {
      id,
      targetType: isGroup ? 'group' : 'individual',
      groupId: isGroup ? lessonData.groupId : null,
      studentId: isGroup ? null : lessonData.studentId,
      teacherId: lessonData.teacherId,
      dayOfWeek: lessonData.dayOfWeek || 'Понедельник',
      time: lessonData.time || '16:00 - 17:00',
      date: lessonData.date || new Date().toISOString().split('T')[0],
      topic: lessonData.topic?.trim() || 'English Practice Lesson',
      status: lessonData.status || 'planned',
      format: lessonData.format || 'Очно (Кабинет 1)'
    };
    this.state.schedule.push(newLesson);
    this.saveState();
    return newLesson;
  }

  updateLesson(id, lessonData) {
    const index = this.state.schedule.findIndex(s => s.id === id);
    if (index !== -1) {
      const oldStatus = this.state.schedule[index].status;
      this.state.schedule[index] = {
        ...this.state.schedule[index],
        ...lessonData
      };

      const newStatus = this.state.schedule[index].status;
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        const lesson = this.state.schedule[index];
        const group = lesson.groupId ? this.getGroupById(lesson.groupId) : null;
        const student = lesson.studentId ? this.getStudentById(lesson.studentId) : null;
        const tbName = group?.textbook || student?.textbook;
        const mNum = lesson.monthNumber || lesson.monthIndex;
        const lNum = lesson.lessonNumber || lesson.lessonNumberInMonth;

        if (tbName && mNum && lNum) {
          this.conductLessonByHierarchy(tbName, mNum, lNum);
        } else if (tbName) {
          const months = this.getMonthsForTextbook(tbName);
          for (const m of months) {
            const lessons = this.getLessonsForMonth(tbName, m.num);
            const nextL = lessons.find(l => !l.isConducted);
            if (nextL) {
              this.conductLessonByHierarchy(tbName, m.num, nextL.lessonNumber);
              break;
            }
          }
        }
      }

      this.saveState();
      return this.state.schedule[index];
    }
    return null;
  }

  updateLessonStatus(id, newStatus) {
    return this.updateLesson(id, { status: newStatus });
  }

  deleteLesson(id) {
    this.state.schedule = this.state.schedule.filter(s => s.id !== id);
    this.saveState(true);
  }

  // =========================================================================
  // Yearly Schedule Matrix & Generator (10 Months x 8 Lessons = 80 Dates)
  // =========================================================================

  calculateDefaultYearlyDates(param1 = 'пн-чт', param2 = 2026, param3 = '11.01') {
    let startDate = '07.09';
    let dayPair = 'пн-чт';
    let customWeekdays = null;
    let holidayStart = '25.12';
    let holidayEnd = '10.01';
    let baseYear = 2026;

    if (typeof param1 === 'object' && param1 !== null) {
      startDate = param1.startDate || '07.09';
      dayPair = param1.dayPair || 'пн-чт';
      customWeekdays = param1.customWeekdays || null;
      holidayStart = param1.holidayStart || '25.12';
      holidayEnd = param1.holidayEnd || (param1.januaryResumeDate ? param1.januaryResumeDate : '10.01');
      if (param1.januaryResumeDate && !param1.holidayEnd) {
        holidayEnd = '10.01';
      }
      baseYear = param1.baseYear || 2026;
    } else {
      dayPair = param1 || 'пн-чт';
      baseYear = param2 || 2026;
      if (param3) {
        if (typeof param3 === 'string' && param3.includes('-')) {
          const parts = param3.split('-');
          holidayStart = parts[0];
          holidayEnd = parts[1];
        } else {
          holidayEnd = '10.01';
        }
      }
    }

    // Parse start date
    let startD = new Date(baseYear, 8, 7); // Default 07.09
    if (typeof startDate === 'string') {
      if (startDate.includes('-')) {
        const p = startDate.split('-').map(Number);
        startD = new Date(p[0], p[1] - 1, p[2]);
      } else if (startDate.includes('.')) {
        const p = startDate.split('.').map(Number);
        const y = p.length > 2 ? p[2] : baseYear;
        startD = new Date(y, p[1] - 1, p[0]);
      }
    }

    // Parse holiday interval
    let holStartD = new Date(baseYear, 11, 25); // Default 25.12
    if (typeof holidayStart === 'string' && holidayStart.includes('.')) {
      const p = holidayStart.split('.').map(Number);
      const y = p.length > 2 ? p[2] : baseYear;
      holStartD = new Date(y, p[1] - 1, p[0]);
    }

    let holEndD = new Date(baseYear + 1, 0, 10); // Default 10.01
    if (typeof holidayEnd === 'string' && holidayEnd.includes('.')) {
      const p = holidayEnd.split('.').map(Number);
      const y = p.length > 2 ? p[2] : (baseYear + 1);
      holEndD = new Date(y, p[1] - 1, p[0]);
    }

    // Target weekdays (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)
    const pairMap = {
      'пн-чт': [1, 4],
      'вт-пт': [2, 5],
      'ср-пт': [3, 5],
      'ср-сб': [3, 6],
      'пн-ср': [1, 3],
      'вт-чт': [2, 4],
      'сб-вс': [6, 0],
      'пн-ср-пт': [1, 3, 5]
    };

    let targetWeekdays = [1, 4];
    if (customWeekdays && Array.isArray(customWeekdays) && customWeekdays.length > 0) {
      targetWeekdays = customWeekdays;
    } else if (typeof dayPair === 'string') {
      const cleaned = dayPair.toLowerCase().replace(/\s+/g, '');
      targetWeekdays = pairMap[cleaned] || [1, 4];
    }

    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const shortDayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

    const monthNamesList = [
      '', '01. Сентябрь', '02. Октябрь', '03. Ноябрь', '04. Декабрь',
      '05. Январь', '06. Февраль', '07. Март', '08. Апрель', '09. Май', '10. Июнь'
    ];

    let curr = new Date(startD);
    while (!targetWeekdays.includes(curr.getDay())) {
      curr.setDate(curr.getDate() + 1);
    }

    const matrix = [];

    for (let m = 1; m <= 10; m++) {
      const monthLessons = [];

      // If month 5 (Jan) and curr <= holEndD, jump past holiday
      if (m === 5 && curr <= holEndD) {
        curr = new Date(holEndD);
        curr.setDate(curr.getDate() + 1);
        while (!targetWeekdays.includes(curr.getDay())) {
          curr.setDate(curr.getDate() + 1);
        }
      }

      for (let l = 1; l <= 8; l++) {
        // Check if inside holiday
        if (curr >= holStartD && curr <= holEndD) {
          curr = new Date(holEndD);
          curr.setDate(curr.getDate() + 1);
          while (!targetWeekdays.includes(curr.getDay())) {
            curr.setDate(curr.getDate() + 1);
          }
        }

        const y = curr.getFullYear();
        const mm = String(curr.getMonth() + 1).padStart(2, '0');
        const dd = String(curr.getDate()).padStart(2, '0');
        const isoDate = `${y}-${mm}-${dd}`;
        const shortDisplay = `${dd}.${mm}`;
        const dayOfWeek = dayNames[curr.getDay()];
        const shortDay = shortDayNames[curr.getDay()];

        monthLessons.push({
          monthNumber: m,
          monthIndex: m,
          lessonNumber: l,
          lessonNumberInMonth: l,
          date: shortDisplay,
          isoDate,
          shortDisplay,
          displayDate: shortDisplay,
          dayOfWeek,
          dayOfWeekShort: shortDay,
          shortDay
        });

        // Advance to next target weekday
        curr.setDate(curr.getDate() + 1);
        while (!targetWeekdays.includes(curr.getDay())) {
          curr.setDate(curr.getDate() + 1);
        }
      }

      matrix.push({
        monthNumber: m,
        monthIndex: m,
        monthName: monthNamesList[m] || `Месяц ${m}`,
        lessons: monthLessons,
        dates: monthLessons
      });
    }

    return matrix;
  }

  generateYearlyScheduleForGroup({
    groupId,
    teacherId = null,
    time = '16:00 - 17:00',
    format = 'Очно (Кабинет 2)',
    startDate = '07.09',
    dayPair = 'пн-чт',
    customWeekdays = null,
    holidayStart = '25.12',
    holidayEnd = '10.01',
    baseYear = 2026,
    januaryResumeDate = '11.01',
    customDatesMatrix = null,
    replaceExisting = true
  }) {
    if (!groupId) return null;
    const group = this.getGroupById(groupId);
    if (!group) return null;

    const teacher = teacherId ? this.getTeacherById(teacherId) : this.getTeacherById(group.teacherId);
    const assignedTeacherId = teacher ? teacher.id : (group.teacherId || (this.state.teachers[0]?.id || ''));
    const textbookName = group.textbook || (this.getTextbooks()[0] || 'English world 1');

    if (replaceExisting) {
      // Remove previous group lessons so clean 80 lessons are installed
      this.state.schedule = this.state.schedule.filter(s => s.groupId !== groupId);
    }

    const matrix = customDatesMatrix || this.calculateDefaultYearlyDates({
      startDate,
      dayPair,
      customWeekdays,
      holidayStart,
      holidayEnd: holidayEnd || (januaryResumeDate === '11.01' ? '10.01' : holidayEnd),
      baseYear
    });

    const createdLessons = [];

    matrix.forEach(mObj => {
      const mNum = mObj.monthNumber || mObj.monthIndex || 1;
      const lessonList = mObj.lessons || mObj.dates || [];

      lessonList.forEach(lObj => {
        const lNum = lObj.lessonNumber || lObj.lessonNumberInMonth || 1;
        const hierDetails = this.getLessonDetails(textbookName, mNum, lNum);
        const topic = hierDetails.topic || `Урок ${lNum}: Материалы ${mNum} месяца`;

        const id = 'sch-' + groupId + '-m' + mNum + '-l' + lNum + '-' + Date.now().toString(36);
        const newLesson = {
          id,
          targetType: 'group',
          groupId,
          studentId: null,
          teacherId: assignedTeacherId,
          monthNumber: mNum,
          lessonNumber: lNum,
          lessonNumberInMonth: lNum,
          dayOfWeek: lObj.dayOfWeek || 'Понедельник',
          dayOfWeekShort: lObj.dayOfWeekShort || lObj.shortDay || 'пн',
          time: lObj.time || time,
          date: lObj.date || lObj.shortDisplay || '01.09',
          topic,
          status: (mNum === 1 && lNum <= 4) ? 'completed' : 'planned',
          format
        };

        this.state.schedule.push(newLesson);
        createdLessons.push(newLesson);
      });
    });

    group.scheduleDays = dayPair;
    group.scheduleTime = time;
    if (teacher) group.teacherId = teacher.id;
    if (format) group.classroom = format;

    this.saveState();
    return createdLessons;
  }

  copyScheduleToGroup({
    sourceGroupId,
    targetGroupId,
    newTime = '18:00 - 19:00',
    newTeacherId = null,
    newFormat = null,
    replaceExisting = true
  }) {
    if (!sourceGroupId || !targetGroupId) return null;
    const sourceGroup = this.getGroupById(sourceGroupId);
    const targetGroup = this.getGroupById(targetGroupId);
    if (!sourceGroup || !targetGroup) return null;

    let sourceSchedule = this.getSchedule({ groupId: sourceGroupId });
    if (!sourceSchedule.length) {
      // If source group doesn't have schedule yet, generate one for it first
      sourceSchedule = this.generateYearlyScheduleForGroup({
        groupId: sourceGroupId,
        time: sourceGroup.scheduleTime || '16:00 - 17:00',
        format: sourceGroup.classroom || 'Кабинет 2'
      });
    }

    const targetTeacherId = newTeacherId || targetGroup.teacherId || sourceGroup.teacherId;
    const targetFormat = newFormat || targetGroup.classroom || 'Кабинет 2';
    const targetTextbook = targetGroup.textbook || sourceGroup.textbook;

    if (replaceExisting) {
      this.state.schedule = this.state.schedule.filter(s => s.groupId !== targetGroupId);
    }

    const createdLessons = [];
    sourceSchedule.forEach(sLesson => {
      const mNum = sLesson.monthNumber || 1;
      const lNum = sLesson.lessonNumber || sLesson.lessonNumberInMonth || 1;
      const hierDetails = this.getLessonDetails(targetTextbook, mNum, lNum);
      const topic = hierDetails.topic || sLesson.topic;

      const id = 'sch-' + targetGroupId + '-m' + mNum + '-l' + lNum + '-' + Date.now().toString(36);
      const newLesson = {
        id,
        targetType: 'group',
        groupId: targetGroupId,
        studentId: null,
        teacherId: targetTeacherId,
        monthNumber: mNum,
        lessonNumber: lNum,
        lessonNumberInMonth: lNum,
        dayOfWeek: sLesson.dayOfWeek,
        dayOfWeekShort: sLesson.dayOfWeekShort || sLesson.dayOfWeek?.slice(0, 2).toLowerCase() || 'пн',
        time: newTime || sLesson.time,
        date: sLesson.date,
        topic,
        status: 'planned',
        format: targetFormat
      };

      this.state.schedule.push(newLesson);
      createdLessons.push(newLesson);
    });

    targetGroup.scheduleDays = sourceGroup.scheduleDays || 'пн - чт';
    targetGroup.scheduleTime = newTime || sourceGroup.scheduleTime;
    if (newTeacherId) targetGroup.teacherId = newTeacherId;
    if (newFormat) targetGroup.classroom = newFormat;

    this.saveState();
    return createdLessons;
  }

  getYearlyScheduleMatrix(groupId) {
    if (!groupId) return [];
    const group = this.getGroupById(groupId);
    if (!group) return [];

    let groupLessons = this.getSchedule({ groupId });
    if (!groupLessons.length) {
      // Auto-populate 80 lessons if group is newly created
      groupLessons = this.generateYearlyScheduleForGroup({
        groupId,
        time: group.scheduleTime || '16:00 - 17:00',
        format: group.classroom || 'Кабинет 2'
      }) || [];
    }

    const textbookName = group.textbook || (this.getTextbooks()[0] || 'English world 1');

    return MONTH_NAMES.map(m => {
      const monthNumber = m.num;
      const monthScheduleLessons = groupLessons.filter(s => s.monthNumber === monthNumber);

      const lessons = [];
      for (let l = 1; l <= 8; l++) {
        const existing = monthScheduleLessons.find(s => (s.lessonNumber === l || s.lessonNumberInMonth === l));
        const hierDetails = this.getLessonDetails(textbookName, monthNumber, l);

        if (existing) {
          lessons.push({
            id: existing.id,
            monthNumber,
            monthIndex: monthNumber,
            lessonNumber: l,
            lessonNumberInMonth: l,
            date: existing.date,
            displayDate: existing.date,
            dayOfWeek: existing.dayOfWeek,
            dayOfWeekShort: existing.dayOfWeekShort || existing.dayOfWeek?.slice(0, 2).toLowerCase() || 'пн',
            time: existing.time,
            status: existing.status,
            topic: existing.topic,
            format: existing.format,
            isConducted: existing.status === 'completed' || hierDetails.isConducted,
            hasFiles: (hierDetails.files && hierDetails.files.length > 0),
            hasHomework: (hierDetails.homework && !!hierDetails.homework.text),
            vocabularyCount: (hierDetails.vocabulary ? hierDetails.vocabulary.length : 0)
          });
        } else {
          lessons.push({
            id: null,
            monthNumber,
            monthIndex: monthNumber,
            lessonNumber: l,
            lessonNumberInMonth: l,
            date: '',
            displayDate: '—',
            dayOfWeek: '',
            dayOfWeekShort: '',
            time: group.scheduleTime || '16:00 - 17:00',
            status: 'unassigned',
            topic: hierDetails.topic || `Урок ${l}`,
            format: group.classroom || 'Очно',
            isConducted: false,
            hasFiles: false,
            hasHomework: false,
            vocabularyCount: 0
          });
        }
      }

      return {
        monthNumber,
        monthIndex: monthNumber,
        monthName: m.name,
        lessons,
        dates: lessons
      };
    });
  }

  // --- Points & Grades System ---
  getPointRecords(studentId = null) {
    let list = [...this.state.pointRecords];
    if (studentId) {
      list = list.filter(p => p.studentId === studentId);
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  awardPoints({ studentId, teacherId, points, type = 'add', category, comment, date }) {
    let parsedPoints = Math.abs(Number(points));
    if (isNaN(parsedPoints) || parsedPoints === 0) return null;

    if (type === 'deduct') {
      parsedPoints = -parsedPoints;
    }

    const defaultCategory = parsedPoints >= 0 ? 'Активность' : 'Несданное ДЗ';
    const finalCategory = category || defaultCategory;
    const finalComment = comment?.trim() || finalCategory;

    const id = 'pt-' + Date.now();
    const record = {
      id,
      studentId,
      teacherId: teacherId || 'admin',
      type: parsedPoints >= 0 ? 'add' : 'deduct',
      date: date || new Date().toISOString(),
      points: parsedPoints,
      category: finalCategory,
      comment: finalComment
    };

    this.state.pointRecords.unshift(record);

    const student = this.getStudentById(studentId);
    if (student) {
      student.totalPoints = Math.max(0, (student.totalPoints || 0) + parsedPoints);
      if (parsedPoints > 0) {
        student.lifetimePoints = (student.lifetimePoints || 0) + parsedPoints;
      }
    }

    this.saveState();
    return record;
  }

  deletePointRecord(id) {
    const record = this.state.pointRecords.find(p => p.id === id);
    if (record) {
      const student = this.getStudentById(record.studentId);
      if (student) {
        student.totalPoints = Math.max(0, (student.totalPoints || 0) - record.points);
        if (record.points > 0) {
          student.lifetimePoints = Math.max(0, (student.lifetimePoints || 0) - record.points);
        }
      }
      this.state.pointRecords = this.state.pointRecords.filter(p => p.id !== id);
      this.saveState(true);
    }
  }

  // --- Monthly Group Competition & Leaderboard System ---
  getAcademicMonthsList() {
    return [
      { key: '2026-09', name: 'Сентябрь 2026', shortName: 'Сентябрь', year: 2026, monthIndex: 8, num: 1 },
      { key: '2026-10', name: 'Октябрь 2026', shortName: 'Октябрь', year: 2026, monthIndex: 9, num: 2 },
      { key: '2026-11', name: 'Ноябрь 2026', shortName: 'Ноябрь', year: 2026, monthIndex: 10, num: 3 },
      { key: '2026-12', name: 'Декабрь 2026', shortName: 'Декабрь', year: 2026, monthIndex: 11, num: 4 },
      { key: '2027-01', name: 'Январь 2027', shortName: 'Январь', year: 2027, monthIndex: 0, num: 5 },
      { key: '2027-02', name: 'Февраль 2027', shortName: 'Февраль', year: 2027, monthIndex: 1, num: 6 },
      { key: '2027-03', name: 'Март 2027', shortName: 'Март', year: 2027, monthIndex: 2, num: 7 },
      { key: '2027-04', name: 'Апрель 2027', shortName: 'Апрель', year: 2027, monthIndex: 3, num: 8 },
      { key: '2027-05', name: 'Май 2027', shortName: 'Май', year: 2027, monthIndex: 4, num: 9 },
      { key: '2027-06', name: 'Июнь 2027', shortName: 'Июнь', year: 2027, monthIndex: 5, num: 10 }
    ];
  }

  /**
   * Calculates monthly leaderboard for a group strictly within the specified month/year.
   * Total/previous months' points are completely ignored.
   * Only positive additions and negative deductions that occurred in this month are calculated.
   */
  getGroupMonthlyLeaderboard(groupId, year, monthIndex) {
    let targetYear = Number(year);
    let targetMonth = Number(monthIndex);

    if (isNaN(targetYear) || isNaN(targetMonth)) {
      const now = new Date();
      targetYear = now.getFullYear();
      targetMonth = now.getMonth();
    }

    const group = groupId ? this.getGroupById(groupId) : null;
    let students = groupId ? this.getStudentsByGroupId(groupId) : this.getStudents();
    if (!students || students.length === 0) {
      students = groupId ? this.getStudents().filter(s => s.groupId === groupId) : this.getStudents();
    }

    const allRecords = this.getPointRecords();

    const leaderboard = students.map(student => {
      const monthlyRecords = allRecords.filter(r => {
        if (r.studentId !== student.id) return false;
        if (!r.date) return false;
        const d = new Date(r.date);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      });

      let addedPoints = 0;
      let deductedPoints = 0;

      monthlyRecords.forEach(r => {
        const pts = Number(r.points) || 0;
        if (pts > 0) {
          addedPoints += pts;
        } else if (pts < 0) {
          deductedPoints += Math.abs(pts);
        }
      });

      const netMonthlyPoints = addedPoints - deductedPoints;

      return {
        studentId: student.id,
        fullName: student.fullName,
        grade: student.grade,
        school: student.school,
        level: student.level,
        groupId: student.groupId,
        groupName: group ? group.name : 'Индивидуально',
        lifetimePoints: student.totalPoints || 0,
        addedPoints,
        deductedPoints,
        netMonthlyPoints,
        operationsCount: monthlyRecords.length,
        records: monthlyRecords
      };
    });

    leaderboard.sort((a, b) => {
      if (b.netMonthlyPoints !== a.netMonthlyPoints) {
        return b.netMonthlyPoints - a.netMonthlyPoints;
      }
      if (b.addedPoints !== a.addedPoints) {
        return b.addedPoints - a.addedPoints;
      }
      return a.fullName.localeCompare(b.fullName, 'ru');
    });

    return leaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      isFirstPlace: idx === 0 && item.netMonthlyPoints > 0,
      isSecondPlace: idx === 1 && item.netMonthlyPoints > 0,
      isThirdPlace: idx === 2 && item.netMonthlyPoints > 0
    }));
  }

  // --- Analytics ---
  getAnalytics() {
    const totalStudents = this.state.students.filter(s => s.status === 'active').length;
    const totalTeachers = this.state.teachers.filter(t => t.status === 'active').length;
    const totalGroups = (this.state.groups || []).filter(g => g.status === 'active').length;
    const totalLessons = this.state.schedule.length;
    const completedLessons = this.state.schedule.filter(s => s.status === 'completed').length;
    const plannedLessons = this.state.schedule.filter(s => s.status === 'planned').length;

    const allPoints = this.state.students.map(s => s.totalPoints || 0);
    const avgPoints = allPoints.length ? Math.round(allPoints.reduce((a, b) => a + b, 0) / allPoints.length) : 0;

    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      totalLessons,
      completedLessons,
      plannedLessons,
      avgPoints
    };
  }

  // =========================================================================
  // Lesson Attendance Management
  // =========================================================================

  getLessonAttendance(lessonId) {
    const lesson = this.getLessonById(lessonId);
    return (lesson && lesson.attendance) ? lesson.attendance : {};
  }

  saveLessonAttendance(lessonId, attendanceMap) {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return null;
    lesson.attendance = { ...(lesson.attendance || {}), ...attendanceMap };

    // If lesson was planned, marking attendance marks it as completed
    if (lesson.status === 'planned') {
      lesson.status = 'completed';
      const group = lesson.groupId ? this.getGroupById(lesson.groupId) : null;
      const student = lesson.studentId ? this.getStudentById(lesson.studentId) : null;
      const tbName = group?.textbook || student?.textbook;
      const mNum = lesson.monthNumber || lesson.monthIndex;
      const lNum = lesson.lessonNumber || lesson.lessonNumberInMonth;
      if (tbName && mNum && lNum) {
        try {
          this.conductLessonByHierarchy(tbName, mNum, lNum);
        } catch (e) {}
      }
    }
    this.saveState();
    return lesson.attendance;
  }

  getStudentAttendanceStats(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) return { total: 0, attended: 0, missed: 0, percentage: 100, history: [] };
    const allLessons = this.state.schedule || [];
    const myLessons = allLessons.filter(l => {
      if (l.studentId === studentId) return true;
      if (student.groupId && l.groupId === student.groupId) return true;
      return false;
    });

    let totalConducted = 0;
    let attended = 0;
    let missed = 0;
    const history = [];

    myLessons.forEach(l => {
      if (l.status === 'completed' || (l.attendance && l.attendance[studentId])) {
        totalConducted++;
        const attStatus = l.attendance ? (l.attendance[studentId] || 'absent') : 'present';
        if (attStatus === 'present') {
          attended++;
          history.push({ lessonId: l.id, date: l.date, time: l.time, topic: l.topic, status: 'present' });
        } else {
          missed++;
          history.push({ lessonId: l.id, date: l.date, time: l.time, topic: l.topic, status: 'absent' });
        }
      }
    });

    const percentage = totalConducted > 0 ? Math.round((attended / totalConducted) * 100) : 100;
    return {
      total: totalConducted,
      attended,
      missed,
      percentage,
      history: history.reverse()
    };
  }

  // =========================================================================
  // Monthly Payments & Warning System
  // =========================================================================

  getCurrentAcademicMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const list = this.getAcademicMonthsList();
    return list.find(m => m.key === key) || list[0]; // defaults to 2026-09
  }

  getPayment(studentId, monthKey) {
    if (!this.state.payments) this.state.payments = {};
    const key = `${studentId}_${monthKey}`;
    return this.state.payments[key] || {
      studentId,
      monthKey,
      status: 'unpaid',
      paidAt: null,
      amount: 25000,
      notes: ''
    };
  }

  setPaymentStatus(studentId, monthKey, status, extra = {}) {
    if (!this.state.payments) this.state.payments = {};
    const key = `${studentId}_${monthKey}`;
    const existing = this.getPayment(studentId, monthKey);
    const newStatus = status === 'paid' ? 'paid' : 'unpaid';
    this.state.payments[key] = {
      ...existing,
      studentId,
      monthKey,
      status: newStatus,
      paidAt: newStatus === 'paid' ? (existing.paidAt || new Date().toISOString()) : null,
      ...extra
    };
    this.saveState();
    return this.state.payments[key];
  }

  bulkSetPaymentStatus(studentIds, monthKey, status) {
    if (!Array.isArray(studentIds) || !monthKey) return;
    if (!this.state.payments) this.state.payments = {};
    studentIds.forEach(id => {
      this.setPaymentStatus(id, monthKey, status);
    });
  }

  isPaymentDueWarningActive(studentId, monthKey = null) {
    if (!studentId) return false;
    const targetMonth = monthKey ? (this.getAcademicMonthsList().find(m => m.key === monthKey) || this.getCurrentAcademicMonth()) : this.getCurrentAcademicMonth();
    
    // If payment is made, warning is strictly hidden
    const payment = this.getPayment(studentId, targetMonth.key);
    if (payment && payment.status === 'paid') {
      return false;
    }

    // "предупреждение включать с первого дня. убирать если оплата есть"
    const now = new Date();
    const firstDay = new Date(targetMonth.year, targetMonth.monthIndex, 1);

    // If today is on or past the 1st of the target academic month (or within current academic year)
    if (now >= firstDay || now.getFullYear() >= targetMonth.year) {
      return true;
    }

    return true;
  }

  getMonthPaymentsSummary(monthKey, groupId = 'all') {
    let students = this.getStudents();
    if (groupId && groupId !== 'all') {
      students = students.filter(s => s.groupId === groupId);
    }
    const total = students.length;
    let paidCount = 0;
    let unpaidCount = 0;

    students.forEach(s => {
      const p = this.getPayment(s.id, monthKey);
      if (p.status === 'paid') {
        paidCount++;
      } else {
        unpaidCount++;
      }
    });

    const percent = total > 0 ? Math.round((paidCount / total) * 100) : 0;
    return {
      total,
      paidCount,
      unpaidCount,
      percent
    };
  }

  // =========================================================================
  // Mini-Games & Quizzes System (Points, 100-pt Weekly Cap, Progress & Titles)
  // =========================================================================

  getCurrentIsoWeekKey(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  getStudentGameProgress(studentId) {
    const student = this.getStudentById(studentId);
    if (!student) {
      return {
        weeklyPoints: 0,
        weeklyLimit: 100,
        currentWeekKey: this.getCurrentIsoWeekKey(),
        irregularStreak: 0,
        conditionalStreak: 0,
        unlockedTenseLevels: ['easy'],
        unlockedSecretTitles: [],
        irregularRecentIds: []
      };
    }

    if (!student.gameStats) {
      student.gameStats = {};
    }

    const currentWeekKey = this.getCurrentIsoWeekKey();
    if (!student.gameStats.weekly) {
      student.gameStats.weekly = { weekKey: currentWeekKey, points: 0 };
    } else if (student.gameStats.weekly.weekKey !== currentWeekKey) {
      student.gameStats.weekly = { weekKey: currentWeekKey, points: 0 };
    }

    if (!Array.isArray(student.gameStats.unlockedTenseLevels) || student.gameStats.unlockedTenseLevels.length === 0) {
      student.gameStats.unlockedTenseLevels = ['easy'];
    }

    if (!Array.isArray(student.unlockedTitles)) {
      student.unlockedTitles = [];
    }

    if (!Array.isArray(student.gameStats.unlockedSecretTitles)) {
      student.gameStats.unlockedSecretTitles = [...student.unlockedTitles];
    }

    if (!Array.isArray(student.gameStats.irregularRecentIds)) {
      student.gameStats.irregularRecentIds = [];
    }

    return {
      weeklyPoints: student.gameStats.weekly.points || 0,
      weeklyLimit: 100,
      currentWeekKey,
      wordsStreak: student.gameStats.wordsStreak || 0,
      irregularStreak: student.gameStats.irregularStreak || 0,
      conditionalStreak: student.gameStats.conditionalStreak || 0,
      tensesStreak: student.gameStats.tensesStreak || 0,
      builderStreak: student.gameStats.builderStreak || 0,
      prepositionsStreak: student.gameStats.prepositionsStreak || 0,
      phrasalStreak: student.gameStats.phrasalStreak || 0,
      mistakesStreak: student.gameStats.mistakesStreak || 0,
      synonymsStreak: student.gameStats.synonymsStreak || 0,
      unlockedTenseLevels: student.gameStats.unlockedTenseLevels,
      unlockedSecretTitles: student.unlockedTitles,
      irregularRecentIds: student.gameStats.irregularRecentIds,
      conditionalModesCompleted: student.gameStats.conditionalModesCompleted || []
    };
  }

  awardGamePoints(studentId, pointsEarned, gameKey, gameTitle = 'Мини-игра') {
    const student = this.getStudentById(studentId);
    if (!student) return { pointsEarned: 0, pointsAwarded: 0, weeklyTotal: 0, capReached: false };

    const progress = this.getStudentGameProgress(studentId);
    const weeklyPoints = progress.weeklyPoints;
    const remainingCap = Math.max(0, 100 - weeklyPoints);
    const rawPoints = Math.max(0, Number(pointsEarned) || 0);
    const pointsAwarded = Math.min(rawPoints, remainingCap);

    if (pointsAwarded > 0) {
      student.gameStats.weekly.points += pointsAwarded;
      this.awardPoints({
        studentId,
        teacherId: 'admin',
        points: pointsAwarded,
        type: 'add',
        category: 'Мини-игры',
        comment: `🎮 ${gameTitle}: набрано ${rawPoints} из 10 (начислено +${pointsAwarded} ⭐ в профиль)`
      });
    }

    const updatedWeeklyTotal = student.gameStats.weekly.points;
    this.saveState();

    return {
      pointsEarned: rawPoints,
      pointsAwarded,
      weeklyTotal: updatedWeeklyTotal,
      weeklyLimit: 100,
      capReached: updatedWeeklyTotal >= 100
    };
  }

  unlockSecretTitle(studentId, titleName) {
    const student = this.getStudentById(studentId);
    if (!student) return false;

    if (!Array.isArray(student.unlockedTitles)) {
      student.unlockedTitles = [];
    }
    if (!student.gameStats) {
      student.gameStats = {};
    }
    if (!Array.isArray(student.gameStats.unlockedSecretTitles)) {
      student.gameStats.unlockedSecretTitles = [];
    }

    const alreadyUnlocked = student.unlockedTitles.includes(titleName);
    if (!alreadyUnlocked) {
      student.unlockedTitles.push(titleName);
      student.gameStats.unlockedSecretTitles.push(titleName);
      this.saveState();
      return true; // newly unlocked
    }
    return false;
  }

  recordGameResult(studentId, gameKey, score, total = 10, meta = {}) {
    const student = this.getStudentById(studentId);
    if (!student) return { newTitleUnlocked: null, levelUnlocked: null };

    this.getStudentGameProgress(studentId); // ensure gameStats is initialized
    let newTitleUnlocked = null;
    let levelUnlocked = null;

    if (gameKey === 'words') {
      if (score === total && total >= 10) {
        student.gameStats.wordsStreak = (student.gameStats.wordsStreak || 0) + 1;
        if (student.gameStats.wordsStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'знаток слов');
          if (unlocked) {
            newTitleUnlocked = 'знаток слов';
          }
        }
      } else {
        student.gameStats.wordsStreak = 0;
      }
    } else if (gameKey === 'irregular') {
      if (score === total && total >= 10) {
        student.gameStats.irregularStreak = (student.gameStats.irregularStreak || 0) + 1;
        if (student.gameStats.irregularStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'знаток irregular');
          if (unlocked) {
            newTitleUnlocked = 'знаток irregular';
          }
        }
      } else {
        student.gameStats.irregularStreak = 0;
      }

      if (Array.isArray(meta.verbIds) && meta.verbIds.length > 0) {
        student.gameStats.irregularRecentIds = meta.verbIds.slice(0, 10);
      }
    } else if (gameKey === 'conditionals') {
      if (score === total && total >= 10) {
        student.gameStats.conditionalStreak = (student.gameStats.conditionalStreak || 0) + 1;
        if (student.gameStats.conditionalStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'знаток conditional');
          if (unlocked) {
            newTitleUnlocked = 'знаток conditional';
          }
        }
        if (meta.mode) {
          if (!Array.isArray(student.gameStats.conditionalModesCompleted)) {
            student.gameStats.conditionalModesCompleted = [];
          }
          if (!student.gameStats.conditionalModesCompleted.includes(meta.mode)) {
            student.gameStats.conditionalModesCompleted.push(meta.mode);
          }
          if (['type1', 'type2', 'type3', 'mixed'].every(m => student.gameStats.conditionalModesCompleted.includes(m))) {
            const unlockedArch = this.unlockSecretTitle(studentId, 'архитектор условий');
            if (unlockedArch) {
              newTitleUnlocked = newTitleUnlocked || 'архитектор условий';
            }
          }
        }
      } else {
        student.gameStats.conditionalStreak = 0;
      }
    } else if (gameKey === 'tenses') {
      const currentLevel = meta.level || 'easy';
      const tiersOrder = ['easy', 'middle', 'hard', 'impossible', 'rampage'];
      const curIndex = tiersOrder.indexOf(currentLevel);

      // Streak tracking for 10/10 in Tenses
      if (score === total && total >= 10) {
        student.gameStats.tensesStreak = (student.gameStats.tensesStreak || 0) + 1;
        if (student.gameStats.tensesStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'повелитель времён');
          if (unlocked) {
            newTitleUnlocked = 'повелитель времён';
          }
        }
      } else {
        student.gameStats.tensesStreak = 0;
      }

      if (score >= 8) {
        if (curIndex !== -1 && curIndex < tiersOrder.length - 1) {
          const nextTier = tiersOrder[curIndex + 1];
          if (!student.gameStats.unlockedTenseLevels.includes(nextTier)) {
            student.gameStats.unlockedTenseLevels.push(nextTier);
            levelUnlocked = nextTier;
          }
        }
        if (currentLevel === 'rampage') {
          const unlocked = this.unlockSecretTitle(studentId, 'гений времён');
          if (unlocked) {
            newTitleUnlocked = newTitleUnlocked || 'гений времён';
          }
        }
      }
    } else if (gameKey === 'builder') {
      if (score === total && total >= 10) {
        student.gameStats.builderStreak = (student.gameStats.builderStreak || 0) + 1;
        if (student.gameStats.builderStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'мастер предложений');
          if (unlocked) {
            newTitleUnlocked = 'мастер предложений';
          }
        }
      } else {
        student.gameStats.builderStreak = 0;
      }
    } else if (gameKey === 'prepositions') {
      if (score === total && total >= 10) {
        student.gameStats.prepositionsStreak = (student.gameStats.prepositionsStreak || 0) + 1;
        if (student.gameStats.prepositionsStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'повелитель предлогов');
          if (unlocked) {
            newTitleUnlocked = 'повелитель предлогов';
          }
        }
      } else {
        student.gameStats.prepositionsStreak = 0;
      }
    } else if (gameKey === 'phrasal') {
      if (score === total && total >= 10) {
        student.gameStats.phrasalStreak = (student.gameStats.phrasalStreak || 0) + 1;
        if (student.gameStats.phrasalStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'знаток phrasal verbs');
          if (unlocked) {
            newTitleUnlocked = 'знаток phrasal verbs';
          }
        }
      } else {
        student.gameStats.phrasalStreak = 0;
      }
    } else if (gameKey === 'mistakes') {
      if (score === total && total >= 10) {
        student.gameStats.mistakesStreak = (student.gameStats.mistakesStreak || 0) + 1;
        if (student.gameStats.mistakesStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'грамматический детектив');
          if (unlocked) {
            newTitleUnlocked = 'грамматический детектив';
          }
        }
      } else {
        student.gameStats.mistakesStreak = 0;
      }
    } else if (gameKey === 'synonyms') {
      if (score === total && total >= 10) {
        student.gameStats.synonymsStreak = (student.gameStats.synonymsStreak || 0) + 1;
        if (student.gameStats.synonymsStreak >= 3) {
          const unlocked = this.unlockSecretTitle(studentId, 'спринтер слов');
          if (unlocked) {
            newTitleUnlocked = 'спринтер слов';
          }
        }
      } else {
        student.gameStats.synonymsStreak = 0;
      }
    }

    // Meta check: Unlocking 5 secret titles awards "легенда мини-игр"
    if (Array.isArray(student.unlockedTitles) && student.unlockedTitles.length >= 5) {
      const unlockedLegend = this.unlockSecretTitle(studentId, 'легенда мини-игр');
      if (unlockedLegend) {
        newTitleUnlocked = newTitleUnlocked || 'легенда мини-игр';
      }
    }

    this.saveState();
    let currentStreak = 0;
    if (gameKey === 'words') currentStreak = student.gameStats.wordsStreak || 0;
    else if (gameKey === 'irregular') currentStreak = student.gameStats.irregularStreak || 0;
    else if (gameKey === 'conditionals') currentStreak = student.gameStats.conditionalStreak || 0;
    else if (gameKey === 'tenses') currentStreak = student.gameStats.tensesStreak || 0;
    else if (gameKey === 'builder') currentStreak = student.gameStats.builderStreak || 0;
    else if (gameKey === 'prepositions') currentStreak = student.gameStats.prepositionsStreak || 0;
    else if (gameKey === 'phrasal') currentStreak = student.gameStats.phrasalStreak || 0;
    else if (gameKey === 'mistakes') currentStreak = student.gameStats.mistakesStreak || 0;
    else if (gameKey === 'synonyms') currentStreak = student.gameStats.synonymsStreak || 0;

    return {
      newTitleUnlocked,
      levelUnlocked,
      currentStreak
    };
  }

  getPrioritizedVocabularyForGame(studentId, targetCount = 10) {
    const poolData = this.getStudentVocabularyPool(studentId);
    let allWords = [...(poolData?.allWords || [])];

    // Filter out invalid/empty items
    allWords = allWords.filter(w => w && w.word && w.word.trim() && w.translation && w.translation.trim());

    // Fallback 1: global textbook vocabulary pool if student pool is too small
    if (allWords.length < targetCount && this.state.textbookVocabularyPool) {
      for (const tbWords of Object.values(this.state.textbookVocabularyPool)) {
        if (Array.isArray(tbWords)) {
          tbWords.forEach(w => {
            if (w && w.word && w.translation && !allWords.some(x => x.word.toLowerCase() === w.word.toLowerCase())) {
              allWords.push({ ...w });
            }
          });
        }
      }
    }

    // Fallback 2: seed vocabulary pairs if system has very few words
    const defaultPairs = [
      { word: 'Disappear', transcription: '[dɪsəˈpɪə]', translation: 'исчезать', example: 'She suddenly disappeared.' },
      { word: 'Adventure', transcription: '[ədˈventʃə]', translation: 'приключение', example: 'They went on an exciting adventure.' },
      { word: 'Challenge', transcription: '[ˈtʃælɪndʒ]', translation: 'вызов, испытание', example: 'It was a difficult challenge.' },
      { word: 'Knowledge', transcription: '[ˈnɒlɪdʒ]', translation: 'знания', example: 'Knowledge is power.' },
      { word: 'Celebrate', transcription: '[ˈselɪbreɪt]', translation: 'праздновать', example: 'We celebrate our victories.' },
      { word: 'Imagine', transcription: '[ɪˈmædʒɪn]', translation: 'воображать', example: 'Imagine the possibilities.' },
      { word: 'Discover', transcription: '[dɪˈskʌvə]', translation: 'открывать, исследовать', example: 'Scientists discover new planets.' },
      { word: 'Protect', transcription: '[prəˈtekt]', translation: 'защищать', example: 'We must protect our planet.' },
      { word: 'Improve', transcription: '[ɪmˈpruːv]', translation: 'улучшать', example: 'Practice helps improve your skills.' },
      { word: 'Inspire', transcription: '[ɪnˈspaɪə]', translation: 'вдохновлять', example: 'Her stories inspire everyone.' }
    ];

    defaultPairs.forEach(dp => {
      if (allWords.length < targetCount && !allWords.some(x => x.word.toLowerCase() === dp.word.toLowerCase())) {
        allWords.push({ ...dp });
      }
    });

    // Determine the latest conducted lesson words
    const wordsWithLesson = allWords.filter(w => w.monthNumber && w.lessonNumber);
    let latestLessonWords = [];
    let otherWords = [];

    if (wordsWithLesson.length > 0) {
      wordsWithLesson.sort((a, b) => {
        if (b.monthNumber !== a.monthNumber) return b.monthNumber - a.monthNumber;
        return b.lessonNumber - a.lessonNumber;
      });

      const maxMonth = wordsWithLesson[0].monthNumber;
      const maxLesson = wordsWithLesson[0].lessonNumber;

      latestLessonWords = wordsWithLesson.filter(w => w.monthNumber === maxMonth && w.lessonNumber === maxLesson);
      otherWords = allWords.filter(w => !(w.monthNumber === maxMonth && w.lessonNumber === maxLesson));
    } else {
      otherWords = allWords;
    }

    // Shuffle helper
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    // Pick from latest lesson first
    let selected = shuffle(latestLessonWords);

    // Backfill with other words if under targetCount
    if (selected.length < targetCount) {
      const remainingNeeded = targetCount - selected.length;
      const shuffledOthers = shuffle(otherWords);
      for (const w of shuffledOthers) {
        if (!selected.some(x => x.word.toLowerCase() === w.word.toLowerCase())) {
          selected.push(w);
          if (selected.length >= targetCount) break;
        }
      }
    }

    return selected.slice(0, targetCount);
  }

  // --- Shop & Staff Goods Management ---
  getShopItems() {
    return this.state.shopItems || [];
  }

  getShopItemById(id) {
    return (this.state.shopItems || []).find(it => it.id === id);
  }

  addShopItem(itemData) {
    const id = 'staff-' + Date.now();
    const newItem = {
      id,
      name: itemData.name?.trim() || 'Новый товар',
      description: itemData.description?.trim() || '',
      price: Math.max(1, Number(itemData.price) || 100),
      photoUrl: itemData.photoUrl?.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      category: 'staff',
      createdAt: new Date().toISOString()
    };
    if (!this.state.shopItems) this.state.shopItems = [];
    this.state.shopItems.unshift(newItem);
    this.saveState(true);
    return newItem;
  }

  updateShopItem(id, itemData) {
    if (!this.state.shopItems) return null;
    const idx = this.state.shopItems.findIndex(it => it.id === id);
    if (idx !== -1) {
      this.state.shopItems[idx] = {
        ...this.state.shopItems[idx],
        ...itemData,
        price: Math.max(1, Number(itemData.price !== undefined ? itemData.price : this.state.shopItems[idx].price))
      };
      this.saveState(true);
      return this.state.shopItems[idx];
    }
    return null;
  }

  deleteShopItem(id) {
    if (!this.state.shopItems) return;
    this.state.shopItems = this.state.shopItems.filter(it => it.id !== id);
    this.saveState(true);
  }

  // --- Purchase System & Order Refunding ---
  getPurchases(filter = {}) {
    let list = this.state.purchases || [];
    if (filter.studentId) {
      list = list.filter(p => p.studentId === filter.studentId);
    }
    if (filter.teacherId) {
      list = list.filter(p => p.teacherId === filter.teacherId);
    }
    if (filter.status) {
      list = list.filter(p => p.status === filter.status);
    }
    return list;
  }

  makePurchase(studentId, item) {
    const student = this.getStudentById(studentId);
    if (!student) {
      return { success: false, message: 'Ученик не найден в системе' };
    }

    const price = Math.max(0, Number(item.price) || 0);
    const currentBalance = student.totalPoints || 0;

    if (currentBalance < price) {
      return {
        success: false,
        message: `Недостаточно баллов! Стоимость: ${price} ⭐, а на вашем балансе: ${currentBalance} ⭐`
      };
    }

    // Deduct spendable points (lifetimePoints is NOT decreased)
    student.totalPoints = currentBalance - price;

    // Ensure inventory structures exist
    if (!Array.isArray(student.unlockedAvatars)) student.unlockedAvatars = student.avatarUrl ? [student.avatarUrl] : [];
    if (!Array.isArray(student.unlockedFrames)) student.unlockedFrames = ['frame-none'];
    if (!Array.isArray(student.unlockedTitles)) student.unlockedTitles = student.studentTitle ? [student.studentTitle] : [];

    // Apply unlock if customization
    if (item.type === 'avatar') {
      const avatarVal = item.value || item.id;
      if (!student.unlockedAvatars.includes(avatarVal)) {
        student.unlockedAvatars.push(avatarVal);
      }
    } else if (item.type === 'frame') {
      const frameId = item.id;
      if (!student.unlockedFrames.includes(frameId)) {
        student.unlockedFrames.push(frameId);
      }
    } else if (item.type === 'title') {
      const titleText = item.text || item.name;
      if (!student.unlockedTitles.includes(titleText)) {
        student.unlockedTitles.push(titleText);
      }
    }

    const group = this.getGroupById(student.groupId);

    const purchaseRecord = {
      id: 'pur-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      studentId,
      studentName: student.fullName,
      groupId: student.groupId || null,
      groupName: group ? group.name : '—',
      teacherId: group?.teacherId || null,
      type: item.type, // 'avatar' | 'frame' | 'title' | 'staff'
      itemId: item.id || item.value || item.text,
      itemName: item.name || item.text || item.value || 'Товар',
      itemIcon: item.icon || item.photoUrl || item.value || '🛍️',
      price,
      date: new Date().toISOString(),
      status: 'completed'
    };

    if (!this.state.purchases) this.state.purchases = [];
    this.state.purchases.unshift(purchaseRecord);

    this.saveState(true);

    return {
      success: true,
      purchase: purchaseRecord,
      remainingBalance: student.totalPoints,
      message: `Покупка «${purchaseRecord.itemName}» успешно оформлена за ${price} ⭐!`
    };
  }

  cancelPurchase(purchaseId, cancelledBy = 'Преподаватель') {
    if (!this.state.purchases) return { success: false, message: 'Покупки не найдены' };
    const purchase = this.state.purchases.find(p => p.id === purchaseId);
    if (!purchase) {
      return { success: false, message: 'Запись о покупке не найдена' };
    }
    if (purchase.status === 'cancelled') {
      return { success: false, message: 'Эта покупка уже была отменена' };
    }

    const student = this.getStudentById(purchase.studentId);
    if (student) {
      // Refund points without penalty: points are returned to spendable balance, NOT added to lifetimePoints
      student.totalPoints = (student.totalPoints || 0) + purchase.price;

      // Re-lock if customization and revert equipped item if equipped
      if (purchase.type === 'avatar') {
        const val = purchase.itemId;
        student.unlockedAvatars = (student.unlockedAvatars || []).filter(a => a !== val);
        if (student.avatarUrl === val) {
          student.avatarUrl = student.unlockedAvatars[0] || '';
        }
      } else if (purchase.type === 'frame') {
        const val = purchase.itemId;
        student.unlockedFrames = (student.unlockedFrames || []).filter(f => f !== val);
        if (student.avatarFrame === val) {
          student.avatarFrame = 'frame-none';
        }
      } else if (purchase.type === 'title') {
        const val = purchase.itemName;
        student.unlockedTitles = (student.unlockedTitles || []).filter(t => t !== val);
        if (student.studentTitle === val) {
          student.studentTitle = '';
        }
      }
    }

    purchase.status = 'cancelled';
    purchase.cancelledAt = new Date().toISOString();
    purchase.cancelledBy = cancelledBy;

    this.saveState(true);

    return {
      success: true,
      message: `Покупка отменена. ${purchase.price} ⭐ возвращены ученику ${student ? student.fullName : ''} без штрафа!`
    };
  }
}

export const store = new Store();
