'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //reg
    const backBtn = document.querySelector('[data-btn="back"]');
    function checkBackBtn(i){
        if(i > 0){
            backBtn.classList.remove('hidden');
        }else{
            backBtn.classList.add('hidden');
        }
    }
    function getTransformTranslateX(el){
        const transformValue = window.getComputedStyle(el).transform;
        const matrix = transformValue.match(/matrix\(([^)]+)\)/)[1].split(', ');
        const translateX = parseFloat(matrix[4]);

        return translateX;

    }
    function validCheck(wrapper){
        let flag = true;
        wrapper.querySelectorAll('input').forEach(input=>{
            if(!input.checkValidity()){
                input.reportValidity();
                flag = false;
            }
        });
        return flag;
    }
    if(document.querySelector('.reg')){
        const continueBtn = document.querySelector('[data-btn="continue"]'),
            regFlex = document.querySelector('.reg__flex'),
            over = document.querySelector('.reg__over'),
            inputWrappers = document.querySelectorAll('.reg__input-wrapper'),
            data = {};

            let index;
            continueBtn.addEventListener('click',(e)=>{
                e.preventDefault();
                const activeWrapper = regFlex.querySelector('.is-active');
                index = +activeWrapper.getAttribute('data-form');
                if(validCheck(activeWrapper)){
                    activeWrapper.querySelectorAll('input').forEach(input=>{
                        const dataItem = input.getAttribute('name');
                        data[dataItem] = input.value;
                    });
                    
                    if(index + 1 === 1){
                        regFlex.querySelector('[data-form="1"]').querySelector('.reg__text').textContent = `Вы регистрируйтесь как ${data.feedmail}`;
                    }
    
                    if(index+1 === inputWrappers.length){
                        // тут может быть запрос на сервер
                        let text ='';
                        console.log(data);
                        for (const key in data) {
                            text += `${key}: ${data[key]}<br>`;
                         }
                        over.querySelector('.reg__text').innerHTML = text;
                        over.classList.remove('hidden');
                    }else{
                        activeWrapper.classList.remove('is-active');
                        document.querySelector(`[data-form="${index + 1}"]`).classList.add('is-active');
                        checkBackBtn(index + 1);
                        regFlex.style.transform = `translateX(${getTransformTranslateX(regFlex) - 500}px)`;
                        
                    }
                }
                
                
                
            });
        
        backBtn.addEventListener('click',(e)=>{
                    e.preventDefault();
                    const activeWrapper = regFlex.querySelector('.is-active');
                    index = +activeWrapper.getAttribute('data-form');

                    activeWrapper.classList.remove('is-active');
                    document.querySelector(`[data-form="${index - 1}"]`).classList.add('is-active');
                    regFlex.style.transform = `translateX(${getTransformTranslateX(regFlex) + 500}px)`;
                    checkBackBtn(index-1);
                    
                    
        });

    }
    //burger-menu
  /*   const inner = document.querySelector('.header__inner'),
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
    } */

    //animate on scroll
    if(document.querySelector('.intersective')){
        const interscetOptions={
            threshold: 0.3
        };
        const interscetCallback = function(entries,observer){
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    entry.target.classList.add('intersective_active');
                    observer.unobserve(entry.target);
                }
            });
        };
        const intersectObserver = new IntersectionObserver(interscetCallback, interscetOptions);

        const intersectElements = document.querySelectorAll('.intersective');
        intersectElements.forEach(el=>{
            intersectObserver.observe(el);
        });
    }
    //lazy load for images
    if(document.querySelector('.lazy-img')){
        const lazyCallback = function(entries,observer){
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    const lazyImg = entry.target;
                    lazyImg.src = lazyImg.dataset.src;
                    lazyImg.classList.remove('lazy-img');
                    observer.unobserve(lazyImg);
                }
            });
        };
        const lazyObserver = new IntersectionObserver(lazyCallback);

        const lazyImages = document.querySelectorAll('.lazy-img');
        lazyImages.forEach(el=> lazyObserver.observe(el));
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
 /*    const contactButtons = document.querySelectorAll('[data-overlay="modal"]'),
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
     }); */
     // companies of Russia
     if(document.querySelector('.companies')){
        const isTouchDevice = !!('ontouchstart' in window || navigator.maxTouchPoints);
        
        const points = document.querySelectorAll('.companies__point'),
            mapRussia = document.querySelector('.companies__russia-img'),
            svgPaths = mapRussia.querySelectorAll('path');
        svgPaths.forEach((path,i)=>{
            path.style.cssText = 'filter:grayscale(100%)';
            if(isTouchDevice){
                path.addEventListener('click',()=>{
                    svgPaths.forEach(pathItem=>{
                        pathItem.style.cssText = 'filter:grayscale(100%)';
                    });
                    path.style.cssText = 'filter:grayscale(0)';
                    points.forEach(point=>{
                        point.querySelector('.companies__pattern').style.display = 'none';
                        if(point.getAttribute('data-point') == i){
                            point.querySelector('.companies__pattern').style.display = 'block';
                        }
                    });
                    
                });
            }else{
                path.addEventListener('mouseenter',()=>{
                    path.style.cssText = 'filter:grayscale(0)';
                    points.forEach(point=>{
                        if(point.getAttribute('data-point') == i){
                            point.querySelector('.companies__pattern').style.display = 'block';
                        }
                    });
                });
                path.addEventListener('mouseleave',()=>{
                    path.style.cssText = 'filter:grayscale(100%)';
                    points.forEach(point=>{
                        if(point.getAttribute('data-point') == i){
                            point.querySelector('.companies__pattern').style.display = 'none';
                        }
                    });
                });
            }
        });

        mapRussia.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('companies__russia-img')){
                svgPaths.forEach(path=>{
                    path.style.cssText = 'filter:grayscale(100%)';
                });
                points.forEach(point=>{
                    point.querySelector('.companies__pattern').style.display = 'none';
                });
            }
        });
     }
     
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
        historySlides[0].classList.add('history__slide_active');
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
            cellsLength = cells.length,
            cellsHeightArr = [cellsLength];
        let windowWidth = window.innerWidth,
            documentWidth = document.documentElement.clientWidth;
        

        cells.forEach((cell,i)=>{
            const details =  cell.querySelector('.catalog__details');
            let left = cell.offsetLeft;

            let detailsHeight;
            setTimeout(()=>{
                detailsHeight =  window.getComputedStyle(details).getPropertyValue('height');
            },10);
            cellsHeightArr[i] = window.getComputedStyle(cell).getPropertyValue('height');

            cell.querySelector('.catalog__shorts').style.height = window.getComputedStyle(cell).getPropertyValue('height');

            details.style.left = -left + 'px';
            details.style.width = documentWidth + 'px';

            window.addEventListener('resize',()=>{
                if(windowWidth != window.innerWidth){
                    if(i == cellsLength - 1){
                        windowWidth = window.innerWidth;
                    }
                    setTimeout(()=>{
                        detailsHeight =  window.getComputedStyle(details).getPropertyValue('height');
                    },20);
                    cellsHeightArr[i] = window.getComputedStyle(cell).getPropertyValue('height');

                    left = cell.offsetLeft;
                    documentWidth = document.documentElement.clientWidth;
                    details.style.left = -left + 'px';
                    details.style.width = documentWidth + 'px';

                }
            });
            


            cell.querySelector('.catalog__btn').addEventListener('click',()=>{
                cells.forEach((itemCell,i)=>{
                    itemCell.style.height = cellsHeightArr[i];
                    itemCell.querySelector('.catalog__details').classList.remove('catalog__details_active');
                    itemCell.querySelector('.catalog__shorts').classList.add('catalog__shorts_gray');
                });
                cell.querySelector('.catalog__shorts').classList.remove('catalog__shorts_gray');
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
                setTimeout(() => {
                    cell.scrollIntoView(false);
                }, 450);
                
            });

            cell.querySelector('.catalog__details-close').addEventListener('click',()=>{
                cell.style.height = cellsHeightArr[i];
                details.classList.remove('catalog__details_active');
                cells.forEach((itemCell)=>{
                    itemCell.querySelector('.catalog__shorts').classList.remove('catalog__shorts_gray');
                });
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
});