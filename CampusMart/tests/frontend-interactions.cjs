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
console.log('PASS: password visibility, confirmation, submit validation, occupancy feedback, and visual constraints.');
