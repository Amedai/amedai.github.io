import styles from './About.module.scss';
import imgObstacles from '../../assets/img/about-obstacles.webp';
import imgFestival from '../../assets/img/about-festival.webp';
import imgEveryone from '../../assets/img/about-everyone.webp';

const features = [
  {
    img: imgObstacles,
    title: 'Препятствия',
    text: 'Более 40 уникальных препятствий на трассе, от простых до экстремальных',
  },
  {
    img: imgFestival,
    title: 'Фестиваль',
    text: 'Музыка, еда, развлечения — целый день активностей для участников и зрителей',
  },
  {
    img: imgEveryone,
    title: 'Для всех',
    text: 'Разные форматы для новичков, любителей и профессиональных спортсменов',
  },
];

function About() {
  return (
    <section className={styles.about}>
      <div className={styles.container}>
        <h2 className={styles.title}>Что такое Гонка Героев?</h2>
        <p className={styles.description}>
          Гонка Героев&nbsp;&mdash; это масштабный спортивный фестиваль,
          где каждый может проверить свои силы, преодолеть полосу
          препятствий и&nbsp;получить незабываемые эмоции. Впервые
          в&nbsp;Менделеевске!
        </p>
        <div className={styles.features}>
          {features.map((f, i) => (
            <div className={styles.feature} key={i}>
              <div className={styles.imgWrap}>
                <img src={f.img} alt={f.title} className={styles.featureImg} />
              </div>
              <div className={styles.featureBody}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureText}>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
