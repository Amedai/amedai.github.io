import styles from './Map.module.scss';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { getLink } from 'geolinks';
import leaflet from 'leaflet';
import { useSelector } from 'react-redux';
import { getSelectedCity } from '../../store/app/selectors';
import { HERO_API } from '../../api';

const PIN_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -4 36 44" width="36" height="44">' +
  '<defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
  '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="%23FF4400" filter="url(%23g)" opacity="0.7"/>' +
  '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0zm0 16.2c-2.3 0-4.2-1.9-4.2-4.2S9.7 7.8 12 7.8s4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2z" fill="%23FF4400"/>' +
  '<circle cx="12" cy="12" r="3.2" fill="%23FFD700"/>' +
  '</svg>'
)}`;

function MapComponent() {
  const city = useSelector(getSelectedCity);
  const lat = city?.geo?.lat ?? 0;
  const lon = city?.geo?.lon ?? 0;
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(leaflet.layerGroup());

  useEffect(() => {
    if (mapRef.current && !mapInstance.current && lat && lon) {
      const instance = leaflet.map(mapRef.current, {
        center: { lat, lng: lon },
        zoom: 14,
      });

      leaflet
        .tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        )
        .addTo(instance);

      mapInstance.current = instance;
    }
  }, [lat, lon]);

  useEffect(() => {
    if (mapInstance.current && lat && lon) {
      markersRef.current.clearLayers();

      const icon = leaflet.icon({
        iconUrl: PIN_SVG,
        iconSize: [36, 44],
        iconAnchor: [18, 40],
      });

      const marker = leaflet.marker({ lat, lng: lon }, { icon });
      markersRef.current.addLayer(marker);
      markersRef.current.addTo(mapInstance.current);
      mapInstance.current.setView([lat, lon], 14);
    }
  }, [lat, lon]);

  if (!city?.geo?.lat) return null;

  const googleLink = getLink('google', {
    lat: city.geo.lat,
    lng: city.geo.lon,
    zoom: 16,
    language: 'ru',
  });
  const yandexLink = getLink('yandex', {
    lat: city.geo.lat,
    lng: city.geo.lon,
    zoom: 16,
  });

  return (
    <section className={styles.section} id="whereis">
      <div className={styles.container}>
        <h2 className={styles.title}>Как добраться</h2>

        <div className={styles.info}>
          <p className={styles.text}>Построить маршрут:</p>
          <div className={styles.links}>
            <a
              href={yandexLink}
              className={styles.mapLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Яндекс Карты
            </a>
            <a
              href={googleLink}
              className={styles.mapLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
            </a>
          </div>
          <p className={styles.note}>
            Приезжайте с болельщиками — для них вход бесплатный!
          </p>
          {city?.info?.guide && (
            <a
              href={`${HERO_API}${city.info.guide}`}
              className={styles.guideLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Гайд участника
            </a>
          )}
        </div>
      </div>

      <div className={styles.mapWrap}>
        <div className={styles.mapContainer} ref={mapRef} />
      </div>
    </section>
  );
}

export default MapComponent;
