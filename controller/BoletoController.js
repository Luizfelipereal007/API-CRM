import Boleto from '../model/Boleto.js';

export default class BoletoController {

  static async listarBoletos(req, res) {
    try {
      const resultado = await Boleto.buscarTodos();
      
      if (resultado.count === 0) {
        return res.status(404).json({
          status: false,
          message: 'Nenhum boleto encontrado para este usuário'
        });
      }
      
      res.status(200).json({
        status: true,
        message: 'Boletos encontrados: ' + resultado.count,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar boletos:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar boletos',
        error: error.message
      });
    }
  }

  static async listarBoletosPorProjeto(req, res) {
    try {
      const { projetoId } = req.params;
      const resultado = await Boleto.buscarPorProjeto(projetoId);
      
      if (resultado.count === 0) {
        return res.status(404).json({
          status: false,
          message: 'Nenhum boleto encontrado para este projeto'
        });
      }
      
      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar boletos do projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar boletos do projeto',
        error: error.message
      });
    }
  }

  static async listarBoletosPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const resultado = await Boleto.buscarPorUsuario(usuarioId);
      
      if (resultado.count === 0) {
        return res.status(404).json({
          status: false,
          message: 'Nenhum boleto encontrado'
        });
      }
      
      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar boletos do usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar boletos do usuário',
        error: error.message
      });
    }
  }

  static async criarBoleto(req, res) {
    try {
      const resultado = await Boleto.criar(req.body);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message,
          ...(resultado.required && { required: resultado.required })
        });
      }

      res.status(resultado.status).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao criar boleto',
        error: error.message
      });
    }
  }

  static async pagarBoleto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Boleto.pagar(id);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao pagar boleto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao pagar boleto',
        error: error.message
      });
    }
  }

  static async deletarBoleto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Boleto.deletar(id);
      
      if (!resultado.success) {
        return res.status(resultado.status).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json({
        status: true,
        message: resultado.message
      });
    } catch (error) {
      console.error('Erro ao deletar boleto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao deletar boleto',
        error: error.message
      });
    }
  }
}