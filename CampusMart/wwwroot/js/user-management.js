// ═══════════════════════════════════════════════════════════════
// CampusMart — User Management
// ═══════════════════════════════════════════════════════════════

const API = '/Admin/UserManagement';

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
    
    requestAnimationFrame(() => toast.classList.add('show'));
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
        const cleanup = () => { overlay.classList.remove('active'); btnOk.onclick = null; btnCancel.onclick = null; };
        
        btnOk.onclick = () => { cleanup(); resolve(true); };
        btnCancel.onclick = () => { cleanup(); resolve(false); };
    });
}

// ── Event Listeners ──
document.addEventListener('DOMContentLoaded', () => {
    
    // Close modals on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') ['addStudentModal', 'viewStudentModal', 'editStudentModal'].forEach(id => closeModal(id));
    });

    // Close on overlay click
    document.addEventListener('click', e => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            e.target.classList.remove('active');
        }
    });

    // Avatar preview (Add)
    const avatarInput = document.getElementById('newAvatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', function () {
            const preview = document.getElementById('newAvatarPreview');
            if (this.files.length > 0) {
                const url = URL.createObjectURL(this.files[0]);
                preview.innerHTML = `<img src="${url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">`;
            } else {
                preview.innerHTML = '';
            }
        });
    }

    // Avatar preview (Edit)
    const editAvatarInput = document.getElementById('editAvatar');
    if (editAvatarInput) {
        editAvatarInput.addEventListener('change', function () {
            const preview = document.getElementById('editAvatarPreview');
            if (this.files.length > 0) {
                const url = URL.createObjectURL(this.files[0]);
                preview.innerHTML = `<img src="${url}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">`;
            } else {
                preview.innerHTML = '';
            }
        });
    }

    // Add Student Form Submit
    const addForm = document.getElementById('addStudentForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('saveStudentBtn');
            btn.disabled = true;
            btn.textContent = 'Creating...';

            const fd = new FormData();
            fd.append('FirstName', document.getElementById('newFirstName').value);
            fd.append('LastName', document.getElementById('newLastName').value);
            fd.append('StudentId', document.getElementById('newStudentId').value);
            fd.append('Email', document.getElementById('newEmail').value);
            
            const fileInput = document.getElementById('newAvatar');
            if (fileInput.files.length > 0) {
                fd.append('AvatarFile', fileInput.files[0]);
            }
            
            // Generate anti-forgery token if required. MVC usually handles it for forms, but for API we might need to ignore it or pass it.
            // Let's pass it if we have it in the DOM, else the controller [ValidateAntiForgeryToken] might fail.
            // Since we use MVC forms, usually we can just include it in the form or disable the attribute. Let's see if we get a 400 error.
            
            try {
                const res = await fetch(`${API}/Create`, { method: 'POST', body: fd });
                if (res.ok) {
                    showToast('Student account created successfully!', 'success');
                    closeModal('addStudentModal');
                    setTimeout(() => window.location.reload(), 1000); // Reload to show new user
                } else {
                    const text = await res.text();
                    showToast(text || 'Failed to create student account.');
                }
            } catch (err) {
                console.error(err);
                showToast('Network error.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        });
    }

    // Edit Student Form Submit
    const editForm = document.getElementById('editStudentForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('updateStudentBtn');
            btn.disabled = true;
            btn.textContent = 'Saving...';

            const fd = new FormData();
            fd.append('Id', document.getElementById('editStudentIdHidden').value);
            fd.append('FirstName', document.getElementById('editFirstName').value);
            fd.append('LastName', document.getElementById('editLastName').value);
            fd.append('StudentId', document.getElementById('editStudentId').value);
            fd.append('Email', document.getElementById('editEmail').value);
            
            const fileInput = document.getElementById('editAvatar');
            if (fileInput.files.length > 0) {
                fd.append('AvatarFile', fileInput.files[0]);
            }
            
            try {
                const res = await fetch(`${API}/Edit`, { method: 'POST', body: fd });
                if (res.ok) {
                    showToast('Student updated successfully!', 'success');
                    closeModal('editStudentModal');
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    const text = await res.text();
                    showToast(text || 'Failed to update student account.');
                }
            } catch (err) {
                console.error(err);
                showToast('Network error.');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save Changes';
            }
        });
    }
});

