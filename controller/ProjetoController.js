import Projeto from '../model/Projeto.js';

export default class ProjetoController {

  static async listarProjetos(req, res) {
    try {
      const resultado = await Projeto.buscarTodos();
      
      if (resultado.count === 0) {
        return res.status(200).json({
          status: true,
          message: 'Nenhum projeto foi encontrado',
          data: []
        });
      }
      
      res.status(200).json({
        status: true,
        message: 'Projetos encontrados: ' + resultado.count,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar projetos',
        error: error.message
      });
    }
  }

  static async buscarProjeto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Projeto.buscarPorId(id);
      
      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao buscar projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar projeto',
        error: error.message
      });
    }
  }

  static async listarProjetosPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const resultado = await Projeto.buscarPorUsuario(usuarioId);
      
      if (resultado.count === 0) {
        return res.status(200).json({
          status: true,
          message: resultado.message,
          data: []
        });
      }
      
      res.status(200).json({
        status: true,
        message: resultado.message,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar projetos do usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar projetos do usuário',
        error: error.message
      });
    }
  }

  static async buscarProjetosPorEmail(req, res) {
    try {
      const { email } = req.params;
      const resultado = await Projeto.buscarPorEmail(email);
      
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
      console.error('Erro ao buscar projetos por email:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar projetos por email',
        error: error.message
      });
    }
  }

  static async buscarProjetosPorNome(req, res) {
    try {
      const { nome } = req.params;
      const resultado = await Projeto.buscarPorNome(nome);
      
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
      console.error('Erro ao buscar projetos por nome:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar projetos por nome',
        error: error.message
      });
    }
  }

  static async buscarProjetosPorCpf(req, res) {
    try {
      const { cpf } = req.params;
      const resultado = await Projeto.buscarPorCpf(cpf);
      
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
      console.error('Erro ao buscar projetos por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar projetos por CPF',
        error: error.message
      });
    }
  }

  static async criarProjeto(req, res) {
    try {
      const resultado = await Projeto.criar(req.body);
      
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
      console.error('Erro ao criar projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao criar projeto',
        error: error.message
      });
    }
  }

  static async atualizarProjeto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Projeto.atualizar(id, req.body);
      
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
      console.error('Erro ao atualizar projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao atualizar projeto',
        error: error.message
      });
    }
  }

  static async deletarProjeto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Projeto.deletar(id);
      
      if (!resultado.success) {
        return res.status(404).json({
          status: false,
          message: resultado.message
        });
      }

      res.status(resultado.status).json({
        status: true,
        message: resultado.message
      });
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao deletar projeto',
        error: error.message
      });
    }
  }
}