/**
 * Serviço de Processo - Integração com API
 */
import api from './api';

/**
 * Busca processo pelo número
 */
export const buscarProcesso = async (numero) => {
  try {
    const response = await api.post('/processos/buscar', { numero });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Erro ao buscar processo'
    };
  }
};

/**
 * Verifica health da API
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: 'API indisponível' };
  }
};
