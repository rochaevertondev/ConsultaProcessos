import TelegramBot from 'node-telegram-bot-api';

/**
 * Serviço para envio de mensagens via Telegram
 */
export class TelegramService {
  /**
   * Envia uma mensagem via Telegram
   * @param {string} chatId - ID do chat de destino
   * @param {string} mensagem - Mensagem a ser enviada
   * @param {string} botToken - Token do bot do Telegram
   * @returns {Promise<Object>} Resultado do envio
   */
  async enviarMensagem(chatId, mensagem, botToken) {
    try {
      if (!botToken) {
        throw new Error('Bot token não configurado');
      }

      // Cria uma instância do bot com o token fornecido
      const botInstance = new TelegramBot(botToken, { polling: false });

      console.log(`📤 Enviando notificação para chat ${chatId}...`);
      await botInstance.sendMessage(chatId, mensagem, { parse_mode: 'HTML' });
      console.log('✅ Notificação enviada com sucesso!');
      
      return { sucesso: true };
    } catch (err) {
      console.error('❌ Erro ao enviar notificação Telegram:', err.message);
      return { sucesso: false, erro: err.message };
    }
  }

  /**
   * Formata um resumo de processo para envio no Telegram
   * @param {Object} dados - Dados do processo
   * @returns {string} Mensagem formatada
   */
  formatarResumoProcesso({ numero, tribunal, movimentacoes }) {
    return `📋 <b>RESUMO DO PROCESSO</b>\n\n` +
           `🔢 <b>Número:</b> <code>${numero}</code>\n` +
           (tribunal ? `🏛️ <b>Tribunal:</b> ${tribunal}\n` : '') +
           `📅 <b>Consultado em:</b> ${new Date().toLocaleString('pt-BR')}\n\n` +
           `📝 <b>Movimentações:</b>\n${movimentacoes.substring(0, 3000)}\n\n` +
           `✅ <b>Dados armazenados apenas no seu navegador</b>`;
  }

  /**
   * Formata mensagem de teste de configuração
   * @returns {string} Mensagem formatada
   */
  formatarMensagemTeste() {
    return `🧪 <b>Teste de Configuração</b>\n\n` +
           `✅ Seu bot está configurado corretamente!\n` +
           `📅 Testado em: ${new Date().toLocaleString('pt-BR')}\n\n` +
           `Agora você pode receber resumos dos processos diretamente aqui.`;
  }
}
