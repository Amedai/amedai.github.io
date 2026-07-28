import styles from './Hero.module.scss';
import gonkaLogo from '../../assets/img/gonka.svg';
import amoniyLogo from '../../assets/img/amoniy.svg';
import { useState, useEffect } from 'react';

import v0  from '../../assets/img/hero/Vector-0.svg';
import v1  from '../../assets/img/hero/Vector-1.svg';
import v2  from '../../assets/img/hero/Vector-2.svg';
import v3  from '../../assets/img/hero/Vector-3.svg';
import v4  from '../../assets/img/hero/Vector-4.svg';
import v5  from '../../assets/img/hero/Vector-5.svg';
import v6  from '../../assets/img/hero/Vector-6.svg';
import v7  from '../../assets/img/hero/Vector-7.svg';
import v8  from '../../assets/img/hero/Vector-8.svg';
import v9  from '../../assets/img/hero/Vector-9.svg';
import v10 from '../../assets/img/hero/Vector-10.svg';
import v11 from '../../assets/img/hero/Vector-11.svg';
import v12 from '../../assets/img/hero/Vector-12.svg';
import v13 from '../../assets/img/hero/Vector-13.svg';
import v14 from '../../assets/img/hero/Vector-14.svg';
import v15 from '../../assets/img/hero/Vector-15.svg';
import v16 from '../../assets/img/hero/Vector-16.svg';
import v17 from '../../assets/img/hero/Vector-17.svg';
import v18 from '../../assets/img/hero/Vector-18.svg';
import v19 from '../../assets/img/hero/Vector-19.svg';
import v20 from '../../assets/img/hero/Vector-20.svg';
import v21 from '../../assets/img/hero/Vector-21.svg';
import v22 from '../../assets/img/hero/Vector-22.svg';
import v23 from '../../assets/img/hero/Vector-23.svg';
import v24 from '../../assets/img/hero/Vector-24.svg';
import v25 from '../../assets/img/hero/Vector-25.svg';
import v26 from '../../assets/img/hero/Vector-26.svg';
import v27 from '../../assets/img/hero/Vector-27.svg';


