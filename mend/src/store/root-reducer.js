import { combineReducers } from '@reduxjs/toolkit';
import { app } from './app/app';
import { feedbackSlice } from './feedback';

const NameSpace = {
  APP: 'APP',
};

export { NameSpace };
export default combineReducers({
  [NameSpace.APP]: app,
  [feedbackSlice.reducerPath]: feedbackSlice.reducer,
});
