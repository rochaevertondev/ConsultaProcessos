/**
 * Componente de Detalhes do Processo
 */
import React from 'react';

const ProcessDetails = ({ processo, onSave }) => {
  if (!processo) return null;

  const renderMovimentacoes = () => {
    const movimentacoes = processo.movimentacoes || '';
    const linhas = movimentacoes.split('\n').filter(l => l.trim());
    
    if (linhas.length === 0) {
      return <p className="no-data">Nenhuma movimentação encontrada</p>;
    }

    return linhas.map((linha, index) => {
      const isClasse = linha.includes('Classe:');
      const isOrgao = linha.includes('Órgão:');
      const isAssunto = linha.includes('Assunto:');
      const isAjuizamento = linha.includes('Ajuizamento:');
      const isUltima = linha.includes('Última Atualização:');
      const isUltimaMovimentacao = linha.startsWith('📌');
      const isMovimentacao = linha.match(/^\[?\d+\]?\s+\d{2}\/\d{2}\/\d{4}/);
      const isEmoji = /^[📌🏛️📄⚖️📅🔔⚠️]/.test(linha);
      
      return (
        <div 
          key={index} 
          className={`
            movimentacao-item
            ${isClasse ? 'item-classe' : ''}
            ${isOrgao ? 'item-orgao' : ''}
            ${isAssunto ? 'item-assunto' : ''}
            ${isAjuizamento ? 'item-ajuizamento' : ''}
            ${isUltima ? 'item-ultima' : ''}
            ${isMovimentacao ? 'item-movimentacao' : ''}
            ${isEmoji ? 'item-destaque' : ''}
          `}
        >
          {linha}
        </div>
      );
    });
  };

  return (
    <div className="processos-grid single-result">
      <div className="processo-card">
        <div className="processo-header">
          <div className="processo-title">
            <h3>Processo {processo.numero}</h3>
            {processo.tribunal && (
              <span className="processo-tribunal">{processo.tribunal}</span>
            )}
          </div>
          
          {/* Partes do Processo */}
          {processo.partes ? (
            (processo.partes.autores?.length > 0 || processo.partes.reus?.length > 0) ? (
              <div className="processo-partes">
                {processo.partes.autores?.length > 0 && (
                  <div className="partes-grupo">
                    <strong>👤 Autor(a):</strong>
                    <span>{processo.partes.autores.join(', ')}</span>
                  </div>
                )}
                {processo.partes.reus?.length > 0 && (
                  <div className="partes-grupo">
                    <strong>⚖️ Réu(Requerido):</strong>
                    <span>{processo.partes.reus.join(', ')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="processo-partes processo-partes-vazio">
                <p>⚠️ Partes não disponíveis na API</p>
              </div>
            )
          ) : null}
          
          <div className="processo-actions">
            <button 
              className="btn-save-processo"
              onClick={onSave}
              title="Salvar processo na lista"
            >
              💾 Salvar
            </button>
          </div>
        </div>
        
        <div className="processo-card-body">
          <h3 className="section-title">📋 Movimentações do Processo</h3>
          <div className="movimentacoes-list">
            {renderMovimentacoes()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetails;
