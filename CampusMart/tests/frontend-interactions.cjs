// Run with: node tests/frontend-interactions.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const control = extra => Object.assign({
    events: {}, attributes: {}, value: '',
    addEventListener(name, handler) { this.events[name] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    setCustomValidity(message) { this.validationMessage = message; }
}, extra);

// Password visibility is accessible; a mismatch follows changes to either field.
const password = control({ type: 'password' });
const confirmation = control({ type: 'password' });
const toggle = control({ dataset: { password: 'Password' } });
const submitText = { textContent: 'Create account' };
const submit = { disabled: false, querySelector: () => submitText };
let nativeValid = false;
let jqueryValid = false;
const form = control({ checkValidity: () => nativeValid, querySelector: () => submit });
const auth = vm.createContext({
    document: {
        getElementById: id => ({ Password: password, ConfirmPassword: confirmation }[id]),
        querySelectorAll: selector => selector === '[data-password]' ? [toggle] : [form]
    },
    window: { addEventListener() {}, jQuery: () => ({ valid: () => jqueryValid }) }
});
vm.runInContext(source('wwwroot/js/auth.js'), auth);
toggle.events.click();
assert.equal(password.type, 'text');
assert.equal(toggle.attributes['aria-pressed'], 'true');
assert.equal(toggle.attributes['aria-label'], 'Hide password');
toggle.events.click();
assert.equal(password.type, 'password');
password.value = 'campus-password';
confirmation.value = 'different-password';
confirmation.events.input();
assert.equal(confirmation.validationMessage, 'The passwords do not match.');
password.value = confirmation.value;
password.events.input();
assert.equal(confirmation.validationMessage, '');

// Invalid forms remain usable; a valid submit cannot be sent repeatedly.
form.events.submit();
assert.equal(submit.disabled, false);
nativeValid = true;
form.events.submit();
assert.equal(submit.disabled, false);
jqueryValid = true;
form.events.submit();
assert.equal(submit.disabled, true);
assert.equal(form.attributes['aria-busy'], 'true');

// Occupancy feedback uses the real count and never paints past the track.
const nodes = new Map();
const floors = vm.createContext({
    document: {
        addEventListener() {},
        getElementById(id) {
            if (!nodes.has(id)) nodes.set(id, { style: {}, textContent: '' });
            return nodes.get(id);
        }
    }
});
vm.runInContext(source('wwwroot/js/floor-management.js'), floors);
vm.runInContext('floors = [{ id: 1, floorNumber: 1, capacity: 4 }]; currentFloorId = 1; stalls = [{ isActive: true }, { isActive: true }, { isActive: false }]; updateCapacity();', floors);
assert.equal(nodes.get('capacityUsed').textContent, 2);
assert.equal(nodes.get('currentOccupancy').textContent, '50%');
assert.equal(nodes.get('capacityFill').style.transform, 'scaleX(0.5)');
vm.runInContext('floors[0].capacity = 1; updateCapacity();', floors);
assert.equal(nodes.get('capacityFill').style.transform, 'scaleX(1)');
vm.runInContext('stalls = []; updateCapacity();', floors);
assert.equal(nodes.get('capacityFill').style.transform, 'scaleX(0)');

