import Blip from '../model/Blip.js';

export default class BlipController {

  static async getProjetosPorEmail(req, res) {
    try {
      const { email } = req.query;
      const resultado = await Blip.buscarProjetosPorEmail(email);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar projetos por email:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar projetos',
        error: error.message
      });
    }
  }

  static async getBoletosPorCpf(req, res) {
    try {
      const { cpf } = req.query;
      const resultado = await Blip.buscarBoletosPorCpf(cpf);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar boletos por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar boletos',
        error: error.message
      });
    }
  }

  static async getNotasFiscaisPorCpf(req, res) {
    try {
      const { cpf } = req.query;
      const resultado = await Blip.buscarNotasFiscaisPorCpf(cpf);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json(resultado);
    } catch (error) {
      console.error('Erro ao buscar notas fiscais por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar notas fiscais',
        error: error.message
      });
    }
  }

  static async getResumoPagamentosPorCpf(req, res) {
    try {
      const { cpf } = req.query;
      const resultado = await Blip.buscarResumoPagamentosPorCpf(cpf);
      
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