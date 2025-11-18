import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const boletos = await db.all(`
      SELECT b.*, p.nome as projeto_nome, u.nome as usuario_nome, u.cpf as usuario_cpf
      FROM boletos b
      INNER JOIN projetos p ON b.projeto_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY b.id
    `);
    if (boletos.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhum boleto encontrado'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Boletos encontrados: ' + boletos.length,
      data: boletos
    });
  } catch (error) {
    console.error('Erro ao listar boletos:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar boletos',
      error: error.message
    });
  }
});

router.get('/projeto/:projetoId', async (req, res) => {
  try {
    const { projetoId } = req.params;
    const boletos = await db.all(
      'SELECT * FROM boletos WHERE projeto_id = ? ORDER BY id',
      [projetoId]
    );
    if (boletos.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhum boleto encontrado'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Boletos encontrados: ' + boletos.length,
      data: boletos
    });
  } catch (error) {
    console.error('Erro ao listar boletos do projeto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar boletos do projeto',
      error: error.message
    });
  }
});

router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const boletos = await db.all(`
      SELECT b.*, p.nome as projeto_nome
      FROM boletos b
      INNER JOIN projetos p ON b.projeto_id = p.id
      WHERE p.usuario_id = ?
      ORDER BY b.id
    `, [usuarioId]);
    if (boletos.length === 0) {
      return res.status(204).json({
        status: false,
        message: 'Nenhum boleto encontrado'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Boletos encontrados: ' + boletos.length,
      data: boletos
    });
  } catch (error) {
    console.error('Erro ao listar boletos do usuário:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao listar boletos do usuário',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, valor, data_vencimento, status_projeto, projeto_id } = req.body;

    if (!nome || !valor || !data_vencimento || !projeto_id) {
      return res.status(422).json({
        status: false,
        message: 'Todos os campos são obrigatórios',
        required: ['nome', 'valor', 'data_vencimento', 'projeto_id']
      });
    }

    const projeto = await db.get('SELECT * FROM projetos WHERE id = ?', [projeto_id]);
    if (!projeto) {
      return res.status(422).json({
        status: false,
        message: 'Projeto não encontrado'
      });
    }

    // Verificar se o projeto já tem um boleto
    const boletoExistente = await db.get(
      'SELECT * FROM boletos WHERE projeto_id = ?',
      [projeto_id]
    );
    
    if (boletoExistente) {
      return res.status(422).json({
        status: false,
        message: 'Este projeto já possui um boleto'
      });
    }

    const result = await db.run(
      'INSERT INTO boletos (nome, valor, data_vencimento, status_projeto, projeto_id) VALUES (?, ?, ?, ?, ?)',
      [nome, valor, data_vencimento, status_projeto || 'desenvolvimento', projeto_id]
    );

    const novoBoleto = await db.get('SELECT * FROM boletos WHERE id = ?', [result.lastID]);

    res.status(201).json({
      status: true,
      message: 'Boleto criado com sucesso',
      data: novoBoleto
    });
  } catch (error) {
    console.error('Erro ao criar boleto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao criar boleto',
      error: error.message
    });
  }
});

// Endpoint para marcar boleto como pago
router.put('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;

    const boleto = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
    if (!boleto) {
      return res.status(204).json({
        status: false,
        message: 'Boleto não encontrado'
      });
    }

    // Marcar boleto como pago
    await db.run(
      'UPDATE boletos SET pago = 1 WHERE id = ?',
      [id]
    );

    // Criar nota fiscal automaticamente quando o boleto é pago
    const novaNotaFiscal = await db.run(
      'INSERT INTO notas_fiscais (boleto_id, valor, projeto_id) VALUES (?, ?, ?)',
      [id, boleto.valor, boleto.projeto_id]
    );

    const boletoAtualizado = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
    const notaFiscal = await db.get('SELECT * FROM notas_fiscais WHERE id = ?', [novaNotaFiscal.lastID]);

    res.status(200).json({
      status: true,
      message: 'Boleto pago com sucesso e nota fiscal criada',
      data: {
        boleto: boletoAtualizado,
        nota_fiscal: notaFiscal
      }
    });
  } catch (error) {
    console.error('Erro ao pagar boleto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao pagar boleto',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const boleto = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
    if (!boleto) {
      return res.status(204).json({
        status: false,
        message: 'Boleto não encontrado'
      });
    }

    await db.run('DELETE FROM boletos WHERE id = ?', [id]);

    res.status(200).json({
      status: true,
      message: 'Boleto deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar boleto:', error);
    res.status(500).json({
      status: false,
      message: 'Erro ao deletar boleto',
      error: error.message
    });
  }
});

export default router;

