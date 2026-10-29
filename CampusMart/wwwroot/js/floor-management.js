// ═══════════════════════════════════════════════════════════════
// CampusMart — Floor Management (Database-backed)
// ═══════════════════════════════════════════════════════════════

const API = '/Admin/FloorApi';
let floors = [];
let currentFloorId = null;
let stalls = [];

// ── Modal Helpers ──

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'none';
        el.classList.remove('active');
    }
}

function showModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = 'flex';
        el.classList.add('active');
        
        // Also populate default fields for Add Floor if this is the addFloorModal
        if (id === 'addFloorModal') {
            const nameInput = document.getElementById('newFloorName');
            const numInput = document.getElementById('newFloorNumber');
            const capInput = document.getElementById('newFloorCapacity');
            if (nameInput) nameInput.value = '';
            if (numInput) numInput.value = floors ? floors.length + 1 : 1;
            if (capInput) capInput.value = 8;
        }
    }
}

// ── Custom Alert / Confirm ──
function showToast(message, type = 'error') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    container.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirm(message) {
    return new Promise((resolve) => {
        let overlay = document.getElementById('customConfirmOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'customConfirmOverlay';
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-icon"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/></svg></div>
                    <div class="confirm-title">Are you sure?</div>
                    <div class="confirm-message" id="confirmMsgText"></div>
                    <div class="confirm-actions">
                        <button class="confirm-btn cancel" id="confirmCancelBtn">Cancel</button>
                        <button class="confirm-btn danger" id="confirmOkBtn">Yes, Delete</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        document.getElementById('confirmMsgText').textContent = message;
        overlay.classList.add('active');

        const btnOk = document.getElementById('confirmOkBtn');
        const btnCancel = document.getElementById('confirmCancelBtn');

        const cleanup = () => {
            overlay.classList.remove('active');
            btnOk.onclick = null;
            btnCancel.onclick = null;
        };

        btnOk.onclick = () => { cleanup(); resolve(true); };
        btnCancel.onclick = () => { cleanup(); resolve(false); };
    });
}

// Close modal when clicking on overlay background (not the modal card itself)
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay') && e.target.id !== 'profileModal') {
        e.target.style.display = 'none';
    }
});

// Close modals on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        ['addFloorModal', 'stallModal', 'stallDetailModal'].forEach(id => closeModal(id));
    }
});

// ── API Helper ──

async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text();
            console.error('API Error:', res.status, text);
            showToast('Error: ' + (text || res.statusText), 'error');
            return null;
        }
        if (res.status === 200) {
            const ct = res.headers.get('content-type');
            if (ct && ct.includes('json')) return res.json();
        }
        return true;
    } catch (err) {
        console.error('Network error:', err);
        showToast('Network error. Check console.', 'error');
        return null;
    }
}

// ── Time Utilities ──

function isStallOpen(openTime, closeTime) {
    if (!openTime || !closeTime) return false;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = openTime.split(':').map(Number);
    const [ch, cm] = closeTime.split(':').map(Number);
    return current >= (oh * 60 + (om || 0)) && current < (ch * 60 + (cm || 0));
}

function formatTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function categoryColor(cat) {
    const c = (cat || '').toLowerCase();
    return { food: '#ffdd67', electronics: '#7cc3ff', textbooks: '#9effb2', clothing: '#f0a0ff', stationery: '#ffb07c', services: '#80e0d0', other: '#ccc' }[c] || '#ccc';
}

// ══════════════════════════════════════
// FLOORS
// ══════════════════════════════════════

async function loadFloors() {
    floors = await apiFetch(`${API}/floors`) || [];
    renderFloorButtons();
    updateGlobalMetrics();

    if (floors.length > 0) {
        if (!currentFloorId || !floors.find(f => f.id === currentFloorId)) {
            currentFloorId = floors[0].id;
        }
        renderFloorButtons(); // re-render with correct active state
        await loadStalls();
    } else {
        currentFloorId = null;
        stalls = [];
        renderStalls();
        updateCapacity();
    }
}

function renderFloorButtons() {
    const container = document.getElementById('floorButtons');
    if (!container) return;

    container.innerHTML = floors.map(f => `
        <button class="floor-btn ${f.id === currentFloorId ? 'active' : ''}" data-id="${f.id}">
            Floor ${f.floorNumber}
        </button>
    `).join('');

    container.querySelectorAll('.floor-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            currentFloorId = Number(btn.dataset.id);
            renderFloorButtons();
            await loadStalls();
        });
    });

    const totalEl = document.getElementById('totalFloors');
    if (totalEl) totalEl.textContent = floors.length;
}

