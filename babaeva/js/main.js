'use strict';
window.addEventListener('DOMContentLoaded',()=>{
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
    function overlayResize(){
        const ratio = overlayBlock.getAttribute('data-ratio');
        if(window.innerWidth>= 1201){
            overlayImgItem.style.height = 600 + 'px';
            overlayBlock.style.width = (ratio * 600) +'px';
            overlayImgItem.style.width = (ratio * 600) +'px';
        }else if(window.innerWidth>= 769){
            overlayImgItem.style.height = 406 + 'px';
            overlayBlock.style.width = (ratio * 406) +'px';
            overlayImgItem.style.width = (ratio * 406) +'px';
        }else if(window.innerWidth>= 320){
            overlayImgItem.style.height = 320/ratio + 'px';
            overlayBlock.style.width = 320 + 'px';
            overlayImgItem.style.width = 320 + 'px';
        }
    }
    const overlayImages = document.querySelectorAll('.overlay-js img'),
            overlayVideos = document.querySelectorAll('.overlay-video-js video'),
            overlayImgItem = document.querySelector('.overlay__img'),
            overlay = document.querySelector('.overlay'),
            overlayBlock = overlay.querySelector('.overlay__block'),
            closeElem = overlay.querySelector('.overlay__close');

    if(document.querySelector('.overlay')){
        if(document.querySelector('.overlay-js')){
            overlayImages.forEach(img=>{
                img.addEventListener('click',()=>{
                    overlayImgItem.querySelector('img').style.display = 'block';
                    overlayImgItem.querySelector('img').src= img.getAttribute('data-src');
                    overlayBlock.setAttribute('data-ratio',img.offsetWidth/img.offsetHeight);
                    overlayResize();
    
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
                    overlayBlock.setAttribute('data-ratio',video.offsetWidth/video.offsetHeight);
                    overlayResize();
                    
                    overlay.querySelector('.overlay__text').textContent= video.getAttribute('data-text');
                    fadeIn(overlay, 100, 'block');
                });
            });
        }

        window.addEventListener('resize',()=>{
            overlayResize();
        });
            
        closeElem.addEventListener('click',()=>{
            fadeOut(overlay,30);
            overlayImgItem.querySelector('img').style.display = 'none';
            overlayImgItem.querySelector('video').style.display = 'none';
            overlayImgItem.querySelector('video').pause();
        });
        overlay.addEventListener('click', (e)=>{
            const target = e.target;
            if(target && target.classList.contains('overlay')){
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

