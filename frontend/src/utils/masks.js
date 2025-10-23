/**
 * Utilitários de máscaras para inputs
 */

/**
 * Aplica máscara no número de processo
 * Formato: 0000000-00.0000.0.00.0000
 */
export const applyProcessoMask = (value) => {
  const numbers = value.replace(/\D/g, '');
  
  let masked = numbers;
  if (numbers.length > 7) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7);
  }
  if (numbers.length > 9) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7, 9) + '.' + numbers.slice(9);
  }
  if (numbers.length > 13) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7, 9) + '.' + numbers.slice(9, 13) + '.' + numbers.slice(13);
  }
  if (numbers.length > 14) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7, 9) + '.' + numbers.slice(9, 13) + '.' + numbers.slice(13, 14) + '.' + numbers.slice(14);
  }
  if (numbers.length > 16) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7, 9) + '.' + numbers.slice(9, 13) + '.' + numbers.slice(13, 14) + '.' + numbers.slice(14, 16) + '.' + numbers.slice(16);
  }
  if (numbers.length > 20) {
    masked = numbers.slice(0, 7) + '-' + numbers.slice(7, 9) + '.' + numbers.slice(9, 13) + '.' + numbers.slice(13, 14) + '.' + numbers.slice(14, 16) + '.' + numbers.slice(16, 20);
  }
  
  return masked;
};

/**
 * Remove máscara do número (apenas dígitos)
 */
export const removeMask = (value) => {
  return value.replace(/\D/g, '');
};
