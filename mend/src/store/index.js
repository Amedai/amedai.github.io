import { configureStore } from '@reduxjs/toolkit';
import { redirect } from './middlewares/redirect';
import rootReducer from './root-reducer';
import api from '../api';
import { feedbackSlice } from './feedback';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: api,
      },
    })
      .concat(feedbackSlice.middleware)
      .concat(redirect),
});

export default store;
