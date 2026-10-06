const API_URL = "https://rover-french-promotion.ngrok-free.dev/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Gabungkan header bawaan (termasuk anti-warning Ngrok) dengan opsi tambahan dari komponen
  const defaultHeaders = {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  });

  return res;
};