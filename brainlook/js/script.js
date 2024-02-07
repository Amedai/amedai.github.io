/* let svgElement = document.getElementById('el');
bbox = svgElement.getBBox();
 
console.log( bbox.x ) ;
console.log( bbox.y ) ;
console.log( bbox.width ) ;  
console.log( bbox.height ) ; */

const swiper = new Swiper('.about__slider', {
  // Optional parameters
  loop: true,
  spaceBetween: 30,
  autoplay: {
    reverseDirection:true,
    delay: 1,
    pauseOnMouseEnter:true,
    disableOnInteraction: false
  },
  speed:3000,
  slidesPerView: 2.5,
});
const swiper1 = new Swiper('.about__slider1', {
  // Optional parameters
  loop: true,
  spaceBetween: 30,
  autoplay: {
    reverseDirection:true,
    delay: 1,
    pauseOnMouseEnter:true,
    disableOnInteraction: false
  },
  speed:2650,
  slidesPerView: 2,
});
const swiper2 = new Swiper('.about__slider2', {
  // Optional parameters
  loop: true,
  spaceBetween: 30,
  autoplay: {
    reverseDirection:true,
    delay: 1,
    pauseOnMouseEnter:true,
    disableOnInteraction: false
  },
  speed:3000,
  slidesPerView: 1.53,
});
const caseSwiper = new Swiper('.case__slider', {
  // Optional parameters
  loop: true,
  spaceBetween: 50,
  autoplay: {
    delay: 5000,
    pauseOnMouseEnter:true,
    disableOnInteraction: false
  },
  speed:2000,
  slidesPerView: 3.29,
  scrollbar: {
    el: '.swiper-scrollbar',
    dragSize:200,
    snapOnRelease: true
  },
});

const serviceItem = document.querySelectorAll('.service__item');
const slider = document.querySelector('.case__slider').querySelectorAll('.case__slider-slide');

slider.forEach(item =>{
  item.addEventListener('click', (e)=>{
      sliderTarget = e.currentTarget;
      
      slider.forEach(item =>{
        item.classList.remove('swiper-slide-active');
      });
      sliderTarget.classList.add('swiper-slide-active');
  });
});

serviceItem.forEach(item =>{
  item.addEventListener('click', (e)=>{
    itemTarget = e.currentTarget;
    serviceItem.forEach(item =>{
      item.querySelector('.service__block-link').style.cssText = 'display: none';
      item.querySelector('.service__block').style.cssText = 'background-color: var(--text-white-main)';
    });
    itemTarget.querySelector('.service__block-link').style.cssText = 'display: block';
    itemTarget.querySelector('.service__block').style.cssText = 'background-color: var(--text-green)';
  });
});

//validate
$(document).ready(function(){
  function validateForms(form){
      $(form).validate({
          rules: {
              name: {
                  required: true,
                  minlength: 2
              },
              phone: {
                required:true
              },
              services:{
                required:true

              }
          },
          messages: {
              name: {
                  required: "Пожалуйста, введите свое имя",
                  minlength: jQuery.validator.format("Введите {0} символа!")
              },
              phone:{
                required:"Пожалуйста, введите свой телефон"
              },
              services:{
                required: "Пожалуйста, выберите услугу"
              }
          }
      });
  };
  validateForms('.bid__form');
});