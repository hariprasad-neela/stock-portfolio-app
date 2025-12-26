// VITE_API_URL will be empty on local (using proxy) 
// but will be your Render URL on Vercel.
const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = async (path: string, options: any = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return response.json();
};