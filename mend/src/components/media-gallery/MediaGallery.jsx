import styles from './MediaGallery.module.scss';
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import poster2024 from '../../assets/img/gallery/poster2024.webp';
import poster2025 from '../../assets/img/gallery/poster2025.webp';

const YEAR_POSTERS = {
  2025: poster2025,
  2024: poster2024,
};

const YEARS_DATA = [
  {
    year: 2025,
    title: 'Гонка Героев — 2025. Битва эпох: Часть 2',
    description:
      'Масштабное спортивное событие собрало 13 000 гостей, из которых 3 300 вышли на старт. Менделеевск — единственный малый город в России, принимающий «Гонку Героев», — сравнялся с крупными столицами по числу участников и превзошел остальные города страны по длине трассы. В 2025 году протяженность трассы составила рекордные 12 километров. На маршруте расположили 41 препятствие — больше, чем в любом другом городе России. Впервые участие приняли команды стран БРИКС. Концепция «Гонки Героев» стала продолжением «Битвы эпох» и собрала беспрецедентное количество костюмированных взводов. В этом году выступили «Прогульщики», «ПРОСТОР», «Жан Клод Ван Гог», а после окончания все могли спеть песни под акустическую гитару с Тимуром Валеевым.',
    video: 'https://heroleague.ru/video/mend2025.mp4',
    photosCount: 52,
  },
  {
    year: 2024,
    title: 'Гонка Героев — 2024. Битва эпох: Часть 1',
    description:
      '«Гонка Героев» в Менделеевске в 2024 году прошла под слоганом «От невозможного к реальности». Впервые спортивное событие стало тематическим — в стиле «Битвы эпох». Участников ждали почти 40 препятствий, большая часть из которых традиционно была связана с водными испытаниями. В 2024 году мероприятие впервые прошло при поддержке Министерства спорта Республики Татарстан: в рамках «Гонки Героев» состоялся первый Чемпионат Республики Татарстан по гонкам с препятствиями. Событие приобрело международный масштаб — участие приняли команды из стран СНГ, Южной Кореи и Китая, партнеры химического комплекса «Аммоний», который ежегодно выступает инициатором проведения «Гонки Героев» в Менделеевске. Вечер украсили кавер-группа «Краш» из Набережных Челнов, Казанские коллективы «PROSTOЯ», «Lazy Days Band». Хедлайнер вечера - коллектив из Москвы «Трибьют «Король и Шут».',
    video: 'https://heroleague.ru/video/mend2024.mp4',
    photosCount: 53,
  },
  {
    year: 2023,
    title: 'Гонка Героев — 2023',
    description:
      'Классическая «Гонка Героев» с усложненной трассой: количество препятствий увеличилось до 34, а «рукоходы» заменили водными испытаниями. К победе участники прорывались через искусственные озера, болота, дымовые завесы, пролезали под колючей проволокой — и всё это в сопровождении звуковых эффектов и с ящиками патронов наперевес. Эти элементы стали отличительной особенностью «Гонки Героев». Впервые появился мотокемпинг для участников и гостей, желающих переночевать в палатках и автодомах.',
    video: 'https://heroleague.ru/video/mend2023.mp4',
    photosCount: 53,
  },
  {
    year: 2022,
    title: 'Гонка Героев — 2022',
    description:
      'Самое масштабное командообразующее мероприятие, которое собрало сотни представителей различных компаний, в том числе команды предприятий ГК «Азот». Классическая трасса с самыми зрелищными испытаниями.',
    video: 'https://heroleague.ru/video/mend2022.mp4',
    photosCount: 30,
  },
];

const PREVIEW_COUNT = 12;
const PRELOAD_AHEAD = 2;

function getPhotoUrl(year, index) {
  return `https://heroleague.ru/pictures/mend/${year}/photo${index}.webp`;
}

function getThumbUrl(year, index) {
  return `https://heroleague.ru/pictures/mend/${year}/thumb/photo${index}.webp`;
}

