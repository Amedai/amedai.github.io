'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //mob menu
    const inner = document.querySelector('.header__inner'),
        burger = document.querySelector('.header__burger');
    
    burger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner--active');
        burger.classList.toggle('header__burger--active');
    });

    //scroll animate
    if(document.querySelector('.scroll-animate')){
        const scrollAnimating = (entries,observer)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    entry.target.classList.add('scroll-animate--active');
                    observer.unobserve(entry.target);
                }
            });
        };

        const scrollInersectObserver = new IntersectionObserver(scrollAnimating,{threshold:0.3});

        const scrollAnimateItems = document.querySelectorAll('.scroll-animate');
        scrollAnimateItems.forEach(item=>{
            scrollInersectObserver.observe(item);
        });
    }
    



    //sliders
    if(document.querySelector('.promo__slider')){
        new Swiper('.promo__slider', {
            autoplay: {
                delay: 5000,
            },
            speed:1000,
            loop: true,
            allowTouchMove:false,
    
            pagination: {
                el: '.promo__pagination.pagination',
                bulletClass: 'pagination__bullet',
                bulletActiveClass: 'pagination__bullet--active',
                clickable:true,
              },
        });
    }

    if(document.querySelector('.vacancy__slider')){
        new Swiper('.vacancy__slider', {
            speed:500,
            slidesPerView:1,

            navigation: {
                nextEl: '.vacancy__arrows .arrows__next',
                prevEl: '.vacancy__arrows .arrows__prev',
            },
    
            pagination: {
                el: '.vacancy__pagination.pagination',
                bulletClass: 'pagination__bullet',
                bulletActiveClass: 'pagination__bullet--active',
                clickable:true,
            },
        });
    }
    if(document.querySelector('.last-events__slider')){
        new Swiper('.last-events__slider', {
            speed:500,
            slidesPerView:1,

            navigation: {
                nextEl: '.last-events__arrows .arrows__next',
                prevEl: '.last-events__arrows .arrows__prev',
            },
        });
    }

    if(document.querySelector('[data-slider="events"]')){
        new Swiper('[data-slider="events"]', {
            grabCursor:true,
            speed:500,
            spaceBetween:26,

            breakpoints:{
                1400.98:{
                    slidesPerView: '2.5',
                },
                767.98:{
                    slidesPerView: '2',
                },
                320:{
                    slidesPerView: '1',
                }
            },

            navigation: {
                nextEl: '.events__arrows .arrows__next',
                prevEl: '.events__arrows .arrows__prev',
            },
    
            pagination: {
                el: '.events__pagination.pagination',
                bulletClass: 'pagination__bullet',
                bulletActiveClass: 'pagination__bullet--active',
                clickable:true,
              },
        });
    }

    if(document.querySelector('[data-slider="menu"]')){
        new Swiper('[data-slider="menu"]', {
            grabCursor:true,
            speed:500,
            spaceBetween:26,

            breakpoints:{
                1400.98:{
                    slidesPerView: '2.5',
                },
                935.98:{
                    slidesPerView: '3',
                },
                767.98:{
                    slidesPerView: '2.3',
                },
                320:{
                    slidesPerView: '1',
                }
            },

            navigation: {
                nextEl: '.events__arrows .arrows__next',
                prevEl: '.events__arrows .arrows__prev',
            },
    
            pagination: {
                el: '.events__pagination.pagination',
                bulletClass: 'pagination__bullet',
                bulletActiveClass: 'pagination__bullet--active',
                clickable:true,
              },
        });
    }

    let advantagesSlider;
    const advSlider = document.querySelector('.advantages__slider'),
        advSliderWrapper = document.querySelector('.advantages__slider-wrapper'),
        advSlides = document.querySelectorAll('.advantages__slide');
    function initAdvantagesSlider(){
        if(window.innerWidth <= 1023.98){
            if(!advantagesSlider){
                advSlider.classList.add('swiper');
                advSliderWrapper.classList.add('swiper-wrapper');
                advSlides.forEach(slide=>{
                    slide.classList.add('swiper-slide');
                });
                advantagesSlider = new Swiper('.advantages__slider', {
                    grabCursor:true,
                    speed:500,
                    spaceBetween:26,
        
                    breakpoints:{
                        935.98:{
                            slidesPerView: '3',
                        },
                        767.98:{
                            slidesPerView: '2.5',
                        },
                        320:{
                            slidesPerView: '1',
                        }
                    },
        
                    navigation: {
                        nextEl: '.advantages__arrows .arrows__next',
                        prevEl: '.advantages__arrows .arrows__prev',
                    },
            
                    pagination: {
                        el: '.advantages__pagination.pagination',
                        bulletClass: 'pagination__bullet',
                        bulletActiveClass: 'pagination__bullet--active',
                        clickable:true,
                    },
                });
            }
        }else if(advantagesSlider){
            advSlider.classList.remove('swiper');
            advSliderWrapper.classList.remove('swiper-wrapper');
            advSlides.forEach(slide=>{
                slide.classList.remove('swiper-slide');
            });
            advantagesSlider.destroy();
            advantagesSlider = null;
        } 
    }

    if(document.querySelector('.advantages__slider')){
        initAdvantagesSlider();
        window.addEventListener('resize',initAdvantagesSlider);
       
    }

    // worth section
    function setBorderBottom(cells,grid,cellLength){
        if(window.innerWidth > 1250.98){
            if(grid.getAttribute('data-border-bottom') != 'desktop'){
                cells.forEach(cell=>{
                    cell.classList.add('worth__cell--border-bottom');
                });
                for(let i = 1; i <= (cellLength-1) % 3 + 1 ;i++){
                    cells[cellLength - i].classList.remove('worth__cell--border-bottom');
                }
                grid.setAttribute('data-border-bottom','desktop');
            }
            
        }else if(window.innerWidth > 767.98){
            if(grid.getAttribute('data-border-bottom') != 'tablet'){
                cells.forEach(cell=>{
                    cell.classList.add('worth__cell--border-bottom');
                });
                for(let i = 1; i <= (cellLength-1) % 2 + 1 ;i++){
                    cells[cellLength - i].classList.remove('worth__cell--border-bottom');
                }
                grid.setAttribute('data-border-bottom','tablet');
            }
            
        }
        
    }

    if(document.querySelector('.worth__cell')){
        const worthGrid = document.querySelector('.worth__grid'),
            worthCells = document.querySelectorAll('.worth__cell'),
            worthCellsLength = worthCells.length;


        setBorderBottom(worthCells,worthGrid,worthCellsLength);

        window.addEventListener('resize',()=>{
            setBorderBottom(worthCells,worthGrid,worthCellsLength);
        });
    }

    //menu-tab
    if(document.querySelector('[data-menu-name]')){
        const detailsBtns = document.querySelectorAll('[data-menu-name]');

        detailsBtns.forEach(btn=>{
            btn.addEventListener('click',()=>{
               localStorage.setItem('menu-name',btn.getAttribute('data-menu-name'));
            });
        });
    }
    if(document.querySelector('#menu')){
        const tabs = document.querySelectorAll('.info__menu-tab-btn'),
            tabBlocks = document.querySelectorAll('.info__flex--tab');
        
        if(localStorage.getItem('menu-name')){
            tabs.forEach((tab,i)=>{
                if(tab.textContent === localStorage.getItem('menu-name')){
                    tab.classList.add('info__menu-tab-btn--active');
                    tabBlocks[i].classList.add('info__flex--tab--active');
                }
    
            });
        }else{
            tabs[0].classList.add('info__menu-tab-btn--active');
            tabBlocks[0].classList.add('info__flex--tab--active');
        }
        
        
        tabs.forEach((tab,i)=>{
            tab.addEventListener('click',(e)=>{
                tabs.forEach(tabItem=>{
                    tabItem.classList.remove('info__menu-tab-btn--active');
                });
                e.target.classList.add('info__menu-tab-btn--active');
                tabBlocks.forEach((block,j)=>{
                    block.classList.remove('info__flex--tab--active');
                    if(j === i){
                        block.classList.add('info__flex--tab--active');
                    }
                });
            });
        });
    }
});