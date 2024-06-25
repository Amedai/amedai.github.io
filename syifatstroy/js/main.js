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
            grabCursor: true,
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
    function getOnlyNumber(value){
        return value.replace(/\D/g,'');
    }
    function calculationMortgage(){
        if(!total || !rublePayment || !interestRate || !termsMonths){
            resultPayment.textContent = 0;
            return;
        }
        const monthInterestRate = interestRate/1200,
              sum = +document.querySelector('.calc__result-numb[id="credit-sum"]').textContent,
              divider = Math.pow(monthInterestRate+1,termsMonths) - 1;
              
        resultPayment.textContent = Math.round(sum*(monthInterestRate + monthInterestRate/divider));
    }
    function calculatingCreditSum(){
        if(!total || !rublePayment){
            creditSum.textContent = 0;
            return;
        }
        if((total - rublePayment) < 0){
            creditSum.textContent = 0;
            return;
        }
        creditSum.textContent = Math.round(total - rublePayment);
    }
    function calculatingDownPaymentPercent(){
        if(total && percentPayment){
            rublePayment = percentPayment*total/100;
            document.querySelector('input[id="ruble-payment"]').value = rublePayment;
        }
    }
    function calculatingMortgageTermsInMonths(){
        if(termsYears){
            termsMonths = termsYears*12;
            document.querySelector('input[id="terms-months"]').value = termsMonths;
        }
    }

    const inputElems = document.querySelectorAll('.calc__input-item'),
            resultPayment = document.querySelector('.calc__result-numb[id="result-payment"]'),
            creditSum = document.querySelector('.calc__result-numb[id="credit-sum"]');

    let total,rublePayment,percentPayment,interestRate,termsYears,termsMonths;
    if(document.querySelector('.calc')){
        inputElems.forEach(el=>{
            el.addEventListener('input',e=>{
                const inputTarget = e.target,
                        inputOnlyNumber = getOnlyNumber(inputTarget.value);
                let resultValue;
                resultValue = inputOnlyNumber;
                switch(inputTarget.getAttribute('id')){
                    case 'total':
                        total = +resultValue;
                        break;
                    case 'ruble-payment':
                        rublePayment = +resultValue;
                        break;
                    case 'percent-payment':
                        percentPayment = +resultValue;
                        break;
                    case 'interest-rate':
                        interestRate = +resultValue;
                        break;
                    case 'terms-years':
                        if(+resultValue > 30){
                            termsYears = 30;
                        }else{
                            termsYears = +resultValue;
                        }
                        document.querySelector('input[id="terms-years"]').value= termsYears;
                        break;
                    case 'terms-months':
                        if(+resultValue > 360){
                            termsMonths = 360;
                        }else{
                            termsMonths = +resultValue;
                        }
                        document.querySelector('input[id="terms-months"]').value= termsMonths;
                        break;
                }
                calculatingCreditSum();
                calculationMortgage();
                calculatingDownPaymentPercent();
                calculatingMortgageTermsInMonths();
            });
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