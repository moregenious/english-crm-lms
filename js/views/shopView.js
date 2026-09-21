/**
 * School Shop View (Магазин бонусов) - Step into the Future
 * Supports:
 * 1. Profile Customization (Avatars for 50 pts, Frames for 100 pts, Titles for 150 pts)
 * 2. Staff School Merchandise with Admin Management & Photo Uploads
 * 3. Purchase History for Students & Order Cancellation / Refund without penalties for Teachers and Admins
 */

import { store } from '../store.js';
import { auth } from '../auth.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { PRESET_EMOJIS, AVAILABLE_FRAMES, AVAILABLE_TITLES, SECRET_TITLES, renderStudentAvatarHtml } from '../components/avatarCustomization.js';

export const ShopView = {
  activeTab: 'customization', // 'customization' | 'staff' | 'purchases'
  subCustomTab: 'avatars',    // 'avatars' | 'frames' | 'titles'
  filterStudent: 'all',

  getActiveStudent() {
    if (auth.isStudent()) {
      const sId = auth.currentStudentId || auth.getCurrentUser()?.id;
      return store.getStudentById(sId) || store.getStudents()[0];
    }
    // For admin or teacher testing, pick first student
    const students = store.getStudents();
    return students[0] || null;
  },

  render(container) {
    const isStudent = auth.isStudent();
    const isTeacher = auth.isTeacher();
    const isAdmin = auth.isAdmin();
    const currentUser = auth.getCurrentUser();
    const student = this.getActiveStudent();

    const spendableBalance = student?.totalPoints || 0;
    const lifetimeBalance = student?.lifetimePoints || spendableBalance;

    container.innerHTML = `
      <div class="shop-view-container" style="max-width: 1200px; margin: 0 auto;">
        <!-- Header Banner -->
        <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: #ffffff; border: none; box-shadow: var(--shadow-lg); padding: var(--space-5); margin-bottom: var(--space-5); border-radius: var(--radius-xl);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 2.2rem;">🛍️</span>
                <div>
                  <h1 style="margin: 0; font-size: 1.5rem; color: #ffffff; font-weight: 800; letter-spacing: -0.5px;">
                    Школьный магазин бонусов (Shop)
                  </h1>
                  <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #c7d2fe;">
                    Обменивай заработанные баллы на уникальные эмодзи-аватары, рамки профиля, титулы и школьный мерч!
                  </p>
                </div>
              </div>
            </div>

            ${isStudent ? `
              <!-- Student Balance Info Box -->
              <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <div style="background: rgba(255, 255, 255, 0.12); padding: 10px 18px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.2); text-align: right;">
                  <div style="font-size: 0.72rem; color: #c7d2fe; font-weight: 600;">Баланс для покупок:</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: #fef08a;">
                    ⭐ ${spendableBalance} <span style="font-size: 0.85rem; font-weight: 600;">баллов</span>
                  </div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.08); padding: 10px 18px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.15); text-align: right;">
                  <div style="font-size: 0.72rem; color: #e0e7ff; font-weight: 600;">Заработанно за всё время:</div>
                  <div style="font-size: 1.4rem; font-weight: 800; color: #67e8f9;">
                    🏆 ${lifetimeBalance} <span style="font-size: 0.85rem; font-weight: 600;">баллов</span>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Teacher/Admin Mode Badge -->
              <div style="background: rgba(255, 255, 255, 0.15); padding: 8px 16px; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.25); display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2rem;">👨‍🏫</span>
                <div style="font-size: 0.82rem; font-weight: 700; color: #fef08a;">
                  Панель преподавателя / Администратора: просмотр каталога, настройка Staff и отмена покупок
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Main Navigation Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: var(--space-4); border-bottom: 2px solid var(--color-border); padding-bottom: 8px; flex-wrap: wrap;">
          <button type="button" class="btn ${this.activeTab === 'customization' ? 'btn-primary' : 'btn-ghost'} shop-main-tab" data-tab="customization" style="font-weight: 700; font-size: 0.95rem;">
            <span>🎨 Кастомизация профиля</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'staff' ? 'btn-primary' : 'btn-ghost'} shop-main-tab" data-tab="staff" style="font-weight: 700; font-size: 0.95rem;">
            <span>🎒 Staff (Мерч и товары)</span>
          </button>
          <button type="button" class="btn ${this.activeTab === 'purchases' ? 'btn-primary' : 'btn-ghost'} shop-main-tab" data-tab="purchases" style="font-weight: 700; font-size: 0.95rem;">
            <span>📜 ${isStudent ? 'Мои покупки' : 'Покупки учеников и возвраты'}</span>
          </button>
        </div>

        <!-- Tab Content Area -->
        <div id="shop-tab-content">
          ${this.renderActiveTabContent(student, isStudent, isTeacher, isAdmin)}
        </div>
      </div>
    `;

    this.bindEvents(container, student, isStudent, isTeacher, isAdmin);
  },

  renderActiveTabContent(student, isStudent, isTeacher, isAdmin) {
    if (this.activeTab === 'customization') {
      return this.renderCustomizationTab(student, isStudent);
    } else if (this.activeTab === 'staff') {
      return this.renderStaffTab(student, isStudent, isAdmin, isTeacher);
    } else if (this.activeTab === 'purchases') {
      return this.renderPurchasesTab(student, isStudent, isTeacher, isAdmin);
    }
    return '';
  },

  // -------------------------------------------------------------
  // TAB 1: CUSTOMIZATION (Avatars, Frames, Titles)
  // -------------------------------------------------------------
  renderCustomizationTab(student, isStudent) {
    const currentPoints = student?.totalPoints || 0;
    const unlockedAvatars = Array.isArray(student?.unlockedAvatars) ? student.unlockedAvatars : (student?.avatarUrl ? [student.avatarUrl] : []);
    const unlockedFrames = Array.isArray(student?.unlockedFrames) ? student.unlockedFrames : ['frame-none', ...(student?.avatarFrame && student.avatarFrame !== 'frame-none' ? [student.avatarFrame] : [])];
    const unlockedTitles = Array.isArray(student?.unlockedTitles) ? student.unlockedTitles : (student?.studentTitle ? [student.studentTitle] : []);

    return `
      <div>
        <!-- Sub-tabs for customization items -->
        <div style="display: flex; gap: 8px; margin-bottom: var(--space-4); flex-wrap: wrap; align-items: center;">
          <button type="button" class="btn btn-sm ${this.subCustomTab === 'avatars' ? 'btn-primary' : 'btn-secondary'} sub-custom-tab" data-sub="avatars" style="font-weight: 700;">
            <span>🐱 Эмодзи-аватары (50 ⭐)</span>
          </button>
          <button type="button" class="btn btn-sm ${this.subCustomTab === 'frames' ? 'btn-primary' : 'btn-secondary'} sub-custom-tab" data-sub="frames" style="font-weight: 700;">
            <span>🖼️ Рамки профиля (100 ⭐)</span>
          </button>
          <button type="button" class="btn btn-sm ${this.subCustomTab === 'titles' ? 'btn-primary' : 'btn-secondary'} sub-custom-tab" data-sub="titles" style="font-weight: 700;">
            <span>👑 Титулы (150 ⭐)</span>
          </button>

          <div style="margin-left: auto; font-size: var(--font-size-xs); color: var(--color-text-muted);">
            Приобретенные предметы навсегда сохраняются в вашем профиле!
          </div>
        </div>

        ${this.subCustomTab === 'avatars' ? `
          <!-- Avatars Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-3);">
            ${PRESET_EMOJIS.map(em => {
              const isUnlocked = unlockedAvatars.includes(em);
              const isEquipped = student?.avatarUrl === em;
              return `
                <div class="card" style="padding: var(--space-3); text-align: center; border: 1.5px solid ${isEquipped ? '#4f46e5' : isUnlocked ? '#22c55e' : 'var(--color-border)'}; border-radius: var(--radius-lg); background: ${isEquipped ? 'rgba(79, 70, 229, 0.05)' : 'var(--color-bg-card)'}; display: flex; flex-direction: column; justify-content: space-between;">
                  <div style="font-size: 2.6rem; margin-bottom: 6px; line-height: 1;">${em}</div>
                  <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 6px;">
                    ${isEquipped ? '<span style="color:#4f46e5;">✓ Надето</span>' : isUnlocked ? '<span style="color:#16a34a;">✓ В коллекции</span>' : '<span style="color:#b45309;">50 ⭐</span>'}
                  </div>
                  ${isEquipped ? `
                    <button type="button" class="btn btn-xs btn-ghost" disabled style="opacity: 0.8; font-weight: 700;">Активен</button>
                  ` : isUnlocked ? `
                    <button type="button" class="btn btn-xs btn-outline btn-equip-custom" data-type="avatar" data-id="${em}" style="font-weight: 700;">Надеть</button>
                  ` : `
                    <button type="button" class="btn btn-xs btn-primary btn-buy-custom" data-type="avatar" data-id="${em}" data-name="Эмодзи ${em}" data-price="50" data-icon="${em}" style="font-weight: 700;">
                      Купить (50 ⭐)
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        ` : this.subCustomTab === 'frames' ? `
          <!-- Frames Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-4);">
            ${AVAILABLE_FRAMES.map(f => {
              const isFree = f.id === 'frame-none';
              const isUnlocked = isFree || unlockedFrames.includes(f.id);
              const isEquipped = student?.avatarFrame === f.id;
              return `
                <div class="card" style="padding: var(--space-4); border: 2px solid ${isEquipped ? '#4f46e5' : isUnlocked ? '#22c55e' : 'var(--color-border)'}; border-radius: var(--radius-xl); background: var(--color-bg-card); display: flex; flex-direction: column; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="font-size: 2.2rem; line-height: 1;">${f.icon}</div>
                    <div>
                      <div style="font-weight: 800; font-size: 1rem; color: var(--color-text-main);">${f.name}</div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted);">${f.desc}</div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--color-border-subtle);">
                    <div style="font-size: 0.8rem; font-weight: 800;">
                      ${isFree ? '<span style="color:#10b981;">Бесплатно</span>' : isEquipped ? '<span style="color:#4f46e5;">✓ Надето</span>' : isUnlocked ? '<span style="color:#16a34a;">✓ Открыто</span>' : '<span style="color:#b45309;">100 ⭐</span>'}
                    </div>
                    ${isEquipped ? `
                      <button type="button" class="btn btn-xs btn-ghost" disabled style="font-weight: 700;">Активна</button>
                    ` : isUnlocked ? `
                      <button type="button" class="btn btn-xs btn-outline btn-equip-custom" data-type="frame" data-id="${f.id}" style="font-weight: 700;">Надеть</button>
                    ` : `
                      <button type="button" class="btn btn-xs btn-primary btn-buy-custom" data-type="frame" data-id="${f.id}" data-name="${f.name}" data-price="100" data-icon="${f.icon}" style="font-weight: 700;">
                        Купить (100 ⭐)
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <!-- Titles Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-3);">
            ${AVAILABLE_TITLES.map(t => {
              const fullTitle = `${t.icon} ${t.text}`;
              const isUnlocked = unlockedTitles.some(ut => ut.includes(t.text));
              const isEquipped = student?.studentTitle?.includes(t.text);
              return `
                <div class="card" style="padding: var(--space-4); border: 1.5px solid ${isEquipped ? '#4f46e5' : isUnlocked ? '#22c55e' : 'var(--color-border)'}; border-radius: var(--radius-lg); background: var(--color-bg-card); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                  <div>
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
                      <span>${t.icon}</span> <span>${t.text}</span>
                    </div>
                    <div style="font-size: 0.72rem; margin-top: 2px;">
                      ${isEquipped ? '<span style="color:#4f46e5; font-weight:700;">✓ Выбран</span>' : isUnlocked ? '<span style="color:#16a34a; font-weight:700;">✓ В коллекции</span>' : '<span style="color:#b45309; font-weight:700;">150 ⭐</span>'}
                    </div>
                  </div>
                  ${isEquipped ? `
                    <button type="button" class="btn btn-xs btn-ghost" disabled style="font-weight: 700;">Активен</button>
                  ` : isUnlocked ? `
                    <button type="button" class="btn btn-xs btn-outline btn-equip-custom" data-type="title" data-id="${fullTitle}" style="font-weight: 700;">Выбрать</button>
                  ` : `
                    <button type="button" class="btn btn-xs btn-primary btn-buy-custom" data-type="title" data-id="${t.text}" data-name="${t.text}" data-price="150" data-icon="${t.icon}" style="font-weight: 700; white-space: nowrap;">
                      Купить (150 ⭐)
                    </button>
                  `}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Secret Titles Information Box -->
          <div style="margin-top: var(--space-5); background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%); border: 1.5px solid #f59e0b; padding: var(--space-4); border-radius: var(--radius-xl);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.8rem;">🔒</span>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #b45309;">
                  Секретные титулы не продаются за баллы!
                </div>
                <div style="font-size: 0.8rem; color: #92400e; margin-top: 2px;">
                  12 секретных титулов можно открыть только за победные серии (3 победы 10/10 подряд) и особые достижения в 9 интерактивных мини-играх. Проверяйте свои силы в разделе «🎮 Мини-игры»!
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  },

  // -------------------------------------------------------------
  // TAB 2: STAFF (School Merchandise & Physical Goods)
  // -------------------------------------------------------------
  renderStaffTab(student, isStudent, isAdmin, isTeacher) {
    const items = store.getShopItems();

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-text-main);">
              🎒 Школьные товары, мерч и сертификаты (Staff)
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              Реальные сувениры и полезные подарки от школы за учебные достижения
            </p>
          </div>

          ${isAdmin ? `
            <button type="button" class="btn btn-primary" id="btn-add-staff-item" style="font-weight: 700;">
              ➕ Добавить товар Staff
            </button>
          ` : ''}
        </div>

        ${items.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🎒</div>
            <div class="empty-state-title">Товары пока не добавлены</div>
            <div class="empty-state-desc">Администратор скоро пополнит ассортимент школьных сувениров и мерча.</div>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-5);">
            ${items.map(item => `
              <div class="card" style="padding: 0; overflow: hidden; border: 1.5px solid var(--color-border); border-radius: var(--radius-xl); display: flex; flex-direction: column; justify-content: space-between; background: var(--color-bg-card); box-shadow: var(--shadow-sm);">
                <div style="width: 100%; height: 180px; background: #f1f5f9; overflow: hidden; position: relative;">
                  <img src="${item.photoUrl}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'" />
                  <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.75); color: #fef08a; padding: 4px 10px; border-radius: var(--radius-full); font-weight: 800; font-size: 0.85rem; backdrop-filter: blur(4px);">
                    ⭐ ${item.price} баллов
                  </div>
                </div>

                <div style="padding: var(--space-4); display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; font-weight: 800; color: var(--color-text-main);">${item.name}</h4>
                    <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.4;">${item.description || 'Школьный сувенир Step into the Future'}</p>
                  </div>

                  <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--color-border-subtle); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    ${isStudent ? `
                      <button type="button" class="btn btn-primary btn-order-staff" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-photo="${item.photoUrl}" style="width: 100%; font-weight: 700;">
                        Заказать за ${item.price} ⭐
                      </button>
                    ` : `
                      <div style="display: flex; gap: 6px; width: 100%;">
                        ${isAdmin ? `
                          <button type="button" class="btn btn-secondary btn-sm btn-edit-staff" data-id="${item.id}" style="flex: 1; font-weight: 700;">
                            ✏️ Изменить
                          </button>
                          <button type="button" class="btn btn-ghost btn-sm btn-delete-staff" data-id="${item.id}" style="color: var(--color-danger);" title="Удалить товар">
                            🗑️
                          </button>
                        ` : `
                          <span style="font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600;">Доступно для заказа учениками</span>
                        `}
                      </div>
                    `}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  // -------------------------------------------------------------
  // TAB 3: PURCHASES & REFUNDING
  // -------------------------------------------------------------
  renderPurchasesTab(student, isStudent, isTeacher, isAdmin) {
    const filter = isStudent ? { studentId: student?.id } : {};
    const purchases = store.getPurchases(filter);

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-text-main);">
              📜 ${isStudent ? 'История моих покупок' : 'Все покупки учеников и управление заказами'}
            </h3>
            <p style="margin: 2px 0 0 0; font-size: var(--font-size-xs); color: var(--color-text-muted);">
              ${isStudent ? 'Отслеживайте, на что были потрачены баллы' : 'Учителя и администраторы могут отменять покупки без штрафов с мгновенным возвратом баллов ученику'}
            </p>
          </div>
        </div>

        ${purchases.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">🛍️</div>
            <div class="empty-state-title">Покупок пока нет</div>
            <div class="empty-state-desc">Здесь будут отображаться все совершенные покупки и заказы мерча.</div>
          </div>
        ` : `
          <div class="card" style="padding: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-xl);">
            <div style="overflow-x: auto;">
              <table class="table" style="margin: 0; width: 100%;">
                <thead>
                  <tr style="background: var(--color-bg-app); border-bottom: 1.5px solid var(--color-border);">
                    ${!isStudent ? '<th style="padding: 12px 16px;">Ученик</th>' : ''}
                    <th style="padding: 12px 16px;">Товар / Предмет</th>
                    <th style="padding: 12px 16px;">Категория</th>
                    <th style="padding: 12px 16px;">Стоимость</th>
                    <th style="padding: 12px 16px;">Дата покупки</th>
                    <th style="padding: 12px 16px;">Статус</th>
                    ${(!isStudent) ? '<th style="padding: 12px 16px; text-align: right;">Действия</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${purchases.map(p => {
                    const isCancelled = p.status === 'cancelled';
                    const typeLabel = {
                      avatar: 'Эмодзи-аватар',
                      frame: 'Рамка профиля',
                      title: 'Титул',
                      staff: 'Школьный товар'
                    }[p.type] || p.type;

                    return `
                      <tr style="${isCancelled ? 'opacity: 0.6; background: rgba(0,0,0,0.02);' : ''}">
                        ${!isStudent ? `
                          <td style="padding: 12px 16px; font-weight: 700; color: var(--color-text-main);">
                            <div>${p.studentName}</div>
                            <div style="font-size: 0.72rem; color: var(--color-text-muted);">${p.groupName || 'Группа'}</div>
                          </td>
                        ` : ''}
                        <td style="padding: 12px 16px;">
                          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700;">
                            <span style="font-size: 1.3rem;">${p.itemIcon || '🛍️'}</span>
                            <span>${p.itemName}</span>
                          </div>
                        </td>
                        <td style="padding: 12px 16px; font-size: var(--font-size-xs); color: var(--color-text-muted);">
                          ${typeLabel}
                        </td>
                        <td style="padding: 12px 16px; font-weight: 800; color: ${isCancelled ? 'var(--color-text-muted)' : '#d97706'};">
                          ⭐ ${p.price}
                        </td>
                        <td style="padding: 12px 16px; font-size: var(--font-size-xs); color: var(--color-text-secondary);">
                          ${new Date(p.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style="padding: 12px 16px;">
                          ${isCancelled ? `
                            <span class="badge badge-cancelled" style="font-size: 0.75rem;">
                              ✕ Отменено (${p.cancelledBy || 'Учитель'})
                            </span>
                          ` : `
                            <span class="badge badge-completed" style="font-size: 0.75rem;">
                              ✓ Куплено
                            </span>
                          `}
                        </td>
                        ${(!isStudent) ? `
                          <td style="padding: 12px 16px; text-align: right;">
                            ${!isCancelled ? `
                              <button type="button" class="btn btn-xs btn-outline btn-cancel-purchase" data-id="${p.id}" data-name="${p.itemName}" data-student="${p.studentName}" data-price="${p.price}" style="color: var(--color-danger); border-color: var(--color-danger); font-weight: 700;">
                                ❌ Отменить покупку
                              </button>
                            ` : `
                              <span style="font-size: 0.75rem; color: var(--color-text-muted);">Баллы возвращены</span>
                            `}
                          </td>
                        ` : ''}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    `;
  },

  // -------------------------------------------------------------
  // EVENT BINDINGS & MODALS
  // -------------------------------------------------------------
  bindEvents(container, student, isStudent, isTeacher, isAdmin) {
    // 1. Main Tab Switching
    container.querySelectorAll('.shop-main-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this.render(container);
      });
    });

    // 2. Sub-tab Switching for Customization
    container.querySelectorAll('.sub-custom-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.subCustomTab = btn.dataset.sub;
        this.render(container);
      });
    });

    // 3. Buying Customization Item
    container.querySelectorAll('.btn-buy-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!student) return;
        const type = btn.dataset.type;
        const itemId = btn.dataset.id;
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);
        const icon = btn.dataset.icon;

        const currentBal = student.totalPoints || 0;
        if (currentBal < price) {
          toast.error(`Недостаточно баллов! Стоимость: ${price} ⭐, а на вашем балансе: ${currentBal} ⭐. Зарабатывайте баллы на уроках и в мини-играх!`);
          return;
        }

        if (confirm(`Приобрести «${name}» за ${price} ⭐?
После покупки предмет навсегда станет доступен в вашем профиле!`)) {
          const res = store.makePurchase(student.id, {
            type,
            id: itemId,
            name,
            price,
            icon,
            value: itemId,
            text: name
          });

          if (res.success) {
            toast.success(res.message);
            // Also offer to equip immediately
            if (confirm(`Предмет куплен! Хотите надеть «${name}» прямо сейчас?`)) {
              if (type === 'avatar') store.updateStudentCustomization(student.id, { avatarUrl: itemId });
              else if (type === 'frame') store.updateStudentCustomization(student.id, { avatarFrame: itemId });
              else if (type === 'title') store.updateStudentCustomization(student.id, { studentTitle: `${icon} ${name}` });
              toast.success('Предмет установлен в профиле! ✨');
            }
            this.render(container);
          } else {
            toast.error(res.message);
          }
        }
      });
    });

    // 4. Equip Customization Item
    container.querySelectorAll('.btn-equip-custom').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!student) return;
        const type = btn.dataset.type;
        const itemId = btn.dataset.id;

        if (type === 'avatar') {
          store.updateStudentCustomization(student.id, { avatarUrl: itemId });
          toast.success(`Аватар ${itemId} надет!`);
        } else if (type === 'frame') {
          store.updateStudentCustomization(student.id, { avatarFrame: itemId });
          toast.success('Рамка профиля обновлена!');
        } else if (type === 'title') {
          store.updateStudentCustomization(student.id, { studentTitle: itemId });
          toast.success('Титул установлен!');
        }
        this.render(container);
      });
    });

    // 5. Order Staff Merchandise Item
    container.querySelectorAll('.btn-order-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!student) return;
        const itemId = btn.dataset.id;
        const name = btn.dataset.name;
        const price = Number(btn.dataset.price);
        const photo = btn.dataset.photo;

        const currentBal = student.totalPoints || 0;
        if (currentBal < price) {
          toast.error(`Недостаточно баллов! Стоимость: ${price} ⭐. На балансе: ${currentBal} ⭐.`);
          return;
        }

        if (confirm(`Оформить заказ на «${name}» за ${price} ⭐?
Баллы спишутся с баланса, а учитель и администрация увидят ваш заказ.`)) {
          const res = store.makePurchase(student.id, {
            type: 'staff',
            id: itemId,
            name,
            price,
            photoUrl: photo,
            icon: '🎒'
          });

          if (res.success) {
            toast.success(`Заказ на «${name}» успешно оформлен! 🎉`);
            this.render(container);
          } else {
            toast.error(res.message);
          }
        }
      });
    });

    // 6. Admin Add Staff Item
    container.querySelector('#btn-add-staff-item')?.addEventListener('click', () => {
      this.openStaffModal(container);
    });

    // 7. Admin Edit Staff Item
    container.querySelectorAll('.btn-edit-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = store.getShopItemById(id);
        if (item) {
          this.openStaffModal(container, item);
        }
      });
    });

    // 8. Admin Delete Staff Item
    container.querySelectorAll('.btn-delete-staff').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (confirm('Вы уверены, что хотите удалить этот товар из магазина Staff?')) {
          store.deleteShopItem(id);
          toast.success('Товар удален из каталога');
          this.render(container);
        }
      });
    });

    // 9. Cancel Purchase (Teachers & Admin)
    container.querySelectorAll('.btn-cancel-purchase').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const studentName = btn.dataset.student;
        const price = btn.dataset.price;

        const cancelledByName = isTeacher ? (auth.getCurrentUser()?.name || 'Преподаватель') : 'Администратор';

        if (confirm(`Отменить покупку «${name}» ученика ${studentName}?
Баллы (${price} ⭐) будут БЕЗ ШТРАФА возвращены на баланс ученика, а предмет снят/заблокирован.`)) {
          const res = store.cancelPurchase(id, cancelledByName);
          if (res.success) {
            toast.success(res.message);
            this.render(container);
          } else {
            toast.error(res.message);
          }
        }
      });
    });
  },

  // -------------------------------------------------------------
  // MODAL: ADD / EDIT STAFF ITEM
  // -------------------------------------------------------------
  // MODAL: ADD / EDIT STAFF ITEM (DIRECT COMPUTER PHOTO UPLOAD)
  // -------------------------------------------------------------
  openStaffModal(container, existingItem = null) {
    const isEdit = !!existingItem;

    let photoUrl = existingItem?.photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

    const bodyHtml = `
      <form id="form-staff-item">
        <div class="form-group">
          <label class="form-label">Название товара / подарка <span class="required">*</span></label>
          <input type="text" name="name" class="form-control" value="${existingItem?.name || ''}" placeholder="например, Фирменная кружка Step into the future" required />
        </div>

        <div class="form-group">
          <label class="form-label">Стоимость в баллах (⭐) <span class="required">*</span></label>
          <input type="number" name="price" class="form-control" value="${existingItem?.price || 200}" min="1" required />
        </div>

        <div class="form-group">
          <label class="form-label">Описание товара</label>
          <textarea name="description" class="form-control" rows="3" placeholder="Укажите размер, цвет, детали или свойства товара">${existingItem?.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Фотография товара (загрузка с компьютера)</label>
          <div style="display: flex; gap: 14px; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap;">
            <!-- Live Preview -->
            <div style="width: 95px; height: 95px; border-radius: var(--radius-lg); overflow: hidden; background: #f8fafc; border: 2px solid var(--color-border); flex-shrink: 0; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center;">
              <img id="staff-modal-preview" src="${photoUrl}" alt="Предпросмотр" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'" />
            </div>

            <!-- Upload Dropzone & Controls -->
            <div style="flex: 1; min-width: 230px;">
              <!-- Native Label Dropzone (clicking anywhere natively opens file dialog) -->
              <label for="staff-photo-file" id="staff-photo-dropzone" style="display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed var(--color-primary-400); border-radius: var(--radius-lg); padding: 14px 12px; text-align: center; cursor: pointer; background: var(--color-bg-app); transition: all 0.2s ease; user-select: none;">
                <div id="staff-dropzone-content">
                  <div style="font-size: 1.6rem; margin-bottom: 4px;">📷</div>
                  <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-primary-700);">
                    Нажмите для выбора фото с компьютера
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    или перетащите картинку сюда (PNG, JPG, WEBP, GIF)
                  </div>
                  <div style="margin-top: 8px;">
                    <span class="btn btn-sm btn-primary" style="font-size: 0.78rem; pointer-events: none; padding: 4px 14px; font-weight: 700;">
                      📁 Выбрать фото с компьютера
                    </span>
                  </div>
                </div>
                <input type="file" id="staff-photo-file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/*" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; opacity: 0;" />
              </label>

              <div id="staff-photo-status" style="font-size: var(--font-size-xs); color: var(--color-success); font-weight: 700; margin-top: 8px; display: none; padding: 4px 8px; background: rgba(34, 197, 94, 0.1); border-radius: var(--radius-sm); border: 1px solid rgba(34, 197, 94, 0.25);">
                ✓ Фото успешно выбрано и загружено
              </div>

              <!-- Collapsible option for internet links -->
              <div style="margin-top: 8px;">
                <a href="javascript:void(0)" id="btn-toggle-photo-url" style="font-size: 0.75rem; color: var(--color-text-muted); text-decoration: underline;">
                  🔗 Или вставить ссылку из интернета
                </a>
                <div id="staff-photo-url-wrap" style="display: none; margin-top: 6px;">
                  <input type="text" id="staff-photo-url" class="form-control form-control-sm" placeholder="например, https://example.com/photo.jpg" value="${photoUrl.startsWith('http') ? photoUrl : ''}" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button type="button" class="btn btn-secondary" onclick="document.getElementById('main-modal').close()">Отмена</button>
      <button type="submit" form="form-staff-item" id="btn-save-staff-item" class="btn btn-primary" style="font-weight: 700;">
        ${isEdit ? 'Сохранить изменения' : 'Добавить в магазин'}
      </button>
    `;

    modal.open({
      title: isEdit ? '✏️ Редактировать товар Staff' : '➕ Добавить товар Staff в магазин',
      bodyHtml,
      footerHtml,
      onOpen: () => {
        const fileInput = document.getElementById('staff-photo-file');
        const dropzone = document.getElementById('staff-photo-dropzone');
        const dropContent = document.getElementById('staff-dropzone-content');
        const urlInput = document.getElementById('staff-photo-url');
        const previewImg = document.getElementById('staff-modal-preview');
        const statusEl = document.getElementById('staff-photo-status');
        const toggleLink = document.getElementById('btn-toggle-photo-url');
        const urlWrap = document.getElementById('staff-photo-url-wrap');
        const submitBtn = document.getElementById('btn-save-staff-item');

        // Toggle internet link input
        toggleLink?.addEventListener('click', (e) => {
          e.preventDefault();
          if (urlWrap) {
            const isHidden = urlWrap.style.display === 'none';
            urlWrap.style.display = isHidden ? 'block' : 'none';
            if (isHidden && urlInput) urlInput.focus();
          }
        });

        // External link manual input
        urlInput?.addEventListener('input', () => {
          const val = urlInput.value.trim();
          if (val) {
            photoUrl = val;
            if (previewImg) previewImg.src = photoUrl;
            if (statusEl) {
              statusEl.style.display = 'block';
              statusEl.textContent = '✓ Ссылка на фото указана вручную';
            }
          }
        });

        // Always reset fileInput on click so picking same file re-triggers change event
        fileInput?.addEventListener('click', () => {
          fileInput.value = '';
        });

        // Core upload handler from device
        const handleFile = async (file) => {
          if (!file) return;

          // 1. Instant local preview via FileReader
          const reader = new FileReader();
          reader.onload = (re) => {
            photoUrl = re.target.result;
            if (previewImg) previewImg.src = photoUrl;
          };
          reader.readAsDataURL(file);

          // Update Dropzone visual feedback immediately
          const sizeKb = Math.round((file.size || 0) / 1024);
          if (dropContent) {
            dropContent.innerHTML = `
              <div style="font-size: 1.5rem; margin-bottom: 2px;">✅</div>
              <div style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-success);">
                Выбрано: «${file.name}»
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                Размер: ${sizeKb} КБ • Нажмите, чтобы выбрать другое фото
              </div>
            `;
          }
          if (dropzone) {
            dropzone.style.borderColor = 'var(--color-success)';
            dropzone.style.background = 'rgba(34, 197, 94, 0.08)';
          }

          if (statusEl) {
            statusEl.style.display = 'block';
            statusEl.textContent = `⏳ Сохранение фото «${file.name}»...`;
          }

          // 2. Upload file directly to backend server
          try {
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = '⏳ Загрузка фото...';
            }

            const uploaded = await store.uploadFileToServer(file, 'staff');
            if (uploaded && uploaded.url) {
              photoUrl = uploaded.url;
              if (previewImg) previewImg.src = photoUrl;
              if (urlInput) urlInput.value = photoUrl;
            }

            if (statusEl) {
              statusEl.style.display = 'block';
              statusEl.textContent = `✓ Фото «${file.name}» (${sizeKb} КБ) успешно загружено на сайт!`;
            }
            toast.success(`Фото «${file.name}» готово к сохранению! 📸`);
          } catch (err) {
            console.warn('Staff photo upload warning:', err);
            if (statusEl) {
              statusEl.style.display = 'block';
              statusEl.textContent = `✓ Фото «${file.name}» сохранено локально`;
            }
            toast.info(`Фото «${file.name}» готово!`);
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = isEdit ? 'Сохранить изменения' : 'Добавить в магазин';
            }
          }
        };

        // Drag and Drop support on dropzone
        dropzone?.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = 'rgba(99, 102, 241, 0.12)';
          dropzone.style.borderColor = 'var(--color-primary-600)';
        });

        dropzone?.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.style.background = photoUrl.startsWith('data:') || photoUrl.startsWith('/uploads/') ? 'rgba(34, 197, 94, 0.08)' : 'var(--color-bg-app)';
          dropzone.style.borderColor = photoUrl.startsWith('data:') || photoUrl.startsWith('/uploads/') ? 'var(--color-success)' : 'var(--color-primary-400)';
        });

        dropzone?.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = e.dataTransfer?.files;
          if (files && files[0]) {
            handleFile(files[0]);
          }
        });

        // File input change handler
        fileInput?.addEventListener('change', (e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFile(file);
          }
        });

        // Form Submit
        const formEl = document.getElementById('form-staff-item');
        formEl?.addEventListener('submit', (e) => {
          e.preventDefault();
          const formData = new FormData(formEl);

          const finalPhoto = photoUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

          const itemData = {
            name: (formData.get('name') || '').trim(),
            price: Math.max(1, Number(formData.get('price')) || 100),
            description: (formData.get('description') || '').trim(),
            photoUrl: finalPhoto
          };

          if (isEdit) {
            store.updateShopItem(existingItem.id, itemData);
            toast.success('Товар Staff успешно обновлен! ✨');
          } else {
            store.addShopItem(itemData);
            toast.success('Новый товар добавлен в магазин Staff! 🎒');
          }

          modal.close();
          this.render(container);
        });

        // Backup submit trigger for footer button across all browsers
        submitBtn?.addEventListener('click', () => {
          if (formEl) {
            if (typeof formEl.requestSubmit === 'function') {
              formEl.requestSubmit();
            } else {
              formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }
        });
      }
    });
  }
};