// ══════════════════════════════════════
// STALLS
// ══════════════════════════════════════

async function loadStalls() {
    if (!currentFloorId) { stalls = []; renderStalls(); return; }
    stalls = await apiFetch(`${API}/floors/${currentFloorId}/stalls`) || [];
    renderStalls();
    updateCapacity();
}

function renderStalls() {
    const grid = document.getElementById('stallGrid');
    const header = document.getElementById('stallsHeader');
    if (!grid) return;

    const floor = floors.find(f => f.id === currentFloorId);
    const floorNum = floor ? floor.floorNumber : '?';
    if (header) header.textContent = floor ? `Active stalls \u2014 Floor ${floorNum}` : "Campus stalls";

    if (stalls.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 60px 0; color: var(--text-muted);">
                <div style="font-size:48px; margin-bottom:12px;"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h16v11H4zM2 10l3-7h14l3 7M9 21v-7h6v7"/></svg></div>
                <h3 style="font-weight:700; color:#fff;">No stalls yet</h3>
                <p>${floor ? 'Create a stall to add the first tenant to this floor.' : 'Create a floor to start adding campus stalls.'}</p>
            </div>`;
        return;
    }

    grid.innerHTML = stalls.map(s => {
        const open = isStallOpen(s.openTime, s.closeTime);
        const statusColor = s.isActive ? (open ? '#79e7a3' : '#ff8d8d') : '#99998f';
        const statusText = s.isActive ? (open ? 'Open' : 'Closed') : 'Inactive';
        const catColor = categoryColor(s.category);

        return `
        <article class="stall-card" style="position:relative; overflow:hidden;">
            ${s.imageUrl ? `
                <div style="height:120px; overflow:hidden; border-radius:12px 12px 0 0; margin:-16px -16px 8px -16px;">
                    <img src="${s.imageUrl}" alt="${s.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>` : ''}
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h3 class="stall-name" style="font-size:20px;">${s.name}</h3>
                <span style="background:${statusColor}22; color:${statusColor}; border:1px solid ${statusColor}44; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:800; text-transform:uppercase; white-space:nowrap;">
                    ${statusText}
                </span>
            </div>
            <div class="stall-id">${s.stallNumber}</div>
            <div class="stall-meta">Owner: <strong>${s.ownerName || '—'}</strong></div>
            <div class="stall-meta">Category <span class="pill" style="color:${catColor}; border-color:${catColor}44;">${s.category || 'N/A'}</span></div>
            <div class="stall-meta" style="font-size:14px; color:var(--text-muted);">
                <svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"/></svg> ${formatTime(s.openTime)} — ${formatTime(s.closeTime)}
            </div>
            <div class="stall-actions">
                <button class="btn" onclick="openEditStall(${s.id})">Edit</button>
                <button class="btn" onclick="openStallDetail(${s.id})">View items</button>
                <button class="btn warn" onclick="toggleStall(${s.id})">${s.isActive ? 'Deactivate' : 'Activate'}</button>
            </div>
        </article>`;
    }).join('');
}

function updateCapacity() {
    const floor = floors.find(f => f.id === currentFloorId);
    if (!floor) return;

    const active = stalls.filter(s => s.isActive).length;
    const cap = floor.capacity;
    const pct = cap > 0 ? Math.round((active / cap) * 100) : 0;

    const el = (id) => document.getElementById(id);
    if (el('capacityLabel')) el('capacityLabel').textContent = `Floor ${floor.floorNumber} Capacity`;
    if (el('capacityUsed')) el('capacityUsed').textContent = active;
    if (el('capacityTotal')) el('capacityTotal').textContent = `/ ${cap} occupied`;
    if (el('capacityFill')) el('capacityFill').style.transform = `scaleX(${Math.min(1, Math.max(0, pct / 100))})`;
    if (el('currentOccupancy')) el('currentOccupancy').textContent = `${pct}%`;
    if (el('occupancySub')) el('occupancySub').textContent = `${active} of ${cap} stalls`;
}

function updateGlobalMetrics() {
    const total = floors.reduce((sum, f) => sum + (f.stallCount || 0), 0);
    const el = document.getElementById('totalActiveStalls');
    if (el) el.textContent = total;
    const sub = document.getElementById('totalStallsSub');
    if (sub) sub.textContent = `across ${floors.length} floor${floors.length !== 1 ? 's' : ''}`;
}

// ══════════════════════════════════════
// EVENT LISTENERS — DOMContentLoaded
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Load data
    loadFloors();

    // ── Add Floor Button ──
    const addFloorBtn = document.getElementById('addFloorBtn');
    if (addFloorBtn) {
        addFloorBtn.addEventListener('click', () => {
            document.getElementById('newFloorName').value = '';
            document.getElementById('newFloorNumber').value = floors.length + 1;
            document.getElementById('newFloorCapacity').value = 8;
            showModal('addFloorModal');
        });
    }

    // ── Save Floor Button ──
    const saveFloorBtn = document.getElementById('saveFloorBtn');
    if (saveFloorBtn) {
        saveFloorBtn.addEventListener('click', async () => {
            const name = document.getElementById('newFloorName').value.trim();
            const num = parseInt(document.getElementById('newFloorNumber').value) || 1;
            const cap = parseInt(document.getElementById('newFloorCapacity').value) || 8;

            if (!name) { showToast('Please enter a floor name.', 'error'); return; }

            saveFloorBtn.disabled = true;
            saveFloorBtn.textContent = 'Creating...';

            const result = await apiFetch(`${API}/floors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, floorNumber: num, capacity: cap })
            });

            saveFloorBtn.disabled = false;
            saveFloorBtn.textContent = 'Create Floor';

            if (result) {
                closeModal('addFloorModal');
                currentFloorId = result.id;
                await loadFloors();
            }
        });
    }

    // ── Add Stall Button ──
    const addStallBtn = document.getElementById('addStallBtn');
    if (addStallBtn) {
        addStallBtn.addEventListener('click', () => {
            if (!currentFloorId) { showToast('Please create a floor first.', 'error'); return; }
            document.getElementById('stallEditId').value = '';
            document.getElementById('stallModalTitle').textContent = 'Create Stall';
            document.getElementById('saveStallBtn').textContent = 'Create Stall';
            document.getElementById('stallForm').reset();
            document.getElementById('stallImagePreview').innerHTML = '';
            showModal('stallModal');
        });
    }

    // ── Stall Form Submit ──
    const stallForm = document.getElementById('stallForm');
    if (stallForm) {
        stallForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('stallEditId').value;
            const submitBtn = document.getElementById('saveStallBtn');

            const fd = new FormData();
            fd.append('Name', document.getElementById('stallName').value);
            fd.append('StallNumber', document.getElementById('stallNumber').value);
            fd.append('OwnerName', document.getElementById('stallOwner').value);
            fd.append('Category', document.getElementById('stallCategory').value);
            fd.append('Description', document.getElementById('stallDesc').value);
            fd.append('OpenTime', document.getElementById('stallOpenTime').value);
            fd.append('CloseTime', document.getElementById('stallCloseTime').value);
            fd.append('FloorId', currentFloorId);

            const imgInput = document.getElementById('stallImage');
            if (imgInput.files.length > 0) fd.append('Image', imgInput.files[0]);

            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            let url = `${API}/stalls`;
            let method = 'POST';
            if (editId) {
                url = `${API}/stalls/${editId}`;
                method = 'PUT';
            }

            const result = await apiFetch(url, { method, body: fd });

            submitBtn.disabled = false;
            submitBtn.textContent = editId ? 'Save Changes' : 'Create Stall';

            if (result) {
                closeModal('stallModal');
                await loadFloors();
                await loadStalls();
            }
        });
    }

    // ── Add Item Form ──
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const stallId = document.getElementById('itemStallId').value;

            const fd = new FormData();
            fd.append('Name', document.getElementById('itemName').value);
            fd.append('Price', document.getElementById('itemPrice').value);
            fd.append('Description', document.getElementById('itemDesc').value);
            fd.append('Stock', document.getElementById('itemStock').value);
            fd.append('StallId', stallId);

            const imgInput = document.getElementById('itemImage');
            if (imgInput.files.length > 0) fd.append('Image', imgInput.files[0]);

            const result = await apiFetch(`${API}/stall-items`, { method: 'POST', body: fd });
            if (result) {
                addItemForm.reset();
                document.getElementById('itemStallId').value = stallId;
                await loadStallItems(stallId);
            }
        });
    }

    // ── Image Preview ──
    const stallImage = document.getElementById('stallImage');
    if (stallImage) {
        stallImage.addEventListener('change', function () {
            const preview = document.getElementById('stallImagePreview');
            if (this.files.length > 0) {
                const url = URL.createObjectURL(this.files[0]);
                preview.innerHTML = `<img src="${url}" style="max-width:100%; max-height:120px; border-radius:8px; object-fit:cover;">`;
            } else {
                preview.innerHTML = '';
            }
        });
    }
});