// mobile: overrides applied at ≤480px (inline styles can't be overridden by CSS media queries)
// Positions designed so items don't hide behind topBar (~90px) or bottomBar (~90px) on mobile
// Aspect ratios used for height estimation: h = width% × (svgHeight / svgWidth)
// Headline safe zone approx: x 20-80%, y 35-65% — items there add intentional depth
const DECOR_ITEMS = [
  // ── FAR LEFT COLUMN (x: 0–11%) ─────────────────────────────────────────────
  {
    src: v0,   // 101×182  tall (h×1.80)  → at 11% wide, 16:9 viewport: h≈31.7%
    style:  { left:  '0%',  top:    '12%',   width: '11%' },
    mobile: { left:  '0%',  top:    '28%',   width: '22%' },
  },
  {
    src: v2,   // 110×204  very tall (h×1.85)  → at 9% wide: h≈16.7%
    style:  { left:  '1%',  top:    '46%',   width:  '9%' },
    mobileHide: true,
  },
  {
    src: v22,  // 116×196  very tall (h×1.69)  → at 8% wide, 16:9 viewport: h≈21.6%
    style:  { left:  '2%',  bottom:  '4%',   width:  '8%' },
    mobileHide: true,
  },

  // ── LEFT INNER (x: 11–26%) ──────────────────────────────────────────────────────
  {
    src: v6,   // 127×92   wider (h×0.72)  → at 9%: h≈6.5%
    style:  { left: '12%',  top:    '16%',   width:  '9%' },
    mobileHide: true,
  },
  {
    src: v13,  // 138×113  medium (h×0.82)  → at 11%: h≈9%
    style:  { left: '11%',  top:    '34%',   width: '11%' },
    mobileHide: true,
  },
  {
    src: v20,  // 186×107  very wide (h×0.58)  → at 14%: h≈8.1%
    style:  { left: '10%',  bottom: '24%',   width: '14%' },
    mobileHide: true,
  },

  // ── UPPER CENTER-LEFT (x: 22–40%) ──────────────────────────────────────────
  {
    src: v3,   // 193×153  wide hat (h×0.79)  → at 12%: h≈9.5%
    style:  { left: '23%',  top:    '12%',   width: '12%' },
    mobile: { left: '28%',  top:    '34%',   width: '22%' },
  },
  {
    src: v5,   // 116×92   medium (h×0.79)  → at 9%: h≈7.1%
    style:  { left: '26%',  top:    '32%',   width:  '9%' },
    mobileHide: true,
  },
  {
    src: v27,  // 42×93    very narrow tall (h×2.21)  → at 4%: h≈8.8%
    style:  { left: '36%',  top:    '30%',   width:  '4%' },
    mobileHide: true,
  },
  {
    src: v26,  // 206×31   ultra-flat (h×0.15)  → at 17%: h≈2.6%
    style:  { left: '24%',  bottom: '18%',   width: '17%' },
    mobileHide: true,
  },

  // ── UPPER CENTER (x: 38–60%) ────────────────────────────────────────────────
  {
    src: v24,  // 70×120   tall narrow (h×1.71)  → at 5% wide, 16:9 viewport: h≈13.7%
    style:  { left: '38%',  top:     '8%',   width:  '5%' },
    mobileHide: true,
  },
  {
    src: v7,   // 202×95   very wide (h×0.47)  → at 16%: h≈7.5%
    style:  { left: '42%',  top:    '24%',   width: '16%' },
    mobile: { left: '30%',  top:    '18%',   width: '30%' },
  },
  {
    src: v10,  // 132×100  medium (h×0.76)  → at 11%: h≈8.4%
    style:  { left: '36%',  bottom: '22%',   width: '11%' },
    mobileHide: true,
  },
  {
    src: v18,  // 91×50    flat (h×0.55)  → at 8%: h≈4.4%
    style:  { left: '33%',  bottom: '10%',   width:  '8%' },
    mobileHide: true,
  },

  // ── UPPER CENTER-RIGHT (x: 55–76%) ──────────────────────────────────────────
  {
    src: v11,  // 150×106  medium wide (h×0.71)  → at 10% wide, 16:9 viewport: h≈11.4%
    style:  { left: '55%',  top:    '10%',   width: '10%' },
    mobileHide: true,
  },
  {
    src: v14,  // 123×109  medium (h×0.89)  → at 10% wide, 16:9 viewport: h≈14.2%
    style:  { left: '58%',  top:    '38%',   width: '10%' },
    mobileHide: true,
  },
  {
    src: v17,  // 69×80    small tall (h×1.16)  → at 6% wide, 16:9 viewport: h≈11.1%
    style:  { left: '50%',  bottom: '22%',   width:  '6%' },
    mobileHide: true,
  },
  {
    src: v8,   // 55×71    small tall (h×1.29)  → at 5%: h≈6.5%
    style:  { left: '55%',  bottom: '10%',   width:  '5%' },
    mobileHide: true,
  },

  // ── RIGHT INNER (x: 63–80%) ────────────────────────────────────────────────────
  {
    src: v19,  // 65×52    small wide (h×0.80)  → at 6%: h≈4.8%
    style:  { left: '68%',  top:    '18%',   width:  '6%' },
    mobileHide: true,
  },
  {
    src: v9,   // 114×77   medium (h×0.68)  → at 9%: h≈6.1%
    style:  { left: '68%',  top:    '36%',   width:  '9%' },
    mobileHide: true,
  },
  {
    src: v15,  // 86×50    flat (h×0.58)  → at 8%: h≈4.7%
    style:  { left: '58%',  bottom: '30%',   width:  '8%' },
    mobile: { left: '50%',  bottom: '22%',   width: '16%' },
  },
  {
    src: v12,  // 64×75    small tall (h×1.17)  → at 7%: h≈8.2%
    style:  { left: '62%',  bottom: '12%',   width:  '7%' },
    mobileHide: true,
  },

  // ── FAR RIGHT (x: 76–100%) ───────────────────────────────────────────────────
  {
    src: v16,  // 69×47    small wide (h×0.68)  → at 6%: h≈4.1%
    style:  { left: '76%',  top:     '8%',   width:  '6%' },
    mobileHide: true,
  },
  {
    src: v25,  // 164×65   very wide flat (h×0.40)  → at 13%: h≈5.2%
    style:  { left: '76%',  top:    '16%',   width: '13%' },
    mobileHide: true,
  },
  {
    src: v1,   // 118×175  tall (h×1.48)  → at 10% wide, 16:9 viewport: h≈23.7%
    style:  { left: '84%',  top:    '26%',   width: '10%' },
    mobile: { right: '0%',  top:    '26%',   width: '20%' },
  },
  {
    src: v23,  // 127×75   medium wide (h×0.59)  → at 9% wide, 16:9 viewport: h≈8.5%
    style:  { left: '75%',  top:    '52%',   width:  '9%' },
    mobile: { right: '4%',  bottom: '28%',   width: '18%' },
  },
  {
    src: v21,  // 114×159  tall (h×1.39)  → at 9% wide, 16:9 viewport: h≈20%
    style:  { left: '87%',  top:    '48%',   width:  '9%' },
    mobileHide: true,
  },
  {
    src: v4,   // 123×158  tall (h×1.28)  → at 9% wide, 16:9 viewport: h≈18.4%
    style:  { left: '82%',  top:    '70%',   width:  '9%' },
    mobile: { right: '2%',  top:    '56%',   width: '18%' },
  },
];

