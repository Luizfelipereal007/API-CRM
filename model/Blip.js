import db from '../database.js';

export default class Blip {

  static async buscarProjetosPorEmail(email) {
    try {
      if (!email) {
        return {
          success: false,
          status: 422,
          message: 'Email é obrigatório'
        };
      }

      const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
      
      if (!usuario) {
        return {
          success: false,
          status: 404,
          message: 'Usuário não encontrado'
        };
      }

      const projetos = await db.all(
        'SELECT * FROM projetos WHERE usuario_id = ? ORDER BY id',
        [usuario.id]
      );

      if (!projetos || projetos.length === 0) {
        return {
          success: true,
          status: 404,
          message: 'Nenhum projeto encontrado para este usuário',
          projetos: []
        };
      }

      const projetosFormatados = projetos.map(projeto => ({
        user_ProjetoName: projeto.nome,
        user_ProjetoStatus: projeto.status,
        user_ProjetoEntrega: projeto.previsao_entrega
      }));

      return {
        success: true,
        status: 200,
        projetos: projetosFormatados
      };
    } catch (error) {
      throw new Error(`Erro ao buscar projetos por email: ${error.message}`);
    }
  }

  static async buscarBoletosPorCpf(cpf) {
    try {
      if (!cpf) {
        return {
          success: false,
          status: 422,
          message: 'CPF é obrigatório'
        };
      }

      const usuario = await db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf]);
      
      if (!usuario) {
        return {
          success: false,
          status: 404,
          message: 'Usuário não encontrado'
        };
      }

      const boletos = await db.all(`
        SELECT
          b.*,
          p.nome as projeto_nome,
          p.status as projeto_status,
          CASE WHEN n.id IS NOT NULL THEN 1 ELSE 0 END as tem_nota_fiscal
        FROM boletos b
        INNER JOIN projetos p ON b.projeto_id = p.id
        LEFT JOIN notas_fiscais n ON b.id = n.boleto_id
        WHERE p.usuario_id = ?
        ORDER BY b.id
      `, [usuario.id]);

      if (!boletos || boletos.length === 0) {
        return {
          success: true,
          status: 200,
          message: 'Nenhum boleto encontrado para este usuário',
          boletos: [],
          usuario: {
            nome: usuario.nome,
            sobrenome: usuario.sobrenome,
            email: usuario.email
          },
          resumo: {
            total_boletos: 0,
            boletos_pagos: 0,
            boletos_pendentes: 0,
            total_valor: 0,
            valor_pago: 0,
            valor_pendente: 0
          }
        };
      }

      const boletosFormatados = boletos.map(boleto => ({
        user_ProjetoName: boleto.projeto_nome,
        user_ProjetoStatus: boleto.projeto_status,
        user_BoletoNome: boleto.nome,
        user_BoletoValor: boleto.valor,
        user_BoletoVencimento: boleto.data_vencimento,
        user_StatusProjeto: boleto.status_projeto,
        user_BoletoPago: boleto.pago,
        user_TemNotaFiscal: boleto.tem_nota_fiscal === 1,
        boleto_id: boleto.id
      }));

      const resumo = {
        total_boletos: boletos.length,
        boletos_pagos: boletos.filter(b => b.pago).length,
        boletos_pendentes: boletos.filter(b => !b.pago).length,
        total_valor: boletos.reduce((acc, b) => acc + b.valor, 0),
        valor_pago: boletos.filter(b => b.pago).reduce((acc, b) => acc + b.valor, 0),
        valor_pendente: boletos.filter(b => !b.pago).reduce((acc, b) => acc + b.valor, 0)
      };

