// Configurações de ambiente
export const config = {
  port: process.env.BACKEND_PORT || 3001,
  datajud: {
    apiKey: process.env.DATAJUD_API_KEY,
    baseUrl: process.env.DATAJUD_BASE_URL || 'https://api-publica.datajud.cnj.jus.br'
  }
};
