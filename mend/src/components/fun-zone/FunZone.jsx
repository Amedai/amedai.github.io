import styles from './FunZone.module.scss';

const MENU_ITEMS = [
  'Тако на углях',
  'Буррито с мясом',
  'Тамалес по-домашнему',
  'Гуакамоле с чипсами',
  'Острый соус — острее, чем наши препятствия!',
  'Маринованный кактус — попробуй, если осмелишься!',
];

const ENTERTAINMENT = [
  {
    title: 'Живая музыка мариачи',
    desc: 'Зажигательная музыка гитар и труб!',
  },
  {
    title: 'Рок-концерт группы the Mood',
    desc: null,
  },
  {
    title: 'Конкурс костюмов',
    desc: 'Надень большую шляпу, отрасти усы, станцуй танго с кнутом — денежные призы лучшим костюмированным командам!',
  },
  {
    title: 'Мотокемпинг',
    desc: 'Приезжай на мотоцикле, получи специальный приз и останься в мотокемпинге в пустыне!',
  },
  {
    title: 'Шоу укротителя змей',
    desc: 'Танцы со змеями и экзотическими животными!',
  },
  {
    title: 'Фотозоны',
    desc: 'Мексиканские декорации, пирамиды ацтеков и пустыня — крутые фото гарантированы!',
  },
];

function FunZone() {
  return (
    <section className={styles.section} id="funzone">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Зона вечеринки</h2>
          <p className={styles.subtitle}>
            Добро пожаловать на&nbsp;мексиканский праздник!
          </p>
          <p className={styles.lead}>
            Даже если ты не&nbsp;бежишь&nbsp;&mdash; ты не&nbsp;пропустишь главное!
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.food}>
            <h3 className={styles.blockTitle}>Мексиканская кухня</h3>
            <p className={styles.quote}>
              Почему из&nbsp;всех грешных мест Мексики мы&nbsp;должны были
              выбрать именно это? Потому что здесь пахнет текилой
              и&nbsp;свежими сигарами!
            </p>
            <h4 className={styles.menuLabel}>В меню:</h4>
            <ul className={styles.menuList}>
              {MENU_ITEMS.map((item, i) => (
                <li key={i} className={styles.menuItem}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.entertainment}>
            <h3 className={styles.blockTitle}>Развлечения</h3>
            <div className={styles.activityList}>
              {ENTERTAINMENT.map((item, i) => (
                <div key={i} className={styles.activity}>
                  <h4 className={styles.activityTitle}>{item.title}</h4>
                  {item.desc && (
                    <p className={styles.activityDesc}>{item.desc}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FunZone;
