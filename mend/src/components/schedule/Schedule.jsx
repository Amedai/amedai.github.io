import styles from './Schedule.module.scss';
import { useState } from 'react';

const FRIDAY = {
  label: '24 июля (пятница)',
  tagline: 'Предварительный разогрев',
  events: [
    {
      time: '12:00 – 19:00',
      place: 'Полоса 100 м',
      title: 'Квалификационные забеги Чемпионата России',
      desc: 'Готовься! Подготовка к главной гонке',
    },
    {
      time: '14:00 – 17:00',
      place: 'Зона регистрации',
      title: 'Регистрация участников корпоративного чемпионата',
      desc: 'На призы от АО «Аммоний»',
    },
    {
      time: '19:00 – 22:00',
      place: 'Площадка перед сценой',
      title: 'Рок-урок с группой the Mood',
      desc: 'Разогреваемся перед концертом!',
    },
  ],
};

const SATURDAY_PHASES = [
  {
    phase: 'Предрассветные сумерки',
    icon: 'dusk',
    events: [
      { time: '03:30', place: 'Трасса 11 км', title: 'Закрытый пробег' },
    ],
  },
  {
    phase: 'Рассвет',
    icon: 'dawn',
    events: [
      { time: '08:00', place: 'Трасса 11 км', title: 'Старт корпоративного чемпионата', desc: 'На призы от АО «Аммоний»' },
      { time: '09:30', place: 'Трасса 11 км', title: 'Корпоративные клиенты' },
      { time: '11:00', place: 'Трасса 11 км', title: 'Фановые забеги команд АО «Аммоний»', desc: 'В рамках партнерской квоты' },
      { time: '11:15 – 12:00', place: 'Трасса 11 км', title: 'Технический перерыв', isTech: true },
    ],
  },
  {
    phase: 'День',
    icon: 'day',
    events: [
      { time: '12:00 – 13:00', place: 'Трасса 11 км', title: 'Массовый старт!', desc: 'Главная гонка дня — стартуют все!', isHighlight: true },
      { time: '13:15 – 14:30', place: 'Трасса 11 км', title: 'Корпоративные клиенты и взводы' },
      { time: '14:30 – 15:00', place: 'Трасса 11 км', title: 'Технический перерыв', isTech: true },
      { time: '15:00 – 17:00', place: 'Трасса 5 км', title: 'Команды без сопровождения инструкторов' },
      { time: '17:00 – 17:30', place: 'Трасса 5 км', title: 'Технический перерыв', isTech: true },
    ],
  },
  {
    phase: 'Закат',
    icon: 'sunset',
    events: [
      { time: '17:30 – 19:15', place: 'Трасса 5 км', title: 'Команды без сопровождения инструкторов', desc: 'Последний шанс покорить трассу!' },
    ],
  },
  {
    phase: 'Ночь',
    icon: 'night',
    events: [
      { time: '19:00 – 22:00', place: 'Площадка перед сценой', title: 'Большой концерт', desc: 'Группа the Mood — рок до упаду! Праздник до рассвета!', isHighlight: true },
    ],
  },
];

function Schedule() {
  const [activeDay, setActiveDay] = useState('saturday');

  return (
    <section className={styles.section} id="schedule">
      <div className={styles.container}>
        <h2 className={styles.title}>Полная программа</h2>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeDay === 'friday' ? styles.tabActive : ''}`}
            onClick={() => setActiveDay('friday')}
          >
            24 июля — Пятница
          </button>
          <button
            className={`${styles.tab} ${activeDay === 'saturday' ? styles.tabActive : ''}`}
            onClick={() => setActiveDay('saturday')}
          >
            25 июля — День гонки!
          </button>
        </div>

        {activeDay === 'friday' && (
          <div className={styles.dayBlock}>
            <p className={styles.dayTagline}>{FRIDAY.tagline}</p>
            <div className={styles.eventsList}>
              {FRIDAY.events.map((ev, i) => (
                <div key={i} className={styles.eventRow}>
                  <div className={styles.eventTime}>{ev.time}</div>
                  <div className={styles.eventBody}>
                    <span className={styles.eventPlace}>{ev.place}</span>
                    <h4 className={styles.eventTitle}>{ev.title}</h4>
                    {ev.desc && <p className={styles.eventDesc}>{ev.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDay === 'saturday' && (
          <div className={styles.dayBlock}>
            <div className={styles.phases}>
              {SATURDAY_PHASES.map((phase, pi) => (
                <div key={pi} className={styles.phase}>
                  <div className={styles.phaseHeader}>
                    <span className={`${styles.phaseIcon} ${styles[phase.icon]}`} />
                    <h3 className={styles.phaseName}>{phase.phase}</h3>
                  </div>
                  <div className={styles.eventsList}>
                    {phase.events.map((ev, ei) => (
                      <div
                        key={ei}
                        className={`${styles.eventRow} ${ev.isHighlight ? styles.eventHighlight : ''} ${ev.isTech ? styles.eventTech : ''}`}
                      >
                        <div className={styles.eventTime}>{ev.time}</div>
                        <div className={styles.eventBody}>
                          <span className={styles.eventPlace}>{ev.place}</span>
                          <h4 className={styles.eventTitle}>{ev.title}</h4>
                          {ev.desc && <p className={styles.eventDesc}>{ev.desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={styles.disclaimer}>
          * программа мероприятия является предварительной
        </p>
      </div>
    </section>
  );
}

export default Schedule;
