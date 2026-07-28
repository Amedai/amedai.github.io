export const returnAuthConfig = () => {
  const token = localStorage.getItem('token');

  return {
    headers: token
      ? {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
        }
      : { 'Content-Type': 'application/json', Accept: 'application/json' },
  };
};
