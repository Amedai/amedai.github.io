import { createAction } from '@reduxjs/toolkit';

const ActionType = {
  REDIRECT_TO_ROUTE: 'app/redirectToRoute',
  SELECT_CITY: 'app/selectCity',
  SET_EVENTS_LIST: 'app/eventsList',
  SET_EVENTS_LOADING: 'app/eventsLoading',
  SET_OPEN_PAGE_STATUS: 'app/page',
};

const setSelectedCity = createAction(ActionType.SELECT_CITY, (city) => ({
  payload: city,
}));

const setEventsList = createAction(ActionType.SET_EVENTS_LIST, (events) => ({
  payload: events,
}));

const setOpenPageStatus = createAction(ActionType.SET_OPEN_PAGE_STATUS, (status) => ({
  payload: status,
}));

const setEventsLoading = createAction(ActionType.SET_EVENTS_LOADING, (loading) => ({
  payload: loading,
}));

export {
  ActionType,
  setSelectedCity,
  setEventsList,
  setEventsLoading,
  setOpenPageStatus,
};
