window.addEventListener('DOMContentLoaded', () => {
    //слайдер
    function customArrowsSlider (sliderClass,sliderPosition){
        const left = document.querySelector(sliderClass + ' .left'),
        right = document.querySelector(sliderClass + ' .right');
        if(sliderPosition === 'fromEdge'){
            left.querySelector('svg path').setAttribute('stroke','white');
            right.querySelector('svg path').setAttribute('stroke','white');
        }
        if(sliderPosition === 'reachEnd'){
            right.querySelector('svg path').setAttribute('stroke','#393939');
        }
        if(sliderPosition === 'reachBeginning'){
            left.querySelector('svg path').setAttribute('stroke','#393939');
        }
    }
   
    if(document.querySelector('.expertise__slider')){
        const expertiseSlider = new Swiper('.expertise__slider', {
            loop: false,
    
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },

            breakpoints: {
                1201:{
                    slidesPerView: '3',
                    spaceBetween:50,
            
                },
                769:{
                    slidesPerView: '3',
                    spaceBetween:30,
                },   
            }
        });
        expertiseSlider.on('fromEdge',()=>{
            customArrowsSlider('.expertise__slider','fromEdge');
        });
        expertiseSlider.on('reachEnd',()=>{
            customArrowsSlider('.expertise__slider','reachEnd');
        });
        expertiseSlider.on('reachBeginning',()=>{
            customArrowsSlider('.expertise__slider','reachBeginning');
        });
    }
    if(document.querySelector('.expertise__slider-mobile')){
        const expertiseSliderMobile = new Swiper('.expertise__slider-mobile', {
            loop: false,
            
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
    
            breakpoints: {
                650:{
                    slidesPerView: '2.6',
                    spaceBetween:20,
                }, 
                550:{
                    slidesPerView: '2.2',
                    spaceBetween:10,
                },
                450:{
                    slidesPerView: '1.7',
                    spaceBetween:20,
                },
                400:{
                    slidesPerView: '1.5',
                    spaceBetween:15,
                },
                320:{
                    slidesPerView: '1.3',
                    spaceBetween:10,
                }, 
            }
        });
        expertiseSliderMobile.on('fromEdge',()=>{
            customArrowsSlider('.expertise__slider-mobile','fromEdge');
        });
        expertiseSliderMobile.on('reachEnd',()=>{
            customArrowsSlider('.expertise__slider-mobile','reachEnd');
        });
        expertiseSliderMobile.on('reachBeginning',()=>{
            customArrowsSlider('.expertise__slider-mobile','reachBeginning');
        });
    }
    if(document.querySelector('.leaflets__slider')){
        const leafletsSlider = new Swiper('.leaflets__slider', {
            loop: false,
            slidesPerView: '1',
            spaceBetween:1,
    
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },

        });
        leafletsSlider.on('fromEdge',()=>{
            customArrowsSlider('.leaflets__slider','fromEdge');
        });
        leafletsSlider.on('reachEnd',()=>{
            customArrowsSlider('.leaflets__slider','reachEnd');
        });
        leafletsSlider.on('reachBeginning',()=>{
            customArrowsSlider('.leaflets__slider','reachBeginning');
        });
    }
    if(document.querySelector('.team__slider')){
        const teamSlider = new Swiper('.team__slider', {
            loop: false,
            grabCursor:true,
    
            navigation: {
            nextEl: '.team__right',
            prevEl: '.team__left',
            },
    
            breakpoints: {
                2300:{
                    slidesPerView: '6.5',
                    spaceBetween:50,
                },
                2000:{
                    slidesPerView: '5.4',
                    spaceBetween:70,
                },
                1800:{
                    slidesPerView: '4.7',
                    spaceBetween:80,
                },
                1600:{
                    slidesPerView: '4.2',
                    spaceBetween:70,
                }, 
                1400:{
                    slidesPerView: '3.7',
                    spaceBetween:70,
                }, 
                1201:{
                    slidesPerView: '3.3',
                    spaceBetween:50,
                }, 
                1000:{
                    slidesPerView: '3.7',
                    spaceBetween:35,
                }, 
                800:{
                    slidesPerView: '2.8',
                    spaceBetween:50,
                }, 
                769:{
                    slidesPerView: '2.6',
                    spaceBetween:30,
                }, 
                600:{
                    slidesPerView: '2.3',
                    spaceBetween:40,
                }, 
                470:{
                    slidesPerView: '1.8',
                    spaceBetween:35,
                }, 
                380:{
                    slidesPerView: '1.45',
                    spaceBetween:30,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:25,
                }, 
            }
        });
        const teamLeft = document.querySelector('.team__left'),
        teamRight = document.querySelector('.team__right');
        teamSlider.on('fromEdge',()=>{
            teamLeft.querySelector('svg path').setAttribute('stroke','white');
            teamRight.querySelector('svg path').setAttribute('stroke','white');
        });
        teamSlider.on('reachEnd',()=>{
            teamRight.querySelector('svg path').setAttribute('stroke','#393939');
        });
        teamSlider.on('reachBeginning',()=>{
            teamLeft.querySelector('svg path').setAttribute('stroke','#393939');
        });
    }
    if(document.querySelector('.cases__slider')){
        const casesSlider = new Swiper('.cases__slider', {
            grid: {                         
                rows: 2,                    
            },  
    
            loop: false,
    
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
    
            breakpoints: {
                600:{
                    slidesPerView: '1.2',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1',
                    spaceBetween:30,
                }, 
            }
        });
        casesSlider.on('fromEdge',()=>{
            customArrowsSlider('.cases__slider','fromEdge');
        });
        casesSlider.on('reachEnd',()=>{
            customArrowsSlider('.cases__slider','reachEnd');
        });
        casesSlider.on('reachBeginning',()=>{
            customArrowsSlider('.cases__slider','reachBeginning');
        });
    }
    if(document.querySelector('.case__slider')){
        new Swiper('.case__slider', {
            loop: false,
            grabCursor:true,
            
            navigation: {
            nextEl: '.case__right',
            prevEl: '.case__left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '2',
                    spaceBetween:100,
                }, 
                769:{
                    slidesPerView: '2',
                    spaceBetween:40,
                }, 
                320:{
                    slidesPerView: '2',
                    spaceBetween:10,
                }, 
            }
        });
    }
    
    if(document.querySelector('.entrepreneurship-slider')){
        const entrepreneurshipSlider = new Swiper('.entrepreneurship-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.55',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.35',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:10,
                },
            }
        });
        entrepreneurshipSlider.on('fromEdge',()=>{
            customArrowsSlider('.entrepreneurship-slider','fromEdge');
        });
        entrepreneurshipSlider.on('reachEnd',()=>{
            customArrowsSlider('.entrepreneurship-slider','reachEnd');
        });
        entrepreneurshipSlider.on('reachBeginning',()=>{
            customArrowsSlider('.entrepreneurship-slider','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy-slider-first')){
        const ammoniyFirstSlider = new Swiper('.ammoniy-slider-first', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        ammoniyFirstSlider.on('fromEdge',()=>{
            customArrowsSlider('.ammoniy-slider-first','fromEdge');
        });
        ammoniyFirstSlider.on('reachEnd',()=>{
            customArrowsSlider('.ammoniy-slider-first','reachEnd');
        });
        ammoniyFirstSlider.on('reachBeginning',()=>{
            customArrowsSlider('.ammoniy-slider-first','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy-slider-second')){
        const ammoniySecondSlider = new Swiper('.ammoniy-slider-second', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        ammoniySecondSlider.on('fromEdge',()=>{
            customArrowsSlider('.ammoniy-slider-second','fromEdge');
        });
        ammoniySecondSlider.on('reachEnd',()=>{
            customArrowsSlider('.ammoniy-slider-second','reachEnd');
        });
        ammoniySecondSlider.on('reachBeginning',()=>{
            customArrowsSlider('.ammoniy-slider-second','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy-slider-third')){
        const ammoniyThirdSlider = new Swiper('.ammoniy-slider-third', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        ammoniyThirdSlider.on('fromEdge',()=>{
            customArrowsSlider('.ammoniy-slider-third','fromEdge');
        });
        ammoniyThirdSlider.on('reachEnd',()=>{
            customArrowsSlider('.ammoniy-slider-third','reachEnd');
        });
        ammoniyThirdSlider.on('reachBeginning',()=>{
            customArrowsSlider('.ammoniy-slider-third','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy-slider-fourth')){
        const ammoniyFourthSlider = new Swiper('.ammoniy-slider-fourth', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        ammoniyFourthSlider.on('fromEdge',()=>{
            customArrowsSlider('.ammoniy-slider-fourth','fromEdge');
        });
        ammoniyFourthSlider.on('reachEnd',()=>{
            customArrowsSlider('.ammoniy-slider-fourth','reachEnd');
        });
        ammoniyFourthSlider.on('reachBeginning',()=>{
            customArrowsSlider('.ammoniy-slider-fourth','reachBeginning');
        });
    }
    if(document.querySelector('.atom-slider')){
        const atomSlider = new Swiper('.atom-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        atomSlider.on('fromEdge',()=>{
            customArrowsSlider('.atom-slider','fromEdge');
        });
        atomSlider.on('reachEnd',()=>{
            customArrowsSlider('.atom-slider','reachEnd');
        });
        atomSlider.on('reachBeginning',()=>{
            customArrowsSlider('.atom-slider','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy-navigation-slider')){
        const ammoniyNavigationSlider = new Swiper('.ammoniy-navigation-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.55',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.35',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:10,
                },
            }
        });
        ammoniyNavigationSlider.on('fromEdge',()=>{
            customArrowsSlider('.ammoniy-navigation-slider','fromEdge');
        });
        ammoniyNavigationSlider.on('reachEnd',()=>{
            customArrowsSlider('.ammoniy-navigation-slider','reachEnd');
        });
        ammoniyNavigationSlider.on('reachBeginning',()=>{
            customArrowsSlider('.ammoniy-navigation-slider','reachBeginning');
        });
    }
    if(document.querySelector('.fisherman-slider')){
        const fishermanSlider = new Swiper('.fisherman-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        fishermanSlider.on('fromEdge',()=>{
            customArrowsSlider('.fisherman-slider','fromEdge');
        });
        fishermanSlider.on('reachEnd',()=>{
            customArrowsSlider('.fisherman-slider','reachEnd');
        });
        fishermanSlider.on('reachBeginning',()=>{
            customArrowsSlider('.fisherman-slider','reachBeginning');
        });
    }
    if(document.querySelector('.indigo-slider')){
        const indigoSlider = new Swiper('.indigo-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        indigoSlider.on('fromEdge',()=>{
            customArrowsSlider('.indigo-slider','fromEdge');
        });
        indigoSlider.on('reachEnd',()=>{
            customArrowsSlider('.indigo-slider','reachEnd');
        });
        indigoSlider.on('reachBeginning',()=>{
            customArrowsSlider('.indigo-slider','reachBeginning');
        });
    }
    if(document.querySelector('.altio-slider')){
        const altioSlider = new Swiper('.altio-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.83',
                    spaceBetween:50,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        altioSlider.on('fromEdge',()=>{
            customArrowsSlider('.altio-slider','fromEdge');
        });
        altioSlider.on('reachEnd',()=>{
            customArrowsSlider('.altio-slider','reachEnd');
        });
        altioSlider.on('reachBeginning',()=>{
            customArrowsSlider('.altio-slider','reachBeginning');
        });
    }
    if(document.querySelector('.murals-slider')){
        const muralsSlider = new Swiper('.murals-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        muralsSlider.on('fromEdge',()=>{
            customArrowsSlider('.murals-slider','fromEdge');
        });
        muralsSlider.on('reachEnd',()=>{
            customArrowsSlider('.murals-slider','reachEnd');
        });
        muralsSlider.on('reachBeginning',()=>{
            customArrowsSlider('.murals-slider','reachBeginning');
        });
    }
    if(document.querySelector('.farmer-day-slider')){
        const farmerDaySlider = new Swiper('.farmer-day-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.55',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.35',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:10,
                },
            }
        });
        farmerDaySlider.on('fromEdge',()=>{
            customArrowsSlider('.farmer-day-slider','fromEdge');
        });
        farmerDaySlider.on('reachEnd',()=>{
            customArrowsSlider('.farmer-day-slider','reachEnd');
        });
        farmerDaySlider.on('reachBeginning',()=>{
            customArrowsSlider('.farmer-day-slider','reachBeginning');
        });
    }
    if(document.querySelector('.yards-slider')){
        const yardsSlider = new Swiper('.yards-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        yardsSlider.on('fromEdge',()=>{
            customArrowsSlider('.yards-slider','fromEdge');
        });
        yardsSlider.on('reachEnd',()=>{
            customArrowsSlider('.yards-slider','reachEnd');
        });
        yardsSlider.on('reachBeginning',()=>{
            customArrowsSlider('.yards-slider','reachBeginning');
        });
    }
    if(document.querySelector('.advanced-farming-slider')){
        const advancedFarmingSlider = new Swiper('.advanced-farming-slider', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.8',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:25,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
        });
        advancedFarmingSlider.on('fromEdge',()=>{
            customArrowsSlider('.advanced-farming-slider','fromEdge');
        });
        advancedFarmingSlider.on('reachEnd',()=>{
            customArrowsSlider('.advanced-farming-slider','reachEnd');
        });
        advancedFarmingSlider.on('reachBeginning',()=>{
            customArrowsSlider('.advanced-farming-slider','reachBeginning');
        });
    }
    if(document.querySelector('.merch__slider-cloth')){
        const merchWorkSlider = new Swiper('.merch__slider-works', {
            loop: false,
            grabCursor:true,
            autoHeight:true,
        });
        merchWorkSlider.disable();
        const merchClothSlider = new Swiper('.merch__slider-cloth', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
            controller:{
                control: merchWorkSlider,
            },
        });
        merchClothSlider.on('fromEdge',()=>{
            customArrowsSlider('.merch__slider-cloth','fromEdge');
        });
        merchClothSlider.on('reachEnd',()=>{
            customArrowsSlider('.merch__slider-cloth','reachEnd');
        });
        merchClothSlider.on('reachBeginning',()=>{
            customArrowsSlider('.merch__slider-cloth','reachBeginning');
        });
    }
    if(document.querySelector('.merch__slider-collection')){
        const merchCollectionSlider = new Swiper('.merch__slider-collection', {
            loop: false,
            grabCursor:true,
            navigation: {
                nextEl: '.right',
                prevEl: '.left',
            },
        });
        merchCollectionSlider.on('fromEdge',()=>{
            customArrowsSlider('.merch__slider-collection','fromEdge');
        });
        merchCollectionSlider.on('reachEnd',()=>{
            customArrowsSlider('.merch__slider-collection','reachEnd');
        });
        merchCollectionSlider.on('reachBeginning',()=>{
            customArrowsSlider('.merch__slider-collection','reachBeginning');
        });
    }
    


    //burger menu
    const inner = document.querySelector('.header__inner'),
    hamburger = document.querySelector('.header__mobile-burger'),
    sticks = document.querySelectorAll('.header__mobile-stick');

    hamburger.addEventListener('click',()=>{
        inner.classList.toggle('header__inner_active');
        sticks.forEach(item=>{
            item.classList.toggle('header__mobile-stick_active');
        });
    });


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
    const   modalLinks = document.querySelectorAll('.modal-links'),
            modals = document.querySelectorAll('.case-modal');
            overlay = document.querySelector('.overlay'),
            closeElement = document.querySelectorAll('.case-modal__close-el');
    
    if(overlay){
        modalLinks.forEach(item=>{
            modals.forEach(modal=>{
                if(item.getAttribute('data-name') === modal.getAttribute('data-name')){
                    item.addEventListener('click',()=>{
                        modal.style.visibility = 'visible';
                        fadeIn(overlay, 100, 'block');
                    });
                }
            });
        });
        closeElement.forEach(el=>{
            el.addEventListener('click',()=>{
                fadeOut(overlay,20);
                modals.forEach(modal=>{
                    modal.style.visibility = 'hidden';
                });
                overlay.scrollTo(0, 0);
            });
        });
        overlay.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('overlay')){
                fadeOut(overlay,20);
                modals.forEach(modal=>{
                    modal.style.visibility = 'hidden';
                });
                overlay.scrollTo(0, 0);
            }
        });
        document.addEventListener('keydown',(e)=>{
            if(overlay.style.opacity === '1' && e.code == 'Escape'){
                fadeOut(overlay,20);
                modals.forEach(modal=>{
                    modal.style.visibility = 'hidden';
                });
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

    //active menu on scroll
    if(document.querySelector('.case__aside')){
        const links = document.querySelectorAll('.case__aside-menu a');
        const observer = new IntersectionObserver(entries=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    links.forEach(link=>{
                        const id = link.getAttribute('href').replace('#','');
                        if(id === entry.target.id){
                            link.classList.add('aside__menu_active');
                        }else{
                            link.classList.remove('aside__menu_active');
                        }
                    });
                }
            });
        },{
            threshold: 0.55
        });
        document.querySelectorAll('.entry').forEach(entry=>{
            observer.observe(entry);
        });
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

    if(document.querySelector('.footer-order__form')){
        //input:focus
        const inputs = document.querySelectorAll('.focusout-js');
        inputs.forEach(inputElem=>{
            const savePlaceholer = inputElem.placeholder;
            inputElem.addEventListener('focus',(e)=>{
                inputTarget = e.target;
                inputTarget.placeholder = '';
                inputTarget.addEventListener('blur',(e)=>{
                    e.target.placeholder = savePlaceholer;
                });
            });
        });

        //mask
        const inputPhone = document.querySelector('input[id="feedtel"]');
        inputPhone.setAttribute('maxlength','18');
        inputPhone.addEventListener('keydown',onPhoneKeyDown);
        inputPhone.addEventListener('input',onPhoneInput);
    }
});
