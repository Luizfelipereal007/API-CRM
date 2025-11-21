import NotaFiscal from '../model/NotaFiscal.js';

export default class NotaFiscalController {

  static async listarNotasFiscais(req, res) {
    try {
      const resultado = await NotaFiscal.buscarTodas();
      
      if (resultado.count === 0) {
        return res.status(404).json({
          status: false,
          message: 'Nenhuma nota fiscal encontrada para este usuário'
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
        return res.status(404).json({
          status: false,
          message: 'Nenhuma nota fiscal encontrada para este projeto'
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
        return res.status(404).json({
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

  static async buscarNotasFiscaisPorEmail(req, res) {
    try {
      const { email } = req.params;
      const resultado = await NotaFiscal.buscarPorEmail(email);
      
      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data,
        count: resultado.count
      });
    } catch (error) {
      console.error('Erro ao buscar notas fiscais por email:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar notas fiscais por email',
        error: error.message
      });
    }
  }

  static async buscarNotasFiscaisPorNome(req, res) {
    try {
      const { nome } = req.params;
      const resultado = await NotaFiscal.buscarPorNome(nome);
      
      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data,
        count: resultado.count
      });
    } catch (error) {
      console.error('Erro ao buscar notas fiscais por nome:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar notas fiscais por nome',
        error: error.message
      });
    }
  }

  static async buscarNotasFiscaisPorCpf(req, res) {
    try {
      const { cpf } = req.params;
      const resultado = await NotaFiscal.buscarPorCpf(cpf);
      
      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data,
        count: resultado.count
      });
    } catch (error) {
      console.error('Erro ao buscar notas fiscais por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar notas fiscais por CPF',
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