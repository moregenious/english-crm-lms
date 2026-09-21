/**
 * Student Avatar, Frames & Titles Customization Component
 */

import { store } from '../store.js';
import { modal } from './modal.js';
import { toast } from './toast.js';

export const AVAILABLE_FRAMES = [
  { id: 'frame-none', name: 'Без рамки', icon: '⚪', desc: 'Классический стиль' },
  { id: 'frame-stars', name: 'Звёздная магия', icon: '✨', desc: 'Сияние и золотые звёздочки' },
  { id: 'frame-neon', name: 'Неоновый пульс', icon: '💫', desc: 'Кибер-неоновое свечение' },
  { id: 'frame-fire', name: 'Огненный вихрь', icon: '🔥', desc: 'Пылающий градиент пламени' },
  { id: 'frame-gold', name: 'Королевская корона', icon: '👑', desc: 'Золото и корона' },
  { id: 'frame-cosmic', name: 'Космос и туманность', icon: '🌌', desc: 'Галактический перелив' },
  { id: 'frame-cyber', name: 'Киберпанк 2077', icon: '⚡', desc: 'Матричный контур' },
  { id: 'frame-rainbow', name: 'Радужный вихрь', icon: '🌈', desc: 'Спектральный перелив' }
];

export const AVAILABLE_TITLES = [
  { text: 'Лучший болтун', icon: '🗣️' },
  { text: 'Гений грамматики', icon: '🧠' },
  { text: 'Король домашки', icon: '👑' },
  { text: 'Гроза Present Perfect', icon: '⚡' },
  { text: 'Ночной зубрила', icon: '🦉' },
  { text: 'Шерлок Холмс произношения', icon: '🕵️‍♂️' },
  { text: 'Шпион в Лондоне', icon: '🇬🇧' },
  { text: 'Главный по мемам', icon: '😎' },
  { text: 'Генератор вопросов', icon: '❓' },
  { text: 'Слушатель на 100%', icon: '🎧' },
  { text: 'Повелитель неправильных глаголов', icon: '⚔️' },
  { text: 'Будущий полиглот', icon: '🚀' }
];

export const SECRET_TITLES = [
  { text: 'знаток слов', icon: '📖', desc: 'Награда за 3 победы 10/10 подряд в тесте по словам' },
  { text: 'знаток irregular', icon: '⚡', desc: 'Награда за 3 победы 10/10 подряд в неправильных глаголах' },
  { text: 'знаток conditional', icon: '⚖️', desc: 'Награда за 3 победы 10/10 подряд в условных предложениях' },
  { text: 'архитектор условий', icon: '🏛️', desc: 'Награда за победы 10/10 во всех 4 режимах Conditionals (Type 1, 2, 3, Mixed)' },
  { text: 'повелитель времён', icon: '⚡', desc: 'Награда за 3 победы 10/10 подряд в тесте по временам' },
  { text: 'гений времён', icon: '⏳', desc: 'Награда за покорение уровня Rampage во всех 12 временах' },
  { text: 'мастер предложений', icon: '🧩', desc: 'Награда за 3 победы 10/10 подряд в конструкторе предложений' },
  { text: 'повелитель предлогов', icon: '🎯', desc: 'Награда за 3 победы 10/10 подряд в ловце предлогов' },
  { text: 'знаток phrasal verbs', icon: '🚀', desc: 'Награда за 3 победы 10/10 подряд в фразовых глаголах' },
  { text: 'грамматический детектив', icon: '🕵️', desc: 'Награда за 3 победы 10/10 подряд в поиске ошибок' },
  { text: 'спринтер слов', icon: '⚡', desc: 'Награда за 3 победы 10/10 подряд в синонимах и антонимах' },
  { text: 'легенда мини-игр', icon: '👑', desc: 'Награда за открытие 5 любых секретных титулов' }
];

export const PRESET_EMOJIS = [
  '🦁', '🦊', '🐼', '🚀', '🦄', '🐱', '🐈‍⬛', '🦉', '🎮', '🎓', '⚡', '🌟', '👑', '🎯', '👾', '🎨', '🎸'
];

