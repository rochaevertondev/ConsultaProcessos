/**
 * Serviço de Telegram - Integração com API
 */
import api from './api';

/**
 * Testa configuração do bot Telegram
 */
export const testarTelegram = async (botToken, chatId) => {
  try {
    const response = await api.post('/telegram/testar', {
      botToken,
      chatId,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Erro ao testar Telegram'
    };
  }
};

/**
 * Envia resumo do processo para o Telegram
 */
export const enviarResumo = async (botToken, chatId, processo) => {
  try {
    // Limpa o número do processo (remove tudo que não é dígito)
    const numeroLimpo = processo.numero.replace(/\D/g, '');
    
    const payload = {
      botToken,
      chatId,
      numero: numeroLimpo,
      tribunal: processo.tribunal,
      movimentacoes: processo.movimentacoes || 'Sem movimentações disponíveis',
    };

    const response = await api.post('/telegram/enviar-resumo', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || 'Erro ao enviar resumo'
    };
  }
};
