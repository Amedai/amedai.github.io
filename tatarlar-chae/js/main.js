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
    function initTabs() {
        const tabsContainer = document.querySelector('.furniture__tabs');
        const tabs = document.querySelectorAll('.furniture__tab');
        const inners = document.querySelectorAll('.furniture__inner');

        if (!tabs.length || !inners.length) return;

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabsContainer.classList.add('furniture__tabs--no-pointer-events');
                const innerActive = document.querySelector('.furniture__inner--active');
                innerActive.classList.add('furniture__inner--prev-active');
                setTimeout(() => {
                    innerActive.classList.remove('furniture__inner--active');
                    innerActive.classList.remove('furniture__inner--prev-active');
                    tabsContainer.classList.remove('furniture__tabs--no-pointer-events');
                }, 301);
                // Удаляем активный класс у всех табов и контента
                tabs.forEach(t => t.classList.remove('furniture__tab--active'));

                // Добавляем активный класс текущему табу
                tab.classList.add('furniture__tab--active');


                // Показываем соответствующий контент по индексу
                if (inners[index]) {
                    inners[index].classList.add('furniture__inner--active');
                }
            });
        });
    }

    initTabsWheelScroll();
    initTabs();

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
    let offerSwiper = null;
    let sphereSwiper = null;

    function initOfferSwiper() {
        if (window.innerWidth <= breakpoint) {
            if (!offerSwiper) {
            offerSwiper = new Swiper('.offer__swiper', {
                slidesPerView: 1,
                centeredSlides: false,
                grabCursor: true,
                loop: false,
                spaceBetween: 0,
                navigation: {
                nextEl: '.offer__arrows-next',
                prevEl: '.offer__arrows-prev',
                },
                on: {
                    init: function() {
                        updateArrowColors(this, '.offer__arrows', '#F5F5F5', '#004D1A', '#5B5B5B', '#ffffff', '0.8', '1', '0.5', '1');
                    },
                    slideChange: function() {
                        updateArrowColors(this, '.offer__arrows', '#F5F5F5', '#004D1A', '#5B5B5B', '#ffffff', '0.8', '1', '0.5', '1');
                    },
                },
            });
            }
        } 
        else {
            if (offerSwiper) {
            offerSwiper.destroy(true, true);   // true, true → полностью чистит стили и события
            offerSwiper = null;
            }
        }
    }

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
    initOfferSwiper();
    initSphereSwiper();

    // и при изменении размера окна
    window.addEventListener('resize', () => {
        // небольшой debounce полезен, но можно и без него
        initOfferSwiper();
        initSphereSwiper();
    });

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

    // Quantity controls for catalog cards
    function initQuantityControls() {
        const quantityWrappers = document.querySelectorAll('[data-quantity]');
        
        quantityWrappers.forEach(wrapper => {
            const minusBtn = wrapper.querySelector('.minus');
            const plusBtn = wrapper.querySelector('.plus');
            const input = wrapper.querySelector('input[type="number"]');
            
            if (!minusBtn || !plusBtn || !input) return;
            
            // Get increment value from data-quantity attribute, default to 5 if not set
            const incrementValue = parseInt(wrapper.dataset.quantity) || 1;

            minusBtn.addEventListener('click', () => {
                const currentValue = parseInt(input.value) || 0;
                const minValue = incrementValue === 5 ? 15 : 1;
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
    
    initQuantityControls();
    initCatalogFilter();
});