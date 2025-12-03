import express from 'express';
import FAQController from '../controller/FAQController.js';

const router = express.Router();

router.post('/', (req, res) => FAQController.buscarFAQ(req, res));

router.get('/assuntos', (req, res) => FAQController.listarAssuntos(req, res));

router.get('/assunto/:assunto', (req, res) => FAQController.buscarPorAssunto(req, res));

export default router;