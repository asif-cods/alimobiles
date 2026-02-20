/* =============================================
   MOBILE ZONE – PRODUCTS LISTING JAVASCRIPT
   Filtering, sorting, pagination, search
   ============================================= */

'use strict';

let filteredProducts = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 8;

document.addEventListener('DOMContentLoaded', () => {
    // Get URL params
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search') || '';
    const catFilter = params.get('cat') || 'all';

    // Pre-select category in filter sidebar
    if (catFilter !== 'all') {
        const checkboxes = document.querySelectorAll('.cat-filter-check');
        checkboxes.forEach(cb => {
            cb.checked = cb.value === catFilter;
        });
        const catTitle = document.getElementById('categoryTitle');
        if (catTitle) catTitle.textContent = catFilter.charAt(0).toUpperCase() + catFilter.slice(1);
    }

    // Pre-fill search input
    const searchInputs = document.querySelectorAll('#searchInput, #productSearch');
    searchInputs.forEach(input => { if (input) input.value = searchQuery; });

    // Initialize filters
    applyFilters();
    initFilterListeners();
});

// ============================================
// Apply All Filters & Render
// ============================================
function applyFilters() {
    if (typeof PRODUCTS === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const searchQuery = (document.getElementById('productSearch')?.value || params.get('search') || '').toLowerCase();
    const catFilter = params.get('cat') || 'all';

    // Get checked categories from sidebar
    const checkedCats = [...document.querySelectorAll('.cat-filter-check:checked')].map(c => c.value);

    // Price range
    const priceRange = document.getElementById('priceRange');
    const maxPrice = priceRange ? parseInt(priceRange.value) : 15000;

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect ? sortSelect.value : 'default';

    // Filter
    filteredProducts = PRODUCTS.filter(p => {
        const matchCat = catFilter !== 'all'
            ? p.cat === catFilter
            : (checkedCats.length === 0 || checkedCats.includes(p.cat));
        const matchPrice = p.price <= maxPrice;
        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            p.cat.toLowerCase().includes(searchQuery);
        return matchCat && matchPrice && matchSearch;
    });

    // Sort
    if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'discount') filteredProducts.sort((a, b) => (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice);

    currentPage = 1;
    renderProducts();
    renderPagination();
    updateResultCount();
}

// ============================================
// Render Products Grid
// ============================================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

    if (pageProducts.length === 0) {
        grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search" style="font-size:3rem;color:var(--mid-gray)"></i>
        <h5 class="mt-3 text-muted">No products found</h5>
        <p class="text-muted">Try adjusting your filters or search query</p>
        <button class="btn btn-outline-primary-custom mt-2" onclick="clearFilters()">Clear Filters</button>
      </div>`;
        return;
    }

    grid.innerHTML = pageProducts.map(p => {
        const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<i class="bi bi-star-fill${i >= p.rating ? ' text-muted' : ''}"></i>`
        ).join('');

        return `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="product-grid-card">
          <div class="product-grid-img-wrap">
            ${disc ? `<span class="product-grid-badge">-${disc}%</span>` : ''}
            <img src="${p.img}" alt="${p.name}" class="product-grid-img" loading="lazy" />
            <div class="product-grid-actions">
              <button class="action-btn-sm" onclick="openQuickView(${p.id})" title="Quick View"><i class="bi bi-eye"></i></button>
              <button class="action-btn-sm" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})" title="Add to Cart"><i class="bi bi-cart-plus"></i></button>
            </div>
          </div>
          <div class="product-grid-body">
            <div class="product-category text-uppercase" style="font-size:.72rem;font-weight:700;color:var(--blue)">${p.cat}</div>
            <a href="product-detail.html?id=${p.id}" class="product-name d-block fw-700" style="font-size:.9rem;font-weight:700;color:var(--text-dark);margin:.2rem 0;">${p.name}</a>
            <div style="color:#FFC107;font-size:.75rem;">${stars} <span style="color:var(--text-muted);font-size:.7rem">(${p.reviews})</span></div>
            <div class="product-price-row mt-1">
              <span class="price-new">₹${p.price.toLocaleString('en-IN')}</span>
              ${p.oldPrice ? `<span class="price-old">₹${p.oldPrice.toLocaleString('en-IN')}</span>` : ''}
            </div>
            <button class="btn btn-add-cart w-100 mt-2" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
              <i class="bi bi-cart-plus me-1"></i>Add to Cart
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
}

// ============================================
// Open Quick View Modal
// ============================================
function openQuickView(productId) {
    const p = PRODUCTS.find(pr => pr.id === productId);
    if (!p) return;

    // Reuse the productModal from the page
    const modalEl = document.getElementById('productModal');
    if (!modalEl) {
        window.location.href = `product-detail.html?id=${productId}`;
        return;
    }

    document.getElementById('modalProductImg').src = p.img;
    document.getElementById('modalProductImg').alt = p.name;
    document.getElementById('modalProductCat').textContent = p.cat;
    document.getElementById('modalProductName').textContent = p.name;
    document.getElementById('modalPriceNew').textContent = '₹' + p.price.toLocaleString('en-IN');
    document.getElementById('modalPriceOld').textContent = p.oldPrice ? '₹' + p.oldPrice.toLocaleString('en-IN') : '';
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    document.getElementById('modalDiscount').textContent = disc ? `-${disc}%` : '';
    document.getElementById('modalProductDesc').textContent = p.desc || '';
    document.getElementById('qtyValue').textContent = 1;

    const starsHtml = Array.from({ length: 5 }, (_, i) =>
        `<i class="bi bi-star-fill${i >= p.rating ? ' text-muted' : ''}"></i>`
    ).join('');
    document.getElementById('modalStars').innerHTML = starsHtml;

    document.getElementById('modalAddCart').onclick = () => {
        const qty = parseInt(document.getElementById('qtyValue').textContent) || 1;
        addToCart({ ...p, qty });
        bootstrap.Modal.getInstance(modalEl)?.hide();
    };
    document.getElementById('modalViewDetail').href = `product-detail.html?id=${productId}`;

    new bootstrap.Modal(modalEl).show();
}

// ============================================
// Pagination
// ============================================
function renderPagination() {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let html = `<li class="page-item${currentPage === 1 ? ' disabled' : ''}">
    <a class="page-link" href="#" onclick="goToPage(${currentPage - 1})">‹</a></li>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item${i === currentPage ? ' active' : ''}">
      <a class="page-link" href="#" onclick="goToPage(${i})">${i}</a></li>`;
    }
    html += `<li class="page-item${currentPage === totalPages ? ' disabled' : ''}">
    <a class="page-link" href="#" onclick="goToPage(${currentPage + 1})">›</a></li>`;

    paginationEl.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProducts();
    renderPagination();
    document.getElementById('productsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Update result count
// ============================================
function updateResultCount() {
    const el = document.getElementById('resultCount');
    if (el) el.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`;
}

