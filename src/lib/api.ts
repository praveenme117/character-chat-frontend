import axios from 'axios';
import { getPublicEnv } from '../config/env';

const { backendUrl } = getPublicEnv();

export const api = axios.create({
  baseURL: backendUrl,
});

export default api;
