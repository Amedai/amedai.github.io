'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.header__burger');
    const innerFirst = document.querySelector('.header__inner-first');
    const closeBtn = document.querySelector('.header__inner-first-close');
    const navLinks = document.querySelectorAll('.header__nav-link');

    if (burger && innerFirst) {
    const closeMenu = () => {
        innerFirst.classList.remove('header__inner-first--active');
    };

    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        innerFirst.classList.toggle('header__inner-first--active');
    });

    document.addEventListener('click', (e) => {
        if (!innerFirst.classList.contains('header__inner-first--active')) {
            return;
        }

        if (innerFirst.contains(e.target) || burger.contains(e.target)) {
            return;
        }

        closeMenu();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    const langButtons = document.querySelectorAll('.header__lang');

    const closeLangDropdowns = (exceptButton = null) => {
        langButtons.forEach((button) => {
            if (button === exceptButton) {
                return;
            }

            const dropdown = button.querySelector('.header__lang-dropdown');
            dropdown?.classList.remove('header__lang-dropdown--active');
        });
    };

    langButtons.forEach((button) => {
        const dropdown = button.querySelector('.header__lang-dropdown');

        if (!dropdown) {
            return;
        }

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('header__lang-dropdown--active');
            closeLangDropdowns();
            dropdown.classList.toggle('header__lang-dropdown--active', !isOpen);
        });

        dropdown.querySelectorAll('.header__lang-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.remove('header__lang-dropdown--active');
            });
        });
    });

    document.addEventListener('click', () => {
        closeLangDropdowns();
    });
    }

    const getSwiperArrowState = (prevEl, nextEl) => {
        const update = (swiper) => {
            prevEl?.classList.toggle('circle-arrow--noactive', swiper.isBeginning);
            nextEl?.classList.toggle('circle-arrow--noactive', swiper.isEnd);
        };

        return {
            update,
            on: {
                init: update,
                slideChange: update,
                reachBeginning: update,
                reachEnd: update,
                fromEdge: update,
                resize: update,
            },
            reset: () => {
                prevEl?.classList.remove('circle-arrow--noactive');
                nextEl?.classList.remove('circle-arrow--noactive');
            },
        };
    };

    const SERVICES_MOBILE_MQ = window.matchMedia('(max-width: 767.98px)');
    const servicesSwiperEl = document.querySelector('.services__swiper');
    const servicesArrowPrev = document.querySelector('.services__arrow-prev');
    const servicesArrowNext = document.querySelector('.services__arrow-next');
    const servicesArrows = getSwiperArrowState(servicesArrowPrev, servicesArrowNext);
    let servicesSwiper = null;

    const initServicesSwiper = () => {
        if (servicesSwiper || !servicesSwiperEl || typeof Swiper === 'undefined') {
            return;
        }

        servicesSwiper = new Swiper(servicesSwiperEl, {
            slidesPerView: 1,
            spaceBetween: 20,
            watchOverflow: true,
            navigation: {
                nextEl: servicesArrowNext,
                prevEl: servicesArrowPrev,
            },
            on: servicesArrows.on,
        });
    };

    const destroyServicesSwiper = () => {
        if (!servicesSwiper) {
            return;
        }

        servicesSwiper.destroy(true, true);
        servicesSwiper = null;
        servicesArrows.reset();
    };

    const toggleServicesSwiper = () => {
        if (SERVICES_MOBILE_MQ.matches) {
            initServicesSwiper();
        } else {
            destroyServicesSwiper();
        }
    };

    if (servicesSwiperEl) {
        toggleServicesSwiper();
        SERVICES_MOBILE_MQ.addEventListener('change', toggleServicesSwiper);
    }

    const casesSwiperEl = document.querySelector('.cases__swiper');
    const casesArrowPrev = document.querySelector('.cases__arrow-prev');
    const casesArrowNext = document.querySelector('.cases__arrow-next');

    if (casesSwiperEl && typeof Swiper !== 'undefined') {
        const casesArrows = getSwiperArrowState(casesArrowPrev, casesArrowNext);

        new Swiper(casesSwiperEl, {
            slidesPerView: 1,
            spaceBetween: 10,
            watchOverflow: true,
            navigation: {
                nextEl: casesArrowNext,
                prevEl: casesArrowPrev,
            },
            on: casesArrows.on,
        });
    }

    const stagesSwiperEl = document.querySelector('.stages__swiper');
    const stagesTabs = document.querySelectorAll('.stages__tab');

    if (stagesSwiperEl && stagesTabs.length && typeof Swiper !== 'undefined') {
        const stagesTabsEl = document.querySelector('.stages__tabs');

        const setActiveStageTab = (index) => {
            stagesTabs.forEach((tab, i) => {
                tab.classList.toggle('stages__tab--active', i === index);
            });
        };

        const syncStagesSwiperHeight = () => {
            if (!stagesTabsEl) {
                return;
            }

            stagesSwiperEl.style.height = `${stagesTabsEl.offsetHeight}px`;
        };

        const stagesSwiper = new Swiper(stagesSwiperEl, {
            direction: 'vertical',
            slidesPerView: 1,
            speed: 600,
            allowTouchMove: true,
            watchOverflow: true,
        });

        syncStagesSwiperHeight();
        stagesSwiper.update();

        window.addEventListener('resize', () => {
            syncStagesSwiperHeight();
            stagesSwiper.update();
        });

        stagesTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                stagesSwiper.slideTo(index);
                setActiveStageTab(index);
            });
        });

        stagesSwiper.on('slideChange', () => {
            setActiveStageTab(stagesSwiper.activeIndex);
        });
    }

    const stagesMobItems = document.querySelectorAll('.stages__flex-mob-item');

    if (stagesMobItems.length) {
        const setActiveStagesMobItem = (index) => {
            stagesMobItems.forEach((item, i) => {
                item.classList.toggle('stages__flex-mob-item--active', i === index);
            });
        };

        stagesMobItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                setActiveStagesMobItem(index);
            });
        });
    }
});
