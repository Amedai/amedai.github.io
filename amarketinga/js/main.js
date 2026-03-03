'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.header__burger');
    const mobMenu = document.querySelector('.header__mob-menu');
    const closeBtn = document.querySelector('.header__close-button');

    function closeMenu() {
        mobMenu.classList.remove('header__mob-menu--active');
        burger.classList.remove('header__burger--hiden');
    }

    function openMenu() {
        mobMenu.classList.add('header__mob-menu--active');
        burger.classList.add('header__burger--hiden');
    }

    burger.addEventListener('click', () => {
        if (mobMenu.classList.contains('header__mob-menu--active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('click', (e) => {
        if (!mobMenu.classList.contains('header__mob-menu--active')) return;
        if (mobMenu.contains(e.target)) return;
        if (burger.contains(e.target)) return;
        closeMenu();
    });


    //slider
    function updateArrowColors(swiper, containerSelector, defaultColor, activeColor) {
        const arrowsContainer = document.querySelector(containerSelector);
        if (!arrowsContainer) return;

        const prevArrow = arrowsContainer.querySelector('.arrows__prev');
        const nextArrow = arrowsContainer.querySelector('.arrows__next');
        
        if (!prevArrow || !nextArrow) return;
        
        const prevPath = prevArrow.querySelectorAll('path');
        const nextPath = nextArrow.querySelectorAll('path');
        
        if (swiper.isBeginning) {
            prevArrow.classList.remove('arrows__prev--bg-white');
            prevArrow.classList.add('arrows__prev--bg-gray');
            prevPath.forEach(path => path.setAttribute('fill', defaultColor));
        } else {
            prevArrow.classList.remove('arrows__prev--bg-gray');
            prevArrow.classList.add('arrows__prev--bg-white');
            prevPath.forEach(path => path.setAttribute('fill', activeColor));
        }
        
        if (swiper.isEnd) {
            nextArrow.classList.remove('arrows__next--bg-white');
            nextArrow.classList.add('arrows__next--bg-gray');
            nextPath.forEach(path => path.setAttribute('fill', defaultColor));
        } else {
            nextArrow.classList.remove('arrows__next--bg-gray');
            nextArrow.classList.add('arrows__next--bg-white');
            nextPath.forEach(path => path.setAttribute('fill', activeColor));
        }
    }

    if(document.querySelector('.cases__swiper')){
        new Swiper('.cases__swiper', {
            slidesPerView: 2,
            grabCursor: true,
            noSwipingSelector: '.cases__arrows',
            navigation: {
                nextEl: '.cases__arrows-next',
                prevEl: '.cases__arrows-prev',
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.cases__arrows', '#ffffff', '#292D32');
                },
                slideChange: function() {
                    updateArrowColors(this, '.cases__arrows', '#ffffff', '#292D32');
                },
            },
            breakpoints: {
                1400:{
                    spaceBetween: 60,
                },
                1024:{
                    spaceBetween: 41,
                },
            }
        });
    }
    if(document.querySelector('.case-slider__swiper')){
        new Swiper('.case-slider__swiper', {
            slidesPerView: 1,
            grabCursor: true,
            noSwipingSelector: '.case-slider__arrows',
            navigation: {
                nextEl: '.case-slider__arrows-next',
                prevEl: '.case-slider__arrows-prev',
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.case-slider__arrows', '#ffffff', '#292D32');
                },
                slideChange: function() {
                    updateArrowColors(this, '.case-slider__arrows', '#ffffff', '#292D32');
                },
            },
        });
    }

    // merch tabs
    const merchTabs = document.querySelectorAll('.merch__tab');
    const merchInners = document.querySelectorAll('.merch__inner');

    if (merchTabs.length && merchInners.length) {
        merchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                merchTabs.forEach(t => t.classList.remove('merch__tab--active'));
                tab.classList.add('merch__tab--active');

                merchInners.forEach(inner => {
                    if (inner.dataset.tabContent === target) {
                        inner.classList.add('merch__inner--active');
                    } else {
                        inner.classList.remove('merch__inner--active');
                    }
                });
            });
        });
    }

});