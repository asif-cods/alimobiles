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
  initRevealAnimations();
  initCountdownTimer();
  initCartCount();
  // Init Dynamic Content
  initFeaturedProducts();
  initCategoriesSlider();
  initHotDeals();
  initHotDealsPage();
});

// ============================================
// CATEGORIES SLIDER
// ============================================
function initCategoriesSlider() {
  const track = document.getElementById('categoriesSliderTrack');
  const dotsEl = document.getElementById('categoriesSliderDots');
  if (!track || !dotsEl) return;

  const slides = track.querySelectorAll('.category-slide');
  let currentSlide = 0;
  let sliderInterval = null;

  // Create dots
  dotsEl.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'category-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to category ' + (i + 1));
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  });

  function getItemsPerView() {
    if (window.innerWidth >= 1200) return 6;
    if (window.innerWidth >= 992) return 5;
    if (window.innerWidth >= 768) return 4;
    if (window.innerWidth >= 576) return 3;
    return 2;
  }

  function goToSlide(index) {
    const itemsPerView = getItemsPerView();
    const maxSlide = Math.max(0, slides.length - itemsPerView);

    if (index > maxSlide) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = maxSlide;
    } else {
      currentSlide = index;
    }

    const slideWidth = slides[0].offsetWidth;
    track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    const dots = dotsEl.querySelectorAll('.category-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function startAutoSlider() {
    stopAutoSlider();
    sliderInterval = setInterval(() => goToSlide(currentSlide + 1), 4000);
  }

  function stopAutoSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
  }

  track.addEventListener('mouseenter', stopAutoSlider);
  track.addEventListener('mouseleave', startAutoSlider);

  // Drag / Touch Support
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  track.addEventListener('touchstart', touchStart);
  track.addEventListener('touchend', touchEnd);
  track.addEventListener('touchmove', touchMove);
  track.addEventListener('mousedown', touchStart);
  track.addEventListener('mouseup', touchEnd);
  track.addEventListener('mouseleave', touchEnd);
  track.addEventListener('mousemove', touchMove);

  function touchStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    stopAutoSlider();
    track.style.transition = 'none';
    const transform = window.getComputedStyle(track).transform;
    if (transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      prevTranslate = matrix.m41;
    } else {
      prevTranslate = 0;
    }
  }

  function touchEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = 'transform 0.45s cubic-bezier(.77, 0, .18, 1)';

    const movedBy = currentTranslate - prevTranslate;
    const slideWidth = slides[0].offsetWidth;

    if (movedBy < -100) {
      goToSlide(currentSlide + 1);
    } else if (movedBy > 100) {
      goToSlide(currentSlide - 1);
    } else {
      goToSlide(currentSlide);
    }
    startAutoSlider();
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  window.addEventListener('resize', () => {
    goToSlide(currentSlide);
  });

  startAutoSlider();
}