      return {
        success: true,
        status: 200,
        message: `Encontrados ${boletos.length} boletos para este usuário`,
        usuario: {
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email
        },
        boletos: boletosFormatados,
        resumo: resumo
      };
    } catch (error) {
      throw new Error(`Erro ao buscar boletos por CPF: ${error.message}`);
    }
  }

  static async buscarNotasFiscaisPorCpf(cpf) {
    try {
      if (!cpf) {
        return {
          success: false,
          status: 422,
          message: 'CPF é obrigatório'
        };
      }

      const usuario = await db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf]);
      
      if (!usuario) {
        return {
          success: false,
          status: 404,
          message: 'Usuário não encontrado'
        };
      }

      const notasFiscais = await db.all(`
        SELECT
          n.id as nota_id,
          n.valor,
          n.data_emissao,
          b.nome as boleto_nome,
          b.data_vencimento as boleto_data_vencimento,
          b.status_projeto,
          p.nome as projeto_nome,
          p.status as projeto_status
        FROM notas_fiscais n
        INNER JOIN boletos b ON n.boleto_id = b.id
        INNER JOIN projetos p ON n.projeto_id = p.id
        WHERE p.usuario_id = ?
        ORDER BY n.data_emissao DESC
      `, [usuario.id]);

      if (!notasFiscais || notasFiscais.length === 0) {
        return {
          success: true,
          status: 200,
          message: 'Nenhuma nota fiscal encontrada (nenhum boleto foi pago ainda)',
          notas_fiscais: [],
          resumo: {
            total_notas: 0,
            total_valor: 0,
            projetos_finalizados: 0
          }
        };
      }

      const notasFormatadas = notasFiscais.map(nota => ({
        user_ProjetoName: nota.projeto_nome,
        user_ProjetoStatus: nota.projeto_status,
        user_BoletoValor: nota.valor,
        user_BoletoVencimento: nota.boleto_data_vencimento,
        user_DataEmissao: nota.data_emissao,
        user_StatusProjeto: nota.status_projeto,
        nota_id: nota.nota_id
      }));

      return {
        success: true,
        status: 200,
        message: `Encontradas ${notasFiscais.length} notas fiscais para este usuário`,
        notas_fiscais: notasFormatadas,
        resumo: {
          total_notas: notasFiscais.length,
          total_valor: notasFiscais.reduce((acc, nota) => acc + nota.valor, 0),
          projetos_finalizados: notasFiscais.filter(n => n.projeto_status === 'finalizado').length
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar notas fiscais por CPF: ${error.message}`);
    }
  }

  static async buscarResumoPagamentosPorCpf(cpf) {
    try {
      if (!cpf) {
        return {
          success: false,
          status: 422,
          message: 'CPF é obrigatório'
        };
      }

      const usuario = await db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf]);
      
      if (!usuario) {
        return {
          success: false,
          status: 404,
          message: 'Usuário não encontrado'
        };
      }

      const resumo = await db.all(`
        SELECT
          p.id as projeto_id,
          p.nome as projeto_nome,
          p.status as projeto_status,
          p.previsao_entrega,
          b.id as boleto_id,
          b.nome as boleto_nome,
          b.valor,
          b.data_vencimento,
          b.status_projeto,
          b.pago,
          n.id as nota_fiscal_id,
          n.data_emissao
        FROM projetos p
        LEFT JOIN boletos b ON p.id = b.projeto_id
        LEFT JOIN notas_fiscais n ON b.id = n.boleto_id
        WHERE p.usuario_id = ?
        ORDER BY p.id, b.id
      `, [usuario.id]);

      if (!resumo || resumo.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum projeto encontrado para este usuário'
        };
      }

      const projetosAgrupados = {};
      resumo.forEach(row => {
        if (!projetosAgrupados[row.projeto_id]) {
          projetosAgrupados[row.projeto_id] = {
            projeto_id: row.projeto_id,
            projeto_nome: row.projeto_nome,
            projeto_status: row.projeto_status,
            previsao_entrega: row.previsao_entrega,
            boletos: []
          };
        }
        
        if (row.boleto_id) {
          projetosAgrupados[row.projeto_id].boletos.push({
            boleto_id: row.boleto_id,
            boleto_nome: row.boleto_nome,
            valor: row.valor,
            data_vencimento: row.data_vencimento,
            status_projeto: row.status_projeto,
            pago: row.pago,
            nota_fiscal_id: row.nota_fiscal_id,
            data_emissao: row.data_emissao
          });
        }
      });

      const projetos = Object.values(projetosAgrupados);

      const totalBoletos = projetos.reduce((acc, p) => acc + p.boletos.length, 0);
      const boletosPagos = projetos.reduce((acc, p) => acc + p.boletos.filter(b => b.pago).length, 0);
      const valorTotalPago = projetos.reduce((acc, p) => acc + p.boletos.filter(b => b.pago).reduce((sum, b) => sum + b.valor, 0), 0);
      const valorTotalPendente = projetos.reduce((acc, p) => acc + p.boletos.filter(b => !b.pago).reduce((sum, b) => sum + b.valor, 0), 0);

      return {
        success: true,
        status: 200,
        message: `Resumo de pagamentos para ${usuario.nome} ${usuario.sobrenome}`,
        usuario: {
          nome: usuario.nome,
          sobrenome: usuario.sobrenome,
          email: usuario.email,
          cpf: usuario.cpf
        },
        projetos: projetos,
        resumo_financeiro: {
          total_projetos: projetos.length,
          projetos_finalizados: projetos.filter(p => p.projeto_status === 'Finalizado').length,
          projetos_em_desenvolvimento: projetos.filter(p => p.projeto_status === 'Em desenvolvimento').length,
          total_boletos: totalBoletos,
          boletos_pagos: boletosPagos,
          boletos_pendentes: totalBoletos - boletosPagos,
          total_valor_pago: valorTotalPago,
          total_valor_pendente: valorTotalPendente,
          percentual_pago: totalBoletos > 0 ? ((boletosPagos / totalBoletos) * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      throw new Error(`Erro ao buscar resumo de pagamentos por CPF: ${error.message}`);
    }
  }
}