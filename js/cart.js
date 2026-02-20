/* =============================================
   MOBILE ZONE – CART JAVASCRIPT
   localStorage-based cart management
   ============================================= */

'use strict';

const CART_KEY = 'mz_cart';

// ============================================
// Get Cart
// ============================================
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

// ============================================
// Save Cart
// ============================================
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateAllCartBadges();
}

// ============================================
// Add To Cart
// ============================================
function addToCart(product) {
    let cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty = (existing.qty || 1) + (product.qty || 1);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || 0,
            img: product.img,
            category: product.category || product.cat || '',
            qty: product.qty || 1
        });
    }

    saveCart(cart);
    showCartToast(product.name);
}

// ============================================
// Remove From Cart
// ============================================
function removeFromCart(productId) {
    let cart = getCart().filter(item => item.id !== productId);
    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
}

// ============================================
// Update Quantity
// ============================================
function updateCartQty(productId, qty) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        item.qty = qty;
    }
    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
}

// ============================================
// Clear Cart
// ============================================
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateAllCartBadges();
}

// ============================================
// Update Cart Count Badges (all pages)
// ============================================
function updateAllCartBadges() {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
    document.querySelectorAll('#cartCount, #cartCountDesktop').forEach(el => {
        el.textContent = count;
    });
}

// ============================================
// Cart Toast Notification
// ============================================
function showCartToast(productName) {
    const toastEl = document.getElementById('cartToast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toastEl) return;

    if (toastMsg) toastMsg.textContent = `"${productName}" added to cart!`;

    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
}

// ============================================
// CART PAGE RENDERER
// ============================================
function renderCartPage() {
    const cartContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummarySection = document.getElementById('cartSummarySection');
    if (!cartContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartSummarySection) cartSummarySection.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartSummarySection) cartSummarySection.style.display = 'block';

    cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item-row" id="cartItem-${item.id}">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img" loading="lazy" />
      <div class="cart-item-info">
        <div class="cart-item-cat">${item.category || 'Accessory'}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
      </div>
      <div class="qty-control">
        <button onclick="updateCartQty(${item.id}, ${(item.qty || 1) - 1})">-</button>
        <span>${item.qty || 1}</span>
        <button onclick="updateCartQty(${item.id}, ${(item.qty || 1) + 1})">+</button>
      </div>
      <div class="ms-2 fw-bold" style="min-width:90px;text-align:right;">
        ₹${(item.price * (item.qty || 1)).toLocaleString('en-IN')}
      </div>
      <button class="btn btn-sm ms-2" style="color:var(--red);" onclick="removeFromCart(${item.id})" aria-label="Remove">
        <i class="bi bi-trash3"></i>
      </button>
    </div>
  `).join('');

    // Update summary
    const subtotal = cart.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
    const savings = cart.reduce((acc, item) => acc + ((item.oldPrice || item.price) - item.price) * (item.qty || 1), 0);
    const delivery = subtotal >= 499 ? 0 : 49;
    const total = subtotal + delivery;

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('cartSubtotal', '₹' + subtotal.toLocaleString('en-IN'));
    setEl('cartSavings', '₹' + savings.toLocaleString('en-IN'));
    setEl('cartDelivery', delivery === 0 ? 'FREE' : '₹' + delivery);
    setEl('cartTotal', '₹' + total.toLocaleString('en-IN'));
    setEl('cartItemCount', cart.length + ' item' + (cart.length !== 1 ? 's' : ''));
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAllCartBadges();
    if (document.getElementById('cartItems')) renderCartPage();
});