// ============================================
// PRODUCTS DATA (shared across pages)
// ============================================
const PRODUCTS = [
  { id: 1, name: 'Dell Keyboard and Mouse', cat: 'keyboard', price: 499, oldPrice: 699, img: '../images/KM-1.png', images: ['../images/KM-1.png', '../images/HE-1.png', '../images/KM-1.png'], rating: 4, reviews: 45, desc: 'Fast Latency Keyboard and Mouse combo.', brand: 'DELL' },
  { id: 2, name: 'Sony WH-1000XM5', cat: 'headphones', price: 8999, oldPrice: 12999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop', 'https://images.unsplash.com/photo-1505740420928?w=600&h=500&fit=crop'], rating: 5, reviews: 214, desc: 'Industry-leading noise cancellation.', brand: 'OUD', model: 'WH-1000XM5' },
  { id: 3, name: '65W GaN Fast Charger', cat: 'chargers', price: 1299, oldPrice: 1999, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 89, desc: 'Compact GaN technology.', brand: 'ZEBRONICS', watts: 65, model: 'FastCharge65' },
  { id: 4, name: 'Armor Phone Case', cat: 'covers', price: 399, oldPrice: 699, img: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 156, desc: 'Military-grade drop protection.', brand: 'MZ' },
  { id: 5, name: '20000mAh Power Bank', cat: 'powerbank', price: 1499, oldPrice: 2499, img: 'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating: 5, reviews: 302, desc: 'Massive capacity with dual USB.', brand: 'REDME', mah: 20000 },
  { id: 6, name: 'boAt TWS Earbuds Pro', cat: 'headphones', price: 1999, oldPrice: 3499, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 178, desc: 'Active noise cancellation.', brand: 'BOAT', model: 'Airdopes 441' },
  { id: 7, name: 'OLED Display Screen', cat: 'display', price: 2499, oldPrice: 3999, img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 67, desc: 'High-resolution OLED replacement.', brand: 'ORIGINAL BRAND' },
  { id: 8, name: 'Braided USB-C Cable 120W', cat: 'chargers', price: 299, oldPrice: 499, img: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&h=500&fit=crop&auto=format', rating: 5, reviews: 421, desc: 'Premium nylon-braided cable.', brand: 'RD', watts: 120 },
  { id: 9, name: 'Slim 10000mAh PD Bank', cat: 'powerbank', price: 999, oldPrice: 1799, img: 'https://images.unsplash.com/photo-1585338070-5b2c5f3a5b5b?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 93, desc: 'Ultra-slim 10000mAh with 18W PD.', brand: 'LAPCARE', mah: 10000 },
  { id: 10, name: 'Realme Buds Premium', cat: 'headphones', price: 4499, oldPrice: 8999, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop&auto=format', rating: 5, reviews: 128, desc: 'Extra bass deep sound.', brand: 'REALME', model: 'Buds Wireless Pro' },
  { id: 11, name: '100W Super Fast Charger', cat: 'chargers', price: 1099, oldPrice: 1999, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating: 5, reviews: 256, desc: '100W USB-C PD charging.', brand: 'OUD', watts: 85 },
  { id: 12, name: '360° Protection Cover', cat: 'covers', price: 299, oldPrice: 499, img: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 89, desc: 'Full-body 360° protection case.', brand: 'VALI' },
  { id: 13, name: 'Anker 12000mAh Power Bank', cat: 'powerbank', price: 1949, oldPrice: 2999, img: 'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating: 5, reviews: 312, desc: 'Massive capacity with triple ports.', brand: 'VALI', mah: 12000 },
  { id: 14, name: 'Li-Ion 5000mAh Battery', cat: 'battery', price: 799, oldPrice: 1299, img: 'https://images.unsplash.com/photo-1609592806596-b12f6bde1c78?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 54, desc: 'High-capacity replacement battery.', brand: 'MOBATREE', mah: 5000 },
  { id: 15, name: 'Wireless Charger Pad 20W', cat: 'chargers', price: 699, oldPrice: 1199, img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 112, desc: '20W max wireless charging.', brand: 'ZEBRONICS', watts: 20 },
  { id: 16, name: 'Clear Transparent Cover', cat: 'covers', price: 199, oldPrice: 349, img: 'https://images.unsplash.com/photo-1601972602237-8c79241e468b?w=600&h=500&fit=crop&auto=format', rating: 3, reviews: 67, desc: 'Ultra-thin crystal clear TPU case.' },
  { id: 17, name: 'SanDisk 128GB Pendrive', cat: 'storage', price: 899, oldPrice: 1499, img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&h=500&fit=crop&auto=format', rating: 4, reviews: 38, desc: 'Fast transfer OTG pendrive.', brand: 'SANDISK', gb: 128 },

];


window.PRODUCTS = PRODUCTS;

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
// Helper to fix local pathing
function fixImgPath(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  const isInPages = window.location.pathname.includes('/pages/');
  const cleanPath = path.replace(/^\.\//, '');

  if (isInPages && !cleanPath.startsWith('../')) {
    return '../' + cleanPath;
  }
  return cleanPath;
}

let currentModalQty = 1;
let currentModalProduct = null;

function openProductModal(productId) {
  const p = PRODUCTS.find(prod => prod.id === productId);
  if (!p) return;
  currentModalProduct = p;
  currentModalQty = 1;

  document.getElementById('modalProductImg').src = fixImgPath(p.img);
  document.getElementById('modalProductImg').alt = p.name;
  document.getElementById('modalProductCat').textContent = p.cat;
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
    starsHtml += `<i class="bi bi-star-fill${i > p.rating ? ' text-muted' : ''}"></i>`;
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

// ============================================
// DYNAMIC PRODUCTS RENDERING
// ============================================

function initFeaturedProducts() {
  const container = document.getElementById('featuredCarouselInner');
  if (!container) return;

  // Take first 8 products for featured (2 slides of 4)
  const featured = PRODUCTS.slice(0, 8);
  let html = '';

  for (let i = 0; i < featured.length; i += 4) {
    const chunk = featured.slice(i, i + 4);
    html += `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="row g-3 px-2">
          ${chunk.map(p => {
      const disc = Math.round((1 - p.price / p.oldPrice) * 100);
      return `
              <div class="col-6 col-md-3">
                <div class="product-slide-card" onclick="openProductModal(${p.id})">
                  <div class="product-slide-img-wrap">
                    <img src="${fixImgPath(p.img)}" alt="${p.name}" class="product-slide-img" loading="lazy" />
                  </div>
                  <div class="product-slide-info">
                    <span class="product-category">${p.cat}</span>
                    <h6 class="product-name">${p.name}</h6>
                    <div class="product-price-row">
                      <span class="price-new">₹${p.price.toLocaleString('en-IN')}</span>
                      <span class="price-old">₹${p.oldPrice.toLocaleString('en-IN')}</span>
                      <span class="discount-badge-sm">-${disc}%</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function initHotDeals() {
  const container = document.getElementById('hotDealsGrid');
  if (!container) return;

  // Take products 9-12 for hot deals
  const deals = PRODUCTS.slice(8, 12);

  container.innerHTML = deals.map(p => {
    const disc = Math.round((1 - p.price / p.oldPrice) * 100);
    return `
      <div class="col-6 col-md-3">
        <a href="pages/product-detail.html?id=${p.id}" class="deal-card-custom">
          <div class="deal-img-box">
            <img src="${fixImgPath(p.img)}" alt="${p.name}" loading="lazy">
          </div>
          <div class="deal-info-custom">
            <span class="product-category text-uppercase">${p.cat}</span>
            <h6 class="deal-name-custom fw-bold">${p.name}</h6>
            <div class="product-price-row">
              <span class="price-new">₹${p.price.toLocaleString('en-IN')}</span>
              <span class="price-old">₹${p.oldPrice.toLocaleString('en-IN')}</span>
              <span class="discount-badge-sm">-${disc}%</span>
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');
}

function initHotDealsPage() {
  const container = document.getElementById('hotDealsPageGrid');
  if (!container) return;

  // Filter products that have a significant discount (>20%)
  const deals = PRODUCTS.filter(p => ((1 - p.price / p.oldPrice) * 100) > 44);

  container.innerHTML = deals.map(p => {
    const disc = Math.round((1 - p.price / p.oldPrice) * 100);
    // reveal, (class)
    return `
      <div class="col-6 col-lg-3 ">
        <div class="deal-card">
          <div class="deal-badge">🔥 ${disc}% OFF</div>
          <a href="product-detail.html?id=${p.id}">
            <div class="deal-img-wrap">
              <img src="${fixImgPath(p.img)}" alt="${p.name}" class="deal-img" loading="lazy" />
            </div>
          </a>
          <div class="deal-body">
            <h6 class="deal-name">${p.name}</h6>
            <div class="deal-prices">
              <span class="deal-price-new">₹${p.price.toLocaleString('en-IN')}</span>
              <span class="deal-price-old">₹${p.oldPrice.toLocaleString('en-IN')}</span>
            </div>
            <div class="deal-stars">
              ${Array.from({ length: 5 }, (_, i) => `<i class="bi bi-star-fill${i >= p.rating ? ' text-muted' : ''}"></i>`).join('')}
              <span>(${p.reviews || 0})</span>
            </div>
            <button class="btn btn-add-cart w-100 mt-2" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
              <i class="bi bi-cart-plus me-1"></i>Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function changeQty(delta) {
  currentModalQty = Math.max(1, currentModalQty + delta);
  const el = document.getElementById('qtyValue');
  if (el) el.textContent = currentModalQty;
}


