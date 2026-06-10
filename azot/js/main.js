'use strict';

window.addEventListener('DOMContentLoaded',()=>{
    //mob menu
    const inner = document.querySelector('.header__inner'),
        burger = document.querySelector('.header__burger'),
        closeElems = document.querySelectorAll('.header__inner-close');
    
    burger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner--active');
    });

    closeElems.forEach(el=>{
        el.addEventListener('click',()=>{
            inner.classList.toggle('header__inner--active');
        });
    });

    const menuMobileLinks = document.querySelectorAll('[data-link-action]');

    menuMobileLinks.forEach(link=>{
        link.addEventListener('click',()=>{
            inner.classList.toggle('header__inner--active');
        });
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

    //slider
    const equalizeSlideHeights = (swiper)=>{
        swiper.slides.forEach((slide)=>{
            slide.style.height = '';
        });

        let maxHeight = 0;
        swiper.slides.forEach((slide)=>{
            maxHeight = Math.max(maxHeight, slide.offsetHeight);
        });

        if(maxHeight){
            swiper.slides.forEach((slide)=>{
                slide.style.height = `${maxHeight}px`;
            });
        }

        swiper.update();
    };

    const updateSliderArrows = (swiper, prevEl, nextEl, block)=>{
        prevEl?.classList.toggle(`${block}__arrows-prev--active`, !swiper.isBeginning);
        nextEl?.classList.toggle(`${block}__arrows-next--active`, !swiper.isEnd);
    };

    const initSliderControls = (swiper, {prevEl, nextEl, block})=>{
        const update = ()=>{
            equalizeSlideHeights(swiper);
            updateSliderArrows(swiper, prevEl, nextEl, block);
        };

        update();
        swiper.on('slideChange', ()=>{
            updateSliderArrows(swiper, prevEl, nextEl, block);
        });
        swiper.on('resize', update);
    };

    if(document.querySelector('.stages__slider')){
        const stagesPrev = document.querySelector('.stages__arrows-prev');
        const stagesNext = document.querySelector('.stages__arrows-next');
        const stagesSwiper = new Swiper('.stages__slider', {
            speed:500,
            slidesPerView:1,

            navigation: {
                nextEl: stagesNext,
                prevEl: stagesPrev,
            },
        });

        initSliderControls(stagesSwiper, {
            prevEl: stagesPrev,
            nextEl: stagesNext,
            block: 'stages',
        });
    }
    if(document.querySelector('.about__slider')){
        const aboutPrev = document.querySelector('.about__arrows-prev');
        const aboutNext = document.querySelector('.about__arrows-next');
        const aboutSwiper = new Swiper('.about__slider', {
            speed:800,
            slidesPerView:2,
            spaceBetween:60,

             breakpoints:{
                1023.98:{
                    slidesPerView: '2',
                },
                767.98:{
                    slidesPerView: '1.8',
                },
                480.98:{
                    slidesPerView: '1.5',
                },
                319.98:{
                    slidesPerView: '1.3',
                },
            },

            navigation: {
                nextEl: aboutNext,
                prevEl: aboutPrev,
            },
        });

        initSliderControls(aboutSwiper, {
            prevEl: aboutPrev,
            nextEl: aboutNext,
            block: 'about',
        });
    }
    document.querySelectorAll('.test__wrapper').forEach((wrapper)=>{
        const slider = wrapper.querySelector('.test__slider');
        const testPrev = wrapper.querySelector('.test__arrows-prev');
        const testNext = wrapper.querySelector('.test__arrows-next');
        const testArrows = wrapper.querySelector('.test__arrows');

        if(!slider){
            return;
        }

        const testSwiper = new Swiper(slider, {
            speed:500,
            slidesPerView:'auto',
            spaceBetween:20,
            watchOverflow:true,

            navigation: {
                nextEl: testNext,
                prevEl: testPrev,
            },
        });

        const updateTestArrowsVisibility = ()=>{
            testArrows?.classList.toggle('test__arrows--hidden', testSwiper.isLocked);
        };

        initSliderControls(testSwiper, {
            prevEl: testPrev,
            nextEl: testNext,
            block: 'test',
        });

        updateTestArrowsVisibility();
        testSwiper.on('resize', updateTestArrowsVisibility);
        testSwiper.on('slideChange', updateTestArrowsVisibility);
    });
});