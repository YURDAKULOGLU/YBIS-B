import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const baseURL = 'http://localhost:3000/api'; // TODO: Use React Native Config for env vars

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error mapper
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default client;
