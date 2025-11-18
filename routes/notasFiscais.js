import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const notas = await db.all(`
      SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.cpf as usuario_cpf
      FROM notas_fiscais n
      INNER JOIN projetos p ON n.projeto_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY n.id
    `);
    if (notas.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhuma nota fiscal encontrada'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Notas fiscais encontradas: ' + notas.length,
      data: notas
    });
  } catch (error) {
    console.error('Erro ao listar notas fiscais:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar notas fiscais',
      error: error.message
    });
  }
});

router.get('/projeto/:projetoId', async (req, res) => {
  try {
    const { projetoId } = req.params;
    const notas = await db.all(
      'SELECT * FROM notas_fiscais WHERE projeto_id = ? ORDER BY id',
      [projetoId]
    );
    
    if (notas.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhuma nota fiscal encontrada'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Notas fiscais encontradas: ' + notas.length,
      data: notas
    });
  } catch (error) {
    console.error('Erro ao listar notas fiscais do projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar notas fiscais do projeto',
      error: error.message
    });
  }
});

router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const notas = await db.all(`
      SELECT n.*, p.nome as projeto_nome
      FROM notas_fiscais n
      INNER JOIN projetos p ON n.projeto_id = p.id
      WHERE p.usuario_id = ?
      ORDER BY n.id
    `, [usuarioId]);
    
    if (notas.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhuma nota fiscal encontrada'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Notas fiscais encontradas: ' + notas.length,
      data: notas
    });
  } catch (error) {
    console.error('Erro ao listar notas fiscais do usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar notas fiscais do usuário',
      error: error.message
    });
  }
});

// Rota removida - notas fiscais são criadas automaticamente quando boletos são pagos
// Esta funcionalidade foi movida para o endpoint PUT /boletos/:id/pagar

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const nota = await db.get('SELECT * FROM notas_fiscais WHERE id = ?', [id]);
    if (!nota) {
      return res.status(204).json({
        status: false,
        message: 'Nota fiscal não encontrada'
      });
    }

    await db.run('DELETE FROM notas_fiscais WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Nota fiscal deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar nota fiscal:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao deletar nota fiscal',
      error: error.message
    });
  }
});

export default router;

