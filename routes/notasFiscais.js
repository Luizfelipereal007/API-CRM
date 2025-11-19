import express from 'express';
import NotaFiscalController from '../controller/NotaFiscalController.js';

const router = express.Router();

router.get('/', NotaFiscalController.listarNotasFiscais);

router.get('/projeto/:projetoId', NotaFiscalController.listarNotasFiscaisPorProjeto);

router.get('/usuario/:usuarioId', NotaFiscalController.listarNotasFiscaisPorUsuario);

router.delete('/:id', NotaFiscalController.deletarNotaFiscal);

export default router;

