import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000
});

export const publicAsset = (path) => path || "/assets/cover.jpg";

let pendingRequests = 0;
const loadingListeners = new Set();

const notifyLoadingListeners = () => {
  loadingListeners.forEach((listener) => listener(pendingRequests));
};

export const subscribeApiLoading = (listener) => {
  loadingListeners.add(listener);
  listener(pendingRequests);
  return () => loadingListeners.delete(listener);
};

const finishRequest = () => {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notifyLoadingListeners();
};

api.interceptors.request.use(
  (config) => {
    pendingRequests += 1;
    notifyLoadingListeners();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    finishRequest();
    return response;
  },
  (error) => {
    finishRequest();
    return Promise.reject(error);
  }
);
