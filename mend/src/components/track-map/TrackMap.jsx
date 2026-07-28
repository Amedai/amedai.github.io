import styles from './TrackMap.module.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api, { HERO_API } from '../../api';
import { getSelectedCity } from '../../store/app/selectors';
import cactusA from '../../assets/img/hero/Vector-0.svg';
import cactusB from '../../assets/img/hero/Vector-1.svg';
import mexicoSign from '../../assets/img/hero/Vector-2.svg';
import biker from '../../assets/img/hero/Vector-3.svg';
import skull from '../../assets/img/hero/Vector-5.svg';
import sombrero from '../../assets/img/hero/Vector-6.svg';
import snake from '../../assets/img/hero/Vector-13.svg';
import revolver from '../../assets/img/hero/Vector-20.svg';
import eagle from '../../assets/img/hero/Vector-21.svg';
import girlSnake from '../../assets/img/hero/Vector-22.svg';
import rope from '../../assets/img/hero/Vector-23.svg';

function buildMediaUrl(path) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${HERO_API}${path}`;
}

function buildPublicUrl(path) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

const OBSTACLE_ALBUMS = [
  {
    title: 'Красная полоса препятствий',
    distance: '12,5 км',
    href: buildPublicUrl('map12.pdf'),
    variant: 'red',
    eyebrow: 'Опасный рассвет',
    risk: 'Сложнее и опаснее',
    description: 'Длинная дистанция для тех, кто готов идти через пыль, канаты и самые жесткие испытания.',
    decor: [skull, snake, revolver, rope, biker, cactusB],
  },
  {
    title: 'Желтая полоса препятствий',
    distance: '6,5 км',
    href: buildPublicUrl('map6.pdf'),
    variant: 'yellow',
    eyebrow: 'Теплый закат',
    risk: 'Безопаснее и мягче',
    description: 'Более спокойный маршрут, чтобы прочувствовать атмосферу гонки без максимального уровня риска.',
    decor: [cactusA, cactusB, mexicoSign, sombrero, eagle, girlSnake],
  },
];

function ObstacleAlbums() {
  return (
    <div className={styles.albums}>
      <h3 className={styles.albumsTitle}>Альбомы препятствий</h3>
      <div className={styles.albumsGrid}>
        {OBSTACLE_ALBUMS.map((album) => (
          <a
            key={album.href}
            href={album.href}
            className={`${styles.albumCard} ${styles[`albumCard_${album.variant}`]}`}
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.albumScene} aria-hidden="true">
              {album.decor.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  className={`${styles.albumDecor} ${styles[`albumDecor_${album.variant}_${index}`]}`}
                />
              ))}
            </span>
            <span className={styles.albumBody}>
              <span className={styles.albumEyebrow}>{album.eyebrow}</span>
              <span className={styles.albumName}>{album.title}</span>
              <span className={styles.albumMeta}>
                <span className={styles.albumDistance}>{album.distance}</span>
                <span className={styles.albumRisk}>{album.risk}</span>
              </span>
              <span className={styles.albumText}>{album.description}</span>
            </span>
            <span className={styles.albumAction}>
              <span>Скачать PDF</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function TrackMapPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderInner}>
        <div className={styles.icon}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M8 12L24 8L40 12L56 8V52L40 56L24 52L8 56V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <line x1="24" y1="8" x2="24" y2="52" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="12" x2="40" y2="56" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h3 className={styles.placeholderTitle}>Маршрут в&nbsp;разработке</h3>
        <p className={styles.placeholderText}>
          Детальные карты трасс 5&nbsp;км и&nbsp;11&nbsp;км будут доступны ближе
          к&nbsp;мероприятию. Следите за&nbsp;обновлениями!
        </p>
        <span className={styles.badge}>Скоро</span>
      </div>
    </div>
  );
}

function TrackMapContent({ publicId }) {
  const [mapPreview, setMapPreview] = useState(null);
  const [mapFull, setMapFull] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!publicId) return;

    let cancelled = false;

    api
      .get(`/api/event_format/event/${publicId}`)
      .then((response) => {
        if (cancelled) return;
        const info = response.data?.city?.info;
        setMapPreview(buildMediaUrl(info?.map_preview));
        setMapFull(buildMediaUrl(info?.map_full));
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Ошибка загрузки карт трасс:', error);
          setMapPreview(null);
          setMapFull(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicId]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen]);

  if (!mapPreview) {
    return <TrackMapPlaceholder />;
  }

  return (
    <>
      <button
        type="button"
        className={styles.previewBtn}
        onClick={() => setLightboxOpen(true)}
        aria-label="Открыть карту трасс"
      >
        <img
          className={styles.previewImg}
          src={mapPreview}
          alt="Карта трасс"
          loading="lazy"
          decoding="async"
        />
        <span className={styles.previewHint}>Нажмите, чтобы увеличить</span>
      </button>

      {lightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Карта трасс"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            className={styles.lightboxImage}
            src={mapFull || mapPreview}
            alt="Карта трасс"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function TrackMap() {
  const selectedCity = useSelector(getSelectedCity);
  const publicId = selectedCity?.public_id;

  return (
    <section className={styles.section} id="tracks">
      <div className={styles.container}>
        <h2 className={styles.title}>Карты трасс</h2>
        <TrackMapContent key={publicId ?? 'empty'} publicId={publicId} />
        <ObstacleAlbums />
      </div>
    </section>
  );
}

export default TrackMap;
