'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const heroTeam = document.querySelector('.hero-team');
    const hero = heroTeam?.querySelector('.hero');
    const team = heroTeam?.querySelector('.team');
    const services = document.querySelector('.services');

    if (heroTeam && hero && team) {
        const TEAM_HIDDEN_RATIO = 0.8;
        let overlap = 0;
        let coverDistance = 0;
        let revealStart = 0;
        let revealEnd = 0;
        let coverEnd = 0;
        let teamFixedTop = 0;
        let teamVisibleTop = 0;
        let isTeamFixed = false;
        let lastScrollY = window.scrollY || window.pageYOffset;
        let ticking = false;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const updateHeroTeamProgress = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const isScrollingDown = scrollY >= lastScrollY;
            const progress = overlap > 0 ? clamp((scrollY - revealStart) / (revealEnd - revealStart), 0, 1) : 0;
            const shouldFixTeam = scrollY >= revealEnd && scrollY <= coverEnd;

            heroTeam.style.setProperty('--hero-team-shift', `${Math.round(progress * overlap)}px`);

            if (shouldFixTeam && !isTeamFixed) {
                teamFixedTop = isScrollingDown ? team.getBoundingClientRect().top : teamVisibleTop;
                team.classList.add('team--cover-fixed');
                team.style.top = `${teamFixedTop}px`;
                isTeamFixed = true;
            }

            if (!shouldFixTeam && isTeamFixed) {
                team.classList.remove('team--cover-fixed');
                team.style.top = '';
                isTeamFixed = false;
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        const requestHeroTeamUpdate = () => {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(updateHeroTeamProgress);
        };

        const syncHeroTeam = () => {
            team.classList.remove('team--cover-fixed');
            team.style.top = '';
            isTeamFixed = false;
            heroTeam.style.minHeight = '';
            heroTeam.style.setProperty('--hero-team-shift', '0px');

            overlap = Math.round(team.offsetHeight * TEAM_HIDDEN_RATIO);
            coverDistance = Math.min(team.offsetHeight, window.innerHeight);

            heroTeam.style.setProperty('--hero-team-overlap', `${overlap}px`);
            heroTeam.style.setProperty('--hero-team-sticky-top', `${Math.min(0, window.innerHeight - hero.offsetHeight)}px`);
            heroTeam.style.setProperty('--hero-team-cover-distance', `${coverDistance}px`);
            services?.style.setProperty('--services-cover-distance', `${coverDistance}px`);

            const heroTeamTop = heroTeam.getBoundingClientRect().top + (window.scrollY || window.pageYOffset);
            const revealDistance = Math.max(overlap, 1);
            const teamTop = heroTeamTop + hero.offsetHeight - overlap;
            const visibleTeamOffset = Math.max((window.innerHeight - team.offsetHeight) / 2, 0);
            const revealTarget = teamTop - visibleTeamOffset;
            teamVisibleTop = visibleTeamOffset;

            heroTeam.style.setProperty('--hero-team-team-top', `${visibleTeamOffset}px`);

            revealStart = Math.max(heroTeamTop, revealTarget - revealDistance);
            revealEnd = Math.max(revealStart + 1, revealTarget);
            coverEnd = revealEnd + coverDistance;
            heroTeam.style.minHeight = `${heroTeam.offsetHeight}px`;

            requestHeroTeamUpdate();
        };

        syncHeroTeam();
        window.addEventListener('scroll', requestHeroTeamUpdate, { passive: true });
        window.addEventListener('resize', syncHeroTeam);
        window.addEventListener('load', syncHeroTeam);
    }

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
