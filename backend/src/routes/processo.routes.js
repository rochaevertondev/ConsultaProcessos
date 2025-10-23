import express from 'express';
import { ProcessoController } from '../controllers/processo.controller.js';

const router = express.Router();
const processoController = new ProcessoController();

// POST /processos/buscar - Busca processo na API
router.post('/buscar', (req, res) => processoController.buscar(req, res));

export default router;
