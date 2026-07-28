import { NameSpace } from '../root-reducer';

const getSelectedCity = (state) => state[NameSpace.APP].selectedCity;
const getEventsList = (state) => state[NameSpace.APP].events;
const getEventsLoading = (state) => state[NameSpace.APP].isEventsLoading;
const getOpenPageStatus = (state) => state[NameSpace.APP].isFirstOpenPage;

export {
  getSelectedCity,
  getEventsList,
  getEventsLoading,
  getOpenPageStatus,
};
