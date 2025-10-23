/**
 * Componente de Busca de Processo
 */
import React, { useState } from 'react';
import { applyProcessoMask } from '../utils/masks';

const ProcessSearch = ({ onSearch, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const masked = applyProcessoMask(e.target.value);
    setSearchTerm(masked);
  };

  const handleSubmit = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Digite o número do processo (somente números)"
        value={searchTerm}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        maxLength={25}
        disabled={loading}
      />
      <button 
        className="search-button" 
        onClick={handleSubmit} 
        disabled={loading}
      >
        🔎 Buscar
      </button>
    </div>
  );
};

export default ProcessSearch;
