import styles from './Footer.module.scss';
import gonkaLogo from '../../assets/img/gonka.svg';
import amoniyLogo from '../../assets/img/amoniy.svg';

const links = [
  { name: 'Календарь мероприятий', href: 'https://heroleague.ru/calendar' },
  { name: 'Магазин', href: 'https://heroleague.ru/shop/' },
  { name: 'Корпоративный сервис', href: '#corp-service' },
  { name: 'О Лиге Героев', href: 'https://heroleague.ru/about' },
  { name: 'FAQ', href: 'https://faq.heroleague.ru/' },
  { name: 'Сайт города', href: 'https://visit-mendeleevsk.ru' },
  { name: 'Политика конфиденциальности', href: '/files/soglasie.pdf' },
];

const socials = [
  { name: 'ВКонтакте', href: 'https://vk.com/heroleague' },
  { name: 'NH4+Спорт', href: 'https://t.me/NH4_sport' },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logos}>
              <img src={amoniyLogo} alt="Аммоний" className={styles.logoAmoniy} />
              <img src={gonkaLogo} alt="Гонка Героев" className={styles.logo} />
            </div>
            <p className={styles.tagline}>Фестивальная гонка с препятствиями</p>
          </div>
          <nav className={styles.nav}>
            <h4 className={styles.navTitle}>Ссылки</h4>
            {links.map((link) => {
              const isInternal = link.href.startsWith('#');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={styles.link}
                  {...(!isInternal && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>
          <div className={styles.social}>
            <h4 className={styles.navTitle}>Мы в соцсетях</h4>
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; АНО &laquo;Гонка Героев&raquo;
            ООО &laquo;Лига Героев Спорт Проджектс&raquo;
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
