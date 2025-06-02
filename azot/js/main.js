'use strict';

window.addEventListener('DOMContentLoaded',()=>{
      //mob menu
    const inner = document.querySelector('.header__inner'),
        burger = document.querySelector('.header__burger');
    
    burger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner--active');
        burger.classList.toggle('header__burger--active');
    });

    //slider
    if(document.querySelector('.stages__slider')){
        new Swiper('.stages__slider', {
            speed:500,
            slidesPerView:1,

            navigation: {
                nextEl: '.stages__arrows-next',
                prevEl: '.stages__arrows-prev',
            },
    
        });
    }
    if(document.querySelector('.about__slider')){
        new Swiper('.about__slider', {
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
                nextEl: '.about__arrows-next',
                prevEl: '.about__arrows-prev',
            },
    
        });
    }
    if(document.querySelector('.test__slider')){
        new Swiper('.test__slider', {
            speed:500,
            slidesPerView:1.4,
            spaceBetween:20,

            navigation: {
                nextEl: '.test__arrows-next',
                prevEl: '.test__arrows-prev',
            },
    
        });
    }
});