function openAddStudentModal() {
    document.getElementById('addStudentForm').reset();
    document.getElementById('newAvatarPreview').innerHTML = '';
    showModal('addStudentModal');
}

async function openEditStudentModal(id) {
    try {
        const res = await fetch(`${API}/GetUserDetails?id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        
        const user = await res.json();
        
        document.getElementById('editStudentIdHidden').value = user.id;
        document.getElementById('editFirstName').value = user.firstName || '';
        document.getElementById('editLastName').value = user.lastName || '';
        document.getElementById('editStudentId').value = user.studentId || '';
        document.getElementById('editEmail').value = user.email || '';
        document.getElementById('editAvatarPreview').innerHTML = '';
        
        if (user.avatarUrl) {
            document.getElementById('editAvatarPreview').innerHTML = `<img src="${user.avatarUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">`;
        }

        showModal('editStudentModal');
    } catch (err) {
        console.error(err);
        showToast('Error loading student details.');
    }
}

async function viewStudentDetails(id) {
    try {
        const res = await fetch(`${API}/GetUserDetails?id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        
        const user = await res.json();
        
        let avatarHtml = '';
        if (user.avatarUrl) {
            avatarHtml = `<img src="${user.avatarUrl}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--primary); margin-bottom:12px;">`;
        } else {
            const initial = user.fullName ? user.fullName.substring(0, 1).toUpperCase() : 'U';
            avatarHtml = `<div style="width:100px; height:100px; border-radius:50%; background:#222; display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:800; border:3px solid var(--primary); margin-bottom:12px;">${initial}</div>`;
        }

        document.getElementById('studentDetailContent').innerHTML = `
            ${avatarHtml}
            <h3 style="margin:0; font-size:24px; font-weight:800;">${user.fullName}</h3>
            <div style="color:var(--text-muted);">${user.email}</div>
            
            <div style="width:100%; text-align:left; margin-top:20px; background:#1a1d24; padding:16px; border-radius:12px;">
                <div style="margin-bottom:8px;"><span style="color:var(--text-muted); font-size:12px;">STUDENT ID</span><br><strong>${user.studentId || 'N/A'}</strong></div>
                <div style="margin-bottom:8px;"><span style="color:var(--text-muted); font-size:12px;">DEPARTMENT</span><br><strong>${user.department || 'N/A'}</strong></div>
                <div style="margin-bottom:8px;"><span style="color:var(--text-muted); font-size:12px;">YEAR & SECTION</span><br><strong>${user.yearLevel || '-'} / ${user.section || '-'}</strong></div>
                <div style="margin-bottom:8px;"><span style="color:var(--text-muted); font-size:12px;">DATE JOINED</span><br><strong>${user.dateJoined}</strong></div>
                <div style="margin-top:12px;"><span style="color:var(--text-muted); font-size:12px;">BIO</span><br><p style="margin:4px 0 0; font-size:14px; line-height:1.5;">${user.bio || 'No bio provided.'}</p></div>
            </div>
        `;
        showModal('viewStudentModal');
    } catch (err) {
        console.error(err);
        showToast('Error loading student details.');
    }
}

async function deleteStudent(id, name) {
    const confirmed = await showConfirm(`Are you sure you want to permanently delete the account for ${name}?`);
    if (!confirmed) return;

    const fd = new FormData();
    fd.append('id', id);

    try {
        const res = await fetch(`${API}/Delete`, { method: 'POST', body: fd });
        if (res.ok) {
            showToast('Student deleted successfully.', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            const text = await res.text();
            showToast(text || 'Failed to delete student.');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error.');
    }
}
