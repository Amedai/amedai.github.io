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
            overlayImgItem = document.querySelector('.overlay__img'),
            overlay = document.querySelector('.overlay'),
            closeElem = overlay.querySelector('.overlay__close');
    
        overlayImages.forEach(img=>{
        img.addEventListener('click',()=>{
            overlayImgItem.querySelector('img').src= img.getAttribute('data-src');
            if(window.screen.width>= 1300){
                overlayImgItem.style.width = (img.offsetWidth/img.offsetHeight * 780) +'px';
            }else if(window.screen.width>= 750){
                overlayImgItem.style.width = (img.offsetWidth/img.offsetHeight * 406) +'px';
            }else if(window.screen.width>= 320){
                overlayImgItem.style.width = img.offsetWidth + 'px';
                overlayImgItem.style.height = img.offsetHeight + 'px';
            }

            overlay.querySelector('.overlay__text').textContent= img.getAttribute('data-text');
            fadeIn(overlay, 100, 'block');
        });
    });
    closeElem.addEventListener('click',()=>{
        fadeOut(overlay,30);
    });
    overlay.addEventListener('click', (e)=>{
        const target = e.target;
        if(target && target.classList.contains('overlay')){
            fadeOut(overlay,30);
        }
    });
    document.addEventListener('keydown',(e)=>{
        if(overlay.style.opacity === '1' && e.code == 'Escape'){
           fadeOut(overlay,30);
        }
     });
});

