/**
 * Componente de Lista de Processos (Offcanvas)
 */
import React from 'react';

const ProcessList = ({ 
  show, 
  processos, 
  onClose, 
  onSendToTelegram, 
  onDelete,
  onSelect
}) => {
  if (!show) return null;
  
  return (
    <>
      {/* Offcanvas */}
      <div className="offcanvas">
        <div className="offcanvas-header">
          <h3>📂 Processos Salvos</h3>
          <button className="btn-close-offcanvas" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="offcanvas-body">
          {processos.length === 0 ? (
            <p className="empty-offcanvas">Nenhum processo salvo ainda</p>
          ) : (
            <ul className="processos-list">
              {processos.map(p => {
                // Limpa o número removendo tudo que não é dígito
                const numeroLimpo = p.numero.replace(/\D/g, '');
                // Formata com máscara CNJ
                const numeroFormatado = numeroLimpo.replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6');
                
                return (
                  <li 
                    key={p.id} 
                    className="processo-item"
                    onClick={() => onSelect(p)}
                    style={{ cursor: 'pointer' }}
                    title="Clique para visualizar"
                  >
                    <div className="processo-item-info">
                      <strong>{numeroFormatado}</strong>
                      {p.tribunal && <span className="badge-small">{p.tribunal}</span>}
                    </div>
                    <div className="processo-item-actions">
                      <button 
                        className="btn-icon btn-telegram"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendToTelegram(p);
                          onClose();
                        }}
                        title="Enviar para Telegram"
                      >
                        📱
                      </button>
                      <button 
                        className="btn-icon btn-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(p.id);
                        }}
                        title="Excluir processo"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Overlay */}
      {show && (
        <div className="overlay" onClick={onClose}></div>
      )}
    </>
  );
};

export default ProcessList;
