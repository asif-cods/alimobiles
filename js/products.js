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

    // Determine active categories for dynamic UI
    let activeCats = [];
    if (catFilter !== 'all') activeCats.push(catFilter);
    if (checkedCats.length > 0) activeCats = [...new Set([...activeCats, ...checkedCats])];

    // If search query is present, try to guess categories
    if (searchQuery) {
        const brands = ['apple', 'samsung', 'vivo', 'oppo', 'realme', 'xiaomi'];
        if (searchQuery.includes('case') || searchQuery.includes('cover') || brands.some(b => searchQuery.includes(b))) activeCats.push('covers');
        if (searchQuery.includes('display') || searchQuery.includes('screen') || searchQuery.includes('lcd')) activeCats.push('display');
        if (searchQuery.includes('glass') || searchQuery.includes('temp')) activeCats.push('tempglass');
        if (searchQuery.includes('battery')) activeCats.push('battery');
        if (searchQuery.includes('speaker') || searchQuery.includes('sound') || searchQuery.includes('bt')) activeCats.push('speakers');
        if (searchQuery.includes('keyboard') || searchQuery.includes('mouse') || searchQuery.includes('Keyboard and mouse')) activeCats.push('keyboard');
        if (searchQuery.includes('storage') || searchQuery.includes('card') || searchQuery.includes('pendrive')) activeCats.push('storage');
        if (searchQuery.includes('power') || searchQuery.includes('bank')) activeCats.push('powerbank');
        if (searchQuery.includes('charger') || searchQuery.includes('cable') || searchQuery.includes('adapter')) activeCats.push('chargers');
        if (searchQuery.includes('headphone') || searchQuery.includes('buds') || searchQuery.includes('tws')) activeCats.push('headphones');
    }

    if (activeCats.length === 0) activeCats = ['all'];

    // Show/hide specific filter sections based on category
    document.querySelectorAll('.cat-spec-filter').forEach(el => {
        const c = el.getAttribute('data-cat');
        // Show if "all" is active OR if the specific category is in the active list
        if (activeCats.includes('all') || activeCats.includes(c)) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });

    const getFilterVal = (id) => {
        const d = document.getElementById(id);
        const m = document.getElementById(id + 'Mobile');
        if (d && d.value && d.value !== 'all' && d.value !== '') return d.value;
        if (m && m.value && m.value !== 'all' && m.value !== '') return m.value;
        return 'all';
    };

    const getModelVal = () => {
        const d = document.getElementById('modelFilter');
        const m = document.getElementById('modelFilterMobile');
        if (d && d.value.trim()) return d.value.toLowerCase().trim();
        if (m && m.value.trim()) return m.value.toLowerCase().trim();
        return '';
    };

    const modelFilter = getModelVal();
    const minPrice = getPrice('priceMin', 0);
    const maxPrice = getPrice('priceMax', 15000); // large default max

    // Extract dynamic filters values
    // Covers
    const coverBrand = getFilterVal('coverBrandFilter').toLowerCase();
    const coverColor = getFilterVal('coverColorFilter').toLowerCase();
    // Display
    const displayType = getFilterVal('displayTypeFilter').toLowerCase();
    // Temp Glass
    const glassType = getFilterVal('glassTypeFilter').toLowerCase();
    // Battery
    const batteryBrand = getFilterVal('batteryBrandFilter').toLowerCase();
    const batteryMah = getFilterVal('batteryMahFilter').toLowerCase();
    // Speakers
    const speakerBrand = getFilterVal('speakerBrandFilter').toLowerCase();
    const speakerConn = getFilterVal('speakerConnFilter').toLowerCase();
    // KB
    const kbBrand = getFilterVal('kbBrandFilter').toLowerCase();
    const kbConn = getFilterVal('kbConnFilter').toLowerCase();
    // Storage
    const storageType = getFilterVal('storageFilter').toLowerCase();
    // PowerBank
    const pbBrand = getFilterVal('pbBrandFilter').toLowerCase();
    const pbMah = getFilterVal('pbMahFilter').toLowerCase();

    const sortSelect = document.getElementById('sortSelect');
    const sortBy = sortSelect ? sortSelect.value : 'default';

    filteredProducts = PRODUCTS.filter(p => {
        const pCat = p.cat ? p.cat.toLowerCase() : '';
        const matchCat = catFilter !== 'all'
            ? pCat === catFilter
            : (checkedCats.length === 0 || checkedCats.includes(pCat));

        const matchPrice = p.price >= minPrice && p.price <= maxPrice;

        const matchSearch = !searchQuery ||
            p.name.toLowerCase().includes(searchQuery) ||
            pCat.includes(searchQuery);

        const matchModel = !modelFilter || p.name.toLowerCase().includes(modelFilter) || (p.model && p.model.toLowerCase().includes(modelFilter));

        // Category-Specific matching
        let matchSpec = true;
        if (pCat === 'covers') {
            if (coverBrand !== 'all' && (!p.mobileBrand || p.mobileBrand.toLowerCase() !== coverBrand)) matchSpec = false;
            if (coverColor !== 'all' && (!p.color || p.color.toLowerCase() !== coverColor)) matchSpec = false;
        } else if (pCat === 'display') {
            if (displayType !== 'all' && (!p.brand || p.brand.toLowerCase() !== displayType) && (!p.type || p.type.toLowerCase() !== displayType)) matchSpec = false;
        } else if (pCat === 'tempglass') {
            if (glassType !== 'all' && (!p.type || p.type.toLowerCase() !== glassType)) matchSpec = false;
        } else if (pCat === 'battery') {
            if (batteryBrand !== 'all' && (!p.brand || p.brand.toLowerCase() !== batteryBrand)) matchSpec = false;
            if (batteryMah !== 'all' && (!p.mah || p.mah.toString() !== batteryMah)) matchSpec = false;
        } else if (pCat === 'speakers') {
            if (speakerBrand !== 'all' && (!p.brand || p.brand.toLowerCase() !== speakerBrand)) matchSpec = false;
            if (speakerConn !== 'all' && (!p.connection || p.connection.toLowerCase() !== speakerConn)) matchSpec = false;
        } else if (pCat === 'keyboard') {
            if (kbBrand !== 'all' && (!p.brand || p.brand.toLowerCase() !== kbBrand)) matchSpec = false;
            if (kbConn !== 'all' && (!p.connection || p.connection.toLowerCase() !== kbConn)) matchSpec = false;
        } else if (pCat === 'storage') {
            if (storageType !== 'all' && (!p.capacity || p.capacity.toLowerCase() !== storageType) && (!p.type || p.type.toLowerCase() !== storageType)) matchSpec = false;
        } else if (pCat === 'powerbank') {
            if (pbBrand !== 'all' && (!p.brand || p.brand.toLowerCase() !== pbBrand)) matchSpec = false;
            if (pbMah !== 'all' && (!p.mah || p.mah.toString() !== pbMah)) matchSpec = false;
        }

        return matchCat && matchPrice && matchSearch && matchModel && matchSpec;
    });

    if (sortBy === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'discount') filteredProducts.sort((a, b) => (b.oldPrice - b.price) / b.oldPrice - (a.oldPrice - a.price) / a.oldPrice);

    currentPage = 1;
    renderProducts();
    renderPagination();
    updateResultCount();
}

