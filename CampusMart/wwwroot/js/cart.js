// Cart JS
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.cart-qty button').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.dataset.action;
            const itemId = this.closest('.cart-item')?.dataset.itemId;
            const qtySpan = this.parentElement.querySelector('span');
            let qty = parseInt(qtySpan?.textContent || '1');
            if (action === 'increase') qty++;
            else if (action === 'decrease' && qty > 1) qty--;
            if (qtySpan) qtySpan.textContent = qty;
            updateCartTotal();
        });
    });

    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function () {
            const item = this.closest('.cart-item');
            if (item) { item.style.opacity = '0'; setTimeout(() => { item.remove(); updateCartTotal(); }, 300); }
        });
    });

    function updateCartTotal() {
        let subtotal = 0;
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = parseFloat(item.querySelector('.cart-item-price')?.textContent.replace('$', '') || 0);
            const qty = parseInt(item.querySelector('.cart-qty span')?.textContent || 1);
            subtotal += price * qty;
        });
        const subtotalEl = document.getElementById('cartSubtotal');
        const totalEl = document.getElementById('cartTotal');
        if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + subtotal.toFixed(2);
    }
});
