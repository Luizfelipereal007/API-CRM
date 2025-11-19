import Usuario from '../model/Usuario.js';

export default class UsuarioController {

  static async listarUsuarios(req, res) {
    try {
      const resultado = await Usuario.buscarTodos();
      
      if (resultado.count === 0) {
        return res.status(200).json({
          status: true,
          message: 'Nenhum usuário foi encontrado',
          data: []
        });
      }
      
      res.status(200).json({
        status: true,
        message: 'Usuários encontrados: ' + resultado.count,
        data: resultado.data
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  }

  static async buscarUsuario(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Usuario.buscarPorId(id);
      
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
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar usuário',
        error: error.message
      });
    }
  }


  static async buscarUsuarioPorEmail(req, res) {
    try {
      const { email } = req.params;
      const resultado = await Usuario.buscarPorEmail(email);
      
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
      console.error('Erro ao buscar usuário por email:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar usuário por email',
        error: error.message
      });
    }
  }

  static async buscarUsuarioPorNome(req, res) {
    try {
      const { nome } = req.params;
      const resultado = await Usuario.buscarPorNome(nome);
      
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
      console.error('Erro ao buscar usuários por nome:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar usuários por nome',
        error: error.message
      });
    }
  }

  static async buscarUsuarioPorCpf(req, res) {
    try {
      const { cpf } = req.params;
      const resultado = await Usuario.buscarPorCpf(cpf);
      
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
      console.error('Erro ao buscar usuário por CPF:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao buscar usuário por CPF',
        error: error.message
      });
    }
  }

  static async criarUsuario(req, res) {
    try {
      const resultado = await Usuario.criar(req.body);
      
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
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }
  }

  static async atualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Usuario.atualizar(id, req.body);
      
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
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  }

  static async deletarUsuario(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Usuario.deletar(id);
      
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
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        status: false,
        message: 'Erro ao deletar usuário',
        error: error.message
      });
    }
  }
}