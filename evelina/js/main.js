'use strict';
window.addEventListener('DOMContentLoaded',()=>{

    //вычесление наибольшей высоту колонок в портфолио контейнере
    function calculateContainerHeight() {
        const container = document.querySelector('.portfolio__gallery');
        const items = document.querySelectorAll('.portfolio__img');
        
        if (items.length === 0) return;

        // На мобильных устройствах (≤500px) используем 100% ширину и одну колонку
        if (window.innerWidth <= 500) {
            container.style.height = 'auto';
            return;
        }

        // Только для десктопа (>500px) вычисляем высоту колонок
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
    if(document.querySelector('.portfolio__gallery')){
        calculateContainerHeight();
        window.addEventListener('resize', calculateContainerHeight);
    }

    // Mobile menu toggle
    function initMobileMenu() {
        const mobBtn = document.querySelector('.header__mob-btn');
        const headerLinks = document.querySelector('.header__links');
        
        if (!mobBtn || !headerLinks) return;
        
        mobBtn.addEventListener('click', () => {
            headerLinks.classList.toggle('header__links--active');
        });
    }
    initMobileMenu();


    //scroll animation
    if(document.querySelector('.scroll-animation')){
/*         window.addEventListener('load',()=>{
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
        }); */
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


    // Проверяем, откуда пришли
    function getNavigationHistory() {
        return {
            referrer: document.referrer,
            historyLength: history.length
        };
    }
    function smartNavigation() {
        const mainBack = document.querySelector('[data-name="main"]');
        const curentPath = window.location.pathname;
        
        const nav = getNavigationHistory();

        if(nav.referrer.includes('index')){
            mainBack.addEventListener('click',(e)=>{
                e.preventDefault();
                history.go(-1);
            });
        }
        if(nav.referrer.includes('project') && curentPath.includes('about') && nav.historyLength > 2){
            mainBack.addEventListener('click',(e)=>{
                e.preventDefault();
                history.go(-2);
            });            
        }
    }
    smartNavigation();

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
                    const category = img.dataset.category;
                    
                    if (selectedCategory === 'all' || category === selectedCategory) {
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

});

