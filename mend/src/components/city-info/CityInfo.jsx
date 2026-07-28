import styles from './CityInfo.module.scss';
import cityLogo from '../../assets/img/partners/_2454324393616.svg';
import nh4Logo from '../../assets/img/partners/nhsport.svg';
import bgPattern from '../../assets/img/mend_bg.svg';

function CityInfo() {
  return (
    <section className={styles.section}>
      <div className={styles.bg} style={{ backgroundImage: `url(${bgPattern})` }} />

      <div className={styles.container}>
        <div className={styles.header}>
          <a
            href="https://visit-mendeleevsk.ru"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.logoLink}
          >
            <img src={cityLogo} alt="Менделеевск" className={styles.logo} />
          </a>
          <h2 className={styles.title}>Откройте Менделеевск</h2>
          <p className={styles.subtitle}>
            Город на&nbsp;берегу Камы с&nbsp;богатой промышленной историей,
            уникальной архитектурой и&nbsp;гостеприимством. Приезжайте на&nbsp;Гонку
            Героев&nbsp;&mdash; и&nbsp;останьтесь, чтобы узнать город ближе.
          </p>
        </div>

        <div className={styles.actions}>
          <a
            href="https://visit-mendeleevsk.ru"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Узнать о городе
          </a>
        </div>

        <div className={styles.sponsor}>
          <span className={styles.sponsorLabel}>При поддержке</span>
          <img src={nh4Logo} alt="NH4+Спорт" className={styles.sponsorLogo} />
          <a
            href="https://t.me/NH4_sport"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.tgBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 8.16l-1.8 8.49c-.14.6-.5.75-1.01.47l-2.8-2.06-1.35 1.3c-.15.15-.28.28-.57.28l.2-2.85 5.18-4.68c.23-.2-.05-.31-.35-.12l-6.4 4.03-2.76-.86c-.6-.19-.61-.6.12-.89l10.79-4.16c.5-.18.94.12.75.87z"/>
            </svg>
            Telegram
          </a>
        </div>
      </div>
    </section>
  );
}

export default CityInfo;
