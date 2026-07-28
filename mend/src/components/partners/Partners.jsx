import styles from './Partners.module.scss';
import { PARTNER_GROUPS } from './partnersData';

function PartnerLogo({ partner, size }) {
  const logo = (
    <img
      src={partner.src}
      alt={partner.alt}
      className={`${styles.logo}${partner.white ? ` ${styles.logoWhite}` : ''}`}
    />
  );

  const wrapClassName = `${styles.logoWrap} ${styles[`logoWrap${size.charAt(0).toUpperCase()}${size.slice(1)}`]}`;

  if (partner.href) {
    return (
      <a
        href={partner.href}
        className={wrapClassName}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={partner.alt}
      >
        {logo}
      </a>
    );
  }

  return <div className={wrapClassName}>{logo}</div>;
}

function PartnerGroup({ group }) {
  const sizeClass = styles[`grid${group.size.charAt(0).toUpperCase()}${group.size.slice(1)}`];
  const partnerCount = group.partners.length;
  const gridClassName = [
    styles.grid,
    sizeClass,
    partnerCount <= 2 ? styles.gridFew : '',
    partnerCount === 1 ? styles.gridSingle : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={styles.group} aria-labelledby={`partners-${group.id}`}>
      <h3 id={`partners-${group.id}`} className={styles.groupTitle}>
        {group.title}
      </h3>
      <div className={gridClassName}>
        {group.partners.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} size={group.size} />
        ))}
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Партнёры</h2>
        <div className={styles.groups}>
          {PARTNER_GROUPS.map((group) => (
            <PartnerGroup key={group.id} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Partners;
