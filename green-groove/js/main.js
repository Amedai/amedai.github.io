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

// 1. ОБЯЗАТЕЛЬНЫЕ настройки для iOS
video.playsInline = true;
video.muted = true;
video.loop = true;
video.volume = 0.02;

// 2. Запускаем видео сразу
video.play().catch(e => console.log('Стартовый запуск:', e.message));

// 3. Intersection Observer (упрощаем)
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(e => {}); // Игнорируем ошибки
            } else {
                video.pause();
            }
        });
    },
    { threshold: 0.1 }
);
observer.observe(heroSection);

// 4. ПРОСТОЙ и РАБОЧИЙ способ включения звука
let soundEnabled = false;

function enableSoundOnFirstInteraction() {
    if (soundEnabled || !video.muted) return;
    
    // Включаем звук ПРОСТО и БЕЗ лишних проверок
    video.muted = false;
    soundEnabled = true;
    console.log('🔊 Звук включен!');
    
    // Если видео на паузе - просто пробуем запустить
    if (video.paused) {
        video.play().catch(e => {
            // Не страшно - запустится когда секция будет видна
            console.log('Видео на паузе, запустится позже');
        });
    }
    
    // УДАЛЯЕМ ВСЕ обработчики
    window.removeEventListener('scroll', scrollHandler);
    document.removeEventListener('click', enableSoundOnFirstInteraction);
}

// 5. УПРОЩЕННЫЙ обработчик скролла (исправляет вашу ошибку)
let scrollTimeout;
function scrollHandler() {
    if (scrollTimeout) return; // Уже запланирован вызов
    
    scrollTimeout = setTimeout(() => {
        enableSoundOnFirstInteraction();
        scrollTimeout = null;
    }, 300); // Ждем 300мс после ПЕРВОГО скролла
}

// 6. Вешаем обработчики ПРАВИЛЬНО
window.addEventListener('scroll', scrollHandler, { passive: true });
// И клик тоже - для надежности
document.addEventListener('click', enableSoundOnFirstInteraction, { once: true });

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