import express from 'express';
import BlipController from '../controller/BlipController.js';

const router = express.Router();

router.get('/getProjetosPorEmail', BlipController.getProjetosPorEmail);

router.get('/getBoletosPorCpf', BlipController.getBoletosPorCpf);

router.get('/getNotasFiscaisPorCpf', BlipController.getNotasFiscaisPorCpf);

router.get('/getResumoPagamentosPorCpf', BlipController.getResumoPagamentosPorCpf);

export default router;

