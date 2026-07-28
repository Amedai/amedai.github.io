import styles from './Header.module.scss';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedCity } from '../../store/app/selectors';
import { HERO_API } from '../../api';

const baseLinks = [
  { id: 0, name: 'О гонке', link: '#about' },
  { id: 1, name: 'Форматы', link: '#events' },
  { id: 6, name: 'Корп. сервис', link: '#corp-service' },
  { id: 2, name: 'FAQ', link: '#faq' },
  { id: 3, name: 'Как добраться', link: '#whereis' },
  { id: 4, name: 'О городе', link: 'https://visit-mendeleevsk.ru', external: true },
  { id: 5, name: 'NH4+Спорт', link: 'https://t.me/NH4_sport', external: true },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const city = useSelector(getSelectedCity);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const links = [...baseLinks];
  if (city?.info?.guide) {
    links.push({ id: 10, name: 'Гайд участника', link: `${HERO_API}${city.info.guide}` });
  }

  return (
    <>
      <header className={`${styles.header} ${visible ? styles.visible : ''}`}>
        <nav className={styles.desktopNav}>
          {links.map((l) => (
            <a
              key={l.id}
              href={l.link}
              className={styles.navLink}
              {...(l.external && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {l.name}
            </a>
          ))}
        </nav>

        <a href="#events" className={styles.cta}>
          Участвовать
        </a>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          aria-label="Меню"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu}>
          <nav className={styles.mobileNav} onClick={(e) => e.stopPropagation()}>
            {links.map((l) => (
              <a
                key={l.id}
                href={l.link}
                className={styles.mobileLink}
                onClick={closeMenu}
                {...(l.external && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {l.name}
              </a>
            ))}
            <a href="#events" className={styles.mobileCta} onClick={closeMenu}>
              Участвовать
            </a>
          </nav>
        </div>
      )}
    </>
  );
}

export default Header;
