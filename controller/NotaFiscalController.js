import NotaFiscal from '../model/NotaFiscal.js';

export default class NotaFiscalController {

  static async listarNotasFiscais(req, res) {
    try {
      const resultado = await NotaFiscal.buscarTodas();
      
      if (resultado.count === 0) {
        return res.status(204).json({
          status: false,
          message: 'Nenhuma nota fiscal encontrada'
        });
      }
      
      res.status(200).json({
        status: true,
        message: 'Notas fiscais encontradas: ' + resultado.count,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar notas fiscais:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar notas fiscais',
        error: error.message
      });
    }
  }

  static async listarNotasFiscaisPorProjeto(req, res) {
    try {
      const { projetoId } = req.params;
      const resultado = await NotaFiscal.buscarPorProjeto(projetoId);
      
      if (resultado.count === 0) {
        return res.status(204).json({
          status: false,
          message: 'Nenhuma nota fiscal encontrada'
        });
      }
      
      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar notas fiscais do projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar notas fiscais do projeto',
        error: error.message
      });
    }
  }

  static async listarNotasFiscaisPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const resultado = await NotaFiscal.buscarPorUsuario(usuarioId);
      
      if (resultado.count === 0) {
        return res.status(204).json({
          status: false,
          message: 'Nenhuma nota fiscal encontrada'
        });
      }
      
      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar notas fiscais do usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar notas fiscais do usuário',
        error: error.message
      });
    }
  }

  static async deletarNotaFiscal(req, res) {
    try {
      const { id } = req.params;
      const resultado = await NotaFiscal.deletar(id);
      
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
      console.error('Erro ao deletar nota fiscal:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao deletar nota fiscal',
        error: error.message
      });
    }
  }
}