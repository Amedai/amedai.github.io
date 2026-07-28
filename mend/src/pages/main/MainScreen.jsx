import Header from '../../components/header/Header';
import Hero from '../../components/hero/Hero';
import EventInfo from '../../components/event-info/EventInfo';
import MediaGallery from '../../components/media-gallery/MediaGallery';
import Reviews from '../../components/reviews/Reviews';
import About from '../../components/about/About';
import Events from '../../components/events/Events';
import CorpService from '../../components/corp-service/CorpService';
import FunZone from '../../components/fun-zone/FunZone';
import Spectators from '../../components/spectators/Spectators';
import Schedule from '../../components/schedule/Schedule';
import TrackMap from '../../components/track-map/TrackMap';
import Faq from '../../components/faq/Faq';
import MapComponent from '../../components/map/Map';
import CityInfo from '../../components/city-info/CityInfo';
import Partners from '../../components/partners/Partners';
import Footer from '../../components/footer/Footer';

function MainScreen() {
  return (
    <>
      <Header />
      <Hero />
      <EventInfo />
      <MediaGallery />
      <Reviews />
      <About />
      <Events />
      <CorpService />
      <FunZone />
      <Spectators />
      <Schedule />
      <TrackMap />
      <CityInfo />
      <Faq />
      <MapComponent />
      <Partners />
      <Footer />
    </>
  );
}

export default MainScreen;
