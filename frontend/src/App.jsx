/**
 * App.jsx - Componente Principal (Refatorado)
 * 
 * Responsabilidades:
 * - Orquestração dos componentes
 * - Gerenciamento de estado global
 * - Coordenação entre hooks e componentes
 */
import React, { useState } from 'react';
import './App.css'; // Tema FIVE Tech Neon
// import './App.css'; // Tema Original (para rollback)

// Hooks customizados
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/useToast';
import { useTelegram } from './hooks/useTelegram';

// Componentes
import Toast from './components/Toast';
import TelegramConfig from './components/TelegramConfig';
import ProcessSearch from './components/ProcessSearch';
import ProcessDetails from './components/ProcessDetails';
import ProcessList from './components/ProcessList';

// Serviços
import * as processoService from './services/processo.service';
import * as telegramService from './services/telegram.service';

function App() {
  // Estado local
  const [processoAtual, setProcessoAtual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Hooks customizados
  const [processos, setProcessos] = useLocalStorage('processos', []);
  const { toast, showToast, hideToast } = useToast();
  const { config, salvarConfig, testar, enviarProcesso, isConfigured } = useTelegram(showToast);

  /**
   * Busca processo na API
   */
  const handleSearch = async (numeroProcesso) => {
    if (!numeroProcesso || !numeroProcesso.trim()) {
      setError('Digite um número de processo');
      return;
    }

    setLoading(true);
    setError(null);
    setProcessoAtual(null);

    const result = await processoService.buscarProcesso(numeroProcesso);

    if (result.success) {
      // Garante que o número esteja limpo (apenas dígitos)
      const numeroLimpo = result.data.processo.numero.replace(/\D/g, '');
      
      setProcessoAtual({
        ...result.data.processo,
        numero: numeroLimpo, // Salva apenas números
        id: Date.now(),
        adicionadoEm: new Date().toISOString(),
      });
      setError(null);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  /**
   * Salva processo atual na lista
   */
  const handleSalvarProcesso = () => {
    if (!processoAtual) return;

    const jaExiste = processos.find(p => p.numero === processoAtual.numero);

    if (jaExiste) {
      // Atualiza processo existente
      const novosProcessos = processos.map(p =>
        p.numero === processoAtual.numero ? processoAtual : p
      );
      setProcessos(novosProcessos);
      showToast('✅ Processo atualizado com sucesso!', 'success');
    } else {
      // Adiciona novo processo
      setProcessos([...processos, processoAtual]);
      showToast('✅ Processo salvo com sucesso!', 'success');
    }

    setProcessoAtual(null);
  };

  /**
   * Envia processo para Telegram
   */
  const handleEnviarTelegram = async (processo) => {
    if (!isConfigured()) {
      showToast('⚠️ Configure seu bot do Telegram primeiro!', 'info');
      setShowConfigModal(true);
      return;
    }

    setLoading(true);
    await enviarProcesso(processo);
    setLoading(false);
  };

  /**
   * Remove processo da lista
   */
  const handleRemoverProcesso = (id) => {
    const novosProcessos = processos.filter(p => p.id !== id);
    setProcessos(novosProcessos);
    showToast('🗑️ Processo removido', 'info');
  };

  /**
   * Seleciona processo para visualizar na página principal
   */
  const handleSelecionarProcesso = (processo) => {
    setProcessoAtual(processo);
    setShowOffcanvas(false);
    setError(null);
  };

  /**
   * Testa configuração do Telegram
   */
  const handleTestarTelegram = async (botToken, chatId) => {
    if (!botToken || !chatId) {
      showToast('❌ Preencha o Token e o Chat ID', 'error');
      return;
    }

    setLoading(true);
    const result = await telegramService.testarTelegram(botToken, chatId);
    
    if (result.success) {
      showToast('✅ Bot configurado com sucesso!', 'success');
    } else {
      showToast(`❌ ${result.error}`, 'error');
    }
    setLoading(false);
  };

  /**
   * Limpa configuração do Telegram
   */
  const handleLimparConfig = () => {
    salvarConfig({ botToken: '', chatId: '' });
    showToast('🗑️ Configuração removida', 'info');
  };

  return (
    <div className="app-container">
      {/* Lista de Processos (Offcanvas) */}
      <ProcessList
        show={showOffcanvas}
        processos={processos}
        onClose={() => setShowOffcanvas(false)}
        onSendToTelegram={handleEnviarTelegram}
        onDelete={handleRemoverProcesso}
        onSelect={handleSelecionarProcesso}
      />

      {/* Modal de Configuração do Telegram */}
      <TelegramConfig
        show={showConfigModal}
        config={config}
        onClose={() => setShowConfigModal(false)}
        onSave={salvarConfig}
        onTest={handleTestarTelegram}
        onClear={handleLimparConfig}
        toast={toast}
        onToastClose={hideToast}
      />

      {/* Toast Notification - apenas quando modal não está aberto */}
      {!showConfigModal && <Toast toast={toast} onClose={hideToast} />}

      {/* Header */}
      <header className="app-header">
        <div className="header-top">
          <button
            className="btn-config"
            onClick={() => setShowConfigModal(true)}
            title="Configurar Telegram"
          >
            📲
          </button>
        </div>
        <h1>Consulta de Processos 🔍</h1>
        <p className="subtitle">Gerencie e consulte seus processos jurídicos</p>
        {processos.length === 0 && (
          <p className="lgpd-info">🔒 Seus dados são armazenados apenas no seu navegador</p>
        )}

        {processos.length > 0 && (
          <button
            className="btn-open-offcanvas"
            onClick={() => setShowOffcanvas(true)}
          >
            📂 Meus Processos ({processos.length})
          </button>
        )}
      </header>

      {/* Busca de Processo */}
      <ProcessSearch onSearch={handleSearch} loading={loading} />

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
          <p className="loading-text">Buscando processo...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !processoAtual && processos.length === 0 && (
        <div className="empty-state">
          <p>📂 Nenhum processo salvo ainda</p>
          <small>Digite um número de processo para buscar</small>
        </div>
      )}

      {/* Detalhes do Processo Atual */}
      {!loading && !error && processoAtual && (
        <ProcessDetails
          processo={processoAtual}
          onSave={handleSalvarProcesso}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <a 
          href="https://fivewebservices.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-logo-link"
          title="FIVE Services"
        >
        </a>
        <div className="app-footer-content">
          <p>© 2025 fivewebservices.com - Sistema de Gestão de Processos</p>
          <p className="lgpd-footer">🔒 Dados armazenados apenas localmente conforme a LGPD 🛡️</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
