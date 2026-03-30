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
      
      // Extrai as partes do processo
      const partes = this._extrairPartes(processo);

      return {
        encontrado: true,
        numero,
        tribunal: tribunalInfo.codigo,
        movimentacoes,
        partes,
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
   * Formata uma data de forma segura
   * @param {string|Date} data - Data a formatar (ISO, timestamp ou YYYYMMDDHHMMSS)
   * @param {boolean} incluirHora - Se deve incluir a hora
   * @returns {string} Data formatada ou empty string
   * @private
   */
  _formatarData(data, incluirHora = false) {
    if (!data) return '';
    
    try {
      let dataObj;
      
      // Se for string numérica sem separadores (YYYYMMDDHHMMSS)
      if (typeof data === 'string' && /^\d{14,}$/.test(data.trim())) {
        const dataSemEspacos = data.trim();
        const ano = dataSemEspacos.substring(0, 4);
        const mes = dataSemEspacos.substring(4, 6);
        const dia = dataSemEspacos.substring(6, 8);
        const hora = dataSemEspacos.substring(8, 10) || '00';
        const minuto = dataSemEspacos.substring(10, 12) || '00';
        const segundo = dataSemEspacos.substring(12, 14) || '00';
        
        dataObj = new Date(`${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`);
      } else {
        dataObj = new Date(data);
      }
      
      // Verifica se é uma data válida
      if (isNaN(dataObj.getTime())) {
        console.warn('⚠️ Data inválida:', data, '| Tipo:', typeof data);
        return '';
      }
      
      return incluirHora 
        ? dataObj.toLocaleString('pt-BR')
        : dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('❌ Erro ao formatar data:', error, '| Data original:', data);
      return '';
    }
  }

  /**
   * Extrai as partes (autores/réus) do processo
   * @param {Object} processo - Dados do processo
   * @returns {Object} Partes formatadas {autores: [], reus: []}
   * @private
   */
  _extrairPartes(processo) {
    const partes = {
      autores: [],
      reus: []
    };

    // Tenta buscar as partes em diferentes campos possíveis
    const partesLista = processo.partes || processo.polos || [];

    if (Array.isArray(partesLista)) {
      partesLista.forEach(parte => {
        const nome = parte.nome || parte.nmParte || 'Parte desconhecida';
        
        // Identifica se é autor ou réu baseado no polo ou tipo
        if (parte.polo === 'ATIVO' || parte.tipo === 'ATIVO' || parte.descricao?.includes('Autor')) {
          partes.autores.push(nome);
        } else if (parte.polo === 'PASSIVO' || parte.tipo === 'PASSIVO' || parte.descricao?.includes('Réu')) {
          partes.reus.push(nome);
        } else {
          // Se não conseguir identificar, adiciona como autor por padrão
          partes.autores.push(nome);
        }
      });
    }

    console.log('👥 Partes extraídas:', partes);
    return partes;
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
      const dataAjuiz = this._formatarData(processo.dataAjuizamento);
      if (dataAjuiz) {
        movimentacoes += `📅 Ajuizamento: ${dataAjuiz}\n`;
      }
    }
    
    // Última atualização com a movimentação correspondente
    if (processo.dataHoraUltimaAtualizacao) {
      const dataAtual = this._formatarData(processo.dataHoraUltimaAtualizacao, true);
      if (dataAtual) {
        movimentacoes += `⚠️ Última Atualização: ${dataAtual}\n`;
      }
      
      // Encontra a movimentação correspondente à última atualização
      if (processo.movimentos && processo.movimentos.length > 0) {
        const ultimaMovimentacao = [...processo.movimentos].sort((a, b) => {
          return new Date(b.dataHora) - new Date(a.dataHora);
        })[0];
        
        if (ultimaMovimentacao) {
          const nomeMovimentacao = ultimaMovimentacao.nome || 'Movimentação';
          movimentacoes += `📌 ${nomeMovimentacao}\n`;
          console.log(`✅ Última movimentação adicionada: ${nomeMovimentacao}`);
        }
      }
    }

    // Movimentações
    if (processo.movimentos && processo.movimentos.length > 0) {
      movimentacoes += `\n📝 MOVIMENTAÇÕES:\n\n`;

      // Ordena por data decrescente (mais recentes primeiro)
      const movimentosOrdenados = [...processo.movimentos].sort((a, b) => {
        return new Date(b.dataHora) - new Date(a.dataHora);
      });

      movimentosOrdenados.forEach((mov, index) => {
        const data = this._formatarData(mov.dataHora, true);
        const nome = mov.nome || 'Movimentação';
        if (data) {
          movimentacoes += `[${index + 1}] ${data}\n${nome}\n\n`;
        }
      });
    }

    return movimentacoes;
  }
}
