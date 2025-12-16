'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //mob menu
    const inner = document.querySelector('.header__inner'),
    burger = document.querySelector('.header__burger'),
    menuitems = inner.querySelectorAll('header__menu-item');
    
    burger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner--active');
        burger.classList.toggle('header__burger--active');
    });
    menuitems.forEach(item=>{
        item.addEventListener('click',()=>{
            inner.classList.toggle('header__inner--active');
            burger.classList.toggle('header__burger--active');
        });
    });

    //фоновое видео
    
    const video = document.querySelector('video');
    const heroSection = document.querySelector('.hero');
    
    video.muted = true;
    video.play();
    // Вариант 1: Базовый Intersection Observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Секция видна - включаем видео
                    video.play();
                    video.loop = true;
                    video.volume = 0.02; 
                } else {
                    // Секция не видна - приостанавливаем видео
                    video.pause();
                    video.volume = 0;
                }
            });
        },
        {
            threshold: 0.1 
        }
    );
    observer.observe(heroSection);
    function enableSound() {
        if (video.muted) {
            video.muted = false; // Теперь звук включится
            video.volume = 0.02; // Устанавливаем желаемую громкость
            // Можно удалить обработчик, чтобы не срабатывал повторно
            document.removeEventListener('click', enableSound);
        }
    }

    // Включаем звук при первом клике где угодно на странице
    document.addEventListener('click', enableSound);

    //advantages animation
    const advantagesItems = document.querySelectorAll('.advantages__item');
    advantagesItems.forEach((item,i)=>{
        const itemText = item.querySelector('.advantages__text');
        item.addEventListener('click', ()=>{
            if((i + 1) % 2 == 0) {
                if(advantagesItems[i-1].classList.contains('advantages__item--noactive')){
                    setTimeout(() => {
                        advantagesItems[i-1].classList.toggle('advantages__item--noactive');
                      }, 500);
                }else{
                    advantagesItems[i-1].classList.toggle('advantages__item--noactive');
                }

            }
            if((i + 1) % 2 !=0) {
                if(advantagesItems[i+1].classList.contains('advantages__item--noactive')){
                    setTimeout(() => {
                        advantagesItems[i+1].classList.toggle('advantages__item--noactive');
                      }, 500);
                }else{
                    advantagesItems[i+1].classList.toggle('advantages__item--noactive');
                }

            }
            if(item.classList.contains('advantages__item--active')){
                itemText.style.display = 'none';
            }else{
                setTimeout(() => {
                    itemText.style.display = 'block';
                  }, 300);
            }
            item.classList.toggle('advantages__item--active');
        });
    });

    //модалка
    function fadeIn (el, timeout, display){
        el.style.opacity = 0;
        el.style.display = display || 'block';
        el.style.transition = `opacity ${timeout}ms`;
        setTimeout(() => {
          el.style.opacity = 1;
        }, timeout);
    }
    function fadeOut (el, timeout){
        el.style.opacity = 1;
        el.style.transition = `opacity ${timeout}ms`;
        el.style.opacity = 0;
      
        setTimeout(() => {
          el.style.display = 'none';
        }, timeout);
    }
    const contactButtons = document.querySelectorAll('[data-overlay="modal"]'),
    overlay = document.querySelector('.overlay'),
    closeElement = document.querySelector('[data-overlay="close"]');

    const body = document.body;

    let scrollPosition = 0;

    contactButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
            fadeIn(overlay, 100, 'block');
            scrollPosition = window.pageYOffset;
            body.classList.add('no-scroll');
            body.style.top = `-${scrollPosition}px`;
        });
    });
    closeElement.addEventListener('click',()=>{
        fadeOut(overlay,30);
        body.classList.remove('no-scroll');
        window.scrollTo(0, scrollPosition);
    });
    overlay.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.classList.contains('overlay')){
            fadeOut(overlay,30);
            body.classList.remove('no-scroll');
            window.scrollTo(0, scrollPosition);
        }
    });
    document.addEventListener('keydown',(e)=>{
        if(overlay.style.opacity === '1' && e.code == 'Escape'){
            fadeOut(overlay,30);
            body.classList.remove('no-scroll');
            window.scrollTo(0, scrollPosition);
    }
    });

    //slider
    if(document.querySelector('.artists__slider')){
        new Swiper('.artists__slider', {
            loop: false,
            grabCursor:true,
            centeredSlidesBounds:true,
            centeredSlides: true,
            navigation: {
            nextEl: '.artists__right',
            prevEl: '.artists__left',
            },
    
            breakpoints: {
                1400:{
                    slidesPerView: '4.2',
                    spaceBetween:25,
                },
                1024:{
                    slidesPerView: '3.2',
                    spaceBetween:25,
                },
                768:{
                    slidesPerView: '2.5',
                    spaceBetween:15,
                },
                320:{
                    slidesPerView: '2.1',
                    spaceBetween:10,
                },
            }
        });
    }
});