import { ActionType } from '../action';

// eslint-disable-next-line no-unused-vars
const redirect = (store) => (next) => (action) => {
  if (action.type === ActionType.REDIRECT_TO_ROUTE) {
    window.location.href = action.payload;
  }

  return next(action);
};

export { redirect };