// ══════════════════════════════════════
// GLOBAL STALL ACTIONS (called from onclick)
// ══════════════════════════════════════

async function toggleStall(id) {
    await apiFetch(`${API}/stalls/${id}/toggle`, { method: 'POST' });
    await loadFloors();
    await loadStalls();
}

function openEditStall(id) {
    const stall = stalls.find(s => s.id === id);
    if (!stall) return;

    document.getElementById('stallEditId').value = id;
    document.getElementById('stallModalTitle').textContent = 'Edit Stall';
    document.getElementById('saveStallBtn').textContent = 'Save Changes';
    document.getElementById('stallName').value = stall.name;
    document.getElementById('stallNumber').value = stall.stallNumber;
    document.getElementById('stallOwner').value = stall.ownerName;
    document.getElementById('stallCategory').value = stall.category;
    document.getElementById('stallDesc').value = stall.description || '';
    document.getElementById('stallOpenTime').value = stall.openTime || '08:00';
    document.getElementById('stallCloseTime').value = stall.closeTime || '20:00';

    const preview = document.getElementById('stallImagePreview');
    if (stall.imageUrl) {
        preview.innerHTML = `<img src="${stall.imageUrl}" style="max-width:100%; max-height:120px; border-radius:8px; object-fit:cover;">`;
    } else {
        preview.innerHTML = '';
    }

    showModal('stallModal');
}

