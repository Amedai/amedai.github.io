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
    video.loop = true;
    video.volume = 0.02;
    video.play();
    // Вариант 1: Базовый Intersection Observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Секция видна - включаем видео
                    video.play();
                } else {
                    // Секция не видна - приостанавливаем видео
                    video.pause();
                }
            });
        },
        {
            threshold: 0.1 
        }
    );
    observer.observe(heroSection);
// Флаг, чтобы не пытаться включить звук несколько раз
let soundAttempted = false;

function enableSound() {
    // Если звук уже не muted или уже пытались включить - выходим
    if (soundAttempted || !video.muted) return;
    
    soundAttempted = true;
    
    // Пытаемся включить звук
    video.muted = false;
    
    // Проверяем, не поставил ли браузер видео на паузу
    if (video.paused) {
        // Если видео на паузе, пробуем перезапустить
        video.play().then(() => {
            console.log("✅ Звук включен после скролла");
        }).catch(error => {
            console.log("⚠️ Звук включен, но видео не запустилось:", error.message);
            // Оставляем звук включенным, видео запустится при следующем скролле
        });
    } else {
        console.log("✅ Звук включен");
    }
    
    // Убираем обработчик СРАЗУ после первой попытки
    window.removeEventListener('scroll', enableSound);
}

// ВАЖНО: используем requestAnimationFrame чтобы не блокировать скролл
let scrollHandlerScheduled = false;

window.addEventListener('scroll', () => {
    if (!scrollHandlerScheduled) {
        scrollHandlerScheduled = true;
        requestAnimationFrame(() => {
            enableSound();
            scrollHandlerScheduled = false;
        });
    }
}, { passive: true });

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