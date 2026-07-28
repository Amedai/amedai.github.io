import styles from './Spectators.module.scss';

const PERKS = [
  'Бесплатный вход на фестиваль',
  'Возможность поддержать участников',
  'Атмосфера настоящего мексиканского праздника',
];

const SERVICES = [
  'Корпоративные услуги и спонсорские пакеты',
  'Стать волонтером',
  'Стать инструктором',
  'Мерч «Аммоний NH4+»',
];

function Spectators() {
  return (
    <section className={styles.section} id="spectators">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Специально для зрителей</h2>
          {/* <div className={styles.perksList}>
            {PERKS.map((perk) => (
              <div key={perk} className={styles.perk}>
                <span className={styles.perkDot} aria-hidden="true" />
                <span>{perk}</span>
              </div>
            ))}
          </div> */}
          <p className={styles.lead}>
            Для зрителей «Гонки Героев» доступны бронирование кемпинга
            и дополнительные возможности, которые помогут стать частью события
            не только на трассе, но и вокруг неё.
          </p>
          <p className={styles.leadSecondary}>
            Можно приехать с комфортом, забронировать место в кемпинге,
            подключиться к корпоративным услугам, стать партнером, волонтером
            или инструктором, а также перейти на сайт мерча «Аммоний NH4+».
          </p>
        </div>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.cardCamp}`}>
            <h3 className={styles.cardTitle}>Бронирование кемпинга</h3>
            <p className={styles.cardText}>
              Приезжайте с комфортом и останьтесь рядом с трассой —
              забронируйте место в кемпинге на время фестиваля.
            </p>
            <a
              href="https://greencity-camp.ru"
              className={styles.ctaBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Забронировать кемпинг</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </article>

          <article className={`${styles.card} ${styles.cardServices}`}>
            <h3 className={styles.cardTitle}>Дополнительные услуги и участие</h3>
            <ul className={styles.servicesList}>
              {SERVICES.map((item) => (
                <li key={item} className={styles.serviceItem}>{item}</li>
              ))}
            </ul>
            <a
              href="https://taplink.cc/heroracemendeleevsk"
              className={styles.ctaBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Перейти на сайт</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Spectators;
