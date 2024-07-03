'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //переход между страницами с сохранением позиции
    if(document.querySelector('[data-name="back"]')){
        const btnsBack = document.querySelectorAll('[data-name="back"]'),
        previousUrl = document.referrer;
        btnsBack.forEach(back=>{
            back.addEventListener('click',e=>{
                e.preventDefault();
                if((previousUrl.slice(previousUrl.indexOf('portfolio-pattern'),previousUrl.indexOf('.html') - 1) === 'portfolio-pattern') && back.getAttribute('data-step')){
                    window.history.go(-2);
                }else{
                    window.history.back();
                }

            });
        });
        
    }


    /* if(window.location.pathname.slice(1) === 'index.html'){
        const btnMain = document.querySelector('[data-name="main"]');
        if(window.innerWidth > 1200){
            const   columnMainLeft = document.querySelector('.portfolio__column_left'),
                    columnMainCenter = document.querySelector('.portfolio__column_center'),
                    columnMainRight = document.querySelector('.portfolio__column_right');


            columnMainLeft.scrollTo({top:window.sessionStorage.getItem(columnMainLeft.getAttribute('data-column'))});
            columnMainCenter.scrollTo({top:window.sessionStorage.getItem(columnMainCenter.getAttribute('data-column'))});
            columnMainRight.scrollTo({top:window.sessionStorage.getItem(columnMainRight.getAttribute('data-column'))});

            
            columnMainLeft.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMainLeft.getAttribute('data-column'),columnMainLeft.scrollTop);
            });
            columnMainCenter.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMainCenter.getAttribute('data-column'),columnMainCenter.scrollTop);
            });
            columnMainRight.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMainRight.getAttribute('data-column'),columnMainRight.scrollTop);
            });
        }
        if(window.innerWidth > 768){
            const   columnsMobile = document.querySelector('.portfolio__list-mobile'),
                    columnMainLeft = columnsMobile.querySelector('.portfolio__column_left'),
                    columnMainRight = columnsMobile.querySelector('.portfolio__column_right');

            columnMainLeft.scrollTo({top:window.sessionStorage.getItem(columnMainLeft.getAttribute('data-column'))});
            columnMainRight.scrollTo({top:window.sessionStorage.getItem(columnMainRight.getAttribute('data-column'))});

            columnMainLeft.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMainLeft.getAttribute('data-column'),columnMainLeft.scrollTop);
            });
            columnMainRight.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMainRight.getAttribute('data-column'),columnMainRight.scrollTop);
            });
        }
        if(window.innerWidth > 320){
            const   columnMobile = document.querySelector('.portfolio__list-mobile');

            columnMobile.scrollTo({top:window.sessionStorage.getItem(columnMobile.getAttribute('data-column'))});

            columnMobile.addEventListener('scroll',()=>{
                window.sessionStorage.setItem(columnMobile.getAttribute('data-column'),columnMobile.scrollTop);
            });
        }

        
        btnMain.addEventListener('click',()=>{
            window.sessionStorage.setItem('left',0);
            window.sessionStorage.setItem('center',0);
            window.sessionStorage.setItem('right',0);
            window.sessionStorage.setItem('mobile',0);
        });
    }    */

    //наведение мыши на картинку
    if(document.querySelector('.hover-js')){
        const images = document.querySelectorAll('.hover-js img');
        images.forEach(img=>{
            function dataHoverSrc(){
                img.src=img.getAttribute('data-hover-src');
            }
            function dataSrc(){
                img.src=img.getAttribute('data-src');
            }
            window.addEventListener('touchstart',(e)=>{
                if(e.target.tagName === 'IMG'){
                    img.onmouseenter = null;
                    img.onmouseleave = null;
                    
                }
            });
            img.onmouseenter = dataHoverSrc;
            img.onmouseleave = dataSrc;
        });
    }
    if(document.querySelector('.hover-video-js')){
        const videos = document.querySelectorAll('.hover-video-js');
        videos.forEach(video=>{
            function displayVideo(){
                video.querySelector('video').style.display = 'block';
                video.querySelector('img').style.display = 'none';
            }
            function displayImg(){
                video.querySelector('img').style.display = 'block';
                video.querySelector('video').style.display = 'none';
            }
            window.addEventListener('touchstart',(e)=>{
                if(e.target.tagName === 'IMG'){
                    video.onmouseenter = null;
                    video.onmouseleave = null;
                }
            });
            video.onmouseenter = displayVideo;
            video.onmouseleave = displayImg;
        });
    }

    //overlay
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
   /*  function overlaySetSize(elemSizesParse){
        let parentElement;
        switch(elemSizesParse.tagName){
            case 'VIDEO':
                parentElement = elemSizesParse.parentElement;
                break;
            case 'IMG':
                parentElement = elemSizesParse.parentElement.parentElement;
                break;
        }
        const widthHeightRatio = elemSizesParse.offsetWidth/elemSizesParse.offsetHeight;

        overlayBlock.setAttribute('data-ratio',widthHeightRatio);

        if(window.innerWidth>= 1201){
            overlayBlock.style.width = (widthHeightRatio * 600) +'px';
            overlayImgItem.style.width = (widthHeightRatio * 600) +'px';
        }else if(window.innerWidth>= 769){
            overlayBlock.style.width = (widthHeightRatio * 406) +'px';
            overlayImgItem.style.width = (widthHeightRatio * 406) +'px';
        }else if(window.innerWidth>= 320){
            if(parentElement.classList.contains('portfolio__img_lg-height')){
                overlayBlock.style.width = (widthHeightRatio * 400) +'px';
                overlayImgItem.style.width = (widthHeightRatio * 400) +'px';
                overlayImgItem.style.height = 400 + 'px';
            }else{
                overlayBlock.style.width = elemSizesParse.offsetWidth + 'px';
                overlayImgItem.style.width = elemSizesParse.offsetWidth + 'px';
                overlayImgItem.style.height = elemSizesParse.offsetHeight + 'px';
            }
        }
    } */
    function overlayResize(overlayBlock,overlayImgItem){
        let height,width;
        const ratio = overlayBlock.getAttribute('data-ratio');
        if(window.innerWidth>= 1201){
            height = window.innerHeight - 215;
            overlayImgItem.style.height = height + 'px';
            overlayBlock.style.width = (ratio * height) +'px';
            overlayImgItem.style.width = (ratio * height) +'px';
        }else if(window.innerWidth>= 320){
            switch(overlayImgItem.getAttribute('data-height')){
                case 'sm':
                    if(window.innerWidth/window.innerHeight >= 600/380){
                        height = window.innerHeight - 100;
                        overlayImgItem.style.height = height + 'px';
                        overlayBlock.style.width = (ratio*height)+ 'px';
                        overlayImgItem.style.width = (ratio*height)+ 'px';
                    }else{
                        width = window.innerWidth-50;
                        overlayImgItem.style.height = width/ratio + 'px';
                        overlayBlock.style.width = width + 'px';
                        overlayImgItem.style.width = width + 'px';
                    }
                    break;
                case 'md':
                    if(window.innerWidth/window.innerHeight >= 600/640){
                        height = window.innerHeight - 100;
                        overlayImgItem.style.height = height + 'px';
                        overlayBlock.style.width = (ratio*height)+ 'px';
                        overlayImgItem.style.width = (ratio*height)+ 'px';
                    }else{
                        width = window.innerWidth-50;
                        overlayImgItem.style.height = width/ratio + 'px';
                        overlayBlock.style.width = width + 'px';
                        overlayImgItem.style.width = width + 'px';
                    }
                    break;
                case 'lg':
                    if(window.innerWidth/window.innerHeight >= 600/790){
                        height = window.innerHeight - 100;
                        overlayImgItem.style.height = height + 'px';
                        overlayBlock.style.width = (ratio*height)+ 'px';
                        overlayImgItem.style.width = (ratio*height)+ 'px';
                    }else{
                        width = window.innerWidth - 50;
                        overlayImgItem.style.height = width/ratio + 'px';
                        overlayBlock.style.width = width + 'px';
                        overlayImgItem.style.width = width + 'px';
                    }
                    break;
                case 'slg':
                    if(window.innerWidth/window.innerHeight >= 1230/860){
                        height = window.innerHeight - 100;
                        overlayImgItem.style.height = height + 'px';
                        overlayBlock.style.width = (ratio*height)+ 'px';
                        overlayImgItem.style.width = (ratio*height)+ 'px';
                    }else{
                        width = window.innerWidth - 50;
                        overlayImgItem.style.height = width/ratio + 'px';
                        overlayBlock.style.width = width + 'px';
                        overlayImgItem.style.width = width + 'px';
                    }
                    break;
            }
        }
    }

    if(document.querySelector('.overlay')){
        const overlayImages = document.querySelectorAll('.overlay-js img'),
        overlayVideos = document.querySelectorAll('.overlay-video-js video'),
        overlayImgItem = document.querySelector('.overlay__img'),
        overlay = document.querySelector('.overlay'),
        overlayBlock = overlay.querySelector('.overlay__block'),
        closeElem = overlay.querySelector('.overlay__close');

        if(document.querySelector('.overlay-js')){
            overlayImages.forEach(img=>{
                img.addEventListener('click',()=>{
                    overlayImgItem.querySelector('img').style.display = 'block';
                    overlayImgItem.querySelector('img').src= img.getAttribute('data-src');
                    overlayImgItem.setAttribute('data-height', img.getAttribute('data-height'));
                    overlayBlock.setAttribute('data-ratio',img.offsetWidth/img.offsetHeight);
                    overlayResize(overlayBlock,overlayImgItem);
    
                    overlay.querySelector('.overlay__text').textContent= img.getAttribute('data-text');
                    fadeIn(overlay, 100, 'block');
                });
            });
        }
        if(document.querySelector('.overlay-video-js')){
            overlayVideos.forEach(video=>{
                video.addEventListener('click',()=>{
                    overlayImgItem.querySelector('video').style.display = 'block';
                    /* overlayImgItem.querySelector('video source').src= video.getAttribute('data-src'); */
                    overlayImgItem.querySelector('video').play();
                    overlayImgItem.setAttribute('data-height', video.getAttribute('data-height'));
                    overlayBlock.setAttribute('data-ratio',video.offsetWidth/video.offsetHeight);
                    overlayResize(overlayBlock,overlayImgItem);
                    
                    overlay.querySelector('.overlay__text').textContent= video.getAttribute('data-text');
                    fadeIn(overlay, 100, 'block');
                });
            });
        }

        window.addEventListener('resize',()=>{
            overlayResize(overlayBlock,overlayImgItem);
        });
            
        closeElem.addEventListener('click',()=>{
            fadeOut(overlay,30);
            overlayImgItem.querySelector('img').style.display = 'none';
            overlayImgItem.querySelector('video').style.display = 'none';
            overlayImgItem.querySelector('video').pause();
        });
        overlay.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && (target.classList.contains('overlay') || target.classList.contains('overlay__block'))){
                fadeOut(overlay,30);
                overlayImgItem.querySelector('img').style.display = 'none';
                overlayImgItem.querySelector('video').style.display = 'none';
                overlayImgItem.querySelector('video').pause();
            }
        });
        document.addEventListener('keydown',(e)=>{
            if(overlay.style.opacity === '1' && e.code == 'Escape'){
               fadeOut(overlay,30);
               overlayImgItem.querySelector('img').style.display = 'none';
               overlayImgItem.querySelector('video').style.display = 'none';
               overlayImgItem.querySelector('video').pause();
            }
         });
    }
});

