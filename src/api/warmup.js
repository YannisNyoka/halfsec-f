import api from './axios';

let isWarmedUp = false;

export const warmupBackend = async () => {
  if (isWarmedUp) return true;

  try {
    await api.get('/health', { timeout: 30000 });
    isWarmedUp = true;
    return true;
  } catch {
    return false;
  }
};

export const resetWarmup = () => {
  isWarmedUp = false;
};