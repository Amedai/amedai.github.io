import { useCallback, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './Reviews.module.scss';

import review1 from '../../assets/img/review/review1.webp';
import review2 from '../../assets/img/review/review2.webp';
import review3 from '../../assets/img/review/review3.webp';
import review4 from '../../assets/img/review/review4.webp';

const REVIEWS = [
  { id: 1, src: review1, alt: 'Отзывы участников из Telegram, скриншот 1' },
  { id: 2, src: review2, alt: 'Отзывы участников из Telegram, скриншот 2' },
  { id: 3, src: review3, alt: 'Отзывы участников из Telegram, скриншот 3' },
  { id: 4, src: review4, alt: 'Отзывы участников из Telegram, скриншот 4' },
];

function Reviews() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [navReady, setNavReady] = useState(false);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + REVIEWS.length) % REVIEWS.length));
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % REVIEWS.length));
  }, []);

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;

    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  return (
    <section className={styles.section} id="reviews">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Отзывы</h2>
          <p className={styles.lead}>
            Что пишут участники и&nbsp;гости после «Гонки Героев» в&nbsp;Менделеевске
          </p>
        </div>

        <div className={styles.viewport}>
          {navReady && (
            <Swiper
              className={styles.swiper}
              modules={[Navigation, Pagination, A11y]}
              onBeforeInit={(swiper) => {
                const nav = swiper.params.navigation;
                const pag = swiper.params.pagination;
                if (nav && typeof nav !== 'boolean') {
                  nav.prevEl = prevRef.current;
                  nav.nextEl = nextRef.current;
                }
                if (pag && typeof pag !== 'boolean') {
                  pag.el = paginationRef.current;
                }
              }}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              pagination={{
                el: paginationRef.current,
                clickable: true,
              }}
              spaceBetween={12}
              slidesPerView={1}
              speed={400}
              grabCursor
              watchOverflow
              breakpoints={{
                600: {
                  slidesPerView: 1.25,
                  spaceBetween: 16,
                  centeredSlides: true,
                },
                900: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                  centeredSlides: false,
                },
                1200: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                  centeredSlides: false,
                },
              }}
            >
              {REVIEWS.map((review, index) => (
                <SwiperSlide key={review.id} className={styles.slide}>
                  <button
                    type="button"
                    className={styles.card}
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Открыть отзыв ${index + 1}`}
                  >
                    <span className={styles.cardMedia}>
                      <img
                        src={review.src}
                        alt={review.alt}
                        className={styles.cardImg}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        <div className={styles.controls}>
          <button
            ref={prevRef}
            type="button"
            className={styles.navBtn}
            aria-label="Предыдущий отзыв"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div ref={paginationRef} className={styles.pagination} />

          <button
            ref={nextRef}
            type="button"
            className={styles.navBtn}
            aria-label="Следующий отзыв"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр отзыва"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Предыдущий отзыв"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className={styles.lightboxFrame} onClick={(e) => e.stopPropagation()}>
            <img
              className={styles.lightboxImage}
              src={REVIEWS[lightboxIndex].src}
              alt={REVIEWS[lightboxIndex].alt}
              draggable={false}
            />
          </div>

          <button
            type="button"
            className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Следующий отзыв"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className={styles.lightboxCounter}>
            {lightboxIndex + 1} / {REVIEWS.length}
          </div>
        </div>
      )}
    </section>
  );
}

export default Reviews;
