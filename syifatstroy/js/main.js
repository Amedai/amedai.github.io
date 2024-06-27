'use strict';
window.addEventListener('DOMContentLoaded',()=>{
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
                    slidesPerView:3.3,
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
                    spaceBetween:40,
                },
                769:{
                    slidesPerView:1.7,
                    spaceBetween:20,
                },
                320:{
                    slidesPerView:1,
                },
            },
          
            navigation: {
              nextEl: '.review__next',
              prevEl: '.review__prev',
            },
        });
    }
    //margin in individual section
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

    const inputElems = document.querySelectorAll('.calc__input-item'),
            resultPayment = document.querySelector('.calc__result-numb[id="result-payment"]'),
            creditSum = document.querySelector('.calc__result-numb[id="credit-sum"]'),
            inputTotal = document.querySelector('input[id="total"]'),
            inputRublePayment = document.querySelector('input[id="ruble-payment"]'),
            inputPercentPayment = document.querySelector('input[id="percent-payment"]'),
            inputInterestRate = document.querySelector('input[id="interest-rate"]'),
            inputTermsYears = document.querySelector('input[id="terms-years"]'),
            inputTermsMonths = document.querySelector('input[id="terms-months"]');

    /* let total,rublePayment,percentPayment,interestRate,termsYears,termsMonths; */
    if(document.querySelector('.calc')){
        inputElems.forEach(el=>{
               
            el.addEventListener('input',e=>{
                console.log(+'10 000');
                const inputTarget = e.target;
                let inputOnlyNumber;
                switch(inputTarget.getAttribute('id')){
                    case 'total':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        inputTotal.value = inputOnlyNumber;
                        break;
                    case 'ruble-payment':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
                        inputRublePayment.value = inputOnlyNumber;
                        calculatingDownPaymentRuble();
                        break;
                    case 'percent-payment':
                        inputOnlyNumber = getOnlyNumberWithFloat(inputTarget.value);
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
    //animation on scroll
    AOS.init({
        disable: false, 
        startEvent: 'load', 
        
        offset: 100, 
        delay: 100, 
        duration: 1000, 
        easing: 'ease', 
        once: true, 
        mirror: false, 
        anchorPlacement: 'top-bottom', 
      
      });
});