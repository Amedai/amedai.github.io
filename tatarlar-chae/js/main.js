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

    // init swiper-slider
    let swiper = null;
    const breakpoint = 768;

    function initSwiper() {
    if (window.innerWidth <= breakpoint) {
        if (!swiper) {
        swiper = new Swiper('.offer__swiper', {
            slidesPerView: 1,
            centeredSlides: false,
            grabCursor: true,
            loop: false,
            spaceBetween: 0,
            navigation: {
            nextEl: '.offer__arrows-next',
            prevEl: '.offer__arrows-prev',
            },
        });
        }
    } 
    else {
        if (swiper) {
        swiper.destroy(true, true);   // true, true → полностью чистит стили и события
        swiper = null;
        }
    }
    }

    // запускаем при загрузке
    initSwiper();

    // и при изменении размера окна
    window.addEventListener('resize', () => {
    // небольшой debounce полезен, но можно и без него
    initSwiper();
    });

    new Swiper('.news__swiper', {
        grabCursor:true,
        navigation: {
        nextEl: '.news__arrows-next',
        prevEl: '.news__arrows-prev',
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
    });
});