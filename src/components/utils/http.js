const BASE_URL = 'https://ems.gitnation.org';
// const BASE_URL = 'http://localhost:3000';

const baseEventFetch = (path) => {
  return (eventId) => {
    return new Promise((resolve, reject) => {
      if (!eventId) {
        resolve(null);
        return;
      }

      fetch(`${BASE_URL}/api/events/${eventId}/${path}`).then((res) => {
        if (res.ok) {
          resolve(res.json());
        }
      });
    });
  };
};

export const getPriceIncrease = baseEventFetch('price-increase');
