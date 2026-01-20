'use strict';
window.addEventListener('DOMContentLoaded',()=>{

    //вычесление наибольшей высоту колонок в портфолио контейнере
    function calculateContainerHeight() {
        const container = document.querySelector('.portfolio__gallery');
        const items = document.querySelectorAll('.portfolio__img');
        
        if (items.length === 0) return;

        // На мобильных устройствах (≤600px) используем 100% ширину и одну колонку
        if (window.innerWidth <= 600) {
            container.style.height = 'auto';
            return;
        }

        // Только для десктопа (>600px) вычисляем высоту колонок
        const columnsCount = 4;
        
        // Собираем высоты по колонкам
         const columnHeights = new Array(columnsCount).fill(0);
        
        items.forEach((item, index) => {
            const columnIndex = index % columnsCount;
            columnHeights[columnIndex] += item.offsetHeight + 30; // + gap
        });
        
        // Берем высоту самой высокой колонки
        const maxColumnHeight = Math.max(...columnHeights);

        
        // Устанавливаем высоту контейнера
        container.style.height = maxColumnHeight + 'px';
    }

    // Функция для инициализации расчета высоты после загрузки изображений
    function initContainerHeight() {
        const container = document.querySelector('.portfolio__gallery');
        const images = container ? container.querySelectorAll('img') : [];
        
        if (images.length === 0) {
            calculateContainerHeight();
            return;
        }

        let loadedImages = 0;
        let errorImages = 0;
        const totalImages = images.length;
        
        // Таймаут на случай долгой загрузки изображений
        const timeoutId = setTimeout(() => {
            if (loadedImages + errorImages < totalImages) {
                calculateContainerHeight();
            }
        }, 3000); // 3 секунды таймаут

        images.forEach(img => {
            if (img.complete) {
                loadedImages++;
            } else {
                img.addEventListener('load', () => {
                    loadedImages++;
                    checkAllLoaded();
                });
                
                img.addEventListener('error', () => {
                    errorImages++;
                    checkAllLoaded();
                });
            }
        });

        function checkAllLoaded() {
            if (loadedImages + errorImages === totalImages) {
                clearTimeout(timeoutId);
                calculateContainerHeight();
            }
        }

        // Если все изображения уже загружены
        if (loadedImages + errorImages === totalImages) {
            clearTimeout(timeoutId);
            calculateContainerHeight();
        }
    }

    if(document.querySelector('.portfolio__gallery')){
        initContainerHeight();
        window.addEventListener('resize', calculateContainerHeight);
    }

    // Mobile menu toggle
    function initMobileMenu() {
        const mobBtn = document.querySelector('.header__mob-btn');
        const headerLinks = document.querySelector('.header__links');
        
        if (!mobBtn || !headerLinks) return;
        
        mobBtn.addEventListener('click', () => {
            const isActive = headerLinks.classList.toggle('header__links--active');
            mobBtn.textContent = isActive ? 'Close' : 'Menu';
        });

        // Закрытие меню при клике на пространство вне блока
        document.addEventListener('click', (e) => {
            const isMenuOpen = headerLinks.classList.contains('header__links--active');
            const isClickInsideMenu = headerLinks.contains(e.target);
            const isClickOnButton = mobBtn.contains(e.target);
            
            if (isMenuOpen && !isClickInsideMenu && !isClickOnButton) {
                headerLinks.classList.remove('header__links--active');
                mobBtn.textContent = 'Menu';
            }
        });
    }
    initMobileMenu();


    //scroll animation
    if(document.querySelector('.scroll-animation')){
        const scrollAnimationCallback = function(entries,observer){
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    const target = entry.target;
                    target.classList.add('scroll-animation--active');
                    observer.unobserve(target);
                }
            });
        };
        const scrollAnimation = new IntersectionObserver(scrollAnimationCallback,{threshold:0.2});
        document.querySelectorAll('.scroll-animation').forEach(el=>{
            scrollAnimation.observe(el);
        });        

    }
    //переход между страницами с сохранением позиции

    function smartNavigation(step) {
        const mainBack = document.querySelector('[data-name="main"]');
        
        mainBack.addEventListener('click',(e)=>{
            e.preventDefault();
            history.go(step);
        });
    }
    
    const currentPath = window.location.pathname.replace(/\/$/, ''); // убираем trailing slash

    const isAbout = currentPath.includes('about');
    const isProject = currentPath.includes('project');
    let isMain = false;
    if(currentPath === '' || currentPath === '/'){
        isMain = true;
    }

    if(isMain){
        sessionStorage.setItem('isVisitMain', 1);
    }
    if(isAbout){
        const aboutPage = document.querySelector('[data-name="about"]');
        aboutPage.addEventListener('click',(e)=>{
            e.preventDefault();
        });

        if(!document.referrer.includes('project') && +sessionStorage.getItem('isVisitMain')){
            smartNavigation(-1);
        }
        if(document.referrer.includes('project') && +sessionStorage.getItem('isAboutPageReadyForSmartNav')){
            smartNavigation(-2);
        }
    }
    if(isProject){
        if(!document.referrer.includes('project') && +sessionStorage.getItem('isVisitMain')){
            sessionStorage.setItem('isAboutPageReadyForSmartNav', 1);
            smartNavigation(-1);
        }else{
            sessionStorage.setItem('isAboutPageReadyForSmartNav', 0);
        }
        
    }


    // Фильтрация портфолио
    function initPortfolioFilter() {
        const tabs = document.querySelectorAll('.portfolio__tab');
        const images = document.querySelectorAll('.portfolio__img');
        
        if (!tabs.length || !images.length) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const selectedCategory = tab.dataset.tab;
                
                // Обновляем активную вкладку
                tabs.forEach(t => t.classList.remove('portfolio__tab--active'));
                tab.classList.add('portfolio__tab--active');
                
                // Получаем видимые элементы для перестройки
                const visibleImages = [];
                const hiddenImages = [];
                
                images.forEach((img) => {
                    const categories = img.dataset.category ? img.dataset.category.split(',').map(cat => cat.trim().replace(/\s+/g, '-').toLowerCase()).filter(cat => cat) : [];
                    
                    if (selectedCategory === 'all' || categories.includes(selectedCategory)) {
                        img.classList.remove('portfolio__img--hidden');
                        visibleImages.push(img);
                    } else {
                        img.classList.add('portfolio__img--hidden');
                        hiddenImages.push(img);
                    }
                });
                
                // Перестраиваем порядок видимых элементов для правильной сетки
                visibleImages.forEach((element, newIndex) => {
                    // Сбрасываем оригинальный порядок
                    element.style.order = '';
                    
                    // Устанавливаем новый порядок для сетки 4 колонки
                    const orderValue = (newIndex % 4) + 1;
                    element.style.order = orderValue;
                });
                
                // Пересчитываем высоту контейнера после анимации
                setTimeout(() => {
                    calculateContainerHeight();
                }, 300);
            });
        });
    }
    initPortfolioFilter();

    // Проверка переполнения вкладок
    function checkTabsOverflow() {
        const tabsContainer = document.querySelector('.portfolio__tabs');
        if (!tabsContainer) return;

        const isOverflowing = tabsContainer.scrollWidth > tabsContainer.clientWidth;
        
        if (isOverflowing) {
            tabsContainer.classList.add('portfolio__tabs--overflow');
        } else {
            tabsContainer.classList.remove('portfolio__tabs--overflow');
        }
    }

    // Инициализация проверки переполнения
    if(document.querySelector('.portfolio__tabs')) {
        checkTabsOverflow();
        window.addEventListener('resize', checkTabsOverflow);
    }

    // Скролл вкладок колесом мыши
    function initTabsWheelScroll() {
        const tabsContainer = document.querySelector('.portfolio__tabs');
        if (!tabsContainer) return;

        tabsContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const scrollAmount = e.deltaY;
            tabsContainer.scrollLeft += scrollAmount;
        });
    }
    initTabsWheelScroll();

    // Видео функциональность
    function initVideoFunctionality() {
        const videoContainers = document.querySelectorAll('.project__video-container');
        const videoOverlay = document.getElementById('videoOverlay');
        const overlayVideo = document.getElementById('overlayVideo');
        
        if (!videoContainers.length || !videoOverlay || !overlayVideo) return;
        
        const isMobile = window.innerWidth <= 600;
        
        videoContainers.forEach(container => {
            const video = container.querySelector('video');
            const playBtn = container.querySelector('.project__video-play-btn');
            
            if (!video || !playBtn) return;
            
            // Десктопная версия - overlay
            if (!isMobile) {
                container.addEventListener('click', (e) => {
                    e.preventDefault();
                    openVideoOverlay(video);
                });
            }
            // Мобильная версия - play/pause на месте
            else {
                container.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleMobileVideo(container, video);
                });
            }
        });
        
        // Открытие overlay для десктопа
        function openVideoOverlay(originalVideo) {
            const overlayContent = document.querySelector('.project__video-overlay-content');
            const overlayVideo = document.getElementById('overlayVideo');
            
            // Определяем класс размера у оригинального контейнера
            const originalContainer = originalVideo.closest('.project__video-container');
            const sizeClass = originalContainer.className.match(/project__img-(\d+x\d+)/);
            
            // Удаляем все классы размеров у overlay и добавляем нужный
            overlayContent.className = 'project__video-overlay-content';
            if (sizeClass) {
                overlayContent.classList.add(`project__video-overlay-content-${sizeClass[1]}`);
            }
            
            const videoSrc = originalVideo.querySelector('source').src;
            const currentTime = originalVideo.currentTime;
            
            overlayVideo.src = videoSrc;
            overlayVideo.currentTime = currentTime;
            overlayVideo.volume = 0.3; // Устанавливаем громкость 30%
            overlayVideo.play();
            
            videoOverlay.classList.add('project__video-overlay--active');
            document.body.style.overflow = 'hidden';
        }
        
        // Закрытие overlay
        function closeVideoOverlay() {
            overlayVideo.pause();
            videoOverlay.classList.remove('project__video-overlay--active');
            document.body.style.overflow = '';
        }
        
        // Мобильная версия - play/pause
        function toggleMobileVideo(container, video) {
            if (video.paused) {
                video.volume = 0.3; // Устанавливаем громкость 30%
                video.play();
                container.classList.add('project__video-container--playing');
            } else {
                video.pause();
                container.classList.remove('project__video-container--playing');
            }
        }
        
        
        // Закрытие overlay по клику вне видео
        videoOverlay.addEventListener('click', (e) => {
            if (e.target === videoOverlay) {
                closeVideoOverlay();
            }
        });
        
        // Закрытие overlay по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoOverlay.classList.contains('project__video-overlay--active')) {
                closeVideoOverlay();
            }
        });
        
        // Обновление при изменении размера окна
        window.addEventListener('resize', () => {
            const newIsMobile = window.innerWidth <= 600;
            if (newIsMobile !== isMobile) {
                location.reload(); // Простое решение для переключения режимов
            }
        });
    }
    
    // Инициализация видео функциональности
    if (document.querySelector('.project__video-container')) {
        initVideoFunctionality();
    }

});

