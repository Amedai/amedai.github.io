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

    //счетчик слушателей
    class ListenersCounter {
        constructor() {
            // Целевые значения по часам (0-23)
            this.hourlyTargets = {
                0: 49000,  1: 44000,  2: 42000,  3: 44000,
                4: 51000,  5: 55000,  6: 58000,  7: 63000,
                8: 66000,  9: 68000,  10: 70000, 11: 70000,
                12: 70000, 13: 70000, 14: 70000, 15: 70000,
                16: 70000, 17: 70000, 18: 67000, 19: 63000,
                20: 60000, 21: 57000, 22: 54000, 23: 51000
            };
            
            this.currentListeners = 0;
            this.interval = null;
            this.updateInterval = 10000; // Обновление каждые 10 секунд
            
            // СНАЧАЛА показываем начальное значение мгновенно
            this.showInitialValue();
            
            // ПОТОМ инициализируем логику (микро-задержка)
            setTimeout(() => this.init(), 0);
        }
        
        showInitialValue() {
            const currentHour = new Date().getHours();
            const initialValue = this.hourlyTargets[currentHour] || 70000;
            
            const counterElement = document.getElementById('listeners-counter');
            if (counterElement) {
                counterElement.textContent = initialValue.toLocaleString('ru-RU');
            }
            
            this.currentListeners = initialValue;
        }
        
        init() {
            // Запускаем обновление
            this.startCounter();
            
            // Обновляем каждый час целевое значение
            setInterval(() => this.updateTarget(), 60 * 60 * 1000);
        }
        
        getTargetForCurrentHour() {
            const currentHour = new Date().getHours();
            return this.hourlyTargets[currentHour];
        }
        
        getNextHourTarget() {
            const nextHour = (new Date().getHours() + 1) % 24;
            return this.hourlyTargets[nextHour];
        }
        
        calculateSmoothChange() {
            const currentTarget = this.getTargetForCurrentHour();
            const nextTarget = this.getNextHourTarget();
            const now = new Date();
            const minutesPassed = now.getMinutes();
            const secondsPassed = now.getSeconds();
            
            // Прогресс текущего часа в диапазоне 0-1
            const hourProgress = (minutesPassed * 60 + secondsPassed) / 3600;
            
            // Линейная интерполяция между часами
            const interpolatedTarget = currentTarget + (nextTarget - currentTarget) * hourProgress;
            
            // Добавляем случайность (±5% от разницы между текущим и целевым)
            const maxRandomChange = Math.abs(interpolatedTarget - this.currentListeners) * 0.05;
            const randomChange = (Math.random() * 2 - 1) * maxRandomChange;
            
            // Плавное движение к интерполированной цели
            const stepSize = 0.1; // Коэффициент плавности (меньше = плавнее)
            const difference = interpolatedTarget - this.currentListeners;
            
            return this.currentListeners + (difference * stepSize) + randomChange;
        }
        
        updateCounter() {
            const newValue = this.calculateSmoothChange();
            this.currentListeners = Math.max(1000, Math.round(newValue)); // Не меньше 1000
            
            // Обновляем отображение
            const counterElement = document.getElementById('listeners-counter');
            if (counterElement) {
                // Форматирование с пробелами
                counterElement.textContent = this.currentListeners.toLocaleString('ru-RU');
                
            }
        }
        
        updateTarget() {
            // Эта функция вызывается каждый час для смены цели
            // Можно добавить дополнительную логику при смене часа
        }
        
        startCounter() {
            if (this.interval) clearInterval(this.interval);
            
            this.interval = setInterval(() => {
                this.updateCounter();
            }, this.updateInterval);
        }
        
        stopCounter() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
        
        // Метод для ручного обновления снаружи
        forceUpdate() {
            this.updateCounter();
        }
        
        // Метод для изменения значения вручную
        setValue(newValue) {
            if (typeof newValue === 'number' && newValue >= 0) {
                this.currentListeners = newValue;
                const counterElement = document.getElementById('listeners-counter');
                if (counterElement) {
                    counterElement.textContent = newValue.toLocaleString('ru-RU');
                }
            }
        }
        
        // Метод для получения текущего значения
        getValue() {
            return this.currentListeners;
        }
    }
    
    // Инициализация при загрузке страницы
    window.listenersCounter = new ListenersCounter();
});