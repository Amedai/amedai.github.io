import styles from './Events.module.scss';
import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { getEventsList, getOpenPageStatus, getSelectedCity } from '../../store/app/selectors';
import { setSelectedCity } from '../../store/action';
import { fetchEventsList } from '../../store/api-actions';
import { HERO_API } from '../../api';
import { CITY_ID } from '../../const/const';

function formatTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const CARD_ACCENTS = ['red', 'orange', 'gold', 'teal'];

function Events() {
  const dispatch = useDispatch();
  const [formats, setFormats] = useState([]);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  const lastFetchedCityRef = useRef(null);
  const isFetchingRef = useRef(false);
  const [expandedCard, setExpandedCard] = useState(null);

  const events = useSelector(getEventsList);
  const selectedCity = useSelector(getSelectedCity);
  const isFirstOpenPage = useSelector(getOpenPageStatus);

  const fetchFormats = useCallback(async (publicId) => {
    const eventCityPublicId = publicId || selectedCity?.public_id;
    if (!eventCityPublicId || !events) return;
    if (isFetchingRef.current || lastFetchedCityRef.current === eventCityPublicId) return;

    isFetchingRef.current = true;
    lastFetchedCityRef.current = eventCityPublicId;

    const filterCity = events.filter((el) => el.city.id === CITY_ID);
    const currentCityIndex = filterCity.findIndex((el) => el.public_id === publicId);

    try {
      const response = await api.get(`/api/event_format/event/${eventCityPublicId}`);
      if (response.data?.values?.length > 0) {
        const hasTickets = response.data.values.find((el) => el?.tickets_left?.athlete > 0);

        if (isFirstOpenPage && !hasTickets && currentCityIndex < filterCity.length - 1) {
          const nextCity = filterCity[currentCityIndex + 1];
          lastFetchedCityRef.current = null;
          dispatch(setSelectedCity(nextCity));
        } else {
          setFormats(response.data.values);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [selectedCity, events, isFirstOpenPage, dispatch]);

  useEffect(() => {
    if (!events) dispatch(fetchEventsList());
  }, [events, dispatch]);

  useEffect(() => {
    if (events && !selectedCity) {
      const dateNow = Math.round(Date.now() / 1000);
      const filterCity = events.filter((el) => el.city.id === CITY_ID);
      const foundCity = filterCity.find(
        (el) => el.city.id === CITY_ID && el.registration_close > dateNow
      ) ?? filterCity[filterCity.length - 1];
      if (foundCity) dispatch(setSelectedCity(foundCity));
    }
  }, [events, selectedCity, dispatch]);

  useEffect(() => {
    if (events && selectedCity) {
      if (lastFetchedCityRef.current !== selectedCity.public_id) {
        lastFetchedCityRef.current = null;
      }
      const closeTime = new Date(selectedCity.registration_close * 1000);
      setRegistrationClosed(closeTime < new Date());
      fetchFormats(selectedCity.public_id);
    }
  }, [selectedCity, events, fetchFormats]);

  const ticketsLabel = (count) => {
    if (count <= 0) return 'Мест нет';
    if (count <= 10) return `Осталось ${count} мест — торопись!`;
    if (count <= 50) return `Осталось мест: ${count}`;
    return `Свободных мест: ${count}`;
  };

  return (
    <section className={styles.section} id="events">
      <div className={styles.bg} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Выбери свой путь</span>
          <h2 className={styles.title}>Выбери свой формат</h2>
          <div className={styles.ornament} aria-hidden="true">
            <span /><span /><span />
          </div>
          <p className={styles.subtitle}>
            Менделеевск &mdash; Гонка Героев в&nbsp;твоём городе
          </p>
        </div>

        {registrationClosed && (
          <div className={styles.closed}>
            <div className={styles.closedIcon} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <p className={styles.closedText}>Продажа билетов завершена</p>
          </div>
        )}

        {formats.length > 0 && !registrationClosed && (
          <div className={styles.grid}>
            {formats.map((format, idx) => {
              const ticketsLeft = format.tickets_left?.athlete ?? 0;
              const isTeam = !!format.team;
              const isSoldOut = ticketsLeft <= 0;
              const isExpanded = expandedCard === format.public_id;
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];

              return (
                <div
                  key={format.public_id}
                  className={`${styles.card} ${styles[`accent_${accent}`]} ${isSoldOut ? styles.cardSoldOut : ''}`}
                >
                  <div className={styles.cardNumber} aria-hidden="true">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className={styles.cardHeader}>
                    <div className={styles.cardBadges}>
                      {isTeam && (
                        <span className={styles.badge}>
                          {format.team_all ? 'Команда' : 'Место в команде'}
                        </span>
                      )}
                      {!isTeam && <span className={styles.badgeSolo}>Индивидуально</span>}
                    </div>
                    <h3 className={styles.cardTitle}>{format.title}</h3>
                  </div>

                  <div className={styles.cardPrice}>
                    <span className={styles.priceAmount}>
                      {format.price > 0
                        ? `${(isTeam && format.team_all && format.max_count
                            ? format.price * format.max_count
                            : format.price
                          ).toLocaleString('ru-RU')} ₽`
                        : 'Бесплатно'}
                    </span>
                    {isTeam && format.max_count && (
                      <span className={styles.priceSub}>
                        {format.team_all
                          ? `за команду (${format.max_count} чел.)`
                          : 'за участника'}
                      </span>
                    )}
                  </div>

                  {format.description && (
                    <p className={styles.cardDesc}>{format.description}</p>
                  )}

                  <div className={styles.cardMeta}>
                    {format.start_time && (
                      <div className={styles.metaRow}>
                        <svg className={styles.metaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{formatTime(format.start_time)}</span>
                      </div>
                    )}
                    {format.address && (
                      <div className={styles.metaRow}>
                        <svg className={styles.metaIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                        <span>{format.address}</span>
                      </div>
                    )}
                  </div>

                  <div className={`${styles.cardDetails} ${isExpanded ? styles.cardDetailsOpen : ''}`}>
                    {format.merch?.length > 0 && (
                      <div className={styles.detailBlock}>
                        <h4 className={styles.detailTitle}>В стоимость входит</h4>
                        <ul className={styles.detailList}>
                          {format.merch.map((item, i) => (
                            <li key={i} className={styles.detailItem}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {format.requirements?.length > 0 && (
                      <div className={styles.detailBlock}>
                        <h4 className={styles.detailTitle}>Требования</h4>
                        <ul className={styles.detailList}>
                          {format.requirements.map((req, i) => (
                            <li key={i} className={styles.detailItem}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    className={styles.toggleBtn}
                    onClick={() =>
                      setExpandedCard(isExpanded ? null : format.public_id)
                    }
                  >
                    <span>{isExpanded ? 'Свернуть' : 'Подробнее'}</span>
                    <svg
                      className={`${styles.toggleArrow} ${isExpanded ? styles.toggleArrowUp : ''}`}
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div className={styles.cardFooter}>
                    <p
                      className={`${styles.tickets} ${
                        ticketsLeft <= 10 && ticketsLeft > 0 ? styles.ticketsLow : ''
                      } ${isSoldOut ? styles.ticketsOut : ''}`}
                    >
                      {ticketsLabel(ticketsLeft)}
                    </p>

                    {!isSoldOut ? (
                      <a
                        href={`${HERO_API}/add?ticket_id=${format.public_id}`}
                        className={styles.buyBtn}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Купить билет
                      </a>
                    ) : (
                      <span className={styles.soldOutBtn}>Распродано</span>
                    )}
                  </div>
                </div>
              );
            })}

            <a
              href="https://heroleague.ru/corp"
              className={`${styles.card} ${styles.accent_gold} ${styles.cardCorp}`}
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

              <ul className={`${styles.detailList} ${styles.corpList}`}>
                <li className={styles.detailItem}>Денежные призы для победителей</li>
                <li className={styles.detailItem}>Отчетное видео с гонки</li>
                <li className={styles.detailItem}>Специальные номинации</li>
              </ul>

              <div className={styles.cardFooter}>
                <span className={styles.corpBtn}>Узнать подробнее</span>
              </div>
            </a>
          </div>
        )}

        {formats.length === 0 && !registrationClosed && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Загрузка форматов...</p>
          </div>
        )}

        {selectedCity?.info?.guide && (
          <a
            className={styles.guide}
            href={`${HERO_API}${selectedCity.info.guide}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Скачать гайд участника
          </a>
        )}
      </div>
    </section>
  );
}

export default Events;
