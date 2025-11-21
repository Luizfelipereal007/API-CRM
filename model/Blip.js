import db from '../database.js';

export default class Blip {
  
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