'use strict';
window.addEventListener('DOMContentLoaded',()=>{
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
    
        script.src = 'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A58dbe9a7266e27da5b7403bca11a18ad709506748b6865b3d7c037b82d1cceb8&amp;width=100%25&amp;height=100%25&amp;lang=ru_RU&amp;scroll=true';
    
        map.appendChild(script);
    }

    const map = document.querySelector('.map__item');
    if(map){
        setTimeout(initYandexMap, 4000);

        window.addEventListener('scroll', initYandexMapOnEvent);
        window.addEventListener('mousemove', initYandexMapOnEvent);
        window.addEventListener('touchstart', initYandexMapOnEvent);
    }
    //парсинг iframe с проекта
    function sendRequest(url){
        return fetch(url).then(response =>{
            return response.json();
        });
    }
    if(document.querySelector('.project')){
        const requestUrl = 'https://xn--80arbtjdchbq9e.xn--p1ai/wp-json/wp/v2/pages/';
        sendRequest(requestUrl)
        .then(data=>{
            data.forEach(item=>{
                if(window.location.pathname.includes(item.slug)){
                    document.querySelector('.project__block').innerHTML = item.content.rendered.replace(/\n/g, '');
                }
            });
        })
        .catch(err => console.log(err));
    }
    //burger menu
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
    //contacts-icons
    if(document.querySelector('.promo__contacts-icons')){
        const contactIcons = document.querySelector('.promo__contacts-icons'),
        contactGroup = contactIcons.querySelector('.promo__contacts-group'),
        contactTel = contactIcons.querySelector('.promo__contacts-tel'),
        contactWhatsapp = contactIcons.querySelector('.promo__contacts-whatsapp');
        
        contactIcons.addEventListener('click',()=>{
            contactGroup.classList.toggle('promo__contacts-group_active');
            contactTel.classList.toggle('promo__contacts-tel_active');
            contactWhatsapp.classList.toggle('promo__contacts-whatsapp_active');
        });
    }
    //sliders
    if(document.querySelector('.promo__slider')){
        new Swiper('.promo__slider', {
            loop: true,
            grabCursor: true,

            autoplay:{
                delay:10000,
            },
          
            navigation: {
              nextEl: '.promo__next',
              prevEl: '.promo__prev',
            },
        });
    }
    if(document.querySelector('.ready-house__slider')){
        new Swiper('.ready-house__slider', {
            loop: true,
            grabCursor: true,

            autoplay:{
                delay:10000,
            },
          
            navigation: {
              nextEl: '.ready-house__next',
              prevEl: '.ready-house__prev',
            },
        });
    }
    if(document.querySelector('.review__slider')){
        new Swiper('.review__slider', {
            loop: false,
            autoHeight:true,

            breakpoints: {
                1725:{
                    slidesPerView:3.5,
                    spaceBetween:40,
                },
                1570:{
                    slidesPerView:3,
                    spaceBetween:40,
                },
                1305:{
                    slidesPerView:2.5,
                    spaceBetween:40,
                },
                910:{
                    slidesPerView:2,
                    spaceBetween:20,
                },
                769:{
                    slidesPerView:1.7,
                    spaceBetween:20,
                },
                320:{
                    slidesPerView:1,
                    spaceBetween:10,
                },
            },
          
            navigation: {
              nextEl: '.review__next',
              prevEl: '.review__prev',
            },
        });
    }
    //set paddingLeft
    function setpaddingLeft(){
        if(window.innerWidth > 1200){
            individualSubtitle.style.paddingLeft = (parseInt(getComputedStyle(container).marginRight) + 60)+'px';
            individualFlexItems.forEach(item=>{
                item.style.paddingLeft = (parseInt(getComputedStyle(container).marginRight) + 60)+'px';
            });
            processFlex.style.paddingLeft = (parseInt(getComputedStyle(container).marginRight) + 60)+'px';
        }else if(window.innerWidth > 768){
            individualSubtitle.style.paddingLeft = 45+'px';
            individualFlexItems.forEach(item=>{
                item.style.paddingLeft = 45+'px';
            });
            processFlex.style.paddingLeft = 45+'px';
        }else if(window.innerWidth > 320){
            individualSubtitle.style.paddingLeft = 0+'px';
            individualFlexItems.forEach(item=>{
                item.style.paddingLeft = 0+'px';
            });
            processFlex.style.paddingLeft = 0+'px';
        }
    }
    const container = document.querySelector('.container'),
          individualSubtitle = document.querySelector('.individual__subtitle'),
          individualFlexItems = document.querySelectorAll('.individual__flex-item'),
          processFlex= document.querySelector('.process__flex');
    if(document.querySelector('.individual__subtitle')){
        setpaddingLeft();
        window.addEventListener('resize',()=>{
            setpaddingLeft();
        });
    }
    //discovery individual section
    if(document.querySelector('.individual')){
        const individualSection = document.querySelector('.individual'),
        discoverBtn = individualSection.querySelector('[data-purpose="discover"]'),
        closeBtn = individualSection.querySelector('[data-purpose="close"]'),
        individualFlexItems = individualSection.querySelectorAll('[data-item="individual"]');
        closeBtn.parentElement.style.display = 'none';
        individualFlexItems.forEach((flexItem,i)=>{
            if(i>2){
                flexItem.style.display = 'none';
            }
        });
        discoverBtn.addEventListener('click',()=>{
            individualFlexItems.forEach((flexItem,i)=>{
                if(i>2){
                    flexItem.style.display = 'flex';
                }
                discoverBtn.parentElement.style.display = 'none';
                closeBtn.parentElement.style.display = 'flex';
            });
        });
        closeBtn.addEventListener('click',()=>{
            individualFlexItems.forEach((flexItem,i)=>{
                if(i>2){
                    flexItem.style.display = 'none';
                }
                closeBtn.parentElement.style.display = 'none';
                discoverBtn.parentElement.style.display = 'flex';
                document.documentElement.scrollTo({top:individualSection.offsetTop});
            });
        });
    }
    //calc
    function getOnlyNumberWithFloat(value){
        let regExp;
        regExp = new RegExp(/^\d*\.?\d*$/);
        if (regExp.test(value)) {
            if((value.includes('.'))){
                if((value.length) - value.indexOf('.') > 3){
                    return value.slice(0,-1);
                }
            }
            return value;
        }else{
            return value.slice(0,-1);
        }
    }
    function getOnlyNumber(value){
        return value.replace(/\D/g,'');
    }
    function calculationMortgage(){
        
        if(!+inputTotal.value || !+inputRublePayment.value || !+inputInterestRate.value || !+inputTermsMonths.value){
            resultPayment.textContent = 0;
            return;
        }
        const monthInterestRate = +inputInterestRate.value/1200,
              sum = +creditSum.textContent,
              divider = Math.pow(monthInterestRate+1,+inputTermsMonths.value) - 1;
              
        resultPayment.textContent = Math.ceil(sum*(monthInterestRate + monthInterestRate/divider));
    }
    function calculatingCreditSum(){
        if(!+inputTotal.value || !+inputRublePayment.value){
            creditSum.textContent = 0;
            return;
        }
        if((+inputTotal.value - +inputRublePayment.value) < 0){
            creditSum.textContent = 0;
            return;
        }
        creditSum.textContent = (+inputTotal.value - +inputRublePayment.value).toFixed(2);
    }
    function calculatingDownPaymentPercent(){
        if(+inputTotal.value && +inputPercentPayment.value){
            inputRublePayment.value = (+inputPercentPayment.value*+inputTotal.value/100).toFixed(2);
        }
    }
    function calculatingDownPaymentRuble(){
        if(+inputTotal.value && +inputRublePayment.value){
            inputPercentPayment.value = (+inputRublePayment.value*100/+inputTotal.value).toFixed(2);
        }
    }
    function calculatingMortgageTermsInMonths(){
        if(+inputTermsYears.value){
            inputTermsMonths.value = +inputTermsYears.value*12;
        }
    }
    function presenceTotalValue(){
        let presence;
        if(!+inputTotal.value){
            inputTotal.style.borderColor = 'red';
            presence = false;
        }else{
            inputTotal.style.borderColor = '#1C1C1C';
            presence = true;
        }
        return presence;
    }

    const inputElems = document.querySelectorAll('.calc__input-item'),
            resultPayment = document.querySelector('.calc__result-numb[id="result-payment"]'),
            creditSum = document.querySelector('.calc__result-numb[id="credit-sum"]'),
            inputTotal = document.querySelector('input[id="total"]'),
            inputRublePayment = document.querySelector('input[id="ruble-payment"]'),
            inputPercentPayment = document.querySelector('input[id="percent-payment"]'),
            inputInterestRate = document.querySelector('input[id="interest-rate"]'),
            inputTermsYears = document.querySelector('input[id="terms-years"]'),
            inputTermsMonths = document.querySelector('input[id="terms-months"]');

    if(document.querySelector('.calc')){
        inputElems.forEach(el=>{
               
            el.addEventListener('input',e=>{
                const inputTarget = e.target;
                let inputOnlyNumber;
                switch(inputTarget.getAttribute('id')){
                    case 'total':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        inputTotal.value = inputOnlyNumber;
                        presenceTotalValue();
                        break;
                    case 'ruble-payment':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        if(!presenceTotalValue()){
                            inputOnlyNumber = '';
                        }
                        inputRublePayment.value = inputOnlyNumber;
                        calculatingDownPaymentRuble();
                        break;
                    case 'percent-payment':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        if(!presenceTotalValue()){
                            inputOnlyNumber = '';
                        }
                        if(+inputPercentPayment.value > 100){
                            inputPercentPayment.value = 100;
                        }else{
                            inputPercentPayment.value = inputOnlyNumber;
                        }
                        calculatingDownPaymentPercent();
                        break;
                    case 'interest-rate':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        if(+inputInterestRate.value > 100){
                            inputInterestRate.value = 100;
                        }else{
                            inputInterestRate.value = inputOnlyNumber;
                        }
                        break;
                    case 'terms-years':
                        inputOnlyNumber = getOnlyNumber(inputTarget.value);
                        if(+inputOnlyNumber > 30){
                            inputTermsYears.value = 30;
                        }else{
                            inputTermsYears.value = inputOnlyNumber;
                        }
                        calculatingMortgageTermsInMonths();
                        break;
                    case 'terms-months':
                        inputOnlyNumber = getOnlyNumber(inputTarget.value);
                        inputTermsYears.value = '';
                        if(+inputOnlyNumber > 360){
                            inputTermsMonths.value = 360;
                        }else{
                            inputTermsMonths.value = inputOnlyNumber;
                        }
                        break;
                }
                calculatingCreditSum();
                calculationMortgage();
            });
        });
    }

    //modal
    function fadeIn (el, timeout, display){
        el.style.opacity = 0;
        el.style.display = display || 'block';
        el.style.transition = `opacity ${timeout}ms`;
        setTimeout(() => {
          el.style.opacity = 1;
        }, 10);
    }
    function fadeOut (el, timeout){
        el.style.opacity = 1;
        el.style.transition = `opacity ${timeout}ms`;
        el.style.opacity = 0;
      
        setTimeout(() => {
          el.style.display = 'none';
        }, timeout);
    }
    const   reviewBlocks = document.querySelectorAll('.review__block'),
            overlay = document.querySelector('.overlay'),
            modalReviewAuthor = document.querySelector('.modal__review-author'),
            modalReviewText = document.querySelector('.modal__review-text'),
            closeElement = document.querySelector('.modal__close');
    
    if(overlay){
        reviewBlocks.forEach(block=>{
            block.querySelector('.review__read-next').addEventListener('click',()=>{
                modalReviewAuthor.textContent = block.querySelector('.review__author').textContent;
                modalReviewText.textContent = block.querySelector('.review__text').textContent;
                fadeIn(overlay,100,'block');
            });
        });

        closeElement.addEventListener('click',()=>{
            fadeOut(overlay,20);
            overlay.scrollTo(0, 0);
        });
        overlay.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('overlay')){
                fadeOut(overlay,20);
                overlay.scrollTo(0, 0);
            }
        });
        document.addEventListener('keydown',(e)=>{
            if(overlay.style.opacity === '1' && e.code == 'Escape'){
                fadeOut(overlay,20);
                overlay.scrollTo(0, 0);
            }
         });
    }
});