function getPrice(id, fallback) {
    const d = document.getElementById(id);
    const m = document.getElementById(id + 'Mobile');
    if (d && d.value) return parseFloat(d.value);
    if (m && m.value) return parseFloat(m.value);
    return fallback;
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
            <img src="${fixImgPath(p.img)}" alt="${p.name}" class="product-grid-img" loading="lazy" />
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

    document.getElementById('modalProductImg').src = fixImgPath(p.img);
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

    const resetVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
        const elm = document.getElementById(id + 'Mobile');
        if (elm) elm.value = val;
    };

    resetVal('modelFilter', '');
    ['priceMin'].forEach(id => resetVal(id, '0'));
    ['priceMax'].forEach(id => resetVal(id, '15000'));

    ['coverBrandFilter', 'coverColorFilter', 'displayTypeFilter', 'glassTypeFilter', 'batteryBrandFilter', 'batteryMahFilter', 'speakerBrandFilter', 'speakerConnFilter', 'kbBrandFilter', 'kbConnFilter', 'storageFilter', 'pbBrandFilter', 'pbMahFilter'].forEach(id => resetVal(id, 'all'));

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';
    const productSearch = document.getElementById('productSearch');
    if (productSearch) productSearch.value = '';
    const url = new URL(window.location.href);
    url.searchParams.delete('cat');
    url.searchParams.delete('search');
    history.replaceState(null, '', url);
    updatePriceRangeSlider(false);
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


function updatePriceRangeSlider(sourceMobile) {
    const srcSuffix = sourceMobile ? 'Mobile' : '';
    const destSuffix = sourceMobile ? '' : 'Mobile';

    const srcMin = document.getElementById('priceMin' + srcSuffix);
    const srcMax = document.getElementById('priceMax' + srcSuffix);
    const destMin = document.getElementById('priceMin' + destSuffix);
    const destMax = document.getElementById('priceMax' + destSuffix);

    if (!srcMin || !srcMax) return;

    let minVal = parseInt(srcMin.value);
    let maxVal = parseInt(srcMax.value);

    // Gap enforcement
    if (maxVal - minVal < 500) {
        if (event && event.target === srcMin) {
            srcMin.value = maxVal - 500;
            minVal = parseInt(srcMin.value);
        } else {
            srcMax.value = minVal + 500;
            maxVal = parseInt(srcMax.value);
        }
    }

    const updateDisplay = (suffix, mi, ma, inputMax) => {
        const prog = document.getElementById('sliderProgress' + suffix);
        const disp = document.getElementById('priceRangeDisplay' + suffix);
        if (prog) {
            prog.style.left = (mi / inputMax) * 100 + "%";
            prog.style.right = 100 - (ma / inputMax) * 100 + "%";
        }
        if (disp) {
            let maxStr = ma >= inputMax ? ma.toLocaleString('en-IN') + '+' : ma.toLocaleString('en-IN');
            disp.textContent = `₹${mi.toLocaleString('en-IN')} - ₹${maxStr}`;
        }
    };

    updateDisplay(srcSuffix, minVal, maxVal, parseInt(srcMax.max));

    if (destMin && destMax) {
        destMin.value = minVal;
        destMax.value = maxVal;
        updateDisplay(destSuffix, minVal, maxVal, parseInt(destMax.max));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updatePriceRangeSlider(false);
});
