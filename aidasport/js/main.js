'use strict';

window.addEventListener('DOMContentLoaded', () => {
  const burgerBtn = document.querySelector('.header__icon--burger');
  const mobileMenu = document.querySelector('.mobilemenu');
  const mobileMenuClose = document.querySelector('.mobilemenu__close');
  const subitems = document.querySelectorAll('.header__subitem');

  const closeSubmenus = (exceptItem) => {
    subitems.forEach((item) => {
      if (item === exceptItem) {
        return;
      }

      item.classList.remove('header__subitem--open');
      item.querySelector('.header__subtoggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  subitems.forEach((item) => {
    const toggle = item.querySelector('.header__subtoggle');

    if (!toggle) {
      return;
    }

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();

      const isOpen = item.classList.contains('header__subitem--open');

      closeSubmenus();

      if (!isOpen) {
        item.classList.add('header__subitem--open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    item.querySelectorAll('.header__submenu-link').forEach((link) => {
      link.addEventListener('click', () => {
        closeSubmenus();
      });
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header__subitem')) {
      closeSubmenus();
    }
  });

  if (typeof window.initCatalogTabs === 'function') {
    window.initCatalogTabs();
  }

  const formatProductPrice = (value) => `${value.toLocaleString('ru-RU')} ₽`;

  window.refreshProductCardPrices = function refreshProductCardPrices() {
    document.querySelectorAll('.product__card[data-price]').forEach((card) => {
      const price = Number(card.dataset.price);
      const sale = Number(card.dataset.sale || 0);
      const priceEl = card.querySelector('.product__price');
      const saleEl = card.querySelector('.product__sale');

      if (!priceEl || Number.isNaN(price)) {
        return;
      }

      if (sale > 0) {
        const salePrice = Math.round(price * (1 - sale / 100));

        if (saleEl) {
          saleEl.textContent = `-${sale}%`;
        }

        priceEl.innerHTML = `<span>${formatProductPrice(price)}</span>${formatProductPrice(salePrice)}`;
        return;
      }

      priceEl.textContent = formatProductPrice(price);
    });
  };

  if (typeof window.initCatalogPage === 'function') {
    window.initCatalogPage();
  }

  window.refreshProductCardPrices();

  const syncSwiperNavState = (swiper, prevEl, nextEl) => {
    if (!swiper || !prevEl || !nextEl) {
      return;
    }

    const rootStyles = getComputedStyle(document.documentElement);
    const activeColor = rootStyles.getPropertyValue('--dark').trim() || '#323232';
    const disabledColor = rootStyles.getPropertyValue('--line').trim() || '#c6c6c6';

    const updateState = () => {
      const isLocked = swiper.isLocked || prevEl.classList.contains('swiper-button-lock');
      const prevDisabled = isLocked || swiper.isBeginning;
      const nextDisabled = isLocked || swiper.isEnd;

      prevEl.style.background = prevDisabled ? disabledColor : activeColor;
      nextEl.style.background = nextDisabled ? disabledColor : activeColor;

      prevEl.setAttribute('aria-disabled', prevDisabled ? 'true' : 'false');
      nextEl.setAttribute('aria-disabled', nextDisabled ? 'true' : 'false');
    };

    updateState();
    swiper.on('init', updateState);
    swiper.on('slideChange', updateState);
    swiper.on('lock', updateState);
    swiper.on('unlock', updateState);
    swiper.on('reachBeginning', updateState);
    swiper.on('reachEnd', updateState);
    swiper.on('fromEdge', updateState);
    swiper.on('resize', updateState);
  };

  if (burgerBtn && mobileMenu && mobileMenuClose) {
    const openMenu = () => {
      mobileMenu.classList.add('mobilemenu--open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('mobilemenu--open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    burgerBtn.addEventListener('click', openMenu);
    mobileMenuClose.addEventListener('click', closeMenu);

    mobileMenu.addEventListener('click', (event) => {
      if (event.target === mobileMenu) {
        closeMenu();
      }
    });
  }

  const modals = document.querySelectorAll('.modal');
  let openedModal = null;

  const closeModal = () => {
    if (!openedModal) {
      return;
    }

    openedModal.classList.remove('modal--open');
    openedModal.setAttribute('aria-hidden', 'true');
    openedModal = null;
    document.body.style.overflow = '';
  };

  const openModal = (modal) => {
    if (!modal) {
      return;
    }

    closeModal();
    openedModal = modal;
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__dialog')?.focus();
  };

  document.querySelectorAll('[data-modal-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      openModal(document.getElementById(trigger.dataset.modalOpen));
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    modal.querySelectorAll('[data-modal-close]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  const heroSlider = document.querySelector('.hero__slider');
  if (heroSlider && typeof Swiper !== 'undefined') {
    new Swiper('.hero__slider', {
      wrapperClass: 'hero__swiperwrapper',
      slideClass: 'hero__swiperslide',
      loop: true,
      speed: 600,
      allowTouchMove: false,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.hero__swiperpagination',
        bulletClass: 'hero__swiperpaginationbullet',
        bulletActiveClass: 'hero__swiperpaginationbullet--active',
        clickable: true,
      },
    });
  }

  const corporateSlider = document.querySelector('.corporate__slider');
  if (
    corporateSlider &&
    typeof Swiper !== 'undefined' &&
    window.matchMedia('(max-width: 767.98px)').matches
  ) {
    const corporateSwiper = new Swiper('.corporate__slider', {
      wrapperClass: 'corporate__swiperwrapper',
      slideClass: 'corporate__swiperslide',
      slidesPerView: 1,
      centeredSlides: true,
      spaceBetween: 0,
      navigation: {
        prevEl: '.corporate__swiperprev',
        nextEl: '.corporate__swipernext',
      },
    });

    syncSwiperNavState(
      corporateSwiper,
      document.querySelector('.corporate__swiperprev'),
      document.querySelector('.corporate__swipernext'),
    );
  }

  document.querySelectorAll('.product__cart').forEach((button) => {
    const icon = button.querySelector('img');

    if (!icon) {
      return;
    }

    const defaultSrc = './images/icons/shopping-bag-add.svg';
    const addedSrc = './images/icons/shopping-bag-added.svg';

    button.addEventListener('click', () => {
      const isAdded = button.classList.toggle('product__cart--added');
      icon.src = isAdded ? addedSrc : defaultSrc;
      button.setAttribute('aria-label', isAdded ? 'В корзине' : 'В корзину');
    });
  });

  document.querySelectorAll('.showcase').forEach((section) => {
    const slider = section.querySelector('.showcase__slider');

    if (!slider || typeof Swiper === 'undefined') {
      return;
    }

    const showcaseSwiper = new Swiper(slider, {
      wrapperClass: 'showcase__swiperwrapper',
      slideClass: 'showcase__swiperslide',
      slidesPerView: 1,
      spaceBetween: 6,
      navigation: {
        prevEl: section.querySelector('.showcase__swiperprev'),
        nextEl: section.querySelector('.showcase__swipernext'),
      },
      breakpoints: {
        356: {
          slidesPerView: 2,
          spaceBetween: 6,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 8,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 12,
        },
      },
    });

    syncSwiperNavState(
      showcaseSwiper,
      section.querySelector('.showcase__swiperprev'),
      section.querySelector('.showcase__swipernext'),
    );
  });

  document.querySelectorAll('.familylook').forEach((section) => {
    const slider = section.querySelector('.familylook__slider');

    if (!slider || typeof Swiper === 'undefined') {
      return;
    }

    const familylookSwiper = new Swiper(slider, {
      wrapperClass: 'familylook__swiperwrapper',
      slideClass: 'familylook__swiperslide',
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        prevEl: section.querySelector('.familylook__swiperprev'),
        nextEl: section.querySelector('.familylook__swipernext'),
      },
      pagination: {
        el: section.querySelector('.familylook__swiperpagination'),
        bulletClass: 'familylook__swiperpaginationbullet',
        bulletActiveClass: 'familylook__swiperpaginationbullet--active',
        clickable: true,
      },
    });

    syncSwiperNavState(
      familylookSwiper,
      section.querySelector('.familylook__swiperprev'),
      section.querySelector('.familylook__swipernext'),
    );
  });

  const corpCases = document.querySelector('.corp__cases');

  if (corpCases && typeof Swiper !== 'undefined') {
    const imageSlider = corpCases.querySelector('.corp__casesimageslider');
    const prevEl = corpCases.querySelector('.corp__casesprev');
    const nextEl = corpCases.querySelector('.corp__casesnext');

    if (imageSlider) {
      let imageSwiper = null;

      const updateCasesNav = () => {
        if (!imageSwiper) {
          return;
        }

        if (prevEl) {
          prevEl.setAttribute('aria-disabled', imageSwiper.isBeginning ? 'true' : 'false');
        }

        if (nextEl) {
          nextEl.setAttribute('aria-disabled', imageSwiper.isEnd ? 'true' : 'false');
        }
      };

      const updateCasesSwiper = () => {
        if (!imageSwiper) {
          return;
        }

        imageSwiper.update();
        updateCasesNav();
      };

      const initCasesSwiper = () => {
        if (imageSlider.offsetWidth === 0) {
          requestAnimationFrame(initCasesSwiper);
          return;
        }

        if (imageSwiper) {
          updateCasesSwiper();
          return;
        }

        imageSwiper = new Swiper(imageSlider, {
          wrapperClass: 'corp__casesimageswiperwrapper',
          slideClass: 'corp__casesimageswiperslide',
          slidesPerView: 1,
          speed: 500,
          allowTouchMove: false,
          observer: true,
          observeParents: true,
          resizeObserver: true,
          watchOverflow: true,
          navigation: {
            prevEl,
            nextEl,
          },
          pagination: {
            el: corpCases.querySelector('.corp__casesimageswiperpagination'),
            bulletClass: 'corp__casesimageswiperpaginationbullet',
            bulletActiveClass: 'corp__casesimageswiperpaginationbullet--active',
            clickable: true,
          },
          on: {
            init: updateCasesNav,
            resize: updateCasesNav,
            slideChange: updateCasesNav,
          },
        });

        updateCasesSwiper();
      };

      initCasesSwiper();
      window.addEventListener('load', updateCasesSwiper);
      window.addEventListener('resize', updateCasesSwiper);
    }
  }

  const brandGallery = document.querySelector('.brand__gallery');

  if (brandGallery && typeof Swiper !== 'undefined') {
    const gallerySlider = brandGallery.querySelector('.brand__slider');
    const galleryPrev = brandGallery.querySelector('.brand__galleryprev');
    const galleryNext = brandGallery.querySelector('.brand__gallerynext');

    if (gallerySlider) {
      const gallerySwiper = new Swiper(gallerySlider, {
        wrapperClass: 'brand__swiperwrapper',
        slideClass: 'brand__swiperslide',
        slidesPerView: 'auto',
        centeredSlides: true,
        centerInsufficientSlides: true,
        slideToClickedSlide: true,
        spaceBetween: 24,
        loop: true,
        loopAdditionalSlides: 2,
        speed: 400,
        navigation: {
          prevEl: galleryPrev,
          nextEl: galleryNext,
        },
        breakpoints: {
          0: {
            spaceBetween: 16,
          },
          768: {
            spaceBetween: 24,
          },
        },
      });

    }
  }

  const corpForm = document.querySelector('.corp__formright');

  if (corpForm) {
    const fileInput = corpForm.querySelector('.corp__formfileinput');
    const fileNameEl = corpForm.querySelector('.corp__formfilename');

    if (fileInput && fileNameEl) {
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];

        if (file) {
          fileNameEl.textContent = file.name;
          fileNameEl.hidden = false;
          return;
        }

        fileNameEl.textContent = '';
        fileNameEl.hidden = true;
      });
    }
  }

  const productpage = document.querySelector('.productpage');

  if (productpage) {
    const mainImage = productpage.querySelector('.productpage__main img');
    const thumbs = productpage.querySelectorAll('.productpage__thumb');
    const colors = productpage.querySelectorAll('.productpage__color');

    const getImagePath = (url) => {
      if (!url) {
        return '';
      }

      try {
        return new URL(url, window.location.href).pathname;
      } catch {
        return url;
      }
    };

    const setActiveThumb = (targetSrc) => {
      const targetPath = getImagePath(targetSrc);

      thumbs.forEach((item) => {
        const isActive = getImagePath(item.dataset.image) === targetPath;

        item.classList.toggle('productpage__thumb--active', isActive);
        item.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const nextSrc = thumb.dataset.image;

        if (!mainImage || !nextSrc) {
          return;
        }

        mainImage.setAttribute('src', nextSrc);
        setActiveThumb(nextSrc);
      });
    });

    if (mainImage) {
      setActiveThumb(mainImage.getAttribute('src'));
    }

    colors.forEach((color) => {
      color.addEventListener('click', () => {
        colors.forEach((item) => {
          item.classList.remove('productpage__color--active');
          item.setAttribute('aria-pressed', 'false');
        });
        color.classList.add('productpage__color--active');
        color.setAttribute('aria-pressed', 'true');
      });
    });

    const addButton = productpage.querySelector('.productpage__add');

    if (addButton) {
      const defaultText = 'Добавить в корзину';
      const addedText = 'Добавлено';

      addButton.addEventListener('click', () => {
        const isAdded = addButton.classList.toggle('productpage__add--added');

        addButton.textContent = isAdded ? addedText : defaultText;
        addButton.setAttribute('aria-pressed', isAdded ? 'true' : 'false');
      });
    }
  }

  const faqItems = document.querySelectorAll('.questions__item');

  faqItems.forEach((item) => {
    const toggle = item.querySelector('.questions__toggle');
    const answer = item.querySelector('.questions__answer');

    if (!toggle || !answer) {
      return;
    }

    toggle.addEventListener('click', () => {
      const isActive = item.classList.contains('questions__item--active');

      faqItems.forEach((otherItem) => {
        otherItem.classList.remove('questions__item--active');
        otherItem.querySelector('.questions__toggle')?.setAttribute('aria-expanded', 'false');
        otherItem.querySelector('.questions__answer')?.setAttribute('hidden', '');
      });

      if (!isActive) {
        item.classList.add('questions__item--active');
        toggle.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });
  });
});