/**
 * Render Avatar HTML with Frame and Badges
 */
export function renderStudentAvatarHtml(student, options = {}) {
  const size = options.size || 'md';
  const frame = student?.avatarFrame || 'frame-none';
  const fullName = student?.fullName || 'Ученик';
  const initials = fullName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'УЧ';
  const avatarUrl = student?.avatarUrl || null;
  const extraClass = options.className || '';

  let innerContent = '';
  if (avatarUrl) {
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('/') || avatarUrl.startsWith('data:image')) {
      innerContent = `<img src="${avatarUrl}" alt="${fullName}" loading="lazy" />`;
    } else {
      innerContent = `<span class="avatar-emoji">${avatarUrl}</span>`;
    }
  } else {
    innerContent = `<span class="avatar-initials">${initials}</span>`;
  }

  let decoHtml = '';
  if (frame === 'frame-stars') {
    decoHtml = `
      <span class="frame-deco-star deco-star-1">✨</span>
      <span class="frame-deco-star deco-star-2">⭐</span>
      <span class="frame-deco-star deco-star-3">✦</span>
    `;
  } else if (frame === 'frame-fire') {
    decoHtml = `<span class="frame-deco-fire">🔥</span>`;
  } else if (frame === 'frame-gold') {
    decoHtml = `<span class="frame-deco-crown">👑</span>`;
  } else if (frame === 'frame-cyber') {
    decoHtml = `<span class="frame-deco-bolt">⚡</span>`;
  }

  const titleAttr = `${fullName}${student?.studentTitle ? ` • ${student.studentTitle}` : ''}`;

  return `
    <div class="custom-avatar-wrapper size-${size} ${frame} ${extraClass}" title="${titleAttr}">
      ${decoHtml}
      <div class="custom-avatar-inner">
        ${innerContent}
      </div>
    </div>
  `;
}

/**
 * Open Interactive Customization Modal
 */
