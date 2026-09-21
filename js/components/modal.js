/**
 * Modal Dialog Controller for English Practice CRM & LMS
 * Utilizes native HTML5 <dialog> element for accessibility and clean backdrop.
 */

export const modal = {
  dialogEl: null,

  init() {
    this.dialogEl = document.getElementById('main-modal');
    if (!this.dialogEl) {
      this.dialogEl = document.createElement('dialog');
      this.dialogEl.id = 'main-modal';
      this.dialogEl.className = 'app-modal';
      document.body.appendChild(this.dialogEl);
    }

    // Track whether mousedown happened genuinely on the backdrop outside the dialog
    let isMouseDownOnBackdrop = false;

    this.dialogEl.addEventListener('mousedown', (e) => {
      // If mousedown was on any child element inside dialog, it's NOT on backdrop
      if (e.target !== this.dialogEl) {
        isMouseDownOnBackdrop = false;
        return;
      }
      const rect = this.dialogEl.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      isMouseDownOnBackdrop = !isInDialog;
    });

    // Close ONLY if BOTH mousedown and click (mouseup) started and completed on the backdrop,
    // and the user was NOT selecting text with the mouse.
    this.dialogEl.addEventListener('click', (e) => {
      // If text is currently selected anywhere (e.g. user dragged mouse across inputs), DO NOT close
      const selection = window.getSelection ? window.getSelection().toString() : '';
      if (selection && selection.trim().length > 0) {
        isMouseDownOnBackdrop = false;
        return;
      }

      if (!isMouseDownOnBackdrop) {
        return;
      }
      if (e.target !== this.dialogEl) {
        isMouseDownOnBackdrop = false;
        return;
      }
      const rect = this.dialogEl.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        this.close();
      }
      isMouseDownOnBackdrop = false;
    });

    // Reset backdrop tracking flag on global mouseup so aborted drags never leave it true
    window.addEventListener('mouseup', () => {
      setTimeout(() => {
        isMouseDownOnBackdrop = false;
      }, 50);
    });

    // Ensure body scroll is restored on close (including ESC key)
    this.dialogEl.addEventListener('close', () => {
      document.body.style.overflow = '';
      const pv = document.getElementById('vocab-preview-dialog');
      if (pv) {
        if (pv.open) pv.close();
        pv.remove();
      }
      document.getElementById('vocab-preview-modal-overlay')?.remove();
    });
  },

  open({ title, bodyHtml, footerHtml = '', onOpen = null }) {
    if (!this.dialogEl) this.init();

    this.dialogEl.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button type="button" class="btn btn-ghost btn-icon" id="modal-close-btn" aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        ${bodyHtml}
      </div>
      ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
    `;

    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.close());

    if (!this.dialogEl.open) {
      document.body.style.overflow = 'hidden';
      this.dialogEl.showModal();
    }

    if (onOpen) {
      setTimeout(onOpen, 20);
    }
  },

  close() {
    const pv = document.getElementById('vocab-preview-dialog');
    if (pv) {
      if (pv.open) pv.close();
      pv.remove();
    }
    if (this.dialogEl && this.dialogEl.open) {
      this.dialogEl.close();
      document.body.style.overflow = '';
    }
  }
};
