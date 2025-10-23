/**
 * Hook para gerenciar configuração e ações do Telegram
 */
import { useLocalStorage } from './useLocalStorage';
import * as telegramService from '../services/telegram.service';

export const useTelegram = (showToast) => {
  const [config, setConfig] = useLocalStorage('telegramConfig', {
    botToken: '',
    chatId: '',
  });

  /**
   * Testa conexão com Telegram
   */
  const testar = async () => {
    if (!config.botToken || !config.chatId) {
      showToast('❌ Configure o bot antes de testar', 'error');
      return { success: false };
    }

    const result = await telegramService.testarTelegram(
      config.botToken,
      config.chatId
    );

    if (result.success) {
      showToast('✅ Bot configurado com sucesso!', 'success');
    } else {
      showToast(`❌ ${result.error}`, 'error');
    }

    return result;
  };

  /**
   * Envia processo para o Telegram
   */
  const enviarProcesso = async (processo) => {
    if (!config.botToken || !config.chatId) {
      showToast('❌ Configure o bot antes de enviar', 'error');
      return { success: false };
    }

    if (!processo) {
      showToast('❌ Nenhum processo selecionado', 'error');
      return { success: false };
    }

    const result = await telegramService.enviarResumo(
      config.botToken,
      config.chatId,
      processo
    );

    if (result.success) {
      showToast('✅ Resumo enviado para o Telegram!', 'success');
    } else {
      showToast(`❌ ${result.error}`, 'error');
    }

    return result;
  };

  /**
   * Salva configuração do Telegram
   */
  const salvarConfig = (novaConfig) => {
    if (!novaConfig.botToken || !novaConfig.chatId) {
      showToast('❌ Preencha o Token e o Chat ID', 'error');
      return false;
    }

    setConfig(novaConfig);
    showToast('✅ Configuração salva com sucesso!', 'success');
    return true;
  };

  /**
   * Verifica se está configurado
   */
  const isConfigured = () => {
    return config.botToken && config.chatId;
  };

  return {
    config,
    salvarConfig,
    testar,
    enviarProcesso,
    isConfigured,
  };
};
