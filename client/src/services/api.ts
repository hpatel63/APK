import axios from 'axios';
import CryptoJS from 'crypto-js';

const api = axios.create();

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('aurora.auth');
  if (stored) {
    const token = JSON.parse(stored).token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data && typeof config.data === 'object') {
    const payload = JSON.stringify(config.data);
    const encrypted = CryptoJS.AES.encrypt(payload, 'aurora-offline-key').toString();
    config.headers = config.headers || {};
    config.headers['X-Payload-Hash'] = CryptoJS.SHA256(encrypted).toString();
  }
  return config;
});

export default api;
