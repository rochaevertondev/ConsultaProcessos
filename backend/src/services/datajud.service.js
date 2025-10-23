import axios from 'axios';
import { config } from '../config/env.js';

/**
 * Serviço para buscar processos na API DataJud do CNJ
 */
export class DataJudService {
  /**
   * Busca um processo pelo número
   * @param {string} numero - Número do processo
   * @returns {Promise<Object>} Dados do processo
   */
  async buscarProcesso(numero) {
    console.log(`🔍 Buscando processo ${numero} na API DataJud CNJ...`);

    try {
      if (!config.datajud.apiKey) {
        throw new Error('DATAJUD_API_KEY não configurada no .env');
      }

      // Remove formatação do número (mantém apenas dígitos)
      const numeroLimpo = numero.replace(/\D/g, '');

      // Determina o tribunal pelo número do processo
      const tribunalInfo = this._determinarTribunal(numeroLimpo);

      // Verifica se o tribunal está disponível na API
      if (!tribunalInfo.disponivel) {
        console.log(`⚠️  Tribunal ${tribunalInfo.codigo} não disponível na API DataJud`);
        return {
          encontrado: false,
          numero,
          tribunal: tribunalInfo.codigo,
          mensagem: `A API DataJud ainda não disponibiliza dados para ${tribunalInfo.nome}. Disponível apenas para: Justiça do Trabalho (TRT).`
        };
      }

      // Monta URL da API DataJud
      const url = `${config.datajud.baseUrl}/${tribunalInfo.indice}/_search`;

      // Query Elasticsearch
      const query = {
        query: {
          match: {
            numeroProcesso: numeroLimpo
          }
        }
      };

      console.log(`📡 Requisição DataJud: ${url}`);
      console.log(`📋 Número: ${numeroLimpo} | Tribunal: ${tribunalInfo.codigo}`);

      // Faz requisição à API
      const response = await axios.post(url, query, {
        timeout: 15000,
        headers: {
          'Authorization': `ApiKey ${config.datajud.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'BotProcesso/1.0'
        }
      });

      // Verifica se encontrou resultados
      if (!response.data.hits || !response.data.hits.hits || response.data.hits.hits.length === 0) {
        console.log('⚠️  Processo não encontrado na API');
        return {
          encontrado: false,
          numero,
          tribunal: tribunalInfo.codigo,
          mensagem: 'Processo não encontrado'
        };
      }

      const processo = response.data.hits.hits[0]._source;
      console.log(`✅ Processo encontrado! Total de movimentações: ${processo.movimentos?.length || 0}`);

      // Formata os dados do processo
      const movimentacoes = this._formatarMovimentacoes(processo);

      return {
        encontrado: true,
        numero,
        tribunal: tribunalInfo.codigo,
        movimentacoes,
        dataUltimaAtualizacao: processo.dataHoraUltimaAtualizacao,
        totalMovimentacoes: processo.movimentos?.length || 0
      };

    } catch (error) {
      console.error('❌ Erro ao buscar processo na API:', error.message);

      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Dados:`, error.response.data);
      }

      throw new Error(`Erro ao buscar processo: ${error.message}`);
    }
  }

  /**
   * Determina o tribunal baseado no número do processo
   * @param {string} numeroLimpo - Número do processo sem formatação
   * @returns {Object} Informações do tribunal
   * @private
   */
  _determinarTribunal(numeroLimpo) {
    const segmentoJustica = numeroLimpo.substring(13, 14);
    const codigoTribunal = numeroLimpo.substring(14, 16);

    console.log(`🔍 Debug: Número limpo = ${numeroLimpo}, Segmento = ${segmentoJustica}, Código = ${codigoTribunal}`);

    // Apenas a Justiça do Trabalho (TRT) está disponível na API DataJud pública
    if (segmentoJustica === '5') {
      return {
        codigo: `TRT${codigoTribunal}`,
        nome: `Tribunal Regional do Trabalho da ${codigoTribunal}ª Região`,
        indice: `api_publica_trt${codigoTribunal}`,
        disponivel: true
      };
    }

    // Outros tribunais ainda não estão disponíveis na API pública
    const tribunaisInfo = {
      '1': { codigo: 'STF', nome: 'Supremo Tribunal Federal' },
      '2': { codigo: 'CNJ', nome: 'Conselho Nacional de Justiça' },
      '3': { codigo: 'STJ', nome: 'Superior Tribunal de Justiça' },
      '4': { codigo: `TRF${codigoTribunal}`, nome: `Tribunal Regional Federal da ${codigoTribunal}ª Região` },
      '6': { codigo: 'STM', nome: 'Superior Tribunal Militar' },
      '7': { codigo: 'TST', nome: 'Tribunal Superior do Trabalho' },
      '8': { codigo: `TRE${codigoTribunal}`, nome: `Tribunal Regional Eleitoral` },
      '9': { codigo: 'TSE', nome: 'Tribunal Superior Eleitoral' }
    };

    // Se for Justiça Estadual (segmento 8), identifica o TJ
    if (segmentoJustica === '8') {
      const tribunaisEstaduais = {
        '01': 'TJAC', '02': 'TJAL', '03': 'TJAP', '04': 'TJAM', '05': 'TJBA',
        '06': 'TJCE', '07': 'TJDF', '08': 'TJES', '09': 'TJGO', '10': 'TJMA',
        '11': 'TJMT', '12': 'TJMS', '13': 'TJMG', '14': 'TJPA', '15': 'TJPB',
        '16': 'TJPR', '17': 'TJPE', '18': 'TJPI', '19': 'TJRJ', '20': 'TJRN',
        '21': 'TJRS', '22': 'TJRO', '23': 'TJRR', '24': 'TJSC', '25': 'TJSE',
        '26': 'TJSP', '27': 'TJTO'
      };
      
      const codigoTJ = tribunaisEstaduais[codigoTribunal] || `TJ${codigoTribunal}`;
      return {
        codigo: codigoTJ,
        nome: `Tribunal de Justiça`,
        indice: null,
        disponivel: false
      };
    }

    const info = tribunaisInfo[segmentoJustica] || { 
      codigo: 'Desconhecido', 
      nome: 'Tribunal Desconhecido' 
    };

    return {
      ...info,
      indice: null,
      disponivel: false
    };
  }

  /**
   * Formata as movimentações do processo
   * @param {Object} processo - Dados do processo
   * @returns {string} Movimentações formatadas
   * @private
   */
  _formatarMovimentacoes(processo) {
    let movimentacoes = '';

    // Informações gerais
    if (processo.classe?.nome) {
      movimentacoes += `📂 Classe: ${processo.classe.nome}\n`;
    }
    if (processo.orgaoJulgador?.nome) {
      movimentacoes += `🏛️ Órgão: ${processo.orgaoJulgador.nome}\n`;
    }
    if (processo.assuntos && processo.assuntos.length > 0) {
      movimentacoes += `📋 Assunto: ${processo.assuntos[0].nome}\n`;
    }
    if (processo.dataAjuizamento) {
      const dataAjuiz = new Date(processo.dataAjuizamento).toLocaleDateString('pt-BR');
      movimentacoes += `📅 Ajuizamento: ${dataAjuiz}\n`;
    }
    if (processo.dataHoraUltimaAtualizacao) {
      const dataAtual = new Date(processo.dataHoraUltimaAtualizacao).toLocaleString('pt-BR');
      movimentacoes += `🔔 Última Atualização: ${dataAtual}\n`;
    }

    // Movimentações
    if (processo.movimentos && processo.movimentos.length > 0) {
      movimentacoes += `\n📝 MOVIMENTAÇÕES:\n\n`;

      // Ordena por data decrescente (mais recentes primeiro)
      const movimentosOrdenados = [...processo.movimentos].sort((a, b) => {
        return new Date(b.dataHora) - new Date(a.dataHora);
      });

      movimentosOrdenados.forEach((mov, index) => {
        const data = new Date(mov.dataHora).toLocaleString('pt-BR');
        const nome = mov.nome || 'Movimentação';
        movimentacoes += `[${index + 1}] ${data}\n${nome}\n\n`;
      });
    }

    return movimentacoes;
  }
}
