const API_KEY = import.meta.env.VITE_API_KEY;

export const stopsForLocationUrl = `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/stops-for-location.json?key=${API_KEY}&`;
export const stopDataUrl = `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/arrivals-and-departures-for-stop.json?key=${API_KEY}&`;
export const tripDataUrl = `https://futar.bkk.hu/api/query/v1/ws/otp/api/where/trip-details.json?key=${API_KEY}&`;
