import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getUserData = (token, userId) =>
  api.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
