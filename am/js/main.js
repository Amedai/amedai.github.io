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
                600:{
                    slidesPerView: '2.6',
                    spaceBetween:30,
                }, 
                450:{
                    slidesPerView: '1.8',
                    spaceBetween:40,
                }, 
                320:{
                    slidesPerView: '1.45',
                    spaceBetween:20,
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
    if(document.querySelector('.team__slider')){
        const teamSlider = new Swiper('.team__slider', {
            loop: false,
            grabCursor:true,
    
            navigation: {
            nextEl: '.team__right',
            prevEl: '.team__left',
            },
    
            breakpoints: {
                1800:{
                    slidesPerView: '3.9',
                    spaceBetween:170,
                },
                1600:{
                    slidesPerView: '3.9',
                    spaceBetween:100,
                }, 
                1400:{
                    slidesPerView: '3.8',
                    spaceBetween:20,
                }, 
                1200:{
                    slidesPerView: '3.7',
                    spaceBetween:20,
                }, 
                1000:{
                    slidesPerView: '3.5',
                    spaceBetween:20,
                }, 
                800:{
                    slidesPerView: '2.6',
                    spaceBetween:20,
                }, 
                700:{
                    slidesPerView: '2.3',
                    spaceBetween:20,
                }, 
                600:{
                    slidesPerView: '1.8',
                    spaceBetween:40,
                }, 
                470:{
                    slidesPerView: '1.6',
                    spaceBetween:30,
                }, 
                380:{
                    slidesPerView: '1.4',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:20,
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
                    slidesPerView: '1.5',
                    spaceBetween:30,
                }, 
                450:{
                    slidesPerView: '1.3',
                    spaceBetween:20,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:20,
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
    if(document.querySelector('.result__slider')){
        new Swiper('.result__slider', {
            loop: false,
            grabCursor:true,
            
            navigation: {
            nextEl: '.result__right',
            prevEl: '.result__left',
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
    if(document.querySelector('.entrepreneurship__slider')){
        const entrepreneurshipSlider = new Swiper('.entrepreneurship__slider', {
            loop: false,
            grabCursor:true,
            navigation: {
            nextEl: '.right',
            prevEl: '.left',
            },
            breakpoints: {
                1201:{
                    slidesPerView: '1.7',
                    spaceBetween:60,
                }, 
                769:{
                    slidesPerView: '1.5',
                    spaceBetween:60,
                }, 
                320:{
                    slidesPerView: '1.2',
                    spaceBetween:20,
                },
            }
        });
        entrepreneurshipSlider.on('fromEdge',()=>{
            customArrowsSlider('.entrepreneurship__slider','fromEdge');
        });
        entrepreneurshipSlider.on('reachEnd',()=>{
            customArrowsSlider('.entrepreneurship__slider','reachEnd');
        });
        entrepreneurshipSlider.on('reachBeginning',()=>{
            customArrowsSlider('.entrepreneurship__slider','reachBeginning');
        });
    }
    if(document.querySelector('.ammoniy__slider')){
        new Swiper('.ammoniy__slider', {
            loop: false,
            grabCursor:true,
            breakpoints: {
                1201:{
                    slidesPerView: '1.7',
                    spaceBetween:30,
                }, 
                769:{
                    slidesPerView: '1.2',
                    spaceBetween:35,
                }, 
                320:{
                    slidesPerView: '1.1',
                    spaceBetween:10,
                },
            }
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
            modals = document.querySelectorAll('.modal');
            overlay = document.querySelector('.overlay'),
            closeElement = document.querySelectorAll('.overlay__close');
    
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
            });
        });
        overlay.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('overlay')){
                fadeOut(overlay,20);
                modals.forEach(modal=>{
                    modal.style.visibility = 'hidden';
                });
            }
        });
        document.addEventListener('keydown',(e)=>{
            if(overlay.style.opacity === '1' && e.code == 'Escape'){
                fadeOut(overlay,20);
                modals.forEach(modal=>{
                    modal.style.visibility = 'hidden';
                });
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
    if(document.querySelector('.aside')){
        const links = document.querySelectorAll('.aside__menu a');
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
            threshold: 0.7
        });
        document.querySelectorAll('.entry').forEach(entry=>{
            observer.observe(entry);
        });
    }
});
