'use strict';
window.addEventListener('DOMContentLoaded',()=>{
    //наведение мыши на картинку
    const images = document.querySelectorAll('.hover-js img');
    images.forEach(img=>{
        img.addEventListener('mouseenter',()=>{
            img.src=img.getAttribute('data-hover-src');
        });
        img.addEventListener('mouseleave',()=>{
            img.src=img.getAttribute('data-src');
        });
    });
    const videos = document.querySelectorAll('.hover-video-js');
    videos.forEach(video=>{
        video.addEventListener('mouseenter',()=>{
            video.querySelector('video').style.display = 'block';
            video.querySelector('video').play();
            video.querySelector('img').style.display = 'none';
        });
        video.addEventListener('mouseleave',()=>{
            video.querySelector('img').style.display = 'block';
            video.querySelector('video').style.display = 'none';
            video.querySelector('video').pause();
        });
    });

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
    const overlayImages = document.querySelectorAll('.overlay-js img'),
            overlayVideos = document.querySelectorAll('.overlay-video-js video'),
            overlayImgItem = document.querySelector('.overlay__img'),
            overlay = document.querySelector('.overlay'),
            overlayBlock = overlay.querySelector('.overlay__block'),
            closeElem = overlay.querySelector('.overlay__close');
    
        overlayImages.forEach(img=>{
            img.addEventListener('click',()=>{
                overlayImgItem.querySelector('img').style.display = 'block';
                overlayImgItem.querySelector('img').src= img.getAttribute('data-src');
                if(window.screen.width>= 1201){
                    overlayBlock.style.width = (img.offsetWidth/img.offsetHeight * 600) +'px';
                    overlayImgItem.style.width = (img.offsetWidth/img.offsetHeight * 600) +'px';
                }else if(window.screen.width>= 769){
                    overlayBlock.style.width = (img.offsetWidth/img.offsetHeight * 406) +'px';
                    overlayImgItem.style.width = (img.offsetWidth/img.offsetHeight * 406) +'px';
                }else if(window.screen.width>= 320){
                    if(img.parentElement.parentElement.classList.contains('portfolio__img_lg-height')){
                        overlayBlock.style.width = (img.offsetWidth-100) + 'px';
                        overlayImgItem.style.width = (img.offsetWidth-100) + 'px';
                        overlayImgItem.style.height = (img.offsetHeight-100) + 'px';
                    }else{
                        overlayBlock.style.width = img.offsetWidth + 'px';
                        overlayImgItem.style.width = img.offsetWidth + 'px';
                        overlayImgItem.style.height = img.offsetHeight + 'px';
                    }
                }

                overlay.querySelector('.overlay__text').textContent= img.getAttribute('data-text');
                fadeIn(overlay, 100, 'block');
            });
        });
        overlayVideos.forEach(video=>{
            video.addEventListener('click',()=>{
                overlayImgItem.querySelector('video').style.display = 'block';
                /* overlayImgItem.querySelector('video source').src= video.getAttribute('data-src'); */
                overlayImgItem.querySelector('video').play();
                if(window.screen.width>= 1201){
                    overlayBlock.style.width = (video.offsetWidth/video.offsetHeight * 600) +'px';
                    overlayImgItem.style.width = (video.offsetWidth/video.offsetHeight * 600) +'px';
                }else if(window.screen.width>= 769){
                    overlayBlock.style.width = (video.offsetWidth/video.offsetHeight * 406) +'px';
                    overlayImgItem.style.width = (video.offsetWidth/video.offsetHeight * 406) +'px';
                }else if(window.screen.width>= 320){
                    if(video.parentElement.classList.contains('portfolio__img_lg-height')){
                        overlayBlock.style.width = (video.offsetWidth-100) + 'px';
                        overlayImgItem.style.width = (video.offsetWidth-100) + 'px';
                        overlayImgItem.style.height = (video.offsetHeight-100) + 'px';
                    }else{
                        overlayBlock.style.width = video.offsetWidth + 'px';
                        overlayImgItem.style.width = video.offsetWidth + 'px';
                        overlayImgItem.style.height = video.offsetHeight + 'px';
                    }
                }
                overlay.querySelector('.overlay__text').textContent= video.getAttribute('data-text');
                fadeIn(overlay, 100, 'block');
            });
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
});

