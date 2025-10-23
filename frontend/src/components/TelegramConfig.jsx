/**
 * Componente de Modal de Configuração do Telegram
 */
import React, { useState, useEffect } from 'react';
import Toast from './Toast';

const TelegramConfig = ({ show, onClose, config, onSave, onTest, onClear, toast, onToastClose }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [step, setStep] = useState(0);

  // Sincroniza localConfig com config quando ele mudar
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!show) return null;

  const handleSave = () => {
    const saved = onSave(localConfig);
    if (saved) {
      onClose();
      setStep(0);
    }
  };

  const handleTest = () => {
    onTest(localConfig.botToken, localConfig.chatId);
  };

  const handleClear = () => {
    setLocalConfig({ botToken: '', chatId: '' });
    onClear();
  };

  return (
    <>
      <div className="config-modal">
        <div className="config-modal-header">
          <h2><span className="modal-icon">⚙️</span> Configurar Telegram</h2>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="config-modal-body">
          {/* Toast dentro do modal */}
          <Toast toast={toast} onClose={onToastClose} />
          
          {/* Stepper */}
          <div className="config-stepper">
            <div 
              className={`step ${step >= 0 ? 'active' : ''} clickable`}
              onClick={() => setStep(0)}
            >
              <div className="step-number">1</div>
              <span>Criar Bot</span>
            </div>
            <div 
              className={`step ${step >= 1 ? 'active' : ''} clickable`}
              onClick={() => setStep(1)}
            >
              <div className="step-number">2</div>
              <span>Obter Chat ID</span>
            </div>
            <div 
              className={`step ${step >= 2 ? 'active' : ''} clickable`}
              onClick={() => setStep(2)}
            >
              <div className="step-number">3</div>
              <span>Configurar</span>
            </div>
          </div>

          {/* Passo 0: Criar Bot */}
          {step === 0 && (
            <div className="config-step-content">
              <h3>📱 Passo 1: Criar seu Bot no Telegram</h3>
              <ol className="step-instructions">
                <li>Abra o Telegram e procure por <strong>@BotFather</strong></li>
                <li>Envie o comando <code>/newbot</code></li>
                <li>Escolha um nome para seu bot (ex: "Meu Bot de Processos")</li>
                <li>Escolha um username que termine com "bot" (ex: "meuprocesso_bot")</li>
                <li>O BotFather vai te enviar um <strong>Token</strong> - copie ele!</li>
                <li>Clique no link do seu bot e envie <code>/start</code> para ativá-lo</li>
              </ol>
              <div className="step-actions">
                <button className="btn-next" onClick={() => setStep(1)}>
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* Passo 1: Obter Chat ID */}
          {step === 1 && (
            <div className="config-step-content">
              <h3>🆔 Passo 2: Descobrir seu Chat ID</h3>
              <ol className="step-instructions">
                <li>No Telegram, procure por <strong>@userinfobot</strong></li>
                <li>Envie <code>/start</code> para ele</li>
                <li>Ele vai responder com seu <strong>ID</strong> (um número)</li>
                <li>Copie esse número (é seu Chat ID)</li>
              </ol>
              <div className="step-tip">
                💡 <strong>Dica:</strong> Você também pode usar @get_id_bot ou @myidbot
              </div>
              <div className="step-actions">
                <button className="btn-back" onClick={() => setStep(0)}>
                  ← Voltar
                </button>
                <button className="btn-next" onClick={() => setStep(2)}>
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* Passo 2: Configurar */}
          {step === 2 && (
            <div className="config-step-content">
              <h3>🔧 Passo 3: Configurar o Sistema</h3>
              <p className="step-description">
                Cole abaixo o Token do bot e seu Chat ID que você copiou:
              </p>

              <div className="config-form-group">
                <label>🤖 Token do Bot:</label>
                <input
                  type="text"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={localConfig.botToken}
                  onChange={(e) => setLocalConfig({...localConfig, botToken: e.target.value})}
                />
              </div>

              <div className="config-form-group">
                <label>🆔 Chat ID:</label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={localConfig.chatId}
                  onChange={(e) => setLocalConfig({...localConfig, chatId: e.target.value})}
                />
              </div>

              {(localConfig.botToken || localConfig.chatId) && (
                <div className="config-status">
                  {localConfig.botToken && localConfig.chatId ? (
                    <span className="status-ready">✅ Configuração completa</span>
                  ) : (
                    <span className="status-incomplete">⚠️ Preencha os dois campos</span>
                  )}
                  <button className="btn-clear-config" onClick={handleClear}>
                    🗑️ Limpar
                  </button>
                </div>
              )}

              <div className="step-actions">
                <button className="btn-back" onClick={() => setStep(1)}>
                  ← Voltar
                </button>
                <button 
                  className="btn-test-config" 
                  onClick={handleTest}
                >
                  🧪 Testar Conexão
                </button>
                <button 
                  className="btn-save-config" 
                  onClick={handleSave}
                >
                  💾 Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TelegramConfig;
