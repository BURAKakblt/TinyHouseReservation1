// frontend/services/api.js
import axios from "axios";

const API_URL = "http://localhost:5254/api"; // Backend URL'in

export const signup = (data) => axios.post(`${API_URL}/signup`, data);
export const login = (data) => axios.post(`${API_URL}/login`, data);
export const getHouses = () => axios.get(`${API_URL}/houses`);
export const addHouse = (formData, token) =>
  axios.post(`${API_URL}/houses`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
