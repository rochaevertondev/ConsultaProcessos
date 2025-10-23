import express from 'express';
import { TelegramController } from '../controllers/telegram.controller.js';

const router = express.Router();
const telegramController = new TelegramController();

// POST /telegram/enviar-resumo - Envia resumo para Telegram
router.post('/enviar-resumo', (req, res) => telegramController.enviarResumo(req, res));

// POST /telegram/testar - Testa configuração do Telegram
router.post('/testar', (req, res) => telegramController.testar(req, res));

export default router;
