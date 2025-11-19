import express from 'express';
import UsuarioController from '../controller/UsuarioController.js';

const router = express.Router();

router.get('/', UsuarioController.listarUsuarios);

router.get('/:id', UsuarioController.buscarUsuario);

router.post('/', UsuarioController.criarUsuario);

router.put('/:id', UsuarioController.atualizarUsuario);

router.delete('/:id', UsuarioController.deletarUsuario);

export default router;

