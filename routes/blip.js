import express from 'express';
import BlipController from '../controller/BlipController.js';

const router = express.Router();

router.get('/getResumoPagamentosPorCpf', BlipController.getResumoPagamentosPorCpf);

export default router;

