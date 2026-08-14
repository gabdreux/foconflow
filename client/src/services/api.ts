import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  async get(endpoint: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Erro ao realizar requisição';
      try {
        const err = JSON.parse(text);
        errorMessage = err.error || err.message || errorMessage;
      } catch {
        errorMessage = `Erro ${response.status}: Rota '${endpoint}' não encontrada no servidor.`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  async post(endpoint: string, body: unknown) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Erro ao realizar requisição';
      try {
        const err = JSON.parse(text);
        errorMessage = err.error || err.message || errorMessage;
      } catch {
        errorMessage = `Erro ${response.status}: Falha ao enviar para '${endpoint}'.`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  },
};