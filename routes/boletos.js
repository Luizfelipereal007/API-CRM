import express from 'express';
import BoletoController from '../controller/BoletoController.js';

const router = express.Router();

router.get('/', BoletoController.listarBoletos);

router.get('/projeto/:projetoId', BoletoController.listarBoletosPorProjeto);

router.get('/usuario/:usuarioId', BoletoController.listarBoletosPorUsuario);

router.post('/', BoletoController.criarBoleto);

router.put('/:id/pagar', BoletoController.pagarBoleto);

router.delete('/:id', BoletoController.deletarBoleto);

export default router;

