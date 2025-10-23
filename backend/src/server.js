import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📊 Armazenamento: localStorage do navegador (sem banco de dados)`);
  console.log(`🔒 LGPD: Dados armazenados apenas no dispositivo do usuário`);
});
