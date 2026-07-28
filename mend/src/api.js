import axios from 'axios';
import { returnAuthConfig } from './utils/auth';

export const HERO_API = import.meta.env.VITE_API;
const TIMEOUT = 5000;

const api = axios.create({
  baseURL: HERO_API,
  timeout: TIMEOUT,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const getInsuranceByPublicId = async (publicId) => {
  try {
    const response = await api.get(`/api/insurances/${publicId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения страховки по public id:', error);
  }
};

const Error = {
  UNAUTHORIZED: 401,
  INVALID_TOKEN: 403,
};

export const createAPI = () => {
  const apiInstance = axios.create({
    baseURL: HERO_API,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  const onSuccess = (response) => response;

  const onFail = (err) => {
    const { response } = err;

    if (!response) throw err;
    else if (response.status === 400) {
      // handle bad request
    } else if (
      response.status === 500 ||
      response.status === 502 ||
      response.status === 422
    ) {
      // handle server error
    } else if (
      response.status === Error.UNAUTHORIZED ||
      response.status === Error.INVALID_TOKEN
    ) {
      if (response.status === Error.INVALID_TOKEN)
        localStorage.removeItem('token');
      throw err;
    } else if (response.data) return response;

    throw err;
  };

  apiInstance.interceptors.response.use(onSuccess, onFail);

  return apiInstance;
};

export const axiosBaseQuery = () => async (props) => {
  const { url, method, data, params } = props;

  let result;
  try {
    if (typeof props === 'string') {
      result = await api({
        url: props,
        method: 'GET',
        headers: returnAuthConfig().headers,
      });
    } else {
      result = await api({
        url,
        method,
        data,
        params,
        headers: returnAuthConfig().headers,
      });
    }

    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};

export default api;
