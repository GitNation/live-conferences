const BASE_URL = 'https://ems.gitnation.org';
// const BASE_URL = 'http://localhost:3000';

const fetchCache = new Map();

const baseEventFetch = (path) => {
  return (eventId) => {
    if (!eventId) {
      return Promise.resolve(null);
    }

    const cacheKey = `${eventId}:${path}`;
    if (fetchCache.has(cacheKey)) {
      return fetchCache.get(cacheKey);
    }

    const promise = fetch(`${BASE_URL}/api/events/${eventId}/${path}`)
      .then((res) => {
        if (!res.ok) {
          return reject(res.statusText);
        }

        fetchCache.delete(cacheKey);
        return res.json();
      })
      .catch((error) => {
        fetchCache.delete(cacheKey);
        throw error;
      });

    fetchCache.set(cacheKey, promise);
    return promise;
  };
};

export const getPriceIncrease = baseEventFetch('price-increase');
