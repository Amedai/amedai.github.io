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
    
    video.muted = true;
    video.play();
    
    let isSoundEnabled = false;
    let maxVolume = 0.5;
    
    function enableSound() {
        if (video.muted) {
            video.muted = false;
            isSoundEnabled = true;
            updateVideoVolume();
            document.removeEventListener('click', enableSound);
        }
    }
    
    function updateVideoVolume() {
        if (!isSoundEnabled) return;
        
        const scrollY = window.scrollY;
        
        // Уменьшаем громкость: каждые 70px скролла = -0.02 громкости
        const scrollSteps = Math.floor(scrollY / 70);
        const volumeDecrease = scrollSteps * 0.02;
        
        // Вычисляем новую громкость
        let newVolume = Math.max(0, maxVolume - volumeDecrease);
        
        video.volume = newVolume;
        
        // Приостанавливаем видео если громкость 0 
        if (newVolume === 0) {
            video.pause();
        } else if (newVolume > 0) {
            video.play();
            video.loop = true;
        }
    }
    
    window.addEventListener('scroll', updateVideoVolume);
    document.addEventListener('click', enableSound);

    //advantages animation
    const advantagesItems = document.querySelectorAll('.advantages__item');
    const advantagesFlex = document.querySelector('.advantages__flex');
    
    // Проверяем, что мы на десктопе (не tablet и не mobile)
    function isDesktop() {
        return window.innerWidth >= 1024; // или другая точка перехода на tablet
    }
    
    if (isDesktop()) {
        advantagesItems.forEach((item,i)=>{
            const itemText = item.querySelector('.advantages__text');
            item.addEventListener('click', ()=>{
                // Если элемент уже активен, просто сворачиваем его
                if(item.classList.contains('advantages__item--active')){
                    item.classList.remove('advantages__item--active');
                    itemText.style.display = 'none';
                    
                    // Удаляем все клоны
                    const clones = advantagesFlex.querySelectorAll('.advantages__item--clone');
                    clones.forEach(clone => clone.remove());
                    
                    // Показываем все скрытые элементы
                    advantagesItems.forEach(originalItem => {
                        originalItem.classList.remove('advantages__item--noactive');
                    });
                    return;
                }
                
                // Сначала сворачиваем все активные элементы
                advantagesItems.forEach(originalItem => {
                    if(originalItem.classList.contains('advantages__item--active')){
                        originalItem.classList.remove('advantages__item--active');
                        const originalText = originalItem.querySelector('.advantages__text');
                        if(originalText) originalText.style.display = 'none';
                    }
                });
                
                // Удаляем все существующие клоны
                const existingClones = advantagesFlex.querySelectorAll('.advantages__item--clone');
                existingClones.forEach(clone => clone.remove());
                
                // Показываем все элементы перед тем как скрывать соседа
                advantagesItems.forEach(originalItem => {
                    originalItem.classList.remove('advantages__item--noactive');
                });
                
                // Определяем соседний элемент и скрываем его
                let siblingItem = null;
                if((i + 1) % 2 == 0) {
                    // Четный элемент, сосед слева
                    siblingItem = advantagesItems[i-1];
                } else {
                    // Нечетный элемент, сосед справа
                    siblingItem = advantagesItems[i+1];
                }
                
                if(siblingItem) {
                    siblingItem.classList.add('advantages__item--noactive');
                    
                    // Создаем клон исчезнувшего элемента
                    const clone = siblingItem.cloneNode(true);
                    clone.classList.add('advantages__item--clone');
                    clone.classList.remove('advantages__item--noactive');
                    
                    // Вставляем клон сразу после расширяющегося элемента
                    item.parentNode.insertBefore(clone, item.nextSibling);
                    
                    // Добавляем обработчик клика для клона
                    const cloneText = clone.querySelector('.advantages__text');
                    clone.addEventListener('click', () => {
                        if(clone.classList.contains('advantages__item--active')){
                            clone.classList.remove('advantages__item--active');
                            cloneText.style.display = 'none';
                        } else {
                            // Сворачиваем все активные элементы
                            document.querySelectorAll('.advantages__item--active').forEach(activeItem => {
                                activeItem.classList.remove('advantages__item--active');
                                const activeText = activeItem.querySelector('.advantages__text');
                                if(activeText) activeText.style.display = 'none';
                            });
                            
                            clone.classList.add('advantages__item--active');
                            setTimeout(() => {
                                cloneText.style.display = 'block';
                            }, 300);
                        }
                    });
                }
                
                // Расширяем текущий элемент
                item.classList.add('advantages__item--active');
                setTimeout(() => {
                    itemText.style.display = 'block';
                }, 300);
            });
        });
    } else {
        // Для планшетов и мобильных - старая логика
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
    }

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

    // Audio controls
    const progressBars = document.querySelectorAll('#progressBar');
    const volumeBars = document.querySelectorAll('#volumeBar');
    const audioPlayers = document.querySelectorAll('#audioPlayer');
    const recordButtons = document.querySelectorAll('.release__record');
    const timeDisplays = document.querySelectorAll('#timeDisplay');
    const audioBottoms = document.querySelectorAll('.release__audio-bottom');

    // Функция обновления прогресс-бара
    function updateProgressBar(input) {
        const value = (input.value - input.min) / (input.max - input.min) * 100;
        input.style.setProperty('--value', value + '%');
    }
    
    // Форматирование времени
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Обновление времени
    function updateTimeDisplay(audioPlayer, progressBar, timeDisplay) {
        if (audioPlayer) {
            const currentTime = audioPlayer.currentTime;
            const duration = audioPlayer.duration || 0;
            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            
            // Обновление прогресс-бара
            if (progressBar && duration) {
                const progressPercent = (currentTime / duration) * 100;
                progressBar.value = progressPercent;
                updateProgressBar(progressBar);
            }
        }
    }
    
    // Переключение play/pause
    function togglePlayPause(audioPlayer, recordButton, audioBottom, progressBar, volumeBar, timeDisplay) {
        if (!audioPlayer) return;
        
        if (audioPlayer.paused) {
            audioPlayer.play();
            recordButton.classList.add('release__record--active');
            // Показать панель управления
            if (audioBottom) {
                audioBottom.style.display = 'flex';
            }
        } else {
            audioPlayer.pause();
            recordButton.classList.remove('release__record--active');
            // Скрыть панель управления
            if (audioBottom) {
                audioBottom.style.display = 'none';
            }
        }
    }
    
    // Инициализация каждого аудиоплеера
    audioPlayers.forEach((audioPlayer, index) => {
        const progressBar = progressBars[index];
        const volumeBar = volumeBars[index];
        const recordButton = recordButtons[index];
        const timeDisplay = timeDisplays[index];
        const audioBottom = audioBottoms[index];
        
        // Инициализация прогресс-баров
        if (progressBar) {
            updateProgressBar(progressBar);
            progressBar.addEventListener('input', () => {
                if (audioPlayer && audioPlayer.duration) {
                    const newTime = (progressBar.value / 100) * audioPlayer.duration;
                    audioPlayer.currentTime = newTime;
                }
            });
        }
        
        if (volumeBar) {
            updateProgressBar(volumeBar);
            volumeBar.addEventListener('input', () => {
                if (audioPlayer) {
                    audioPlayer.volume = volumeBar.value;
                    updateProgressBar(volumeBar);
                }
            });
        }
        
        // Клик по кнопке play/pause
        if (recordButton) {
            recordButton.addEventListener('click', () => {
                togglePlayPause(audioPlayer, recordButton, audioBottom, progressBar, volumeBar, timeDisplay);
            });
        }
        
        // События аудио плеера
        if (audioPlayer) {
            // Установка начальной громкости
            audioPlayer.volume = volumeBar ? volumeBar.value : 1;
            
            // Обновление времени во время воспроизведения
            audioPlayer.addEventListener('timeupdate', () => {
                updateTimeDisplay(audioPlayer, progressBar, timeDisplay);
            });
            
            // Обновление при загрузке метаданных
            audioPlayer.addEventListener('loadedmetadata', () => {
                updateTimeDisplay(audioPlayer, progressBar, timeDisplay);
                if (progressBar) {
                    progressBar.max = 100;
                    progressBar.value = 0;
                    updateProgressBar(progressBar);
                }
            });
            
            // Окончание воспроизведения
            audioPlayer.addEventListener('ended', () => {
                recordButton.classList.remove('release__record--active');
                if (progressBar) {
                    progressBar.value = 0;
                    updateProgressBar(progressBar);
                }
                updateTimeDisplay(audioPlayer, progressBar, timeDisplay);
            });
        }
    });
});