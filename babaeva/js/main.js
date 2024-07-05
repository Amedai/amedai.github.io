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

    function overlayResize(overlayBlock,overlayImgItem){
        function calcSizeFromHeight(heightVar){
            overlayImgItem.style.height = heightVar + 'px';
            overlayBlock.style.width = (ratio * heightVar) +'px';
            overlayImgItem.style.width = (ratio * heightVar) +'px';
        }
        function calcSizeFromWidth(widthVar){
            overlayImgItem.style.height = widthVar/ratio + 'px';
            overlayBlock.style.width = widthVar + 'px';
            overlayImgItem.style.width = widthVar + 'px';
        }
        let height,width;
        const ratio = overlayBlock.getAttribute('data-ratio');
        if(window.innerWidth>= 1201){
            height = window.innerHeight - 215;
            calcSizeFromHeight(height);
        }else if(window.innerWidth>= 320){
            switch(overlayImgItem.getAttribute('data-height')){
                case 'sm':
                    if(window.innerWidth/window.innerHeight >= 600/380){
                        height = window.innerHeight - 100;
                        calcSizeFromHeight(height);
                    }else{
                        width = window.innerWidth-50;
                        calcSizeFromWidth(width);
                    }
                    break;
                case 'md':
                    if(window.innerWidth/window.innerHeight >= 600/640){
                        height = window.innerHeight - 100;
                        calcSizeFromHeight(height);
                    }else{
                        width = window.innerWidth-50;
                        calcSizeFromWidth(width);
                    }
                    break;
                case 'lg':
                    if(window.innerWidth/window.innerHeight >= 600/790){
                        height = window.innerHeight - 100;
                        calcSizeFromHeight(height);
                    }else{
                        width = window.innerWidth - 50;
                        calcSizeFromWidth(width);
                    }
                    break;
                case 'slg':
                    if(window.innerWidth/window.innerHeight >= 1230/860){
                        height = window.innerHeight - 100;
                        calcSizeFromHeight(height);
                    }else{
                        width = window.innerWidth - 50;
                        calcSizeFromWidth(width);
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

