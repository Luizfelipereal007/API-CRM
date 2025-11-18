import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const usuarios = await db.all('SELECT * FROM usuarios ORDER BY id');
    
    if (usuarios.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'Nenhum usuário foi encontrado',
        data: []
      });
    }
    
    res.status(200).json({
      status: true,
      message: 'Usuários encontrados: ' + usuarios.length,
      data: usuarios
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    
    if (!usuario) {
      return res.status(204).json({
        status: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Usuário encontrado',
      data: usuario
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, sobrenome, telefone, cpf, email } = req.body;

    if (!nome || !sobrenome || !telefone || !cpf || !email) {
      return res.status(422).json({
        status: false,
        message: 'Todos os campos são obrigatórios',
        required: ['nome', 'sobrenome', 'telefone', 'cpf', 'email']
      });
    }

    const result = await db.run(
      'INSERT INTO usuarios (nome, sobrenome, telefone, cpf, email) VALUES (?, ?, ?, ?, ?)',
      [nome, sobrenome, telefone, cpf, email]
    );

    const novoUsuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [result.lastID]);

    res.status(201).json({
      status: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(422).json({
        status: false,
        message: 'CPF ou Email já cadastrado'
      });
    }
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, sobrenome, telefone, cpf, email } = req.body;

    const usuarioExistente = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuarioExistente) {
      return res.status(204).json({
        status: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!nome || !sobrenome || !telefone || !cpf || !email) {
      return res.status(422).json({
        status: false,
        message: 'Todos os campos são obrigatórios',
        required: ['nome', 'sobrenome', 'telefone', 'cpf', 'email']
      });
    }

    await db.run(
      'UPDATE usuarios SET nome = ?, sobrenome = ?, telefone = ?, cpf = ?, email = ? WHERE id = ?',
      [nome, sobrenome, telefone, cpf, email, id]
    );

    const usuarioAtualizado = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(422).json({
        status: false,
        message: 'CPF ou Email já cadastrado'
      });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(204).json({
        status: false,
        message: 'Usuário não encontrado'
      });
    }

    await db.run('DELETE FROM usuarios WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
});

export default router;

