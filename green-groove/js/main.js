'use strict';
window.addEventListener('DOMContentLoaded',()=>{
   //mob menu
   const inner = document.querySelector('.header__inner'),
   burger = document.querySelector('.header__burger'),
   menuLinks = inner.querySelectorAll('.header__menu-link');

   const closeMenu = () => {
       inner.classList.remove('header__inner--active');
       burger.classList.remove('header__burger--active');
       document.body.classList.remove('no-scroll');
   };

   burger.addEventListener('click', () => {
       const isActive = inner.classList.toggle('header__inner--active');
       burger.classList.toggle('header__burger--active');
       document.body.classList.toggle('no-scroll', isActive);
   });

   menuLinks.forEach(link => {
       link.addEventListener('click', closeMenu);
   });


    //фоновое видео
    const heroVideo = document.querySelector('.hero__bg-video');
    const soundToggle = document.querySelector('.hero__sound-toggle');
    const soundToggleImg = document.querySelector('.hero__sound-toggle-img');
    const soundToggleText = document.querySelector('.hero__sound-toggle-text');

    if (heroVideo && soundToggle) {
        soundToggle.addEventListener('click', () => {
            const isActive = soundToggleImg.classList.toggle('hero__sound-toggle-img--active');
            if (isActive) {
                heroVideo.muted = false;
                heroVideo.volume = 0.4;
                if (soundToggleText) soundToggleText.textContent = 'Выключить звук';
            } else {
                heroVideo.muted = true;
                if (soundToggleText) soundToggleText.textContent = 'Включить звук';
            }
        });
    }

    //advantages animation
    const advantagesItems = document.querySelectorAll('.advantages__item');
    const itemHeights = new Map();

    function calcItemHeights() {
        advantagesItems.forEach(item => {
            itemHeights.set(item, {
                collapsed: item.offsetHeight,
                expanded: item.scrollHeight
            });
        });
    }

    calcItemHeights();
    window.addEventListener('load', calcItemHeights);
    let prevWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        const currentWidth = window.innerWidth;
        if (currentWidth === prevWidth) return;
        prevWidth = currentWidth;

        advantagesItems.forEach(el => {
            el.classList.remove('advantages__item--active');
            el.style.height = '';
        });
        calcItemHeights();
    });

    advantagesItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('advantages__item--active');
            const scrollY = window.scrollY;
            const itemTop = item.getBoundingClientRect().top;

            advantagesItems.forEach(el => {
                if (el.classList.contains('advantages__item--active')) {
                    el.classList.remove('advantages__item--active');
                    el.style.height = itemHeights.get(el).collapsed + 'px';
                }
            });

            if (!isActive) {
                item.classList.add('advantages__item--active');
                item.style.height = itemHeights.get(item).expanded + 'px';
            }

            const newItemTop = item.getBoundingClientRect().top;
            window.scrollTo(0, scrollY + (newItemTop - itemTop));
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
        const artistImages = document.querySelectorAll('.artists__img');

        artistImages.forEach(img => {
            img.addEventListener('touchstart', function() {
                this.classList.toggle('artists__img--active');

                artistImages.forEach(otherImg => {
                    if (otherImg !== this) {
                        otherImg.classList.remove('artists__img--active');
                    }
                });
            });
        });
        
        new Swiper('.artists__slider', {
            loop: true,
            grabCursor:true,
            centeredSlides: true,
            initialSlide: 4,
            mousewheel: {
                enabled: true,
                forceToAxis: true,
                thresholdDelta: 10,
            },
            freeMode: {
                enabled: true,          
                momentum: true,         // инерция (плавное замедление после движения)
                momentumVelocityRatio: 0.5,  // скорость инерции (можно поиграться: 0.5-2)
                momentumRatio: 1,       // сила инерции
                sticky: false           // без прилипания к слайдам (важно для полной плавности)
            },
             breakpoints: {
                1400:{
                    slidesPerView: '4.2',
                    spaceBetween:30,
                },
                1024:{
                    slidesPerView: '3.6',
                    spaceBetween:30,
                },
                768:{
                    slidesPerView: '2.2',
                    spaceBetween:25,
                },
                320:{
                    slidesPerView: '2.1',
                    spaceBetween:15,
                },
            }
        });
    }

    //счетчик слушателей
    const listenersCounter = document.getElementById('listeners-counter');
    if (listenersCounter) {
        const listenersTable = {
            0: 49000,  1: 44000,  2: 42000,  3: 44000,
            4: 51000,  5: 55000,  6: 58000,  7: 63000,
            8: 66000,  9: 68000,  10: 70000, 11: 70000,
            12: 70000, 13: 70000, 14: 70000, 15: 70000,
            16: 70000, 17: 70000, 18: 67000, 19: 63000,
            20: 60000, 21: 57000, 22: 54000, 23: 51000
        };

        const getMskTime = () => {
            const now = new Date();
            return { h: (now.getUTCHours() + 3) % 24, m: now.getUTCMinutes() };
        };

        const getListenersTarget = () => {
            const { h, m } = getMskTime();
            const cur = listenersTable[h];
            const next = listenersTable[(h + 1) % 24];
            return cur + (next - cur) * (m / 60);
        };

        let currentListeners = Math.round(getListenersTarget());
        listenersCounter.textContent = currentListeners.toLocaleString('ru-RU');

        setInterval(() => {
            const { h } = getMskTime();
            const sameHours = listenersTable[h] === listenersTable[(h + 1) % 24];
            const target = getListenersTarget();

            const randomChange = currentListeners * (Math.random() * 0.1 - 0.05);
            const drift = sameHours ? 0 : (target - currentListeners) * 0.2;

            currentListeners = Math.min(Math.round(currentListeners + randomChange + drift), 77000);
            listenersCounter.textContent = currentListeners.toLocaleString('ru-RU');
        }, 5000);
    }

    //scroll animation
    if(document.querySelector('.scroll-animate')){
        const scrollAnimationCallback = function(entries,observer){
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    const target = entry.target;
                    target.classList.add('scroll-animate--active');
                    observer.unobserve(target);
                }
            });
        };
        const scrollAnimation = new IntersectionObserver(scrollAnimationCallback,{threshold:0.2});
        document.querySelectorAll('.scroll-animate').forEach(el=>{
            scrollAnimation.observe(el);
        });        

    }

    // Audio controls
    const audioItems = document.querySelectorAll('.release__audio-item');
    let currentAudio = null;
    let currentButton = null;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function setProgressFill(input, value) {
        input.style.setProperty('--value', `${value}%`);
    }

    function stopCurrent() {
        if (currentAudio) {
            currentAudio.pause();
            currentButton.classList.remove('release__record--active');
            currentAudio = null;
            currentButton = null;
        }
    }

    audioItems.forEach(item => {
        const audio = item.querySelector('audio');
        const button = item.querySelector('.release__record');
        const progressBar = item.querySelector('.release__audio-progress-bar input');
        const timeDisplay = item.querySelector('.release__time-display');

        button.addEventListener('click', () => {
            if (currentAudio && currentAudio !== audio) {
                stopCurrent();
            }
            if (audio.paused) {
                audio.volume = 0.4;
                audio.play();
                button.classList.add('release__record--active');
                currentAudio = audio;
                currentButton = button;
            } else {
                audio.pause();
                button.classList.remove('release__record--active');
                currentAudio = null;
                currentButton = null;
            }
        });

        audio.addEventListener('timeupdate', () => {
            if (!progressBar._dragging && audio.duration) {
                const val = (audio.currentTime / audio.duration) * 100;
                progressBar.value = val;
                setProgressFill(progressBar, val);
            }
            if (timeDisplay) {
                timeDisplay.textContent = formatTime(audio.currentTime);
            }
        });

        audio.addEventListener('ended', () => {
            button.classList.remove('release__record--active');
            progressBar.value = 0;
            setProgressFill(progressBar, 0);
            if (timeDisplay) timeDisplay.textContent = '00:00';
            currentAudio = null;
            currentButton = null;
        });

        progressBar.addEventListener('mousedown', () => { progressBar._dragging = true; });
        progressBar.addEventListener('touchstart', () => { progressBar._dragging = true; }, { passive: true });

        progressBar.addEventListener('input', () => {
            const val = parseFloat(progressBar.value);
            setProgressFill(progressBar, val);
            if (audio.duration) {
                audio.currentTime = (val / 100) * audio.duration;
            }
            if (timeDisplay) {
                timeDisplay.textContent = formatTime(audio.currentTime);
            }
        });

        progressBar.addEventListener('mouseup', () => { progressBar._dragging = false; });
        progressBar.addEventListener('touchend', () => { progressBar._dragging = false; });
    });

});