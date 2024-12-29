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
    function initSlider(slider){
        
        if(window.innerWidth <= 768){
            console.log(slider.enabled);
            if(!slider.enabled){
                console.log(12);
                slider.enable();
                
                console.log(slider);
            
            }
        }else if(slider.enabled){
            slider.disable();
            console.log(slider);
        }
    }

    if(document.querySelector('.advantages__slider')){
        const advantagesSlider = new Swiper('.advantages__slider', {
            grabCursor:true,
            speed:500,
            spaceBetween:26,
            enabled:false,

            breakpoints:{
                1023.98:{
                    slidesPerView: '3',
                },
/*                 767.98:{
                    slidesPerView: '2',
                }, */
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
        console.log(advantagesSlider.enabled);
        initSlider(advantagesSlider);
        
       
    }
    window.addEventListener('resize',()=>{ 
        console.log(window.innerWidth);
        /* initSlider(advantagesSlider); */
    });
});