export function openCustomizationModal(student, onSave = null) {
  if (!student) return;

  // Refresh student from store to have latest balance and inventory
  student = store.getStudentById(student.id) || student;

  let draft = {
    avatarUrl: student.avatarUrl || null,
    avatarFrame: student.avatarFrame || 'frame-none',
    studentTitle: student.studentTitle || ''
  };

  const currentPoints = student.totalPoints || 0;
  const unlockedAvatars = Array.isArray(student.unlockedAvatars) ? student.unlockedAvatars : (student.avatarUrl ? [student.avatarUrl] : []);
  const unlockedFrames = Array.isArray(student.unlockedFrames) ? student.unlockedFrames : ['frame-none', ...(student.avatarFrame && student.avatarFrame !== 'frame-none' ? [student.avatarFrame] : [])];
  const unlockedTitles = Array.isArray(student.unlockedTitles) ? student.unlockedTitles : (student.studentTitle ? [student.studentTitle] : []);

  function getPreviewHtml() {
    const previewStudent = {
      fullName: student.fullName,
      ...draft
    };

    return `
      <div class="customization-live-preview-box">
        <div id="preview-avatar-mount">
          ${renderStudentAvatarHtml(previewStudent, { size: 'preview' })}
        </div>
        <div class="preview-name">${student.fullName}</div>
        <div id="preview-title-mount" style="margin-top: 6px;">
          ${draft.studentTitle ? `
            <span class="student-title-badge">
              <span>${draft.studentTitle}</span>
            </span>
          ` : `
            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.6); font-style: italic;">
              Титул пока не выбран
            </span>
          `}
        </div>
      </div>
    `;
  }

  const bodyHtml = `
    <div class="customization-modal-container">
      <!-- Balance Banner & Link to Shop -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 10px 16px; border-radius: var(--radius-lg); margin-bottom: var(--space-4); box-shadow: var(--shadow-sm); flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">⭐</span>
          <div>
            <div style="font-size: 0.75rem; color: #c7d2fe;">Доступный баланс для покупок:</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #fef08a;">${currentPoints} баллов</div>
          </div>
        </div>
        <a href="#shop" onclick="document.getElementById('main-modal').close()" class="btn btn-sm btn-secondary" style="font-weight: 700;">
          🛍️ Перейти в Магазин
        </a>
      </div>

      <!-- Live Preview -->
      <div id="custom-preview-container">
        ${getPreviewHtml()}
      </div>

      <!-- Section 1: Avatar Image / Emoji -->
      <div style="background: var(--color-bg-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); flex-wrap: wrap; gap: 8px;">
          <h4 style="margin: 0; font-size: 1rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
            <span>📸</span> <span>Аватар профиля</span>
          </h4>
          <div style="display: flex; gap: 8px;">
            <label for="custom-avatar-file" class="btn btn-secondary btn-sm" style="cursor: pointer; margin: 0; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <span>Загрузить фото</span>
            </label>
            <input type="file" id="custom-avatar-file" accept="image/*" style="display: none;" />
            <button type="button" class="btn btn-ghost btn-sm" id="btn-reset-avatar-initials" title="Вернуть цветные буквы с инициалами">
              Инициалы
            </button>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);">
          <span>Эмодзи-аватары (разблокированные или за 50 ⭐):</span>
          <span style="color: #7c3aed; font-weight: 700;">Цена: 50 ⭐</span>
        </div>
        <div class="emoji-presets-row">
          ${PRESET_EMOJIS.map(em => {
            const isUnlocked = unlockedAvatars.includes(em);
            const isSelected = draft.avatarUrl === em;
            return `
              <button type="button" class="emoji-preset-btn ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked-avatar-btn' : ''}" data-emoji="${em}" data-unlocked="${isUnlocked ? '1' : '0'}" title="${isUnlocked ? `Выбрать ${em}` : `${em} (Заблокировано: 50 ⭐)`}" style="position: relative;">
                <span>${em}</span>
                ${!isUnlocked ? `<span style="position: absolute; bottom: -2px; right: -2px; font-size: 0.6rem; background: rgba(0,0,0,0.75); color: #fef08a; border-radius: 6px; padding: 1px 3px; line-height: 1;">🔒</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Section 2: Avatar Frames -->
      <div style="background: var(--color-bg-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
          <h4 style="margin: 0; font-size: 1rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
            <span>✨</span> <span>Рамка со спецэффектом</span>
          </h4>
          <span style="font-size: var(--font-size-xs); color: #d97706; font-weight: 700;">Цена: 100 ⭐</span>
        </div>
        <div class="frames-selection-grid">
          ${AVAILABLE_FRAMES.map(f => {
            const isUnlocked = f.id === 'frame-none' || unlockedFrames.includes(f.id);
            const isSelected = draft.avatarFrame === f.id;
            return `
              <div class="frame-choice-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked-frame-card' : ''}" data-frame-id="${f.id}" data-frame-name="${f.name}" data-frame-icon="${f.icon}" data-unlocked="${isUnlocked ? '1' : '0'}" style="position: relative;">
                <div style="font-size: 1.8rem; line-height: 1;">${f.icon}</div>
                <div class="frame-choice-label">${f.name}</div>
                <div style="font-size: 0.68rem; color: var(--color-text-muted);">${f.desc}</div>
                ${!isUnlocked ? `
                  <div style="margin-top: 4px; font-size: 0.68rem; font-weight: 800; color: #b45309; background: #fef3c7; border-radius: 6px; padding: 2px 6px; display: inline-block;">
                    🔒 100 ⭐
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Section 3: Funny & Secret Titles -->
      <div style="background: var(--color-bg-card); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
        <h4 style="margin: 0 0 var(--space-3) 0; font-size: 1rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
          <span>🏷️</span> <span>Выбор титула для курсов</span>
        </h4>

        ${(() => {
          const unlockedSecretTitles = (student.id ? store.getStudentGameProgress(student.id).unlockedSecretTitles : []) || [];
          if (unlockedSecretTitles.length > 0) {
            return `
              <div style="margin-bottom: var(--space-3); background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.2) 100%); border: 1.5px solid #f59e0b; padding: var(--space-3); border-radius: var(--radius-md);">
                <div style="font-size: 0.82rem; font-weight: 800; color: #b45309; display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                  <span>🏆</span> <span>Заработанные секретные титулы (Мини-игры):</span>
                </div>
                <div class="titles-selection-wrap">
                  ${unlockedSecretTitles.map(utName => {
                    const sec = SECRET_TITLES.find(s => s.text === utName) || { text: utName, icon: '🏆', desc: 'Секретный титул' };
                    const isSelected = draft.studentTitle.includes(sec.text);
                    return `
                      <button type="button" class="title-choice-chip ${isSelected ? 'selected' : ''}" data-title="${sec.icon} ${sec.text}" data-unlocked="1" style="border: 1.5px solid #f59e0b; background: ${isSelected ? '#f59e0b' : '#fffbeb'}; color: ${isSelected ? '#ffffff' : '#92400e'}; font-weight: 700;" title="${sec.desc}">
                        <span>${sec.icon}</span>
                        <span>${sec.text}</span>
                        <span style="font-size: 0.65rem; background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 10px; margin-left: 4px;">Секретный</span>
                      </button>
                    `;
                  }).join('')}
                </div>
                ${unlockedSecretTitles.length < SECRET_TITLES.length ? `
                  <div style="font-size: 0.72rem; color: #b45309; margin-top: 6px; display: flex; align-items: center; gap: 4px;">
                    <span>🔒</span> <span>Остальные секретные титулы станут доступны после выполнения условий в мини-играх (${unlockedSecretTitles.length} из ${SECRET_TITLES.length} открыто).</span>
                  </div>
                ` : ''}
              </div>
            `;
          } else {
            return `
              <div style="margin-bottom: var(--space-3); font-size: var(--font-size-xs); color: var(--color-text-muted); background: rgba(0,0,0,0.02); padding: 8px 12px; border-radius: var(--radius-md); border: 1px dashed var(--color-border); display: flex; align-items: center; gap: 6px;">
                <span>🔒</span> <span>Секретные титулы скрыты и открываются за победные серии и особые достижения в мини-играх!</span>
              </div>
            `;
          }
        })()}

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);">
          <span>Стандартные титулы:</span>
          <span style="color: #2563eb; font-weight: 700;">Цена: 150 ⭐</span>
        </div>

        <div class="titles-selection-wrap">
          <button type="button" class="title-choice-chip ${!draft.studentTitle ? 'selected' : ''}" data-title="" data-unlocked="1">
            <span>⚪ Без титула</span>
          </button>
          ${AVAILABLE_TITLES.map(t => {
            const isUnlocked = unlockedTitles.some(ut => ut.includes(t.text));
            const isSelected = draft.studentTitle.includes(t.text);
            return `
              <button type="button" class="title-choice-chip ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked-title-chip' : ''}" data-title="${t.icon} ${t.text}" data-title-name="${t.text}" data-title-icon="${t.icon}" data-unlocked="${isUnlocked ? '1' : '0'}">
                <span>${t.icon}</span>
                <span>${t.text}</span>
                ${!isUnlocked ? `<span style="font-size: 0.65rem; color: #b45309; background: #fef3c7; padding: 1px 5px; border-radius: 6px; font-weight: 800; margin-left: 4px;">🔒 150 ⭐</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-secondary" id="btn-cancel-customization">Отмена</button>
    <button type="button" class="btn btn-primary" id="btn-save-customization">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>Сохранить изменения</span>
    </button>
  `;

  modal.open({
    title: '🎨 Кастомизация профиля ученика',
    bodyHtml,
    footerHtml,
    onOpen: () => {
      const fileInput = document.getElementById('custom-avatar-file');
      const resetInitialsBtn = document.getElementById('btn-reset-avatar-initials');
      const cancelBtn = document.getElementById('btn-cancel-customization');
      const saveBtn = document.getElementById('btn-save-customization');

      function updatePreview() {
        const previewContainer = document.getElementById('custom-preview-container');
        if (previewContainer) {
          previewContainer.innerHTML = getPreviewHtml();
        }
      }

      const promptBuyItem = (type, itemId, itemName, price, icon) => {
        const currentBal = student.totalPoints || 0;
        if (currentBal < price) {
          toast.error(`Недостаточно баллов! Стоимость: ${price} ⭐. На вашем балансе: ${currentBal} ⭐. Зарабатывайте баллы на уроках и в мини-играх!`);
          return;
        }

        if (confirm(`Приобрести «${itemName}» за ${price} ⭐?\nВаш баланс: ${currentBal} ⭐. После покупки предмет станет навсегда открыт в профиле!`)) {
          const res = store.makePurchase(student.id, {
            type,
            id: itemId,
            name: itemName,
            price,
            icon,
            value: itemId,
            text: itemName
          });

          if (res.success) {
            toast.success(res.message);
            // Re-open with freshly updated student data
            const freshStudent = store.getStudentById(student.id);
            modal.close();
            openCustomizationModal(freshStudent, onSave);
            if (onSave) onSave(freshStudent);
          } else {
            toast.error(res.message);
          }
        }
      };

      // 1. File Upload handler
      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Instant local preview via FileReader
        const reader = new FileReader();
        reader.onload = (re) => {
          draft.avatarUrl = re.target.result;
          updatePreview();
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.file?.url) {
              draft.avatarUrl = data.file.url;
              updatePreview();
            }
          }
        } catch (err) {
          console.warn('Direct upload error, falling back to local data URL:', err);
        }
      });

      // 2. Reset to initials
      resetInitialsBtn?.addEventListener('click', () => {
        draft.avatarUrl = null;
        document.querySelectorAll('.emoji-preset-btn').forEach(b => b.classList.remove('selected'));
        updatePreview();
      });

      // 3. Emoji Presets click
      document.querySelectorAll('.emoji-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isUnlocked = btn.dataset.unlocked === '1';
          const emoji = btn.dataset.emoji;

          if (!isUnlocked) {
            promptBuyItem('avatar', emoji, `Эмодзи ${emoji}`, 50, emoji);
            return;
          }

          document.querySelectorAll('.emoji-preset-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          draft.avatarUrl = emoji;
          updatePreview();
        });
      });

      // 4. Frames Click
      document.querySelectorAll('.frame-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          const isUnlocked = card.dataset.unlocked === '1';
          const frameId = card.dataset.frameId;
          const frameName = card.dataset.frameName || 'Рамка';
          const frameIcon = card.dataset.frameIcon || '✨';

          if (!isUnlocked) {
            promptBuyItem('frame', frameId, `Рамка «${frameName}»`, 100, frameIcon);
            return;
          }

          document.querySelectorAll('.frame-choice-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          draft.avatarFrame = frameId;
          updatePreview();
        });
      });

      // 5. Titles Click
      document.querySelectorAll('.title-choice-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const isUnlocked = chip.dataset.unlocked === '1';
          const titleText = chip.dataset.title;
          const titleName = chip.dataset.titleName || titleText;
          const titleIcon = chip.dataset.titleIcon || '🏷️';

          if (!isUnlocked) {
            promptBuyItem('title', titleName, `Титул «${titleName}»`, 150, titleIcon);
            return;
          }

          document.querySelectorAll('.title-choice-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          draft.studentTitle = titleText;
          updatePreview();
        });
      });

      // Cancel
      cancelBtn?.addEventListener('click', () => modal.close());

      // Save
      saveBtn?.addEventListener('click', () => {
        const updated = store.updateStudentCustomization(student.id, {
          avatarUrl: draft.avatarUrl,
          avatarFrame: draft.avatarFrame,
          studentTitle: draft.studentTitle
        });

        toast.success('Профиль успешно обновлен! 🎨');
        modal.close();

        if (onSave && typeof onSave === 'function') {
          onSave(updated || student);
        }
      });
    }
  });
}
