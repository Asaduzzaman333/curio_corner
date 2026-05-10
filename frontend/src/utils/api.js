import axios from "axios";

<<<<<<< HEAD
export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
=======
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
>>>>>>> 4292013668882ef06c50bcc3180dcc50f830320d

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000
});

export const publicAsset = (path) => path || "/assets/cover.jpg";
