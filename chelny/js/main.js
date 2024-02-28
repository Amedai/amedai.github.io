window.addEventListener('DOMContentLoaded', () => {
    const  preloader = document.querySelector('.preloader');
    window.onload = function () {
    preloader.classList.add('preloader__loaded-hiding');
    window.setTimeout(function () {
      preloader.classList.add('preloader__loaded');
      preloader.classList.remove('preloader__loaded-hiding');
    }, 500);
};

    //lazy load for yandex-cart
    function initYandexMapOnEvent (e) {
        initYandexMap();
        e.currentTarget.removeEventListener(e.type, initYandexMapOnEvent);
    }

    function initYandexMap () {
        if (window.yandexMapDidInit) {
            return false;
        }
        window.yandexMapDidInit = true;
    
        const script = document.createElement('script');

        script.async = true;
    
        script.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A29ba7d7918f1c1feb3e10c2f6dbcebf021b7477ec9a3ef378e58164aa98d541d&amp;width=100%25&amp;height=100%25&amp;lang=ru_RU&amp;scroll=true';
    
        map.appendChild(script);
    }

    const map = document.querySelector('.contacts__map');
    if(map){
        setTimeout(initYandexMap, 5000);

        window.addEventListener('scroll', initYandexMapOnEvent);
        window.addEventListener('mousemove', initYandexMapOnEvent);
        window.addEventListener('touchstart', initYandexMapOnEvent);
    }
  
    //burger menu
    const inner = document.querySelector('.header__inner'),
    hamburger = document.querySelector('.header__mobile-burger'),
    sticks = document.querySelectorAll('.header__mobile-stick');

    hamburger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner_active');
        sticks.forEach(item=>{
            item.classList.toggle('header__mobile-stick_active');
        });
    });

    //modal
    function fadeIn (el, timeout, display){
        el.style.opacity = 0;
        el.style.display = display || 'block';
        el.style.transition = `opacity ${timeout}ms`;
        setTimeout(() => {
          el.style.opacity = 1;
        }, 10);
    }
    function fadeOut (el, timeout){
        el.style.opacity = 1;
        el.style.transition = `opacity ${timeout}ms`;
        el.style.opacity = 0;
      
        setTimeout(() => {
          el.style.display = 'none';
        }, timeout);
    }
    const contactButtons = document.querySelectorAll('.contact-btn'),
            priceButtons = document.querySelectorAll('.price-btn'),
            overlay = document.querySelector('.overlay'),
            closeElement = document.querySelector('.modal__close');
    
    contactButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
            fadeIn(overlay, 100, 'block');
        });
    });
    priceButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
            fadeIn(overlay, 100, 'block');
        });
    });
    closeElement.addEventListener('click',()=>{
        fadeOut(overlay,30);
    });
    overlay.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.classList.contains('overlay')){
            fadeOut(overlay,30);
        }
    });
    document.addEventListener('keydown',(e)=>{
        if(overlay.style.opacity === '1' && e.code == 'Escape'){
           fadeOut(overlay,30);
        }
     });


    //слайдер
    new Swiper('.promotion__info-slider', {
        loop: true,
        slidesPerView: 'auto',
        grabCursor: true,
        pagination: {
          el: '.info-slider__pagination',
          bulletClass: 'info-slider__bullet',
          bulletActiveClass: 'info-slider__bullet-active'
        },
      
        navigation: {
          nextEl: '.info-slider__right',
          prevEl: '.info-slider__left',
        },
    });

    new Swiper('.tractor__info-slider', {
        loop: true,
        slidesPerView: 'auto',
        grabCursor: true,
        pagination: {
          el: '.info-slider__pagination',
          bulletClass: 'info-slider__bullet',
          bulletActiveClass: 'info-slider__bullet-active'
        },
      
        navigation: {
          nextEl: '.info-slider__right',
          prevEl: '.info-slider__left',
        },
    });

    new Swiper('.repair-tractors__slider', {
        loop: false,
        breakpoints: {
            601:{
                slidesPerView: '2.3',
                spaceBetween:30,
            },
            501:{
                slidesPerView: '1.7',
                spaceBetween:40,
            },
            401: {
                slidesPerView: '1.5',
                spaceBetween:20,
            },
            320: {
                slidesPerView: '1.3',
                spaceBetween:20,
            },
            
        }
    });

    new Swiper('.before-after__slider', {
        loop: true,
        autoplay:{
            delay:3500,
        },
        speed:2000,
        effect: 'fade',
        fadeEffect: {
            crossFade:true,
        },
    });

    new Swiper('.documents__slider', {
        loop: false,
        breakpoints: {
            671:{
                slidesPerView: '2.5',
                spaceBetween:30,
            },
            601:{
                slidesPerView: '2.2',
                spaceBetween:25,
            },
            551:{
                slidesPerView: '2.1',
                spaceBetween:15,
            },
            501:{
                slidesPerView: '1.8',
                spaceBetween:25,
            },
            401: {
                slidesPerView: '1.6',
                spaceBetween:25,
            },
            365: {
                slidesPerView: '1.35',
                spaceBetween:25,
            },
            320: {
                slidesPerView: '1.25',
                spaceBetween:10,
            },
            
        }
    });

    //carousel
    const images = document.querySelectorAll('.works__carousel-img');

    if(images){
        images.forEach((item)=>{
            item.addEventListener('mouseenter',(e)=>{
                target = e.target;
                images.forEach(item=>{
                    if(target != item){
                        item.style.filter = 'blur(10px)';
                        item.style.zIndex = -1;
                    }
                });
            });
            item.addEventListener('mouseleave',()=>{
                images.forEach(item=>{
                    item.style.filter = 'blur(0px)';
                    item.style.zIndex = 0;
                });
            });
        });
    }

    //animation on scroll
    AOS.init({
        disable: false, 
        startEvent: 'load', 
        
        offset: 100, 
        delay: 100, 
        duration: 1000, 
        easing: 'ease', 
        once: true, 
        mirror: false, 
        anchorPlacement: 'top-bottom', 
      
      });
});