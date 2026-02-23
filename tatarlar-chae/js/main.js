'use strict';

window.addEventListener('DOMContentLoaded',()=>{
    //mob menu
    const menu = document.querySelector('.header__mob-outer'),
    close = document.querySelector('.header__cross'),
    burger = document.querySelector('.header__burger');
    
    burger.addEventListener('click',()=>{
        menu.classList.toggle('header__mob-outer--active');
    });
    close.addEventListener('click',()=>{
        menu.classList.remove('header__mob-outer--active');
    });
    
    // Закрытие на клик вне меню
    document.addEventListener('click',(e)=>{
        if (menu.classList.contains('header__mob-outer--active') && 
            !menu.contains(e.target) && 
            !burger.contains(e.target)) {
            menu.classList.remove('header__mob-outer--active');
        }
    });

    // Header menu dropdown
    function initHeaderDropdown() {
        const headerMenuItems = document.querySelectorAll('.header__menu-item--hover');
        const headerInner = document.querySelector('.header__inner');
        
        headerMenuItems.forEach(item => {
            let timeout;
            
            const showSubmenu = () => {
                clearTimeout(timeout);
                item.classList.add('header__menu-item--active');
            };
            
            const hideSubmenu = () => {
                timeout = setTimeout(() => {
                    item.classList.remove('header__menu-item--active');
                }, 100);
            };
            
            // Mouse enter on menu item
            item.addEventListener('mouseenter', showSubmenu);
            
            
            // Mouse enter on submenu
            const submenu = item.querySelector('.header__submenu');
            if (submenu) {
                submenu.addEventListener('mouseenter', showSubmenu);
            }
            
            headerInner.addEventListener('mouseleave', hideSubmenu);
        });
        
    }
    initHeaderDropdown();

    // Header background change on scroll
    function handleHeaderScroll() {
        const header = document.querySelector('.header__inner');
        const firstSection = document.querySelector('[data-section="hero"]');
        const headerMob = document.querySelector('.header__mob-outer');
        const headerSubMenu = document.querySelector('.header__submenu');
        
        if (firstSection) {
            const firstSectionBottom = firstSection.offsetHeight;
            
            if (window.scrollY > firstSectionBottom) {
                header.classList.add('header__inner--scrolled');
                headerMob.classList.add('header__mob-outer--scrolled');
                headerSubMenu.classList.add('header__submenu--scrolled');
            } else {
                header.classList.remove('header__inner--scrolled');
                headerMob.classList.remove('header__mob-outer--scrolled');
                headerSubMenu.classList.remove('header__submenu--scrolled');
            }
        }
    }

    handleHeaderScroll();
    window.addEventListener('scroll', handleHeaderScroll);


    //scroll animation
    if(document.querySelector('.scroll-animate')){
        const scrollAnimationCallback = function(entries,observer){
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    const target = entry.target;
                    target.classList.add('scroll-animate--active');
                    observer.unobserve(target);
                }
            });
        };
        const scrollAnimation = new IntersectionObserver(scrollAnimationCallback,{threshold:0.2});
        document.querySelectorAll('.scroll-animate').forEach(el=>{
            scrollAnimation.observe(el);
        });        

    }
    
    // FAQ accordion
    const faqItems = document.querySelectorAll('.faq__grid-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('faq__grid-item--active');
            
            // Закрываем все остальные элементы
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('faq__grid-item--active');
            });
            
            // Открываем текущий элемент, если он был закрыт
            if (!isActive) {
                item.classList.add('faq__grid-item--active');
            }
        });
    });

    // Закрытие на ESC
    document.addEventListener('keydown',(e)=>{
        if (e.key === 'Escape' && menu.classList.contains('header__mob-outer--active')) {
            menu.classList.remove('header__mob-outer--active');
        }
    });

    // Проверка переполнения вкладок
    function checkTabsOverflow() {
        const tabsContainer = document.querySelector('.furniture__tabs');
        if (!tabsContainer) return;

        const isOverflowing = tabsContainer.scrollWidth > tabsContainer.clientWidth;
        
        if (isOverflowing) {
            tabsContainer.classList.add('furniture__tabs--overflow');
        } else {
            tabsContainer.classList.remove('furniture__tabs--overflow');
        }
    }

    // Инициализация проверки переполнения
    if(document.querySelector('.furniture__tabs')) {
        checkTabsOverflow();
        window.addEventListener('resize', checkTabsOverflow);
    }

    // Скролл вкладок зажатой левой кнопкой мыши
    function initTabsWheelScroll() {
        const tabsContainer = document.querySelector('.furniture__tabs');
        if (!tabsContainer) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        tabsContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            tabsContainer.style.cursor = 'grabbing';
            startX = e.pageX - tabsContainer.offsetLeft;
            scrollLeft = tabsContainer.scrollLeft;
        });

        tabsContainer.addEventListener('mouseleave', () => {
            isDown = false;
            tabsContainer.style.cursor = 'grab';
        });

        tabsContainer.addEventListener('mouseup', () => {
            isDown = false;
            tabsContainer.style.cursor = 'grab';
        });

        tabsContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - tabsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            tabsContainer.scrollLeft = scrollLeft - walk;
        });

        tabsContainer.style.cursor = 'grab';
    }

    // Функциональность табов
    function initTabs(slider) {
        const tabs = document.querySelectorAll('.furniture__tab');

        if (!tabs.length) return;

        function setActiveTab(index) {
            tabs.forEach(t => t.classList.remove('furniture__tab--active'));
            tabs[index]?.classList.add('furniture__tab--active');
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                setActiveTab(index);
                slider.slideTo(index);
            });
        });

        slider.on('slideChange', () => {
            setActiveTab(slider.realIndex);
        });

        slider.on('breakpoint', () => {
            setActiveTab(slider.realIndex);
        });
    }

    
    if(document.querySelector('.furniture__swiper')){
        const furnitureSlider = new Swiper('.furniture__swiper', {
            speed:700,
            slidesPerView:1,

            breakpoints: {
                1200:{
                    spaceBetween:300,
                    allowTouchMove:false,
                    grabCursor:false,
                },
                768:{
                    spaceBetween:150,
                    allowTouchMove:false,
                    grabCursor:false,
                },
                320:{
                    spaceBetween:50,
                    allowTouchMove:true,
                    grabCursor:true,
                }
            }
        });


        initTabsWheelScroll();
        initTabs(furnitureSlider);
    }




    // init swiper-sliders
    function updateArrowColors(swiper, arrowSelector, defaultCircleColor, activeCircleColor, defaultArrowColor, activeArrowColor, defaultCircleOpacity, activeCircleOpacity, defaultArrowOpacity, activeArrowOpacity) {
        const arrowsContainer = document.querySelector(arrowSelector);
        const prevArrow = arrowsContainer.querySelector('.arrows__prev');
        const nextArrow = arrowsContainer.querySelector('.arrows__next');
        
        if (!prevArrow || !nextArrow) return;
        
        // Find path elements for stroke changes
        const prevPath = prevArrow.querySelector('path');
        const nextPath = nextArrow.querySelector('path');

        const prevCircle = prevArrow.querySelector('circle');
        const nextCircle = nextArrow.querySelector('circle');
        
        // Update prev arrow
        if (swiper.isBeginning) {
            prevCircle.setAttribute('fill', defaultCircleColor);
            prevCircle.setAttribute('fill-opacity', defaultCircleOpacity);
            prevPath.setAttribute('stroke', defaultArrowColor);
            prevPath.setAttribute('stroke-opacity', defaultArrowOpacity);
        } else {
            prevCircle.setAttribute('fill', activeCircleColor);
            prevCircle.setAttribute('fill-opacity', activeCircleOpacity);
            prevPath.setAttribute('stroke', activeArrowColor);
            prevPath.setAttribute('stroke-opacity', activeArrowOpacity);
        }
        
        // Update next arrow
        if (swiper.isEnd) {
            nextCircle.setAttribute('fill', defaultCircleColor);
            nextCircle.setAttribute('fill-opacity', defaultCircleOpacity);
            nextPath.setAttribute('stroke', defaultArrowColor);
            nextPath.setAttribute('stroke-opacity', defaultArrowOpacity);
        } else {
            nextCircle.setAttribute('fill', activeCircleColor);
            nextCircle.setAttribute('fill-opacity', activeCircleOpacity);
            nextPath.setAttribute('stroke', activeArrowColor);
            nextPath.setAttribute('stroke-opacity', activeArrowOpacity);
        }
    }

    const breakpoint = 767.98;
    let sphereSwiper = null;

    function initSphereSwiper() {
        if (window.innerWidth <= breakpoint) {
            if (!sphereSwiper) {
            sphereSwiper = new Swiper('.spheres__swiper', {
                slidesPerView: 'auto',
                centeredSlides: false,
                grabCursor: true,
                loop: false,
                spaceBetween: 0,
            });
            }
        } 
        else {
            if (sphereSwiper) {
            sphereSwiper.destroy(true, true);   // true, true → полностью чистит стили и события
            sphereSwiper = null;
            }
        }
    }

    // запускаем при загрузке
    initSphereSwiper();

    // и при изменении размера окна
    window.addEventListener('resize', () => {
        // небольшой debounce полезен, но можно и без него
        initSphereSwiper();
    });
    if(document.querySelector('.news__swiper')){
        new Swiper('.news__swiper', {
            grabCursor:true,
            navigation: {
            nextEl: '.news__arrows-next',
            prevEl: '.news__arrows-prev',
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.news__arrows', '#ffffff', '#004D1A', '#004D1A', '#ffffff', '0.8', '1', '1', '1');
                },
                slideChange: function() {
                    updateArrowColors(this, '.news__arrows', '#ffffff', '#004D1A', '#004D1A', '#ffffff', '0.8', '1', '1', '1');
                },
            },
            breakpoints: {
                1024:{
                    slidesPerView: '3',
                    spaceBetween:17,
                },
                768:{
                    slidesPerView: '2.5',
                    spaceBetween:15,
                },
                500:{
                    slidesPerView: '2.2',
                    spaceBetween:15,
                },
                400:{
                    slidesPerView: '1.8',
                    spaceBetween:15,
                },
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:15,    
                },
            }
        });
    }
    if(document.querySelector('.review__swiper')){
        new Swiper('.review__swiper', {
            grabCursor:true,
            navigation: {
            nextEl: '.review__arrows-next',
            prevEl: '.review__arrows-prev',
            },
            pagination: {
                el: '.review__swiper-pagination',
                clickable: true,
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.review__arrows', '#ffffff', '#004D1A', '#004D1A', '#ffffff', '0.8', '1', '1', '1');
                },
                slideChange: function() {
                    updateArrowColors(this, '.review__arrows', '#ffffff', '#004D1A', '#004D1A', '#ffffff', '0.8', '1', '1', '1');
                },
            },
            breakpoints: {
                1024:{
                    slidesPerView: '3',
                    spaceBetween:17,
                },
                768:{
                    slidesPerView: '2.5',
                    spaceBetween:15,
                },
                500:{
                    slidesPerView: '1.8',
                    spaceBetween:15,
                },
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:15,    
                },
            }
        });
    }
    if(document.querySelector('.gallery__swiper')){
        new Swiper('.gallery__swiper', {
            grabCursor:true,
            slidesPerView: '1',
            spaceBetween:0,
            navigation: {
            nextEl: '.gallery__arrows-next',
            prevEl: '.gallery__arrows-prev',
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.gallery__arrows', '#ffffff', '#ffffff', '#5B5B5B', '#004d1a', '0.8', '1', '0.5', '1');
                },
                slideChange: function() {
                    updateArrowColors(this, '.gallery__arrows', '#ffffff', '#ffffff', '#5B5B5B', '#004d1a', '0.8', '1', '0.5', '1');
                },
            },
        });
    }

    // Quantity controls for catalog cards and any [data-quantity] block
    function initQuantityControls() {
        const quantityWrappers = document.querySelectorAll('[data-quantity]');

        quantityWrappers.forEach(wrapper => {
            const minusBtn = wrapper.querySelector('.minus');
            const plusBtn = wrapper.querySelector('.plus');
            const input = wrapper.querySelector('input[type="number"]');

            if (!minusBtn || !plusBtn || !input) return;

            const incrementValue = parseInt(wrapper.dataset.quantity) || 1;
            const minValue = incrementValue === 5 ? 15 : 1;

            input.min = minValue;
            input.readOnly = true;

            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value) || 0;
                const newValue = Math.max(minValue, currentValue - incrementValue);
                input.value = newValue;
            });

            plusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value) || 0;
                const maxValue = parseInt(input.max) || 999;
                const newValue = Math.min(maxValue, currentValue + incrementValue);
                input.value = newValue;
            });
        });
    }
    
    // Catalog filter toggle
    function initCatalogFilter() {
        const filterOpenBtn = document.querySelector('.catalog__filter-open');
        const filterDropdown = document.querySelector('.catalog__flex-filter--tablet-visible');
        
        if (!filterOpenBtn || !filterDropdown) return;
        
        filterOpenBtn.addEventListener('click', () => {
            filterDropdown.classList.toggle('catalog__flex-filter--active');
        });
        
        // Close filter when clicking outside
        document.addEventListener('click', (e) => {
            if (!filterOpenBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.remove('catalog__flex-filter--active');
            }
        });
    }
    
    // Catalog pagination
    function initCatalogPagination() {
        const content = document.querySelector('.catalog__content');
        const paginationEl = document.querySelector('.card-pagination');
        if (!content || !paginationEl) return;

        const ITEMS_PER_PAGE = 6;
        let currentPage = 1;
        let initialized = false;

        const arrows = paginationEl.querySelectorAll('.card-pagination__arrow');
        const prevBtn = arrows[0];
        const nextBtn = arrows[1];

        function getActiveCards() {
            return Array.from(content.querySelectorAll('.catalog-card:not(.catalog-card--filtered):not(.catalog-card--search-hidden)'));
        }

        function showPage(page, withScroll = true) {
            const cards = getActiveCards();
            const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE) || 1;
            currentPage = Math.max(1, Math.min(page, totalPages));

            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;

            content.querySelectorAll('.catalog-card--filtered, .catalog-card--search-hidden').forEach(card => {
                card.style.display = 'none';
            });

            cards.forEach((card, i) => {
                card.style.display = (i >= start && i < end) ? '' : 'none';
            });

            renderPageNumbers(totalPages);

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            paginationEl.style.display = totalPages <= 1 ? 'none' : '';

            if (initialized && withScroll) {
                const offset = 120;
                let el = content, top = 0;
                while (el && el !== document.body) {
                    top += el.offsetTop;
                    el = el.offsetParent;
                }
                window.scrollTo({ top: top - offset, behavior: 'smooth' });
            }
        }

        function renderPageNumbers(totalPages) {
            paginationEl.querySelectorAll('.card-pagination__page-count').forEach(el => el.remove());

            for (let i = 1; i <= totalPages; i++) {
                const span = document.createElement('span');
                span.className = 'card-pagination__page-count' + (i === currentPage ? ' card-pagination__page-count--active' : '');
                span.textContent = i;
                span.addEventListener('click', () => showPage(i));
                nextBtn.before(span);
            }
        }

        prevBtn.addEventListener('click', () => showPage(currentPage - 1));
        nextBtn.addEventListener('click', () => showPage(currentPage + 1));

        showPage(1);
        initialized = true;

        return () => showPage(1, false);
    }

    // Catalog filtering
    function initCatalogFiltering(paginationRefresh) {
        const content = document.querySelector('.catalog__content');
        if (!content) return;

        const allCards = Array.from(content.querySelectorAll('.catalog-card'));
        const acceptBtns = document.querySelectorAll('.catalog__filter-accept');

        const CATEGORY_IDS  = ['tea', 'coffe', 'mulled-wine'];
        const TYPE_IDS      = ['black', 'green', 'fruit'];
        const PROPERTY_IDS  = ['tonizing', 'awakening', 'strengthening'];

        // Sync duplicate checkboxes between desktop/tablet panels
        function syncById(changedCb) {
            document.querySelectorAll(`[id="${changedCb.id}"]`).forEach(cb => {
                cb.checked = changedCb.checked;
            });
        }

        // Show/hide tea sub-filters
        function updateTeaSubFilters(isTeaChecked) {
            document.querySelectorAll('.catalog__filter-item--hidden').forEach(item => {
                item.classList.toggle('catalog__filter-item--hidden-active', isTeaChecked);
            });

            // Reset type/property checkboxes when tea is unchecked
            if (!isTeaChecked) {
                [...TYPE_IDS, ...PROPERTY_IDS].forEach(id => {
                    document.querySelectorAll(`[id="${id}"]`).forEach(cb => { cb.checked = false; });
                });
            }
        }

        // Collect checked values for a group of IDs
        function getChecked(ids) {
            return ids.filter(id =>
                Array.from(document.querySelectorAll(`[id="${id}"]`)).some(cb => cb.checked)
            );
        }

        function applyFilter() {
            const selectedCategories = getChecked(CATEGORY_IDS);
            const selectedTypes      = getChecked(TYPE_IDS);
            const selectedProperties = getChecked(PROPERTY_IDS);

            allCards.forEach(card => {
                const cat  = card.dataset.category;
                const type = card.dataset.type;
                const prop = card.dataset.property;

                let visible = true;

                // Category filter
                if (selectedCategories.length > 0 && !selectedCategories.includes(cat)) {
                    visible = false;
                }

                // Type filter — only for tea cards
                if (visible && cat === 'tea' && selectedTypes.length > 0) {
                    if (!type || !selectedTypes.includes(type)) visible = false;
                }

                // Property filter — only for tea cards
                if (visible && cat === 'tea' && selectedProperties.length > 0) {
                    if (!prop || !selectedProperties.includes(prop)) visible = false;
                }

                card.classList.toggle('catalog-card--filtered', !visible);
            });

            if (paginationRefresh) paginationRefresh();
        }

        // Tea checkbox — sync panels + toggle sub-filters
        document.querySelectorAll('[id="tea"]').forEach(cb => {
            cb.addEventListener('change', function () {
                syncById(this);
                updateTeaSubFilters(this.checked);
            });
        });

        // All other checkboxes — just sync between panels
        [...CATEGORY_IDS.filter(id => id !== 'tea'), ...TYPE_IDS, ...PROPERTY_IDS].forEach(id => {
            document.querySelectorAll(`[id="${id}"]`).forEach(cb => {
                cb.addEventListener('change', function () { syncById(this); });
            });
        });

        // "Применить" buttons
        acceptBtns.forEach(btn => btn.addEventListener('click', applyFilter));
    }

    // Catalog search
    function initCatalogSearch(paginationRefresh) {
        const searchInput = document.querySelector('.catalog__input-search');
        const searchBtn = document.querySelector('.catalog__btn-search');
        const content = document.querySelector('.catalog__content');

        if (!searchInput || !searchBtn || !content) return;

        const allCards = Array.from(content.querySelectorAll('.catalog-card'));

        let noResultsMsg = content.querySelector('.catalog__no-results');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.className = 'catalog__no-results';
            noResultsMsg.textContent = 'По вашему запросу ничего не найдено';
            noResultsMsg.style.display = 'none';
            content.after(noResultsMsg);
        }

        function applySearch() {
            const query = searchInput.value.trim().toLowerCase();

            allCards.forEach(card => {
                const titleText = (card.querySelector('.catalog-card__title')?.textContent || '').toLowerCase();
                const compoundText = (card.querySelector('.catalog-card__compound')?.textContent || '').toLowerCase();
                const matches = !query || titleText.includes(query) || compoundText.includes(query);
                card.classList.toggle('catalog-card--search-hidden', !matches);
            });

            if (paginationRefresh) paginationRefresh();

            const hasVisible = allCards.some(card =>
                !card.classList.contains('catalog-card--filtered') &&
                !card.classList.contains('catalog-card--search-hidden')
            );
            noResultsMsg.style.display = hasVisible ? 'none' : '';
        }

        searchBtn.addEventListener('click', applySearch);

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applySearch();
        });

        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') applySearch();
        });
    }

    // Present pagination (desktop: 8 cards, tablet/mobile: 6 cards)
    function initPresentPagination() {
        const content = document.querySelector('.present__content');
        const paginationEl = document.querySelector('.card-pagination');
        if (!content || !paginationEl) return;

        let currentPage = 1;
        let initialized = false;

        const arrows = paginationEl.querySelectorAll('.card-pagination__arrow');
        const prevBtn = arrows[0];
        const nextBtn = arrows[1];

        function getItemsPerPage() {
            return window.innerWidth >= 1024 ? 8 : 6;
        }

        function getActiveCards() {
            return Array.from(content.querySelectorAll('.catalog-card:not(.catalog-card--search-hidden)'));
        }

        function showPage(page, withScroll = true) {
            const ITEMS_PER_PAGE = getItemsPerPage();
            const cards = getActiveCards();
            const totalPages = Math.ceil(cards.length / ITEMS_PER_PAGE) || 1;
            currentPage = Math.max(1, Math.min(page, totalPages));

            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;

            content.querySelectorAll('.catalog-card--search-hidden').forEach(card => {
                card.style.display = 'none';
            });

            cards.forEach((card, i) => {
                card.style.display = (i >= start && i < end) ? '' : 'none';
            });

            renderPageNumbers(totalPages);

            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            paginationEl.style.display = totalPages <= 1 ? 'none' : '';

            if (initialized && withScroll) {
                const offset = 120;
                let el = content, top = 0;
                while (el && el !== document.body) {
                    top += el.offsetTop;
                    el = el.offsetParent;
                }
                window.scrollTo({ top: top - offset, behavior: 'smooth' });
            }
        }

        function renderPageNumbers(totalPages) {
            paginationEl.querySelectorAll('.card-pagination__page-count').forEach(el => el.remove());

            for (let i = 1; i <= totalPages; i++) {
                const span = document.createElement('span');
                span.className = 'card-pagination__page-count' + (i === currentPage ? ' card-pagination__page-count--active' : '');
                span.textContent = i;
                span.addEventListener('click', () => showPage(i));
                nextBtn.before(span);
            }
        }

        prevBtn.addEventListener('click', () => showPage(currentPage - 1));
        nextBtn.addEventListener('click', () => showPage(currentPage + 1));

        showPage(1);
        initialized = true;

        let lastItemsPerPage = getItemsPerPage();
        window.addEventListener('resize', () => {
            const newItemsPerPage = getItemsPerPage();
            if (newItemsPerPage !== lastItemsPerPage) {
                lastItemsPerPage = newItemsPerPage;
                showPage(1, false);
            }
        });

        return () => showPage(1, false);
    }

    // Present search
    function initPresentSearch(paginationRefresh) {
        const searchInput = document.querySelector('.present__input-search');
        const searchBtn = document.querySelector('.present__btn-search');
        const content = document.querySelector('.present__content');

        if (!searchInput || !searchBtn || !content) return;

        const allCards = Array.from(content.querySelectorAll('.catalog-card'));

        let noResultsMsg = content.querySelector('.present__no-results');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.className = 'catalog__no-results present__no-results';
            noResultsMsg.textContent = 'По вашему запросу ничего не найдено';
            noResultsMsg.style.display = 'none';
            content.after(noResultsMsg);
        }

        function applySearch() {
            const query = searchInput.value.trim().toLowerCase();

            allCards.forEach(card => {
                const titleText = (card.querySelector('.catalog-card__title')?.textContent || '').toLowerCase();
                const matches = !query || titleText.includes(query);
                card.classList.toggle('catalog-card--search-hidden', !matches);
            });

            if (paginationRefresh) paginationRefresh();

            const hasVisible = allCards.some(card => !card.classList.contains('catalog-card--search-hidden'));
            noResultsMsg.style.display = hasVisible ? 'none' : '';
        }

        searchBtn.addEventListener('click', applySearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applySearch();
        });
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') applySearch();
        });
    }

    // Cart (localStorage)
    function initCart() {
        function getCart() {
            return JSON.parse(localStorage.getItem('cart') || '{}');
        }

        function saveCart(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        function getCartCount() {
            return Object.keys(getCart()).length;
        }

        function updateCounter() {
            const count = getCartCount();
            document.querySelectorAll('.header__basket-card-counter').forEach(el => {
                el.textContent = count;
                el.classList.toggle('header__basket-card-counter--active', count > 0);
            });
        }

        function setButtonActive(btn, active) {
            const baseClass = Array.from(btn.classList).find(c => !c.includes('--'));
            if (baseClass) btn.classList.toggle(`${baseClass}--active`, active);
        }

        function setCardState(container, inCart) {
            const buyBtn    = container.querySelector('[data-btn="buy"]');
            const basketBtn = container.querySelector('[data-btn="href-basket"]');
            if (!buyBtn || !basketBtn) return;
            setButtonActive(buyBtn,    !inCart);
            setButtonActive(basketBtn,  inCart);
        }

        document.querySelectorAll('[data-article]').forEach(container => {
            const article = container.dataset.article;
            if (!article) return;

            setCardState(container, article in getCart());

            const qtyInput   = container.querySelector('.catalog-card__qty-input, .details__qty-input');
            const qtyWrapper = container.querySelector('[data-quantity]');

            // При загрузке подставляем количество из localStorage
            if (qtyInput && article in getCart()) {
                const cart = getCart();
                const step = qtyWrapper ? parseInt(qtyWrapper.dataset.quantity) || 1 : 1;
                const minVal = step === 5 ? 15 : 1;
                qtyInput.min = minVal;
                qtyInput.readOnly = true;
                const maxVal = parseInt(qtyInput.max) || 999;
                const qty = Math.min(maxVal, Math.max(minVal, cart[article].quantity || step));
                qtyInput.value = qty;
            }

            // При изменении количества (только +/-) обновляем quantity в localStorage; ввод в поле запрещён
            if (qtyInput && qtyWrapper) {
                const step = parseInt(qtyWrapper.dataset.quantity) || 1;
                const minVal = step === 5 ? 15 : 1;
                qtyInput.min = minVal;
                qtyInput.readOnly = true;
                const cur = parseInt(qtyInput.value, 10);
                if (!(article in getCart()) && (isNaN(cur) || cur < minVal)) {
                    qtyInput.value = minVal;
                }
                const syncQuantityToCart = () => {
                    const cart = getCart();
                    const val = parseInt(qtyInput.value) || step;
                    if (article in cart) {
                        cart[article].quantity = val;
                        saveCart(cart);
                    }
                };
                const minusBtn = qtyWrapper.querySelector('.minus');
                const plusBtn = qtyWrapper.querySelector('.plus');
                if (minusBtn) minusBtn.addEventListener('click', () => setTimeout(syncQuantityToCart, 0));
                if (plusBtn) plusBtn.addEventListener('click', () => setTimeout(syncQuantityToCart, 0));
            }

            const buyBtn = container.querySelector('[data-btn="buy"]');
            if (!buyBtn) return;

            buyBtn.addEventListener('click', () => {
                const img        = container.querySelector('img');
                const titleEl    = container.querySelector('.catalog-card__title, .details__title');
                const priceEl    = container.querySelector('.catalog-card__price span, .details__price span');

                const cart = getCart();
                cart[article] = {
                    title:    titleEl    ? titleEl.textContent.trim()              : '',
                    price:    priceEl    ? priceEl.textContent.trim()              : '',
                    image:    img        ? img.getAttribute('src')                 : '',
                    quantity: qtyInput   ? parseInt(qtyInput.value) || 1           : 1,
                    step:     qtyWrapper ? parseInt(qtyWrapper.dataset.quantity) || 1 : 1,
                };
                saveCart(cart);
                setCardState(container, true);
                updateCounter();
            });
        });
        
        updateCounter();
    }

    // Order page — cart rendering from localStorage
    function initOrderPage() {
        const wrapper = document.querySelector('.order__cart-wrapper');
        if (!wrapper) return;

        const DELIVERY_COST = 400;

        function getCart() {
            return JSON.parse(localStorage.getItem('cart') || '{}');
        }

        function saveCart(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        function parsePrice(priceStr) {
            return parseInt(String(priceStr).replace(/\s/g, '').replace(/[^\d]/g, '')) || 0;
        }

        function formatPrice(amount) {
            return amount.toLocaleString('ru-RU') + ' ₽';
        }

        function updateHeaderCounter() {
            const count = Object.keys(getCart()).length;
            document.querySelectorAll('.header__basket-card-counter').forEach(el => {
                el.textContent = count;
                el.classList.toggle('header__basket-card-counter--active', count > 0);
            });
        }

        function recalcTotals() {
            let totalCost = 0;
            const cart = getCart();

            document.querySelectorAll('.order__cart[data-article]').forEach(cartEl => {
                const article = cartEl.dataset.article;
                if (!cart[article]) return;

                const priceNum = parsePrice(cart[article].price);
                const input = cartEl.querySelector('.order__qty-input');
                const qty = parseInt(input ? input.value : 0) || 0;
                const itemTotal = priceNum * qty;

                const totalEl = cartEl.querySelector('.order__cart-total');
                if (totalEl) totalEl.textContent = formatPrice(itemTotal);

                totalCost += itemTotal;
            });

            const costPriceEls = document.querySelectorAll('.order__cost-price');
            if (costPriceEls[0]) costPriceEls[0].textContent = formatPrice(totalCost);

            const basketTotalEl = document.querySelector('.order__basket-total-price');
            if (basketTotalEl) basketTotalEl.textContent = formatPrice(totalCost + DELIVERY_COST);
        }

        function updateCartTitle() {
            const count = Object.keys(getCart()).length;
            const titleSpan = document.querySelector('.order__basket .order__inner-title span');
            if (titleSpan) titleSpan.textContent = '(' + count + ')';
        }

        function createCartItem(article, item) {
            const div = document.createElement('div');
            div.className = 'order__cart';
            div.dataset.article = article;

            const step = item.step || 1;
            const minQty = step === 5 ? 15 : 1;
            const priceNum = parsePrice(item.price);
            const qty = Math.max(minQty, item.quantity || step);
            const itemTotal = priceNum * qty;

            div.innerHTML =
                '<div class="order__cart-img">' +
                    '<img src="' + item.image + '" alt="' + item.title + '">' +
                '</div>' +
                '<div class="order__cart-info">' +
                    '<div class="order__cart-info-block">' +
                        '<div class="order__cart-img order__cart-img--mob-visible">' +
                            '<img src="' + item.image + '" alt="' + item.title + '">' +
                        '</div>' +
                        '<div class="order__cart-title-block">' +
                            '<h3 class="order__cart-title">' + item.title + '</h3>' +
                            '<div class="order__cart-price"><span>' + item.price + '/</span> шт</div>' +
                        '</div>' +
                        '<button class="order__cart-remove-btn hover-scale" type="button">' +
                            '<img src="./images/icons/trash.svg" alt="">' +
                        '</button>' +
                    '</div>' +
                    '<div class="order__cart-info-block">' +
                        '<div class="order__quantity" data-quantity="' + step + '">' +
                            '<button type="button" class="order__qty-minus-btn minus">-</button>' +
                            '<input type="number" value="' + qty + '" min="' + minQty + '" max="999" class="order__qty-input">' +
                            '<button type="button" class="order__qty-plus-btn plus">+</button>' +
                        '</div>' +
                        '<span class="order__cart-total">' + formatPrice(itemTotal) + '</span>' +
                    '</div>' +
                '</div>';

            div.querySelector('.order__cart-remove-btn').addEventListener('click', () => {
                const cart = getCart();
                delete cart[article];
                saveCart(cart);
                div.remove();
                updateCartTitle();
                recalcTotals();
                updateHeaderCounter();
            });

            const input = div.querySelector('.order__qty-input');

            div.querySelector('.order__qty-minus-btn').addEventListener('click', () => {
                const val = parseInt(input.value) || step;
                const newVal = Math.max(minQty, val - step);
                input.value = newVal;
                const cart = getCart();
                if (cart[article]) { cart[article].quantity = newVal; saveCart(cart); }
                recalcTotals();
            });

            div.querySelector('.order__qty-plus-btn').addEventListener('click', () => {
                const val = parseInt(input.value) || step;
                const newVal = Math.min(999, val + step);
                input.value = newVal;
                const cart = getCart();
                if (cart[article]) { cart[article].quantity = newVal; saveCart(cart); }
                recalcTotals();
            });

            input.readOnly = true;

            return div;
        }

        function renderCart() {
            const promoBlock = wrapper.querySelector('.order__promo');
            const cart = getCart();

            Object.entries(cart).forEach(([article, item]) => {
                wrapper.insertBefore(createCartItem(article, item), promoBlock);
            });

            updateCartTitle();
            recalcTotals();
            updateHeaderCounter();
        }

        const clearBtn = document.querySelector('.order__btn-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                saveCart({});
                wrapper.querySelectorAll('.order__cart').forEach(el => el.remove());
                updateCartTitle();
                recalcTotals();
                updateHeaderCounter();
            });
        }

        renderCart();
    }

    initQuantityControls();
    initCatalogFilter();
    const paginationRefresh = initCatalogPagination();
    initCatalogFiltering(paginationRefresh);
    initCatalogSearch(paginationRefresh);
    const presentPaginationRefresh = initPresentPagination();
    initPresentSearch(presentPaginationRefresh);
    initCart();
    initOrderPage();
});