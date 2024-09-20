'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //mobile menu
    const inner = document.querySelector('.header__inner'),
    hamburger = document.querySelector('.header__burger'),
    sticks = document.querySelectorAll('.header__stick');

    hamburger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner_active');
        sticks.forEach(item=>{
            item.classList.toggle('header__stick_active');
        });
    });
    if(window.innerWidth <= 1200){
        const burgerMenuLinks = document.querySelectorAll('[data-link-action="hide-menu"]');
        burgerMenuLinks.forEach(link=>{
            link.addEventListener('click',()=>{
                inner.classList.toggle('header__inner_active');
                sticks.forEach(item=>{
                    item.classList.toggle('header__stick_active');
                });
            });
        });
    }

    //sliders
    if(document.querySelector('.cases')){
        
        new Swiper('.cases__slider', {
            loop: false,
            slidesPerView:1,
            spaceBetween:1,

          
            navigation: {
              nextEl: '.cases__next',
              prevEl: '.cases__prev',
            },
        });

        const sliders = document.querySelectorAll('.cases__slider'),
            tabs = document.querySelectorAll('.cases__tabs-item');


        tabs.forEach((tab,tabIndex)=>{
            tab.addEventListener('click',(e)=>{
               const tabTarget = e.currentTarget;
                tabs.forEach(tabItem=>{
                    tabItem.classList.remove('cases__tabs-item_active');
                });
                tabTarget.classList.add('cases__tabs-item_active');
                sliders.forEach(sliderItem=>{
                    sliderItem.classList.remove('cases__slider_active');
                    if(sliderItem.getAttribute('data-chain')==tabIndex){
                        sliderItem.classList.add('cases__slider_active');
                    }
                });

            });
        });

        sliders.forEach(slider=>{
            const slides = slider.querySelectorAll('.cases__slide');
            slides.forEach(slide=>{
                const firstSlideBlock = slide.querySelector('.cases__slide-block'),
                    slideBlocks = slide.querySelectorAll('.cases__slide-block');

                    firstSlideBlock.classList.add('cases__slide-block_lg');
                    firstSlideBlock.querySelector('.cases__slide-info').classList.add('cases__slide-info_active');
                slideBlocks.forEach((slideBlock,i)=>{
                    const slideInfo = slideBlock.querySelector('.cases__slide-info');
                    if(i != 0){
                        slideBlock.addEventListener('mouseenter',()=>{
                            slideBlock.classList.add('cases__slide-block_lg');
                            slideInfo.classList.add('cases__slide-info_active');

                            firstSlideBlock.classList.remove('cases__slide-block_lg');
                            firstSlideBlock.querySelector('.cases__slide-info').classList.remove('cases__slide-info_active');
                        });
                        slideBlock.addEventListener('mouseleave',()=>{
                            slideBlock.classList.remove('cases__slide-block_lg');
                            slideInfo.classList.remove('cases__slide-info_active');

                            firstSlideBlock.classList.add('cases__slide-block_lg');
                            firstSlideBlock.querySelector('.cases__slide-info').classList.add('cases__slide-info_active');
                        });
                    }
                });

            });
        });

        const sliderTabs = document.querySelectorAll('.cases__tabs-slide');

        sliderTabs.forEach((tab,tabIndex)=>{
            tab.addEventListener('click',(e)=>{
               const tabTarget = e.currentTarget;
                sliderTabs.forEach(tabItem=>{
                    tabItem.classList.remove('cases__tabs-slide_active');
                });
                tabTarget.classList.add('cases__tabs-slide_active');
                sliders.forEach(sliderItem=>{
                    sliderItem.classList.remove('cases__slider_active');
                    if(sliderItem.getAttribute('data-chain')==tabIndex){
                        sliderItem.classList.add('cases__slider_active');
                    }
                });

            });
        });
        new Swiper('.cases__tabs-slider',{
            loop: false,
            spaceBetween:0,

            breakpoints: {
                520:{
                    slidesPerView:2.3,
                },
                320:{
                    slidesPerView:1.6,
                },
            },
        });
    }
    /* if(Math.abs(grid.getBoundingClientRect().top) < window.innerHeight){
                grid.style.cssText = `transform: translateY(${(-mainScrollNumb/25) + 'px'})`;
            } */
    function bgParalax(className){
        const bgParalax = document.querySelector(className);
        let translateIndex;

        window.addEventListener('scroll',()=>{

            if(bgParalax.getBoundingClientRect().top<=0){
                translateIndex = Math.abs(bgParalax.getBoundingClientRect().top);
                if(translateIndex <= 40){
                    translateIndex = 0;
                }
                bgParalax.style.cssText = `transform: translateY(${(0 + translateIndex/3.5) + 'px'}) scale(${1 + translateIndex/8000})`;
            }
        });
    }
    function tranlateYBlock(className,divider){
        let translateIndex;
        const block = document.querySelector(className);

        window.addEventListener('scroll',()=>{
            if(Math.abs(block.getBoundingClientRect().top)< window.innerHeight){
                translateIndex = Math.abs(block.getBoundingClientRect().top - window.innerHeight);
                
                if(translateIndex <= 40){
                    translateIndex = 0;
                }
                block.style.cssText = `transform: translateY(${-(0 + translateIndex/divider) + 'px'})`;
            }
        });
    }
    if(document.querySelector('.promo')){
        bgParalax('.promo__img');
        tranlateYBlock('.advantages__grid',10);
        /* tranlateYBlock('.cases',10); */
        bgParalax('.stages__img');
        tranlateYBlock('.about__count',10);
        tranlateYBlock('.about__team',10);
        tranlateYBlock('.about__block',20);
        tranlateYBlock('.answer__details-wrapper',20);
        bgParalax('.discussion__img');
    }

    //animation on scroll
    AOS.init({
        disable: false,
        startEvent: 'DOMContentLoaded', 
        
        offset: 100, 
        delay: 100, 
        duration: 1000, 
        easing: 'ease', 
        once: false, 
        mirror: false, 
        anchorPlacement: 'top-bottom', 
      
      });
});