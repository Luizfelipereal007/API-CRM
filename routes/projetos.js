import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const projetos = await db.all(`
      SELECT p.*, u.nome as usuario_nome, u.email as usuario_email 
      FROM projetos p 
      INNER JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.id
    `);
    
    if (projetos.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'Nenhum projeto foi encontrado',
        data: []
      });
    }
    
    res.status(200).json({
      status: true,
      message: 'Projetos encontrados: ' + projetos.length,
      data: projetos
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar projetos',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projeto = await db.get(`
      SELECT p.*, u.nome as usuario_nome, u.email as usuario_email 
      FROM projetos p 
      INNER JOIN usuarios u ON p.usuario_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    if (!projeto) {
      return res.status(204).json({
        status: false,
        message: 'Projeto não encontrado'
      });
    }

    res.status(200).json({
      status: true,
      message: 'Projeto encontrado',
      data: projeto
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao buscar projeto',
      error: error.message
    });
  }
});

router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const projetos = await db.all(
      'SELECT * FROM projetos WHERE usuario_id = ? ORDER BY id',
      [usuarioId]
    );
    
    if (projetos.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'Não há projetos para este usuário',
        data: []
      });
    }
    
    res.status(200).json({
      status: true,
      message: 'Projetos encontrados: ' + projetos.length,
      data: projetos
    });
  } catch (error) {
    console.error('Erro ao listar projetos do usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar projetos do usuário',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, status, previsao_entrega, usuario_id } = req.body;

    if (!nome || !status || !previsao_entrega || !usuario_id) {
      return res.status(422).json({
        status: false,
        message: 'Todos os campos são obrigatórios',
        required: ['nome', 'status', 'previsao_entrega', 'usuario_id']
      });
    }

    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    if (!usuario) {
      return res.status(422).json({
        status: false,
        message: 'Usuário não encontrado'
      });
    }

    const result = await db.run(
      'INSERT INTO projetos (nome, status, previsao_entrega, usuario_id) VALUES (?, ?, ?, ?)',
      [nome, status, previsao_entrega, usuario_id]
    );

    const novoProjeto = await db.get('SELECT * FROM projetos WHERE id = ?', [result.lastID]);

    res.status(201).json({
      status: true,
      message: 'Projeto criado com sucesso',
      data: novoProjeto
    });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao criar projeto',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, status, previsao_entrega, usuario_id } = req.body;

    const projetoExistente = await db.get('SELECT * FROM projetos WHERE id = ?', [id]);
    if (!projetoExistente) {
      return res.status(204).json({
        status: false,
        message: 'Projeto não encontrado'
      });
    }

    if (!nome || !status || !previsao_entrega || !usuario_id) {
      return res.status(422).json({
        status: false,
        message: 'Todos os campos são obrigatórios',
        required: ['nome', 'status', 'previsao_entrega', 'usuario_id']
      });
    }

    const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
    if (!usuario) {
      return res.status(422).json({
        status: false,
        message: 'Usuário não encontrado'
      });
    }

    await db.run(
      'UPDATE projetos SET nome = ?, status = ?, previsao_entrega = ?, usuario_id = ? WHERE id = ?',
      [nome, status, previsao_entrega, usuario_id, id]
    );

    const projetoAtualizado = await db.get('SELECT * FROM projetos WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Projeto atualizado com sucesso',
      data: projetoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao atualizar projeto',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const projeto = await db.get('SELECT * FROM projetos WHERE id = ?', [id]);
    if (!projeto) {
      return res.status(204).json({
        status: false,
        message: 'Projeto não encontrado'
      });
    }

    await db.run('DELETE FROM projetos WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Projeto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao deletar projeto',
      error: error.message
    });
  }
});

export default router;

