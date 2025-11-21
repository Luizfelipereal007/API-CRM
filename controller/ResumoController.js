import Resumo from '../model/Resumo.js';

export default class ResumoController {

  static async getResumoPagamentosPorCpf(req, res) {
    try {
      const { cpf } = req.query;
      const resultado = await Resumo.buscarResumoPagamentosPorCpf(cpf);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar resumo de pagamentos por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar resumo de pagamentos',
        error: error.message
      });
    }
  }
}