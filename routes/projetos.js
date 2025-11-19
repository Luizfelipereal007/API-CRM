import express from 'express';
import ProjetoController from '../controller/ProjetoController.js';

const router = express.Router();

router.get('/', ProjetoController.listarProjetos);

router.get('/:id', ProjetoController.buscarProjeto);

router.get('/usuario/:usuarioId', ProjetoController.listarProjetosPorUsuario);

router.post('/', ProjetoController.criarProjeto);

router.put('/:id', ProjetoController.atualizarProjeto);

router.delete('/:id', ProjetoController.deletarProjeto);

export default router;

