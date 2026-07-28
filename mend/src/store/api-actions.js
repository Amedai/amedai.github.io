import { setEventsList, setEventsLoading } from './action';

const fetchEventsList = () => (dispatch, getState, api) => {
  const state = getState();

  if (state.APP.isEventsLoading || state.APP.events) {
    return;
  }

  dispatch(setEventsLoading(true));

  api.get('api/event_city/type/gonka')
    .then((r) => {
      if (r.status === 200) {
        dispatch(setEventsList(r.data.values));
      }
    })
    .catch((error) => {
      console.error('Ошибка загрузки событий:', error);
    })
    .finally(() => {
      dispatch(setEventsLoading(false));
    });
};

export {
  fetchEventsList,
};
