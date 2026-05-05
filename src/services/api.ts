import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.tu-backend.com', // Cambia esto por tu URL real
});

export default api;
