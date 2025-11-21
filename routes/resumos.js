import express from 'express';
import ResumoController from '../controller/ResumoController.js';

const router = express.Router();

router.get('/getResumoPagamentosPorCpf', ResumoController.getResumoPagamentosPorCpf);

export default router;