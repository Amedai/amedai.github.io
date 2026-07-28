export const CITY_ID = 527579;
export const CITY_NAME = 'Менделеевск';

export const routes = {
  main: {
    path: '/',
    name: 'Главная',
  },
  event: {
    path: '/event',
    name: 'Мероприятие',
  },
  personal: {
    path: '/me',
    name: 'Личный кабинет',
  },
  calendar: {
    path: '/calendar',
    name: 'Календарь мероприятий',
  },
  basket: {
    path: '/basket',
    name: 'Корзина',
  },
  about: {
    path: '/about',
    name: 'О нас',
  },
  partners: {
    path: '/partners',
    name: 'Партнеры',
  },
  corporate: {
    path: '/corp',
    name: 'Корпоративным клиентам',
  },
  feedback: {
    path: '/feedback',
    name: 'Обратная связь',
  },
  news: {
    path: '/news',
    name: 'Новости Лиги Героев',
  },
};

export const REGEX_MAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,12}$/i;
