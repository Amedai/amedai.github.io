'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //mob menu
    const inner = document.querySelector('.header__inner'),
        burger = document.querySelector('.header__burger');
    
    burger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner--active');
        burger.classList.toggle('header__burger--active');
    });

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
    if(document.querySelector('.events__slider')){
        new Swiper('.events__slider', {
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
});