'use strict';
window.addEventListener('DOMContentLoaded',()=>{

    //вычесление наибольшей высоту колонок в портфолио контейнера
    function calculateContainerHeight() {
        const container = document.querySelector('.portfolio__gallery');
        const items = document.querySelectorAll('.portfolio__img');
        
        if (items.length === 0) return;

        // Определяем количество колонок в зависимости от ширины экрана
        const isMobile = window.innerWidth <= 800;
        const columnsCount = isMobile ? 2 : 4;
        
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
            mainBack.addEventListener('click',()=>{
                e.preventDefault(e);
                history.go(-1);
            });
        }
        if(nav.referrer.includes('work-more') && curentPath.includes('about') && nav.historyLength > 2){
            mainBack.addEventListener('click',()=>{
                e.preventDefault(e);
                history.go(-2);
            });            
        }
    }
    smartNavigation();



});