// ── Stall Detail & Items ──

async function openStallDetail(id) {
    const stall = stalls.find(s => s.id === id);
    if (!stall) return;

    document.getElementById('stallDetailTitle').textContent = stall.name;
    document.getElementById('itemStallId').value = id;

    const open = isStallOpen(stall.openTime, stall.closeTime);
    const statusColor = stall.isActive ? (open ? '#79e7a3' : '#ff8d8d') : '#666';
    const statusText = stall.isActive ? (open ? 'Open' : 'Closed') : 'Inactive';

    document.getElementById('stallDetailContent').innerHTML = `
        ${stall.imageUrl ? `<img src="${stall.imageUrl}" style="width:100%; max-height:200px; object-fit:cover; border-radius:12px; margin-bottom:16px;">` : ''}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div><span style="color:var(--text-muted); font-size:12px;">STALL NUMBER</span><br><strong>${stall.stallNumber}</strong></div>
            <div><span style="color:var(--text-muted); font-size:12px;">OWNER</span><br><strong>${stall.ownerName || '—'}</strong></div>
            <div><span style="color:var(--text-muted); font-size:12px;">CATEGORY</span><br><span class="pill" style="color:${categoryColor(stall.category)}; border-color:${categoryColor(stall.category)}44; margin-left:0;">${stall.category || 'N/A'}</span></div>
            <div><span style="color:var(--text-muted); font-size:12px;">STATUS</span><br><span style="color:${statusColor}; font-weight:700;">${statusText}</span></div>
            <div style="grid-column:1/-1;"><span style="color:var(--text-muted); font-size:12px;">HOURS</span><br><strong><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"/></svg> ${formatTime(stall.openTime)} — ${formatTime(stall.closeTime)}</strong></div>
        </div>`;

    showModal('stallDetailModal');
    await loadStallItems(id);
}

async function loadStallItems(stallId) {
    const items = await apiFetch(`${API}/stalls/${stallId}/items`) || [];
    const container = document.getElementById('stallItemsList');

    if (items.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No items added yet. Use the form below to add items.</div>`;
        return;
    }

    container.innerHTML = items.map(item => `
        <div style="display:flex; align-items:center; gap:12px; padding:10px; border:1px solid var(--border-subtle); border-radius:10px; margin-bottom:8px; background:rgba(255,255,255,0.02);">
            ${item.imageUrl
                ? `<img src="${item.imageUrl}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">`
                : `<div style="width:50px; height:50px; border-radius:8px; background:#1f252f; display:flex; align-items:center; justify-content:center; font-size:20px;"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10"/></svg></div>`
            }
            <div style="flex:1;">
                <div style="font-weight:700;">${item.name}</div>
                <div style="font-size:12px; color:var(--text-muted);">${item.description || ''}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:800; color:var(--primary);">₱${Number(item.price).toFixed(2)}</div>
                <div style="font-size:11px; color:var(--text-muted);">Stock: ${item.stock}</div>
            </div>
            <button class="btn warn" style="padding:4px 8px; font-size:12px;" onclick="deleteStallItem(${item.id}, ${stallId})">✕</button>
        </div>
    `).join('');
}

async function deleteStallItem(itemId, stallId) {
    const confirmed = await showConfirm('Are you sure you want to delete this item?');
    if (!confirmed) return;
    await apiFetch(`${API}/stall-items/${itemId}`, { method: 'DELETE' });
    showToast('Item deleted successfully.', 'success');
    await loadStallItems(stallId);
}