// Admin dialogs stay editable while their background is inert, including nested confirms.
const ready = [];
const observers = new Map();
const elements = new Map();
let focused;
function element(id, parentElement = null) {
    const classes = new Set();
    const el = control({
        id, parentElement, style: {}, inert: false, isConnected: true,
        classList: {
            contains: name => classes.has(name),
            add: name => classes.add(name),
            remove: name => classes.delete(name),
            toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }
        },
        getClientRects: () => [1],
        closest(selector) {
            if (selector === '.admin-search') return searchLabel;
            for (let node = this; node; node = node.parentElement) {
                if (node.inert) return node;
            }
            return null;
        },
        focus() { if (!this.closest('[inert]')) focused = this; },
        querySelector: () => null,
        querySelectorAll: () => [],
        appendChild(child) { child.parentElement = this; }
    });
    elements.set(id, el);
    return el;
}
const body = element('body');
const main = element('main', body);
const sidebar = element('adminSidebar', body);
const menu = element('menuToggle', main);
const searchLabel = element('searchLabel', main);
for (const id of ['sidebarScrim', 'adminSearch', 'adminSearchStatus', 'adminSearchEmpty']) element(id, main);
const dialogs = [];
function dialog(id, parent = main, confirm = false) {
    const overlay = element(id, parent);
    overlay.style.display = 'none';
    const card = element(id + 'Card', overlay);
    const field = element(id + 'Input', card);
    overlay.querySelector = selector => selector === '.profile-modal, .confirm-dialog' ? card :
        selector === '.confirm-btn.cancel' && confirm ? field : null;
    card.querySelectorAll = () => [field];
    card.querySelector = selector => selector === '.confirm-btn.cancel' && confirm ? field : null;
    field.click = () => { overlay.style.display = 'none'; overlay.classList.remove('active'); };
    dialogs.push(overlay);
    return { overlay, field };
}
const modalIds = ['addFloorModal', 'stallModal', 'stallDetailModal', 'addStudentModal', 'editStudentModal', 'profileModal'];
const pageDialogs = modalIds.map(id => dialog(id));
// The separate profile editor initializer isn't needed for these lifecycle checks.
elements.delete('profileModal');
const media = control({ matches: false });
const documentEvents = {};
const admin = vm.createContext({
    document: {
        body,
        get activeElement() { return focused; },
        getElementById: id => elements.get(id),
        querySelector: selector => selector === '.admin-main' ? main : null,
        querySelectorAll: () => dialogs,
        addEventListener(name, handler) {
            if (name === 'DOMContentLoaded') ready.push(handler);
            else documentEvents[name] = handler;
        }
    },
    window: { matchMedia: () => media },
    MutationObserver: class {
        constructor(callback) { this.callback = callback; }
        observe(target) { observers.set(target, this.callback); }
    }
});
vm.runInContext(source('wwwroot/js/admin-dashboard.js'), admin);
const buttonLabel = { textContent: 'Create Floor' };
const iconButton = control({ querySelector: () => buttonLabel, textContent: 'icon markup' });
admin.adminButtonLabel(iconButton, 'Creating...');
assert.equal(buttonLabel.textContent, 'Creating...');
assert.equal(iconButton.textContent, 'icon markup', 'loading labels preserve their icon');
const plainButton = control({ querySelector: () => null });
admin.adminButtonLabel(plainButton, 'Save');
assert.equal(plainButton.textContent, 'Save');
ready.forEach(handler => handler());
function openDialog(overlay) {
    overlay.style.display = 'flex';
    overlay.classList.add('active');
    observers.get(overlay)();
}
function closeDialog(overlay) {
    overlay.style.display = 'none';
    overlay.classList.remove('active');
    observers.get(overlay)();
}
for (const { overlay, field } of pageDialogs) {
    menu.focus();
    openDialog(overlay);
    assert.equal(overlay.parentElement, body, overlay.id + ' escapes the inert page');
    assert.equal(main.inert, true);
    assert.equal(field.closest('[inert]'), null, overlay.id + ' input is editable');
    assert.equal(focused, field, overlay.id + ' receives keyboard focus');
    closeDialog(overlay);
    assert.equal(main.inert, false);
    assert.equal(focused, menu);
}
const detail = pageDialogs[2];
openDialog(detail.overlay);
const confirmationDialog = dialog('customConfirmOverlay', main, true);
observers.get(body)();
openDialog(confirmationDialog.overlay);
documentEvents.keydown({ key: 'Escape' });
observers.get(confirmationDialog.overlay)();
assert.equal(main.inert, true, 'canceling a confirmation preserves the underlying dialog');
assert.equal(focused, detail.field);
documentEvents.keydown({ key: 'Escape' });
observers.get(detail.overlay)();
assert.equal(main.inert, false);
// Inline display:none takes precedence over a stale active class after dismissal.
openDialog(detail.overlay);
detail.overlay.style.display = 'none';
observers.get(detail.overlay)();
assert.equal(main.inert, false);
detail.overlay.classList.remove('active');
// Mobile navigation and viewport changes must never disable a dialog's inputs.
media.matches = true;
media.events.change();
menu.events.click();
assert.equal(main.inert, true);
openDialog(detail.overlay);
assert.equal(body.classList.contains('nav-open'), false);
media.matches = false;
media.events.change();
assert.equal(main.inert, true);
assert.equal(detail.field.closest('[inert]'), null);
closeDialog(detail.overlay);
assert.equal(main.inert, false);
assert.equal(sidebar.inert, false);

// Respect the requested visual constraints across account and admin UI sources.
for (const file of ['Views/Shared/_AuthLayout.cshtml', 'Views/Shared/_AdminLayout.cshtml',
    'Views/Shared/_AdminSidebar.cshtml', 'Views/Account/Login.cshtml',
    'Views/Account/Register.cshtml', 'Views/Account/ForgotPassword.cshtml',
    'wwwroot/js/auth.js', 'wwwroot/js/admin-dashboard.js',
    'wwwroot/js/floor-management.js', 'wwwroot/js/user-management.js',
    'Areas/Admin/Views/Listing/Index.cshtml', 'Areas/Admin/Views/Notification/Index.cshtml']) {
    assert.equal(/\p{Extended_Pictographic}/u.test(source(file)), false, file);
}
for (const file of ['wwwroot/css/auth.css', 'wwwroot/css/admin.css']) {
    assert.match(source(file), /prefers-reduced-motion/);
    assert.doesNotMatch(source(file), /(?:linear|radial)-gradient\(/);
}
console.log('PASS: password visibility, confirmation, submit validation, occupancy feedback, admin dialog input/focus/closing/mobile behavior, and visual constraints.');
