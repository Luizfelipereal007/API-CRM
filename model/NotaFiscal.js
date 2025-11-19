import db from '../database.js';

export default class NotaFiscal {

  static async buscarTodas() {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.cpf as usuario_cpf
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY n.id
      `);
      
      return {
        success: true,
        data: notas,
        count: notas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais: ${error.message}`);
    }
  }

  static async buscarPorProjeto(projetoId) {
    try {
      const notas = await db.all(
        'SELECT * FROM notas_fiscais WHERE projeto_id = ? ORDER BY id',
        [projetoId]
      );
      
      return {
        success: true,
        data: notas,
        count: notas.length,
        message: 'Notas fiscais encontradas: ' + notas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais do projeto: ${error.message}`);
    }
  }

  static async buscarPorUsuario(usuarioId) {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        WHERE p.usuario_id = ?
        ORDER BY n.id
      `, [usuarioId]);
      
      return {
        success: true,
        data: notas,
        count: notas.length,
        message: 'Notas fiscais encontradas: ' + notas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais do usuário: ${error.message}`);
    }
  }

  static async deletar(id) {
    try {
      const nota = await db.get('SELECT * FROM notas_fiscais WHERE id = ?', [id]);
      if (!nota) {
        return {
          success: false,
          status: 404,
          message: 'Nota fiscal não encontrada'
        };
      }

      await db.run('DELETE FROM notas_fiscais WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        message: 'Nota fiscal deletada com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao deletar nota fiscal: ${error.message}`);
    }
  }
}