// ============================================
// Filter Event Listeners
// ============================================
function initFilterListeners() {
    // Category checkboxes
    document.querySelectorAll('.cat-filter-check').forEach(cb => {
        cb.addEventListener('change', () => {
            // Update URL to remove cat param when using sidebar filters
            const url = new URL(window.location.href);
            url.searchParams.delete('cat');
            history.replaceState(null, '', url);
            applyFilters();
        });
    });

    // Price range
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        const priceDisplay = document.getElementById('priceDisplay');
        priceRange.addEventListener('input', () => {
            if (priceDisplay) priceDisplay.textContent = '₹' + parseInt(priceRange.value).toLocaleString('en-IN');
            applyFilters();
        });
    }

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);

    // Search
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', debounce(applyFilters, 300));
    }
}

// ============================================
// Clear Filters
// ============================================
function clearFilters() {
    document.querySelectorAll('.cat-filter-check').forEach(cb => cb.checked = false);
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = priceRange.max;
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) priceDisplay.textContent = '₹' + parseInt(priceRange.max).toLocaleString('en-IN');
    }
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';
    const productSearch = document.getElementById('productSearch');
    if (productSearch) productSearch.value = '';
    const url = new URL(window.location.href);
    url.searchParams.delete('cat');
    url.searchParams.delete('search');
    history.replaceState(null, '', url);
    applyFilters();
}

// ============================================
// Debounce utility
// ============================================
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
