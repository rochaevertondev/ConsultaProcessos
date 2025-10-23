import { TelegramService } from '../services/telegram.service.js';

const telegramService = new TelegramService();

/**
 * Controller para operações do Telegram
 */
export class TelegramController {
  /**
   * Envia resumo de processo para o Telegram
   */
  async enviarResumo(req, res) {
    const { numero, movimentacoes, tribunal, botToken, chatId } = req.body;

    if (!numero) {
      return res.status(400).json({ error: 'Número do processo é obrigatório' });
    }

    if (!movimentacoes) {
      return res.status(400).json({ error: 'Movimentações são obrigatórias' });
    }

    // Exige que o usuário configure seu próprio bot
    if (!botToken || !chatId) {
      return res.status(400).json({
        error: 'Configure seu bot do Telegram',
        mensagem: 'É necessário configurar o Token do Bot e Chat ID nas configurações'
      });
    }

    try {
      // Formata a mensagem
      const mensagem = telegramService.formatarResumoProcesso({
        numero,
        tribunal,
        movimentacoes
      });

      // Envia via Telegram usando as credenciais do usuário
      const resultado = await telegramService.enviarMensagem(chatId, mensagem, botToken);

      if (resultado.sucesso) {
        res.json({
          sucesso: true,
          mensagem: 'Resumo enviado com sucesso!',
          chatId: chatId
        });
      } else {
        res.status(500).json({
          error: 'Erro ao enviar notificação',
          detalhes: resultado.erro
        });
      }
    } catch (err) {
      console.error('Erro ao enviar resumo:', err);
      res.status(500).json({
        error: 'Erro ao enviar resumo',
        detalhes: err.message
      });
    }
  }

  /**
   * Testa configuração do Telegram
   */
  async testar(req, res) {
    const { botToken, chatId } = req.body;

    if (!botToken || !chatId) {
      return res.status(400).json({ error: 'Bot Token e Chat ID são obrigatórios' });
    }

    try {
      const mensagem = telegramService.formatarMensagemTeste();
      const resultado = await telegramService.enviarMensagem(chatId, mensagem, botToken);

      if (resultado.sucesso) {
        res.json({
          sucesso: true,
          mensagem: 'Teste realizado com sucesso! Verifique seu Telegram.',
        });
      } else {
        res.status(500).json({
          error: 'Erro ao testar configuração',
          detalhes: resultado.erro
        });
      }
    } catch (err) {
      console.error('Erro ao testar Telegram:', err);
      res.status(500).json({
        error: 'Erro ao testar configuração',
        detalhes: err.message
      });
    }
  }
}
