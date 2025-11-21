import db from '../database.js';

export default class Boleto {

  static formatarData(data) {
    return data.toLocaleString('sv-SE').replace(',', '');
  }

  static BoletoNaoEncontrado = {
          success: false,
          status: 404,
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
      
      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));
      
      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length
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
      
      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));
      
      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length,
        message: 'Boletos encontrados: ' + boletosFormatados.length
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
      
      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));
      
      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length,
        message: 'Boletos encontrados: ' + boletosFormatados.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos do usuário: ${error.message}`);
    }
  }

  static async buscarPorEmail(email) {
    try {
      const boletos = await db.all(`
        SELECT b.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.email = ?
        ORDER BY b.id
      `, [email]);
      
      if (!boletos || boletos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum boleto encontrado para este email'
        };
      }

      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));

      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length,
        message: `Encontrados ${boletos.length} boleto(s) para este email`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos por email: ${error.message}`);
    }
  }

  static async buscarPorNome(nome) {
    try {
      const boletos = await db.all(`
        SELECT b.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.nome LIKE ?
        ORDER BY b.id
      `, [`%${nome}%`]);
      
      if (!boletos || boletos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum boleto encontrado para este nome'
        };
      }

      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));

      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length,
        message: `Encontrados ${boletos.length} boleto(s) para este nome`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos por nome: ${error.message}`);
    }
  }

  static async buscarPorCpf(cpf) {
    try {
      const boletos = await db.all(`
        SELECT b.*, p.nome as projeto_nome, u.nome as usuario_nome, u.email as usuario_email, u.cpf as usuario_cpf
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE u.cpf = ?
        ORDER BY b.id
      `, [cpf]);
      
      if (!boletos || boletos.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum boleto encontrado para este CPF'
        };
      }

      const boletosFormatados = boletos.map(boleto => ({
        ...boleto,
        pago_em: boleto.pago_em ? this.formatarData(new Date(boleto.pago_em)) : null
      }));

      return {
        success: true,
        data: boletosFormatados,
        count: boletosFormatados.length,
        message: `Encontrados ${boletos.length} boleto(s) para este CPF`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos por CPF: ${error.message}`);
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

      const dataPagamento = this.formatarData(new Date());
      
      await db.run(
        'UPDATE boletos SET pago = 1, pago_em = ? WHERE id = ?',
        [dataPagamento, id]
      );

      const novaNotaFiscal = await db.run(
        'INSERT INTO notas_fiscais (boleto_id, valor, projeto_id, nome, data_vencimento, pago_em) VALUES (?, ?, ?, ?, ?, ?)',
        [id, boleto.valor, boleto.projeto_id, `NF-${id}-${Date.now()}`, boleto.data_vencimento, dataPagamento]
      );

      const boletoAtualizado = await db.get('SELECT * FROM boletos WHERE id = ?', [id]);
      const notaFiscal = await db.get('SELECT * FROM notas_fiscais WHERE id = ?', [novaNotaFiscal.lastID]);

      return {
        success: true,
        status: 200,
        data: {
          boleto: {
            ...boletoAtualizado,
            pago_em: dataPagamento
          },
          nota_fiscal: notaFiscal
        },
        message: 'Boleto pago com sucesso e nota fiscal criada',
        pago_em: dataPagamento
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