import axios from "axios";

const API = axios.create({
  baseURL: "https://spam-email-detector-ji7h.onrender.com",
});

API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    const parsedUser = JSON.parse(userInfo);

    if (parsedUser.token) {
      config.headers.Authorization = `Bearer ${parsedUser.token}`;
    }
  }

  return config;
});

export default API;
