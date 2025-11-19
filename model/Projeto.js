import db from '../database.js';

export default class Projeto {


  static ProjetoNaoEncontrado = {
          success: false,
          status: 204,
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

  static async criar(dadosProjeto) {
    try {
      const { nome, status, previsao_entrega, usuario_id } = dadosProjeto;

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

      const result = await db.run(
        'INSERT INTO projetos (nome, status, previsao_entrega, usuario_id) VALUES (?, ?, ?, ?)',
        [nome, status, previsao_entrega, usuario_id]
      );

      const novoProjeto = await db.get('SELECT * FROM projetos WHERE id = ?', [result.lastID]);

      return {
        success: true,
        status: 201,
        data: novoProjeto,
        message: 'Projeto criado com sucesso'
      };
    } catch (error) {
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