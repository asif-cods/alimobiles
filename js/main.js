/* =============================================
   MOBILE ZONE – MAIN JAVASCRIPT
   ============================================= */

'use strict';

// ============================================
// DOM Ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollTop();
  initSearch();
  initRevealAnimations();
  initCountdownTimer();
  initCartCount();
});

// ============================================
// NAVBAR – Scroll shadow + Active Link
// ============================================
function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  // Scroll effects
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateScrollTopBtn();
  });

  // Active nav link highlighting (for home page sections)
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-section]');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
  }

  // Highlight current page nav link
  const currentPage = window.location.pathname.split('/').pop();
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(currentPage) && currentPage !== '') {
      link.classList.add('active');
    }
  });
}

// ============================================
// SCROLL TO TOP BUTTON
// ============================================
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateScrollTopBtn() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

// ============================================
// SEARCH OVERLAY
// ============================================
function initSearch() {
  const toggleBtns = [
    document.getElementById('searchToggle'),
    document.getElementById('mobileSearchToggle')
  ];
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('closeSearch');
  const searchInput = document.getElementById('searchInput');

  if (!overlay) return;

  toggleBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.toggle('active');
        if (overlay.classList.contains('active') && searchInput) {
          setTimeout(() => searchInput.focus(), 100);
        }
      });
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  }

  // Search on Enter
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch(searchInput.value.trim());
    });
  }
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (searchInput) doSearch(searchInput.value.trim());
    });
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });
}

