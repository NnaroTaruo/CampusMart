// === ADMIN DASHBOARD JS ===
// Keeps admin profile modal UX consistent and separated from markup.
document.addEventListener('DOMContentLoaded', function () {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;

    const profileTriggers = document.querySelectorAll('.profile-trigger');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    const changeProfilePicBtn = document.getElementById('changeProfilePicBtn');
    const profilePicInput = document.getElementById('profilePicInput');
    const modalPicPreview = document.getElementById('modalPicPreview');

    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarName = document.getElementById('sidebarName');
    const profileNameInput = document.getElementById('profileNameInput');

    function openProfileModal() {
        profileModal.style.display = 'flex';
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProfileEditor() {
        profileModal.style.display = 'none';
        profileModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    profileTriggers.forEach(trigger => {
        trigger.addEventListener('click', openProfileModal);
    });

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', closeProfileEditor);
    }

    // Close when clicking outside the modal card.
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) closeProfileEditor();
    });

    // Escape key closes the modal.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            closeProfileEditor();
        }
    });

    // "Change Picture" button opens the hidden file input.
    if (changeProfilePicBtn && profilePicInput) {
        changeProfilePicBtn.addEventListener('click', () => profilePicInput.click());
    }

    // Image preview for the profile picture.
    if (profilePicInput && modalPicPreview) {
        profilePicInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    modalPicPreview.src = e.target.result;
                    modalPicPreview.hidden = false;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Save profile (Now hits the backend via ProfileController)
    const adminQuickEditForm = document.getElementById('adminQuickEditForm');
    if (adminQuickEditForm) {
        adminQuickEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (saveProfileBtn) {
                saveProfileBtn.disabled = true;
                adminButtonLabel(saveProfileBtn, 'Saving...');
            }

            const fd = new FormData();
            fd.append('fullName', profileNameInput.value);
            if (profilePicInput.files.length > 0) {
                fd.append('avatarFile', profilePicInput.files[0]);
            }

            try {
                const res = await fetch('/Profile/QuickUpdate', { method: 'POST', body: fd });
                if (res.ok) {
                    const data = await res.json();
                    if (sidebarName) sidebarName.textContent = data.fullName;
                    if (sidebarAvatar && data.avatarUrl) sidebarAvatar.src = data.avatarUrl;
                    
                    adminNotify('Profile updated successfully.');
                    closeProfileEditor();
                } else {
                    adminNotify('Could not save your profile. Please try again.');
                }
            } catch (err) {
                console.error(err);
                adminNotify('Connection lost. Please try again.');
            } finally {
                if (saveProfileBtn) {
                    saveProfileBtn.disabled = false;
                    adminButtonLabel(saveProfileBtn, 'Save changes');
                }
            }
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    const main = document.querySelector('.admin-main');
    const scrim = document.getElementById('sidebarScrim');
    const mobile = window.matchMedia('(max-width: 768px)');
    const focusable = root => [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')]
        .filter(el => !el.disabled && !el.hidden && el.getClientRects().length);
    let activeOverlay = null;
    const openDialogs = [];
    const previousFocus = new WeakMap();

    function setMenu(open) {
        const expanded = open && mobile.matches;
        document.body.classList.toggle('nav-open', expanded);
        menu.setAttribute('aria-expanded', String(expanded));
        menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
        sidebar.inert = !!activeOverlay || (mobile.matches && !expanded);
        main.inert = !!activeOverlay || expanded;
        document.body.style.overflow = activeOverlay || expanded ? 'hidden' : '';
        if (expanded && !activeOverlay) focusable(sidebar)[0]?.focus();
    }
    menu.addEventListener('click', () => setMenu(!document.body.classList.contains('nav-open')));
    scrim.addEventListener('click', () => { setMenu(false); menu.focus(); });
    mobile.addEventListener('change', () => setMenu(false));
    sidebar.inert = mobile.matches;

    const overlays = new Set();
    function syncDialog(overlay) {
        const open = overlay.style.display !== 'none' &&
            (overlay.classList.contains('active') || overlay.style.display === 'flex');
        overlay.setAttribute('aria-hidden', String(!open));
        const index = openDialogs.indexOf(overlay);
        if (open && index === -1) {
            previousFocus.set(overlay, document.activeElement);
            openDialogs.push(overlay);
            activeOverlay = overlay;
            setMenu(false);
            const dialog = overlay.querySelector('.profile-modal, .confirm-dialog');
            if (dialog) {
                dialog.setAttribute('role', 'dialog');
                dialog.setAttribute('aria-modal', 'true');
                dialog.setAttribute('tabindex', '-1');
                const title = dialog.querySelector('.modal-title, .confirm-title');
                if (title) {
                    title.id ||= overlay.id + 'Title';
                    dialog.setAttribute('aria-labelledby', title.id);
                }
                const close = dialog.querySelector('.close-modal');
                if (close) close.setAttribute('aria-label', 'Close dialog');
                const target = dialog.querySelector('.confirm-btn.cancel') || focusable(dialog)[0] || dialog;
                target.focus();
            }
        } else if (!open && index !== -1) {
            openDialogs.splice(index, 1);
            if (activeOverlay !== overlay) return;
            activeOverlay = openDialogs.at(-1) || null;
            setMenu(false);
            const target = previousFocus.get(overlay);
            if (target?.isConnected && !target.closest('[inert]')) target.focus();
            else if (mobile.matches && !activeOverlay) menu.focus();
        }
    }
    function watchDialogs() {
        document.querySelectorAll('.modal-overlay, #customConfirmOverlay').forEach(overlay => {
            if (overlays.has(overlay)) return;
            overlays.add(overlay);
            // Page dialogs must sit outside the main content that becomes inert.
            if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
            new MutationObserver(() => syncDialog(overlay)).observe(overlay, {
                attributes: true, attributeFilter: ['class', 'style']
            });
            syncDialog(overlay);
        });
    }
    watchDialogs();
    new MutationObserver(watchDialogs).observe(document.body, { childList: true, subtree: true });

    document.addEventListener('keydown', event => {
        const menuOpen = document.body.classList.contains('nav-open');
        if (event.key === 'Escape') {
            if (activeOverlay) {
                const cancel = activeOverlay.querySelector('.confirm-btn.cancel');
                if (cancel) cancel.click();
                else {
                    activeOverlay.style.display = 'none';
                    activeOverlay.classList.remove('active');
                }
            } else if (menuOpen) {
                setMenu(false);
                menu.focus();
            }
        }
        const region = activeOverlay || (menuOpen ? sidebar : null);
        if (event.key !== 'Tab' || !region) return;
        const controls = focusable(region);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first?.focus();
        }
    });

    const search = document.getElementById('adminSearch');
    const status = document.getElementById('adminSearchStatus');
    search.closest('.admin-search').hidden = !document.querySelector('.content-wrap table, #stallGrid');
    function filterPage() {
        const query = search.value.trim().toLocaleLowerCase();
        const rows = [...document.querySelectorAll('.content-wrap tbody tr, #stallGrid .stall-card')];
        let shown = 0;
        rows.forEach(row => {
            const match = !query || row.textContent.toLocaleLowerCase().includes(query);
            row.hidden = !match;
            if (match) shown++;
        });
        status.textContent = query ? shown + ' matches on this page.' : '';
        document.getElementById('adminSearchEmpty').hidden = !query || shown > 0;
    }
    search.addEventListener('input', filterPage);
    const grid = document.getElementById('stallGrid');
    if (grid) new MutationObserver(filterPage).observe(grid, { childList: true });
});

function adminIcon(name) {
    return `<svg class="ui-icon" data-icon="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="/images/admin-icons.svg#${name}"></use></svg>`;
}

function adminButtonLabel(button, text) {
    (button.querySelector('.button-label') || button).textContent = text;
}

function adminNotify(message) {
    let toast = document.getElementById('adminToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'adminToast';
        toast.className = 'admin-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.innerHTML = adminIcon('info');
    const label = document.createElement('span');
    label.textContent = message;
    toast.appendChild(label);
    toast.hidden = false;
    clearTimeout(adminNotify.timer);
    adminNotify.timer = setTimeout(() => { toast.hidden = true; }, 5000);
}
