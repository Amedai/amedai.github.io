import { createReducer } from '@reduxjs/toolkit';
import { setEventsList, setEventsLoading, setOpenPageStatus, setSelectedCity } from '../action';

const initialState = {
  selectedCity: null,
  events: null,
  isEventsLoading: false,
  isFirstOpenPage: true,
};

const app = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelectedCity, (state, action) => {
      state.selectedCity = action.payload;
    })
    .addCase(setEventsList, (state, action) => {
      state.events = action.payload;
    })
    .addCase(setEventsLoading, (state, action) => {
      state.isEventsLoading = action.payload;
    })
    .addCase(setOpenPageStatus, (state, action) => {
      state.isFirstOpenPage = action.payload;
    })
});

export { app };
