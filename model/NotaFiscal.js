import db from '../database.js';

export default class NotaFiscal {

  static formatarData(data) {
    return data.toLocaleString('sv-SE').replace(',', '');
  }

  static async buscarTodas() {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.cpf as usuario_cpf, b.nome as boleto_nome, b.pago, b.pago_em
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN boletos b ON n.boleto_id = b.id
        ORDER BY n.id
      `);
      
      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));
      
      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais: ${error.message}`);
    }
  }

  static async buscarPorProjeto(projetoId) {
    try {
      const notas = await db.all(
        'SELECT n.*, b.nome as boleto_nome, b.pago, b.pago_em FROM notas_fiscais n LEFT JOIN boletos b ON n.boleto_id = b.id WHERE n.projeto_id = ? ORDER BY n.id',
        [projetoId]
      );
      
      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));
      
      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length,
        message: 'Notas fiscais encontradas: ' + notasFormatadas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais do projeto: ${error.message}`);
    }
  }

  static async buscarPorUsuario(usuarioId) {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, b.nome as boleto_nome, b.pago, b.pago_em
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        LEFT JOIN boletos b ON n.boleto_id = b.id
        WHERE p.usuario_id = ?
        ORDER BY n.id
      `, [usuarioId]);
      
      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));
      
      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length,
        message: 'Notas fiscais encontradas: ' + notasFormatadas.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais do usuário: ${error.message}`);
    }
  }

  static async buscarPorEmail(email) {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf, b.nome as boleto_nome, b.pago, b.pago_em
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN boletos b ON n.boleto_id = b.id
        WHERE u.email = ?
        ORDER BY n.id
      `, [email]);
      
      if (!notas || notas.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhuma nota fiscal encontrada para este email'
        };
      }

      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));

      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length,
        message: `Encontradas ${notas.length} nota(s) fiscal(is) para este email`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais por email: ${error.message}`);
    }
  }

  static async buscarPorNome(nome) {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf, b.nome as boleto_nome, b.pago, b.pago_em
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN boletos b ON n.boleto_id = b.id
        WHERE u.nome LIKE ?
        ORDER BY n.id
      `, [`%${nome}%`]);
      
      if (!notas || notas.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhuma nota fiscal encontrada para este nome'
        };
      }

      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));

      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length,
        message: `Encontradas ${notas.length} nota(s) fiscal(is) para este nome`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais por nome: ${error.message}`);
    }
  }

  static async buscarPorCpf(cpf) {
    try {
      const notas = await db.all(`
        SELECT n.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf, b.nome as boleto_nome, b.pago, b.pago_em
        FROM notas_fiscais n
        INNER JOIN projetos p ON n.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN boletos b ON n.boleto_id = b.id
        WHERE u.cpf = ?
        ORDER BY n.id
      `, [cpf]);
      
      if (!notas || notas.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhuma nota fiscal encontrada para este CPF'
        };
      }

      const notasFormatadas = notas.map(nota => ({
        ...nota,
        pago_em: nota.pago_em ? this.formatarData(new Date(nota.pago_em)) : null
      }));

      return {
        success: true,
        data: notasFormatadas,
        count: notasFormatadas.length,
        message: `Encontradas ${notas.length} nota(s) fiscal(is) para este CPF`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais por CPF: ${error.message}`);
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