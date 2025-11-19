import db from '../database.js';

export default class Boleto {

  static BoletoNaoEncontrado = {
          success: false,
          status: 204,
          message: 'Boleto não encontrado'
        }
        
  static async buscarTodos() {
    try {
      const boletos = await db.all(`
        SELECT b.*, p.nome as projeto_nome, u.nome as usuario_nome, u.cpf as usuario_cpf
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY b.id
      `);
      
      return {
        success: true,
        data: boletos,
        count: boletos.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos: ${error.message}`);
    }
  }

  static async buscarPorProjeto(projetoId) {
    try {
      const boletos = await db.all(
        'SELECT * FROM boletos WHERE projeto_id = ? ORDER BY id',
        [projetoId]
      );
      
      return {
        success: true,
        data: boletos,
        count: boletos.length,
        message: 'Boletos encontrados: ' + boletos.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos do projeto: ${error.message}`);
    }
  }

  static async buscarPorUsuario(usuarioId) {
    try {
      const boletos = await db.all(`
        SELECT b.*, p.nome as projeto_nome
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        WHERE p.usuario_id = ?
        ORDER BY b.id
      `, [usuarioId]);
      
      return {
        success: true,
        data: boletos,
        count: boletos.length,
        message: 'Boletos encontrados: ' + boletos.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos do usuário: ${error.message}`);
    }
  }

  static async criar(dadosBoleto) {
    try {
      const { nome, valor, data_vencimento, status_projeto, projeto_id } = dadosBoleto;

      if (!nome || !valor || !data_vencimento || !projeto_id) {
        return {
          success: false,
          status: 422,
          message: 'Todos os campos são obrigatórios',
          required: ['nome', 'valor', 'data_vencimento', 'projeto_id']
        };
      }

      const projeto = await db.get('SELECT * FROM projetos WHERE id = ?', [projeto_id]);
      if (!projeto) {
        return {
          success: false,
          status: 422,
          message: 'Projeto não encontrado'
        };
      }

      const boletoExistente = await db.get(
        'SELECT * FROM boletos WHERE projeto_id = ?',
        [projeto_id]
      );
      
      if (boletoExistente) {
        return {
          success: false,
          status: 422,
          message: 'Este projeto já possui um boleto'
        };
      }

      const result = await db.run(
        'INSERT INTO boletos (nome, valor, data_vencimento, status_projeto, projeto_id) VALUES (?, ?, ?, ?, ?)',
        [nome, valor, data_vencimento, status_projeto || 'desenvolvimento', projeto_id]
      );

      const novoBoleto = await db.get('SELECT * FROM boletos WHERE id = ?', [result.lastID]);

      return {
        success: true,
        status: 201,
        data: novoBoleto,
        message: 'Boleto criado com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao criar boleto: ${error.message}`);
    }
  }

  static async pagar(id) {
    try {
      const boleto = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
      if (!boleto) {
        return BoletoNaoEncontrado;
      }

      if (boleto.pago) {
        return {
          success: false,
          status: 422,
          message: 'Este boleto já foi pago'
        };
      }

      await db.run(
        'UPDATE boletos SET pago = 1 WHERE id = ?',
        [id]
      );

      const novaNotaFiscal = await db.run(
        'INSERT INTO notas_fiscais (boleto_id, valor, projeto_id, nome) VALUES (?, ?, ?, ?)',
        [id, boleto.valor, boleto.projeto_id, `NF-${id}-${Date.now()}`]
      );

      const boletoAtualizado = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
      const notaFiscal = await db.get('SELECT * FROM notas_fiscais WHERE id = ?', [novaNotaFiscal.lastID]);

      return {
        success: true,
        status: 200,
        data: {
          boleto: boletoAtualizado,
          nota_fiscal: notaFiscal
        },
        message: 'Boleto pago com sucesso e nota fiscal criada'
      };
    } catch (error) {
      throw new Error(`Erro ao pagar boleto: ${error.message}`);
    }
  }

  static async deletar(id) {
    try {
      const boleto = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
      if (!boleto) {
        return BoletoNaoEncontrado;
      }

      if (boleto.pago) {
        return {
          success: false,
          status: 422,
          message: 'Não é possível deletar um boleto que já foi pago'
        };
      }

      await db.run('DELETE FROM boletos WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        message: 'Boleto deletado com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao deletar boleto: ${error.message}`);
    }
  }
}