function LazyThumb({ thumbSrc, alt, onClick, ariaLabel, priority }) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      className={`${styles.thumb} ${loaded ? styles.thumbReady : ''}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {!loaded && <div className={styles.thumbShimmer} />}

      {inView && (
        <img
          className={styles.thumbImg}
          src={thumbSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          draggable={false}
          onLoad={() => setLoaded(true)}
        />
      )}
    </button>
  );
}

function VideoPoster({ videoRef, videoSrc, thumbSrc, posterSrc, year }) {
  const [playing, setPlaying] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  };

  return (
    <div className={styles.videoWrap}>
      <video
        ref={videoRef}
        className={`${styles.video} ${!playing ? styles.videoHidden : ''}`}
        controls
        playsInline
        preload="none"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {!playing && (
        <button
          className={styles.videoPoster}
          onClick={handlePlay}
          aria-label="Воспроизвести видео"
        >
          <img
            className={styles.videoPosterThumb}
            src={thumbSrc}
            alt=""
            aria-hidden="true"
          />
          <img
            className={`${styles.videoPosterFull} ${posterLoaded ? styles.videoPosterFullVisible : ''}`}
            src={posterSrc}
            alt={`Видео Гонки Героев ${year}`}
            onLoad={() => setPosterLoaded(true)}
          />
          <span className={styles.videoPlayBtn} aria-hidden="true">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
              <path d="M19 15l14 9-14 9V15z" fill="#fff" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

function MediaGallery() {
  const [activeYear, setActiveYear] = useState(2025);
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const videoRef = useRef(null);

  const yearData = YEARS_DATA.find((y) => y.year === activeYear);
  const photos = useMemo(() => {
    const regularPhotos = Array.from({ length: yearData.photosCount }, (_, i) => ({
      full: getPhotoUrl(yearData.year, i + 1),
      thumb: getThumbUrl(yearData.year, i + 1),
      label: String(i + 1),
    }));

    const poster = YEAR_POSTERS[yearData.year];
    if (poster) {
      return [{ full: poster, thumb: poster, label: 'poster' }, ...regularPhotos];
    }

    return regularPhotos;
  }, [yearData.year, yearData.photosCount]);

  const visiblePhotos = expanded ? photos : photos.slice(0, PREVIEW_COUNT);
  const hasMore = photos.length > PREVIEW_COUNT;
  const remainingCount = photos.length - PREVIEW_COUNT;
  const [lightboxLoaded, setLightboxLoaded] = useState(false);

  const handleYearChange = (year) => {
    setActiveYear(year);
    setExpanded(false);
    setLightboxIndex(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxLoaded(false);
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxLoaded(false);
    setTouchDelta(0);
  };

  const goPrev = useCallback(() => {
    setLightboxLoaded(false);
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goNext = useCallback(() => {
    setLightboxLoaded(false);
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;

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
  }, [lightboxIndex, goPrev, goNext]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const links = [];
    for (let offset = 1; offset <= PRELOAD_AHEAD; offset++) {
      const nextIdx = (lightboxIndex + offset) % photos.length;
      const prevIdx = (lightboxIndex - offset + photos.length) % photos.length;
      [photos[nextIdx], photos[prevIdx]].forEach((photo) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.type = 'image/webp';
        link.href = photo.full;
        document.head.appendChild(link);
        links.push(link);

        new Image().src = photo.thumb;
      });
    }

    return () => links.forEach((l) => l.remove());
  }, [lightboxIndex, photos]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  return (
    <section className={styles.section} id="media">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Как это было</span>
          <h2 className={styles.title}>Видео и фото</h2>
        </div>

        <div className={styles.tabs}>
          {YEARS_DATA.map(({ year }) => (
            <button
              key={year}
              className={`${styles.tab} ${activeYear === year ? styles.tabActive : ''}`}
              onClick={() => handleYearChange(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className={styles.yearIntro}>
          <h3 className={styles.yearTitle}>{yearData.title}</h3>
          <p className={styles.yearDescription}>{yearData.description}</p>
        </div>

        {yearData.video && (
          <VideoPoster
            key={activeYear}
            videoRef={videoRef}
            videoSrc={yearData.video}
            thumbSrc={getThumbUrl(yearData.year, 1)}
            posterSrc={getPhotoUrl(yearData.year, 1)}
            year={activeYear}
          />
        )}

        <div className={styles.gallery}>
          {visiblePhotos.map((photo, i) => (
            <LazyThumb
              key={`${activeYear}-${photo.label}`}
              thumbSrc={photo.thumb}
              alt={
                photo.label === 'poster'
                  ? `Гонка Героев ${activeYear}, рекламный постер`
                  : `Гонка Героев ${activeYear}, фото ${photo.label}`
              }
              onClick={() => openLightbox(i)}
              ariaLabel={photo.label === 'poster' ? 'Постер' : `Фото ${photo.label}`}
              priority={i < 6}
            />
          ))}

          {!expanded && hasMore && (
            <button
              className={styles.showMore}
              onClick={() => setExpanded(true)}
            >
              <span className={styles.showMoreIcon}>+{remainingCount}</span>
              <span className={styles.showMoreText}>Все фото</span>
            </button>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className={styles.lightbox}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фото"
        >
          <button
            className={styles.lightboxClose}
            onClick={closeLightbox}
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <button
            className={`${styles.lightboxArrow} ${styles.lightboxPrev}`}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Предыдущее фото"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div
            className={`${styles.lightboxImageWrap} ${!lightboxLoaded ? styles.lightboxImageWrapLoading : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: touchDelta ? `translateX(${touchDelta}px)` : undefined,
              transition: touchDelta ? 'none' : undefined,
            }}
          >
            {!lightboxLoaded && (
              <>
                <img
                  className={styles.lightboxPreview}
                  src={photos[lightboxIndex].thumb}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
                <div className={styles.lightboxSpinner} aria-hidden="true">
                  <svg viewBox="0 0 44 44" width="44" height="44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="90 60" strokeLinecap="round" />
                  </svg>
                </div>
              </>
            )}
            <img
              className={`${styles.lightboxImage} ${lightboxLoaded ? styles.lightboxImageVisible : ''}`}
              src={photos[lightboxIndex].full}
              alt={
                photos[lightboxIndex].label === 'poster'
                  ? `Гонка Героев ${activeYear}, рекламный постер`
                  : `Гонка Героев ${activeYear}, фото ${photos[lightboxIndex].label}`
              }
              draggable={false}
              onLoad={() => setLightboxLoaded(true)}
            />
          </div>

          <button
            className={`${styles.lightboxArrow} ${styles.lightboxNext}`}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Следующее фото"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          <div className={styles.lightboxCounter}>
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </section>
  );
}

export default MediaGallery;
