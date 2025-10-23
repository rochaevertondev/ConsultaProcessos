/**
 * Funções de validação
 */

/**
 * Valida se o número de processo está no formato correto
 */
export const isValidProcessoNumber = (numero) => {
  const numbers = numero.replace(/\D/g, '');
  return numbers.length === 20;
};

/**
 * Valida configuração do Telegram
 */
export const isValidTelegramConfig = (config) => {
  return config.botToken && config.botToken.trim() !== '' &&
         config.chatId && config.chatId.trim() !== '';
};

/**
 * Valida se há processo selecionado
 */
export const hasProcessoSelected = (processo) => {
  return processo !== null && processo !== undefined;
};
