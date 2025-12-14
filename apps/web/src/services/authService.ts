import axios from "axios";

const API_URL = "http://localhost:3000/api";

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (email: string, username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, { email, username, password });
  return response.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );
  return response.data;
};
