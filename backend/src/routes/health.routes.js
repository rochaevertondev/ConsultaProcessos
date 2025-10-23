import express from 'express';
import { config } from '../config/env.js';

const router = express.Router();

// GET /health - Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataJudAPI: !!config.datajud.apiKey,
    storage: 'localStorage (cliente)',
    mode: 'user-configured-bots'
  });
});

export default router;