const NAV_LINKS = [
  { id: 0, name: 'О гонке', link: '#about' },
  { id: 1, name: 'Форматы', link: '#events' },
  { id: 2, name: 'FAQ', link: '#faq' },
  { id: 3, name: 'Как добраться', link: '#whereis' },
];

const SCATTERED_TEXTS = [
  { text: 'Mucho Gusto!', className: 'st1' },
  { text: 'AMIGOS', className: 'st2' },
  { text: 'Bienvenido', className: 'st3' },
  { text: 'когда закончатся патроны — ты можешь спеть напоследок', className: 'st4' },
];

function useSmallMobile() {
  const [isSmall, setIsSmall] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 480,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    const handler = (e) => setIsSmall(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isSmall;
}

function Hero() {
  const isSmallMobile = useSmallMobile();

  return (
    <section className={styles.hero}>
      <div className={styles.heroDecor} aria-hidden="true">
        {DECOR_ITEMS.map((item, i) => {
          if (item.mobileHide && isSmallMobile) return null;
          const itemStyle = isSmallMobile && item.mobile
            ? { ...item.style, ...item.mobile }
            : item.style;
          return (
            <img
              key={i}
              src={item.src}
              alt=""
              className={styles.decorItem}
              style={itemStyle}
            />
          );
        })}
      </div>

      <div className={styles.topArea}>
        <div className={styles.topBar}>
          <div className={styles.sponsor}>
            <img src={amoniyLogo} alt="Аммоний" className={styles.sponsorLogo} />
          </div>

          <div className={styles.titleBox}>
            <span className={styles.titleText}>ФЕСТИВАЛЬНАЯ ГОНКА ГЕРОЕВ</span>
          </div>

          <div className={styles.raceLogo}>
            <img src={gonkaLogo} alt="Гонка Героев" />
          </div>
        </div>

        <nav className={styles.heroNav}>
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={l.link} className={styles.heroNavLink}>
              {l.name}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.scattered}>
        {SCATTERED_TEXTS.map((item) => (
          <span key={item.className} className={styles[item.className]}>
            {item.text}
          </span>
        ))}
      </div>

      <div className={styles.center}>
        <h1 className={styles.headline}>
          <span>от рассвета</span>
          <span>до заката</span>
        </h1>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.badge}>
          <span>25 июля 2026</span>
        </div>

        <a href="#events" className={styles.ctaBadge}>
          <span>Выбрать формат</span>
        </a>

        <div className={styles.badge}>
          <span>Менделеевск</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