function doSearch(query) {
  if (!query) return;
  window.location.href = `pages/products.html?search=${encodeURIComponent(query)}`;
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .section-header, .why-card, .deal-card, .category-card, .review-card, .product-slide-card, .product-grid-card');

  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function initCountdownTimer() {
  const hEl = document.getElementById('countdown-h');
  const mEl = document.getElementById('countdown-m');
  const sEl = document.getElementById('countdown-s');

  if (!hEl || !mEl || !sEl) return;

  // Set deal to end at midnight tonight
  const now = new Date();
  const endTime = new Date();
  endTime.setHours(23, 59, 59, 0);

  let storageKey = 'mz_deal_end';
  let savedEnd = localStorage.getItem(storageKey);
  if (!savedEnd || new Date(savedEnd) < now) {
    localStorage.setItem(storageKey, endTime.toISOString());
    savedEnd = endTime.toISOString();
  }

  const target = new Date(savedEnd);

  function tick() {
    const diff = target - new Date();
    if (diff <= 0) {
      hEl.textContent = '00';
      mEl.textContent = '00';
      sEl.textContent = '00';
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    hEl.textContent = String(h).padStart(2, '0');
    mEl.textContent = String(m).padStart(2, '0');
    sEl.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

// ============================================
// CART COUNT DISPLAY
// ============================================
function initCartCount() {
  const cart = JSON.parse(localStorage.getItem('mz_cart') || '[]');
  const count = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const badges = document.querySelectorAll('#cartCount, #cartCountDesktop');
  badges.forEach(b => { if (b) b.textContent = count; });
}

// ============================================
// PRODUCT MODAL
// ============================================
let currentModalQty = 1;
let currentModalProduct = null;

function openProductModal(index) {
  if (typeof featuredProducts === 'undefined' || !featuredProducts[index]) return;
  const p = featuredProducts[index];
  currentModalProduct = p;
  currentModalQty = 1;

  document.getElementById('modalProductImg').src = p.img;
  document.getElementById('modalProductImg').alt = p.name;
  document.getElementById('modalProductCat').textContent = p.category;
  document.getElementById('modalProductName').textContent = p.name;
  document.getElementById('modalPriceNew').textContent = '₹' + p.price.toLocaleString('en-IN');
  document.getElementById('modalPriceOld').textContent = '₹' + p.oldPrice.toLocaleString('en-IN');
  const disc = Math.round((1 - p.price / p.oldPrice) * 100);
  document.getElementById('modalDiscount').textContent = `-${disc}%`;
  document.getElementById('modalProductDesc').textContent = p.desc || '';
  document.getElementById('qtyValue').textContent = 1;

  // Stars
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<i class="bi bi-star-fill${i > p.stars ? ' text-muted' : ''}"></i>`;
  }
  document.getElementById('modalStars').innerHTML = starsHtml;

  // Add to cart button
  document.getElementById('modalAddCart').onclick = () => {
    const item = { ...p, qty: currentModalQty };
    addToCart(item);
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (modal) modal.hide();
  };

  // View detail link
  document.getElementById('modalViewDetail').href = `pages/product-detail.html?id=${p.id}`;

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

function changeQty(delta) {
  currentModalQty = Math.max(1, currentModalQty + delta);
  const el = document.getElementById('qtyValue');
  if (el) el.textContent = currentModalQty;
}

// ============================================
// PRODUCTS DATA (shared across pages)
// ============================================
const PRODUCTS = [
  { id:1,  name:'Sony WH-1000XM5',         cat:'headphones', price:8999,  oldPrice:12999, img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format', rating:5, reviews:214, desc:'Industry-leading noise cancellation. 30-hour battery life. Crystal clear calls.' },
  { id:2,  name:'65W GaN Fast Charger',     cat:'chargers',   price:1299,  oldPrice:1999,  img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating:4, reviews:89,  desc:'Compact GaN technology. Charges laptop, phone, tablet simultaneously.' },
  { id:3,  name:'Armor Phone Case',          cat:'covers',     price:399,   oldPrice:699,   img:'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating:4, reviews:156, desc:'Military-grade drop protection. Slim profile with raised camera bezels.' },
  { id:4,  name:'20000mAh Power Bank',       cat:'powerbank',  price:1499,  oldPrice:2499,  img:'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating:5, reviews:302, desc:'Massive capacity with dual USB + USB-C PD output. LED charge indicator.' },
  { id:5,  name:'TWS Earbuds Pro',           cat:'headphones', price:1999,  oldPrice:3499,  img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=500&fit=crop&auto=format', rating:4, reviews:178, desc:'Active noise cancellation with 8-hour playtime + 24hr case.' },
  { id:6,  name:'OLED Display Screen',       cat:'display',    price:2499,  oldPrice:3999,  img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=500&fit=crop&auto=format', rating:4, reviews:67,  desc:'High-resolution OLED replacement panel. True-color display technology.' },
  { id:7,  name:'Braided USB-C Cable',       cat:'chargers',   price:299,   oldPrice:499,   img:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=500&fit=crop&auto=format', rating:5, reviews:421, desc:'Premium nylon-braided cable. Supports 100W fast charging. 1.5m length.' },
  { id:8,  name:'Slim 10000mAh PD Bank',     cat:'powerbank',  price:999,   oldPrice:1799,  img:'https://images.unsplash.com/photo-1585338070-5b2c5f3a5b5b?w=600&h=500&fit=crop&auto=format', rating:4, reviews:93,  desc:'Ultra-slim 10000mAh with 18W PD. Airline-friendly portable design.' },
  { id:9,  name:'XB900 Premium Headphones',  cat:'headphones', price:4499,  oldPrice:8999,  img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format', rating:5, reviews:128, desc:'Extra bass deep sound with 35-hour battery. Foldable design.' },
  { id:10, name:'100W Super Fast Charger',   cat:'chargers',   price:1099,  oldPrice:1999,  img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating:5, reviews:256, desc:'100W USB-C PD charging. GaN technology. Compact travel charger.' },
  { id:11, name:'360° Protection Cover',     cat:'covers',     price:299,   oldPrice:499,   img:'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating:4, reviews:89,  desc:'Full-body 360° protection case with tempered glass screen protector.' },
  { id:12, name:'Anker 26800mAh Power Bank', cat:'powerbank',  price:1949,  oldPrice:2999,  img:'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating:5, reviews:312, desc:'Massive 26800mAh with triple ports. Charge 3 devices simultaneously.' },
  { id:13, name:'Li-Ion 4500mAh Battery',   cat:'battery',    price:799,   oldPrice:1299,  img:'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating:4, reviews:54,  desc:'High-capacity Li-Ion replacement battery. 500+ charge cycle life.' },
  { id:14, name:'Wireless Charger Pad',      cat:'chargers',   price:699,   oldPrice:1199,  img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating:4, reviews:112, desc:'15W max wireless charging. Compatible with all Qi-enabled devices.' },
  { id:15, name:'Clear Transparent Cover',  cat:'covers',     price:199,   oldPrice:349,   img:'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating:3, reviews:67,  desc:'Ultra-thin crystal clear TPU case. Anti-yellowing technology.' },
  { id:16, name:'IPS Display Replacement',  cat:'display',    price:1899,  oldPrice:2999,  img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=500&fit=crop&auto=format', rating:4, reviews:38,  desc:'Full HD IPS LCD replacement. Touch digitizer pre-assembled.' },
];

window.PRODUCTS = PRODUCTS;
