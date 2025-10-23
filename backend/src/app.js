import express from 'express';
import cors from 'cors';
import processoRoutes from './routes/processo.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/processos', processoRoutes);
app.use('/telegram', telegramRoutes);
app.use('/', healthRoutes);

export default app;
