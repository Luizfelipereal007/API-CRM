import express from 'express';
import BoletoController from '../controller/BoletoController.js';

const router = express.Router();

router.get('/', BoletoController.listarBoletos);

router.get('/projeto/:projetoId', BoletoController.listarBoletosPorProjeto);

router.get('/usuario/:usuarioId', BoletoController.listarBoletosPorUsuario);

router.get('/email/:email', BoletoController.buscarBoletosPorEmail);

router.get('/nome/:nome', BoletoController.buscarBoletosPorNome);

router.get('/cpf/:cpf', BoletoController.buscarBoletosPorCpf);

router.post('/', BoletoController.criarBoleto);

router.put('/:id/pagar', BoletoController.pagarBoleto);

router.delete('/:id', BoletoController.deletarBoleto);

export default router;

