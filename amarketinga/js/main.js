'use strict';

window.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.header__burger');
    const mobMenu = document.querySelector('.header__mob-menu');
    const closeBtn = document.querySelector('.header__close-button');

    function closeMenu() {
        mobMenu.classList.remove('header__mob-menu--active');
        burger.classList.remove('header__burger--hiden');
    }

    function openMenu() {
        mobMenu.classList.add('header__mob-menu--active');
        burger.classList.add('header__burger--hiden');
    }

    burger.addEventListener('click', () => {
        if (mobMenu.classList.contains('header__mob-menu--active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('click', (e) => {
        if (!mobMenu.classList.contains('header__mob-menu--active')) return;
        if (mobMenu.contains(e.target)) return;
        if (burger.contains(e.target)) return;
        closeMenu();
    });


    //slider
    function updateArrowColors(swiper, containerSelector, defaultColor, activeColor) {
        const arrowsContainer = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;
        if (!arrowsContainer) return;

        const prevArrow = arrowsContainer.querySelector('.arrows__prev');
        const nextArrow = arrowsContainer.querySelector('.arrows__next');
        
        if (!prevArrow || !nextArrow) return;
        
        const prevPath = prevArrow.querySelectorAll('path');
        const nextPath = nextArrow.querySelectorAll('path');
        
        if (swiper.isBeginning) {
            prevArrow.classList.remove('arrows__prev--bg-white');
            prevArrow.classList.add('arrows__prev--bg-gray');
            prevPath.forEach(path => path.setAttribute('fill', defaultColor));
        } else {
            prevArrow.classList.remove('arrows__prev--bg-gray');
            prevArrow.classList.add('arrows__prev--bg-white');
            prevPath.forEach(path => path.setAttribute('fill', activeColor));
        }
        
        if (swiper.isEnd) {
            nextArrow.classList.remove('arrows__next--bg-white');
            nextArrow.classList.add('arrows__next--bg-gray');
            nextPath.forEach(path => path.setAttribute('fill', defaultColor));
        } else {
            nextArrow.classList.remove('arrows__next--bg-gray');
            nextArrow.classList.add('arrows__next--bg-white');
            nextPath.forEach(path => path.setAttribute('fill', activeColor));
        }
    }

    if(document.querySelector('.cases__swiper')){
        // Табы кейсов
        const casesTabs = document.querySelectorAll('.cases__inner-tab');
        const casesContents = document.querySelectorAll('.cases__inner-content');
        const casesButtonMore = document.querySelector('.cases__button-more--tablet-hidden');
        const tabToPage = { design: 'design.html', stands: 'stands.html', events: 'events.html', merch: 'merch.html' };

        const setCasesTabActive = (tabName) => {
            casesTabs.forEach(tab => {
                tab.classList.toggle('cases__inner-tab--active', tab.getAttribute('data-tab') === tabName);
            });
            casesContents.forEach(content => {
                content.classList.toggle('cases__inner-content--active', content.getAttribute('data-tab-content') === tabName);
            });
            if (casesButtonMore && tabToPage[tabName]) {
                casesButtonMore.setAttribute('href', tabToPage[tabName]);
            }
        };
        casesTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName) setCasesTabActive(tabName);
            });
        });

        // Инициализация Swiper для каждого таба (у каждого таба свой слайдер)
        document.querySelectorAll('.cases__inner-content').forEach(contentEl => {
            const swiperEl = contentEl.querySelector('.cases__swiper');
            if (!swiperEl) return;
            const arrowsEl = contentEl.querySelector('.cases__arrows');
            new Swiper(swiperEl, {
                slidesPerView: 2,
                grabCursor: true,
                noSwipingSelector: '.cases__arrows',
                navigation: {
                    nextEl: contentEl.querySelector('.cases__arrows-next'),
                    prevEl: contentEl.querySelector('.cases__arrows-prev'),
                },
                on: {
                    init: function() {
                        updateArrowColors(this, arrowsEl, '#ffffff', '#292D32');
                    },
                    slideChange: function() {
                        updateArrowColors(this, arrowsEl, '#ffffff', '#292D32');
                    },
                },
                breakpoints: {
                    1400:{
                        slidesPerView: 2,
                        spaceBetween: 70,
                    },
                    768:{
                        slidesPerView: 2,
                        spaceBetween: 40,
                    },
                    320:{
                        slidesPerView: 1,
                        spaceBetween: 20,
                    },
                }
            });
        });
    }
    if(document.querySelector('.case-slider__swiper')){
        new Swiper('.case-slider__swiper', {
            slidesPerView: 1,
            grabCursor: true,
            noSwipingSelector: '.case-slider__arrows',
            navigation: {
                nextEl: '.case-slider__arrows-next',
                prevEl: '.case-slider__arrows-prev',
            },
            on: {
                init: function() {
                    updateArrowColors(this, '.case-slider__arrows', '#ffffff', '#292D32');
                },
                slideChange: function() {
                    updateArrowColors(this, '.case-slider__arrows', '#ffffff', '#292D32');
                },
            },
        });
    }

     // Функциональность табов для merch
     function initMerchTabs(slider) {
        const tabs = document.querySelectorAll('.merch__tab');

        if (!tabs.length) return;

        function setActiveTab(index) {
            tabs.forEach(t => t.classList.remove('merch__tab--active'));
            tabs[index]?.classList.add('merch__tab--active');
        }

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                setActiveTab(index);
                slider.slideTo(index);
            });
        });

        slider.on('slideChange', () => {
            setActiveTab(slider.realIndex);
        });

        slider.on('breakpoint', () => {
            setActiveTab(slider.realIndex);
        });
    }

    
    if(document.querySelector('.merch__swiper')){
        const merchSlider = new Swiper('.merch__swiper', {
            speed: 700,
            slidesPerView: 1,

            breakpoints: {
                1200:{
                    spaceBetween: 300,
                    allowTouchMove: false,
                    grabCursor: false,
                },
                768:{
                    spaceBetween: 150,
                    allowTouchMove: false,
                    grabCursor: false,
                },
                320:{
                    spaceBetween: 50,
                    allowTouchMove: true,
                    grabCursor: true,
                }
            }
        });

        initMerchTabs(merchSlider);
    }


        //form
        function getOnlyNumber(value){
            return value.replace(/\D/g,'');
        }
        function onPhoneInput(e){
            const inputTarget = e.target,
                  selectionStart = inputTarget.selectionStart,
                  inputOnlyNumber = getOnlyNumber(inputTarget.value);
            let resultValue = '';
           
    
            if (inputTarget.value.length != selectionStart) {
                if (e.data && /\D/g.test(e.data)) {
                    inputTarget.value = inputOnlyNumber;
                }
                return;
            }
    
    
            if(['7','8','9'].indexOf(inputOnlyNumber[0]) > -1){
                //russian number
                if(inputOnlyNumber[0] == '8' || inputOnlyNumber[0] == '7'){
                    resultValue += '+7 ';
                }else{
                    resultValue += '+7 (9';
                }
                if(inputOnlyNumber.length > 1){
                    resultValue += '(' + inputOnlyNumber.substring(1,4);
                } 
                if(inputOnlyNumber.length >4){
                    resultValue += ') ' + inputOnlyNumber.substring(4,7);
                } 
                if(inputOnlyNumber.length > 7){
                    resultValue += '-' + inputOnlyNumber.substring(7,9);
                } 
                if(inputOnlyNumber.length > 9){
                    resultValue += '-' + inputOnlyNumber.substring(9, 11);
                } 
            }else{
                //not russian number
                if(inputOnlyNumber){
                    resultValue += '+' + inputOnlyNumber;
                }
                
            }
            inputTarget.value = resultValue;
        }
    
        function onPhoneKeyDown (e) {
            const inputValue = e.target.value.replace(/\D/g, '');
            if (e.keyCode == 8 && inputValue.length == 1) {
                e.target.value = '';
            }
        }
    
        if(document.querySelector('.order__form-wrapper')){
            //input: focus — убираем placeholder, blur — возвращаем
            const inputs = document.querySelectorAll('.focusout-js');
            inputs.forEach(inputElem => {
                const savePlaceholder = inputElem.placeholder;
                inputElem.addEventListener('focus', () => {
                    inputElem.placeholder = '';
                });
                inputElem.addEventListener('blur', () => {
                    inputElem.placeholder = savePlaceholder;
                });
            });
    
            //mask
            const inputPhone = document.querySelector('input[id="tel"]');
            inputPhone.setAttribute('maxlength','18');
            inputPhone.addEventListener('keydown',onPhoneKeyDown);
            inputPhone.addEventListener('input',onPhoneInput);
        }

});