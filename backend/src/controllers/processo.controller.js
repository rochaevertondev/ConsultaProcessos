import { DataJudService } from '../services/datajud.service.js';

const datajudService = new DataJudService();

/**
 * Controller para operações de processos
 */
export class ProcessoController {
  /**
   * Busca um processo na API DataJud
   */
  async buscar(req, res) {
    const { numero } = req.body;

    if (!numero) {
      return res.status(400).json({ error: 'Número do processo é obrigatório' });
    }

    try {
      const dadosProcesso = await datajudService.buscarProcesso(numero);

      if (!dadosProcesso.encontrado) {
        return res.status(404).json({
          error: 'Processo não encontrado',
          numero
        });
      }

      res.json({
        processo: {
          numero: dadosProcesso.numero,
          tribunal: dadosProcesso.tribunal,
          movimentacoes: dadosProcesso.movimentacoes,
          dataUltimaAtualizacao: dadosProcesso.dataUltimaAtualizacao,
          totalMovimentacoes: dadosProcesso.totalMovimentacoes,
          consultadoEm: new Date().toISOString()
        },
        mensagem: 'Processo consultado com sucesso'
      });

    } catch (err) {
      console.error('Erro ao buscar processo:', err);
      res.status(500).json({
        error: 'Erro ao buscar processo',
        detalhes: err.message
      });
    }
  }
}
