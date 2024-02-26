window.addEventListener('DOMContentLoaded', () => {
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
        slidesPerView: '1.12',
        spaceBetween:15,
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
        slidesPerView: '1.15',
        spaceBetween:20,
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
        startEvent: 'DOMContentLoaded', 
        
        offset: 100, 
        delay: 100, 
        duration: 1000, 
        easing: 'ease', 
        once: true, 
        mirror: false, 
        anchorPlacement: 'top-bottom', 
      
      });
});