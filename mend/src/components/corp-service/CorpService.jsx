import styles from './CorpService.module.scss';

const SERVICES = [
  {
    title: 'Кейтеринг',
    desc: 'от перекусов до полноценного питания',
  },
  {
    title: 'Шатры и лаунж-зоны',
    desc: 'для отдыха и восстановления',
  },
  {
    title: 'Оборудование и мебель',
    desc: 'под задачи команды',
  },
  {
    title: 'Фото- и видеосопровождение',
    desc: 'с итоговым роликом',
  },
  {
    title: 'Индивидуальные решения',
    desc: 'под формат участия',
  },
];

function CorpService() {
  return (
    <section className={styles.section} id="corp-service">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Для команд и компаний</span>
          <h2 className={styles.title}>
            Корпоративный сервис
            <span className={styles.titleBrand}>NH4+partners</span>
          </h2>
          <div className={styles.ornament} aria-hidden="true">
            <span /><span /><span />
          </div>
          <p className={styles.lead}>
            Закроют все организационные задачи команды.
            Вы&nbsp;фокусируетесь на&nbsp;результате, они&nbsp;&mdash; на&nbsp;всём остальном.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.servicesBlock}>
            <h3 className={styles.blockTitle}>Что берут на&nbsp;себя</h3>
            <ul className={styles.servicesList}>
              {SERVICES.map((item, i) => (
                <li key={i} className={styles.serviceItem}>
                  <span className={styles.serviceIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.serviceBody}>
                    <h4 className={styles.serviceTitle}>{item.title}</h4>
                    <p className={styles.serviceDesc}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className={styles.summary}>
              <strong className={styles.summaryBrand}>NH4+</strong>
              &nbsp;&mdash; это система, где каждая деталь работает
              на&nbsp;ваш результат: комфорт, эстетика
              и&nbsp;функциональность в&nbsp;одной связке.
            </p>

            <a
              href="https://nh4-partners.ru"
              className={styles.ctaBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.ctaLabel}>Перейти на&nbsp;nh4-partners.ru</span>
              <svg
                className={styles.ctaArrow}
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          <a
            href="https://heroleague.ru/corp"
            className={`${styles.card} ${styles.cardCorp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardBadges}>
                <span className={styles.badge}>Команда</span>
              </div>
              <h3 className={styles.cardTitle}>Корпоративное участие</h3>
            </div>

            <p className={styles.cardDesc}>
              Корпоративный чемпионат на&nbsp;ценные призы от&nbsp;АО&nbsp;«Аммоний».
              Лучшие костюмированные команды получат специальные награды.
            </p>

            <ul className={styles.detailList}>
              <li className={styles.detailItem}>Денежные призы для победителей</li>
              <li className={styles.detailItem}>Отчетное видео с&nbsp;гонки</li>
              <li className={styles.detailItem}>Специальные номинации</li>
            </ul>

            <div className={styles.cardFooter}>
              <span className={styles.corpBtn}>Узнать подробнее</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export default CorpService;
