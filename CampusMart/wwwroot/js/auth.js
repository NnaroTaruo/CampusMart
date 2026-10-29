document.querySelectorAll('[data-password]').forEach(button => {
    button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.password);
        const visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        button.setAttribute('aria-pressed', String(visible));
        button.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
    });
});

const authToast = document.getElementById('authToast');
if (authToast) {
    const message = authToast.dataset.error || authToast.dataset.success;
    if (message) {
        authToast.textContent = message;
        authToast.dataset.type = authToast.dataset.error ? 'error' : 'success';
        requestAnimationFrame(() => authToast.classList.add('show'));
        setTimeout(() => authToast.classList.remove('show'), 6000);
    }
}

const password = document.getElementById('Password');
const confirmation = document.getElementById('ConfirmPassword');
if (password && confirmation) {
    const checkMatch = () => {
        confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value
            ? 'The passwords do not match.' : '');
    };
    password.addEventListener('input', checkMatch);
    confirmation.addEventListener('input', checkMatch);
}

document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', () => {
        if (!form.checkValidity() || (window.jQuery && !window.jQuery(form).valid())) return;
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        button.querySelector('span').textContent = 'Please wait...';
        form.setAttribute('aria-busy', 'true');
    });
});
window.addEventListener('pageshow', event => {
    if (event.persisted) location.reload();
});
