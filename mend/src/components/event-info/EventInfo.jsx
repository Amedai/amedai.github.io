import styles from './EventInfo.module.scss';

const CONCEPT_ITEMS = [
  {
    time: '03:30',
    title: 'Старт на рассвете',
    desc: 'Закрытый пробег. Гонка символически открывается на предрассветных сумерках. На трассу выходят инструкторы и специальные гости. Участие по приглашению.',
  },
  {
    time: 'День',
    title: 'Массовые забеги',
    desc: 'Когда солнце в зените — главная гонка дня!',
  },
  {
    time: 'Закат',
    title: 'Финиш на закате',
    desc: 'Под аплодисменты тысяч зрителей.',
  },
  {
    time: 'Fiesta',
    title: 'Мексиканский стиль',
    desc: 'Костюмы, музыка, кухня и атмосфера настоящего праздника.',
  },
];

function EventInfo() {
  return (
    <section className={styles.section} id="about">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>5-я юбилейная</span>
          <h2 className={styles.title}>Гонка Героев</h2>
          <p className={styles.subtitle}>
            Впервые в&nbsp;формате &laquo;От&nbsp;рассвета до&nbsp;заката&raquo;
          </p>
        </div>

        <div className={styles.intro}>
          <div className={styles.introBlock}>
            <h3 className={styles.introTitle}>
              Менделеевск&nbsp;&mdash; место силы Гонки Героев
            </h3>
            <p className={styles.introText}>
              Каждый год Менделеевск встречает героев экстремальных трасс. Здесь
              всегда было что-то особенное: неповторимая атмосфера, мощная
              поддержка зрителей и&nbsp;тот самый дух настоящего приключения.
            </p>
            <p className={styles.introAccent}>
              5-я юбилейная гонка станет самой эпичной!
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>5</span>
              <span className={styles.statLabel}>юбилейный год</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>20<small>ч</small></span>
              <span className={styles.statLabel}>непрерывной гонки</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>40<small>+</small></span>
              <span className={styles.statLabel}>препятствий</span>
            </div>
          </div>
        </div>

        <div className={styles.epic}>
          <p className={styles.epicText}>
            Впервые в&nbsp;истории проекта&nbsp;&mdash; непрерывная гонка
            с&nbsp;3:00 до&nbsp;23:00! Целый день адреналина, препятствий
            и&nbsp;мексиканского безумия.
          </p>
        </div>

        <div className={styles.concept}>
          <h3 className={styles.conceptTitle}>
            Концепция &laquo;От&nbsp;рассвета до&nbsp;заката&raquo;
          </h3>
          <div className={styles.timeline}>
            {CONCEPT_ITEMS.map((item, i) => (
              <div className={styles.timelineItem} key={i}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineTime}>{item.time}</div>
                <div className={styles.timelineContent}>
                  <h4 className={styles.timelineTitle}>{item.title}</h4>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.tagline}>
          <p>Кто рожден быть героем... бежит в&nbsp;Менделеевске!</p>
        </div>
      </div>
    </section>
  );
}

export default EventInfo;
