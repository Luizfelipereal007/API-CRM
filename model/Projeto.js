import db from '../database.js';

export default class Projeto {


  static ProjetoNaoEncontrado = {
          success: false,
          status: 404,
          message: 'Projeto não encontrado'
        }

  static async buscarTodos() {
    try {
      const projetos = await db.all(`
        SELECT p.*, u.nome as usuario_nome, u.email as usuario_email 
        FROM projetos p 
        INNER JOIN usuarios u ON p.usuario_id = u.id 
        ORDER BY p.id
      `);
      
      return {
        success: true,
        data: projetos,
        count: projetos.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos: ${error.message}`);
    }
  }

  static async buscarPorId(id) {
    try {
      const projeto = await db.get(`
        SELECT p.*, u.nome as usuario_nome, u.email as usuario_email 
        FROM projetos p 
        INNER JOIN usuarios u ON p.usuario_id = u.id 
        WHERE p.id = ?
      `, [id]);
      
      if (!projeto) {
        return ProjetoNaoEncontrado;
      }

      return {
        success: true,
        data: projeto,
        message: 'Projeto encontrado'
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projeto: ${error.message}`);
    }
  }

  static async buscarPorUsuario(usuarioId) {
    try {
      const projetos = await db.all(
        'SELECT * FROM projetos WHERE usuario_id = ? ORDER BY id',
        [usuarioId]
      );
      
      return {
        success: true,
        data: projetos,
        count: projetos.length,
        message: projetos.length === 0 ? 'Não há projetos para este usuário' : `Projetos encontrados: ${projetos.length}`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos do usuário: ${error.message}`);
    }
  }

  static async buscarPorEmail(email) {
    try {
      const projetos = await db.all(`
        SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
        FROM projetos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.email = ?
        ORDER BY p.id
      `, [email]);
      
      if (!projetos || projetos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum projeto encontrado para este email'
        };
      }

      return {
        success: true,
        data: projetos,
        count: projetos.length,
        message: `Encontrados ${projetos.length} projeto(s) para este email`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos por email: ${error.message}`);
    }
  }

  static async buscarPorNome(nome) {
    try {
      const projetos = await db.all(`
        SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
        FROM projetos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.nome LIKE ?
        ORDER BY p.id
      `, [`%${nome}%`]);
      
      if (!projetos || projetos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum projeto encontrado para este nome'
        };
      }

      return {
        success: true,
        data: projetos,
        count: projetos.length,
        message: `Encontrados ${projetos.length} projeto(s) para este nome`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos por nome: ${error.message}`);
    }
  }

  static async buscarPorCpf(cpf) {
    try {
      const projetos = await db.all(`
        SELECT p.*, u.nome as usuario_nome, u.email as usuario_email
        FROM projetos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.cpf = ?
        ORDER BY p.id
      `, [cpf]);
      
      if (!projetos || projetos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum projeto encontrado para este CPF'
        };
      }

      return {
        success: true,
        data: projetos,
        count: projetos.length,
        message: `Encontrados ${projetos.length} projeto(s) para este CPF`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos por CPF: ${error.message}`);
    }
  }

  static async criar(dadosProjeto) {
    const transaction = db;
    
    try {
      const { nome, status, previsao_entrega, usuario_id, valor_boleto } = dadosProjeto;

      if (!nome || !status || !previsao_entrega || !usuario_id) {
        return {
          success: false,
          status: 422,
          message: 'Todos os campos são obrigatórios',
          required: ['nome', 'status', 'previsao_entrega', 'usuario_id']
        };
      }

      const usuario = await transaction.get('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
      if (!usuario) {
        return {
          success: false,
          status: 422,
          message: 'Usuário não encontrado'
        };
      }

      await transaction.run('BEGIN TRANSACTION');

      const result = await transaction.run(
        'INSERT INTO projetos (nome, status, previsao_entrega, usuario_id) VALUES (?, ?, ?, ?)',
        [nome, status, previsao_entrega, usuario_id]
      );

      const projetoId = result.lastID;
      const novoProjeto = await transaction.get('SELECT * FROM projetos WHERE id = ?', [projetoId]);

      const valor = valor_boleto || 1000.00;
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30);

      const nomeBoleto = `Boleto Projeto ${nome}`;
      const statusProjeto = status || 'desenvolvimento';

      const boletoResult = await transaction.run(
        'INSERT INTO boletos (nome, valor, data_vencimento, status_projeto, projeto_id) VALUES (?, ?, ?, ?, ?)',
        [nomeBoleto, valor, dataVencimento.toISOString().split('T')[0], statusProjeto, projetoId]
      );

      const novoBoleto = await transaction.get('SELECT * FROM boletos WHERE id = ?', [boletoResult.lastID]);

      await transaction.run('COMMIT');

      return {
        success: true,
        status: 201,
        data: {
          projeto: novoProjeto,
          boleto: novoBoleto
        },
        message: 'Projeto e boleto criados com sucesso'
      };
    } catch (error) {
      try {
        await transaction.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erro ao reverter transação:', rollbackError);
      }
      
      throw new Error(`Erro ao criar projeto: ${error.message}`);
    }
  }

  static async atualizar(id, dadosProjeto) {
    try {
      const { nome, status, previsao_entrega, usuario_id } = dadosProjeto;

      const projetoExistente = await this.buscarPorId(id);
      if (!projetoExistente.success) {
          return ProjetoNaoEncontrado;
      }

      if (!nome || !status || !previsao_entrega || !usuario_id) {
        return {
          success: false,
          status: 422,
          message: 'Todos os campos são obrigatórios',
          required: ['nome', 'status', 'previsao_entrega', 'usuario_id']
        };
      }

      const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [usuario_id]);
      if (!usuario) {
        return {
          success: false,
          status: 422,
          message: 'Usuário não encontrado'
        };
      }

      await db.run(
        'UPDATE projetos SET nome = ?, status = ?, previsao_entrega = ?, usuario_id = ? WHERE id = ?',
        [nome, status, previsao_entrega, usuario_id, id]
      );

      const projetoAtualizado = await db.get('SELECT * FROM projetos WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        data: projetoAtualizado,
        message: 'Projeto atualizado com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar projeto: ${error.message}`);
    }
  }

  static async deletar(id) {
    try {
      const projeto = await this.buscarPorId(id);
      if (!projeto.success) {
        return ProjetoNaoEncontrado;
      }

      await db.run('DELETE FROM projetos WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        message: 'Projeto deletado com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao deletar projeto: ${error.message}`);
    }
  }
}