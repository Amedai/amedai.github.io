'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //burger-menu
    const inner = document.querySelector('.header__inner'),
    hamburger = document.querySelector('.header__burger'),
    sticks = document.querySelectorAll('.header__stick');

    hamburger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner_active');
        sticks.forEach(item=>{
            item.classList.toggle('header__stick_active');
        });
    });
    if(window.innerWidth <= 768){
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
    //lazy load for yandex-cart
    function initYandexMapOnEvent (e) {
        initYandexMap();
        e.currentTarget.removeEventListener(e.type, initYandexMapOnEvent);
    }

    function initYandexMap () {
        if (window.yandexMapDidInit) {
            return false;
        }
        window.yandexMapDidInit = true;
    
        const script = document.createElement('script');

        script.async = true;
        
        script.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A2f9cf536e0e91f031a369cc1f28994f5eb2262f67f3c53e9cca0c0551b9c45fd&amp;width=100%25&amp;height=100%25&amp;lang=ru_RU&amp;scroll=true';
    
        map.appendChild(script);
    }

    const map = document.querySelector('.map__item');
    if(map){
        setTimeout(initYandexMap, 4000);

        window.addEventListener('scroll', initYandexMapOnEvent);
        window.addEventListener('mousemove', initYandexMapOnEvent);
        window.addEventListener('touchstart', initYandexMapOnEvent);
    }

    function fadeIn (el, timeout, display){
        el.style.opacity = 0;
        el.style.display = display || 'block';
        el.style.transition = `opacity ${timeout}ms`;
        setTimeout(() => {
          el.style.opacity = 1;
        }, 50);
    }
    function fadeOut (el, timeout){
        el.style.opacity = 1;
        el.style.transition = `opacity ${timeout}ms`;
        el.style.opacity = 0;
      
        setTimeout(() => {
          el.style.display = 'none';
        }, timeout);
    }

     //modal
    const contactButtons = document.querySelectorAll('[data-overlay="modal"]'),
            overlay = document.querySelector('.overlay'),
            closeElement = document.querySelector('.overlay__modal-close');
    
    contactButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
            fadeIn(overlay, 100, 'block');
        });
    });
    closeElement.addEventListener('click',()=>{
        fadeOut(overlay,30);
    });
    overlay.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.classList.contains('overlay')){
            fadeOut(overlay,30);
        }
    });
    document.addEventListener('keydown',(e)=>{
        if(overlay.style.opacity === '1' && e.code == 'Escape'){
           fadeOut(overlay,30);
        }
     });
     // companies of Russia
     if(document.querySelector('.companies')){
        const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);
        
        const points = document.querySelectorAll('.companies__point'),
            map = document.querySelector('.companies__russia-img');
        points.forEach(point=>{
            const text = point.querySelector('.companies__text'),
                pattern = point.querySelector('.companies__pattern');
            if(isTouchDevice){
                point.addEventListener('click',()=>{
                    points.forEach(item=>{
                        item.querySelector('.companies__pattern').style.display = 'none';
                        item.style.zIndex = 11;
                    });
                    text.textContent = point.getAttribute('data-company');
                    point.style.zIndex = 12;
                    fadeIn(pattern,100,'block');
                });
            }else{
                point.addEventListener('mouseenter',()=>{
                    text.textContent = point.getAttribute('data-company');
                    point.style.zIndex = 12;
                    fadeIn(pattern,100,'block');
                });
                point.addEventListener('mouseleave',()=>{
                    pattern.style.display = 'none';
                    point.style.zIndex = 11;
                });
            }
        });
        map.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('companies__russia-img')){
                points.forEach(point=>{
                    point.querySelector('.companies__pattern').style.display = 'none';
                    point.style.zIndex = 11;
                });
            }
        });

     }

     //companies__carousel hover
     /* if(document.querySelector('.companies__carousel')){
        const carouselItems = document.querySelectorAll('.companies__carousel-item');
        carouselItems.forEach(item=>{
            item.addEventListener('mouseenter',()=>{
                item.classList.toggle('companies__carousel-item_active');
                item.querySelector('.companies__carousel-img').classList.toggle('companies__carousel-img_active');
            });
            item.addEventListener('mouseleave',()=>{
                item.classList.toggle('companies__carousel-item_active');
                item.querySelector('.companies__carousel-img').classList.toggle('companies__carousel-img_active');
            });
        });
     } */
     
     //sliders
     function customArrowsSlider (sliderClass,sliderPosition){
        const left = document.querySelector(sliderClass + ' .prev'),
        right = document.querySelector(sliderClass + ' .next');
        if(sliderPosition === 'fromEdge'){
            left.querySelector('svg path').setAttribute('fill','#0158A9');
            right.querySelector('svg path').setAttribute('fill','#0158A9');
        }
        if(sliderPosition === 'reachEnd'){
            right.querySelector('svg path').setAttribute('fill','#CCDAE7');
        }
        if(sliderPosition === 'reachBeginning'){
            left.querySelector('svg path').setAttribute('fill','#CCDAE7');
        }
    }
     if(document.querySelector('.history__slider')){
        const historySlider = new Swiper('.history__slider', {
            loop: false,
            slidesPerView: 'auto',
            grabCursor: true,
            
            navigation: {
            nextEl: '.next',
            prevEl: '.prev',
            },

        });
        historySlider.on('fromEdge',()=>{
            customArrowsSlider('.history__slider','fromEdge');
        });
        historySlider.on('reachEnd',()=>{
            customArrowsSlider('.history__slider','reachEnd');
        });
        historySlider.on('reachBeginning',()=>{
            customArrowsSlider('.history__slider','reachBeginning');
        });
        //событие slideChange происходит раньше смены активного слайда,а transitionStart позже
        const historySlides = document.querySelectorAll('.history__slide');
        historySlider.on('transitionStart',()=>{
            const activeSlide = document.querySelector('.swiper-slide-active');
            historySlides.forEach(historySlide=>{
                historySlide.classList.remove('history__slide_active');
            });
            activeSlide.classList.add('history__slide_active');
            
        });
    }

    //catalog details
    if(document.querySelector('.catalog')){
        const catalogDetailsSlidersArray = new Swiper('.catalog__details-slider', {
            init:false,

            loop: false,
            slidesPerView: 1,

            pagination: {
                el: '.catalog__details-pagination',
                bulletClass: 'catalog__details-bullet',
                bulletActiveClass: 'catalog__details-bullet_active',
              },
            
            navigation: {
            nextEl: '.next',
            prevEl: '.prev',
            },

        });
        const cells = document.querySelectorAll('.catalog__cell'),
            cellsHeightArr = [cells.length];

        cells.forEach((cell,i)=>{
            const details =  cell.querySelector('.catalog__details');
            let left = cell.offsetLeft;
            let documentWidth = document.documentElement.clientWidth;

            let detailsHeight;
            setTimeout(()=>{
                detailsHeight =  window.getComputedStyle(details).getPropertyValue('height');
            },10);
            cellsHeightArr[i] = window.getComputedStyle(cell).getPropertyValue('height');

            details.style.left = -left + 'px';
            details.style.width = documentWidth + 'px';

            /* document.querySelector('.catalog__grid').style.cssText = `grid-auto-rows: minmax(357px, ${cellsHeightArr[i]})`; */

            window.addEventListener('resize',()=>{
                cellsHeightArr[i] = window.getComputedStyle(cell).getPropertyValue('height');

                left = cell.offsetLeft;
                documentWidth = document.documentElement.clientWidth;
                details.style.left = -left + 'px';
                details.style.width = documentWidth + 'px';

                detailsHeight =  window.getComputedStyle(details).getPropertyValue('height');
            });
            


            cell.querySelector('.catalog__btn').addEventListener('click',()=>{
                cells.forEach((itemCell,i)=>{
                    itemCell.style.height = cellsHeightArr[i];
                    itemCell.querySelector('.catalog__details').classList.remove('catalog__details_active');
                });

                if(!catalogDetailsSlidersArray[i].el){
                    catalogDetailsSlidersArray[i].init();
                    catalogDetailsSlidersArray[i].on('fromEdge',()=>{
                        catalogDetailsSlidersArray[i].navigation.nextEl.querySelector('svg path').setAttribute('fill','#0158A9');
                        catalogDetailsSlidersArray[i].navigation.prevEl.querySelector('svg path').setAttribute('fill','#0158A9');
                    });
                    catalogDetailsSlidersArray[i].on('reachBeginning',()=>{
                        catalogDetailsSlidersArray[i].navigation.prevEl.querySelector('svg path').setAttribute('fill','#CCDAE7');
                    });
                    catalogDetailsSlidersArray[i].on('reachEnd',()=>{
                        catalogDetailsSlidersArray[i].navigation.nextEl.querySelector('svg path').setAttribute('fill','#CCDAE7');
                    });
                }
                cell.style.height = parseInt(cellsHeightArr[i]) + parseInt(detailsHeight) + 2 +'px';
                details.classList.add('catalog__details_active');
            });

            cell.querySelector('.catalog__details-close').addEventListener('click',()=>{
                cell.style.height = cellsHeightArr[i];
                details.classList.remove('catalog__details_active');
            });
        });

    }

    // close-open function
    function closeOpen(closedSection,closedClass,countVisibleElems){
        const closedBlock = document.querySelector(closedSection),
        closedElems = closedBlock.querySelectorAll(closedClass),
        closeBtn = closedBlock.querySelector('[data-btn="close"]'),
        openBtn = closedBlock.querySelector('[data-btn="open"]');

        setTimeout(()=>{
            closedElems.forEach((el,i)=>{
                if(i >= countVisibleElems){
                    el.style.display = 'none';
                }
            });
        },20);
       
        openBtn.addEventListener('click',()=>{
            closedElems.forEach((el,i)=>{
                if(i >= countVisibleElems){
                    el.style.display = 'block';
                }
            });
            openBtn.style.display = 'none';
            closeBtn.style.display = 'block';
        });
        closeBtn.addEventListener('click',()=>{
            closedElems.forEach((el,i)=>{
                if(i >= countVisibleElems){
                    el.style.display = 'none';
                }
            });
            closeBtn.style.display = 'none';
            openBtn.style.display = 'block';
        });
    }
    if(document.querySelector('.catalog')){
        if(window.innerWidth > 1200){
            closeOpen('.catalog','.catalog__cell',12);
        }else if(window.innerWidth > 700){
            closeOpen('.catalog','.catalog__cell',8);
        }else if(window.innerWidth > -1){
            closeOpen('.catalog','.catalog__cell',3);
        }
    }
    if(document.querySelector('.news')){
        if(window.innerWidth > 1200){
            closeOpen('.news','.article-mini__cell',6);
        }else if(window.innerWidth > 700){
            closeOpen('.news','.article-mini__cell',4);
        }else if(window.innerWidth > -1){
            closeOpen('.news','.article-mini__cell',3);
        }
    }
    if(document.querySelector('.docs')){
        if(window.innerWidth > 1200){
            closeOpen('.docs','.docs__cell',8);
        }else if(window.innerWidth > 700){
            closeOpen('.docs','.docs__cell',3);
        }else if(window.innerWidth > -1){
            closeOpen('.docs','.docs__cell',2);
        }
    }
    if(document.querySelector('.charity')){
        if(window.innerWidth > 1200){
            closeOpen('.charity','.article-mini__cell',6);
        }else if(window.innerWidth > 700){
            closeOpen('.charity','.article-mini__cell',4);
        }else if(window.innerWidth > -1){
            closeOpen('.charity','.article-mini__cell',3);
        }
    }
    //news-pattern.html back
    if(document.querySelector('.article')){
      const crossEl = document.querySelector('.article__cross');

      crossEl.addEventListener('click',()=>{
        window.history.back();
      });
    }

    //aos
    AOS.init({
        disable: false,
        startEvent: 'DOMContentLoaded', 
        
        offset: 10, 
        delay: 20, 
        duration: 1000, 
        easing: 'ease', 
        once: true, 
        mirror: false, 
        anchorPlacement: 'top-bottom', 
      
      });
});