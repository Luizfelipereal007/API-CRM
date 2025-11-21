import db from '../database.js';

export default class Usuario {

  static UsuarioNaoEncontrado = {
    success: false,
    status: 404,
    message: 'Usuário não encontrado'
  }

  static async adicionarCountsUsuario(usuario) {
    try {
      const countProjetos = await db.get(
        'SELECT COUNT(*) as count FROM projetos WHERE usuario_id = ?',
        [usuario.id]
      );
      
      const countBoletos = await db.get(
        'SELECT COUNT(*) as count FROM boletos b INNER JOIN projetos p ON b.projeto_id = p.id WHERE p.usuario_id = ?',
        [usuario.id]
      );
      
      const countNotasFiscais = await db.get(
        'SELECT COUNT(*) as count FROM notas_fiscais nf INNER JOIN projetos p ON nf.projeto_id = p.id WHERE p.usuario_id = ?',
        [usuario.id]
      );
      
      return {
        ...usuario,
        projetos: countProjetos.count,
        boletos: countBoletos.count,
        notas_fiscais: countNotasFiscais.count
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar counts ao usuário: ${error.message}`);
    }
  }

  static async buscarTodos() {
    try {
      const usuarios = await db.all('SELECT * FROM usuarios ORDER BY id');
      
      const usuariosComCounts = await Promise.all(
        usuarios.map(async (usuario) => {
          return await this.adicionarCountsUsuario(usuario);
        })
      );
      
      return {
        success: true,
        data: usuariosComCounts,
        count: usuarios.length
      };
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  static async buscarPorId(id) {
    try {
      const usuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
      
      if (!usuario) {
        return UsuarioNaoEncontrado;
      }

      const usuarioComCounts = await this.adicionarCountsUsuario(usuario);

      return {
        success: true,
        data: usuarioComCounts,
        message: 'Usuário encontrado'
      };
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  static async buscarPorEmail(email) {
    try {
      const usuario = await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
      
      if (!usuario) {
        return Usuario.UsuarioNaoEncontrado;
      }

      const usuarioComCounts = await this.adicionarCountsUsuario(usuario);

      return {
        success: true,
        data: usuarioComCounts,
        message: 'Usuário encontrado por email'
      };
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }

  static async buscarPorNome(nome) {
    try {
      const usuarios = await db.all('SELECT * FROM usuarios WHERE nome LIKE ?', [`%${nome}%`]);
      
      if (!usuarios || usuarios.length === 0) {
        return {
          success: false,
          status: 404,
          message: 'Nenhum usuário encontrado com este nome'
        };
      }

      const usuariosComCounts = await Promise.all(
        usuarios.map(async (usuario) => {
          return await this.adicionarCountsUsuario(usuario);
        })
      );

      return {
        success: true,
        data: usuariosComCounts,
        count: usuarios.length,
        message: `Encontrados ${usuarios.length} usuário(s) com este nome`
      };
    } catch (error) {
      throw new Error(`Erro ao buscar usuários por nome: ${error.message}`);
    }
  }

  static async buscarPorCpf(cpf) {
    try {
      const usuario = await db.get('SELECT * FROM usuarios WHERE cpf = ?', [cpf]);
      
      if (!usuario) {
        return Usuario.UsuarioNaoEncontrado;
      }

      const usuarioComCounts = await this.adicionarCountsUsuario(usuario);

      return {
        success: true,
        data: usuarioComCounts,
        message: 'Usuário encontrado por CPF'
      };
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por CPF: ${error.message}`);
    }
  }

  static async criar(dadosUsuario) {
    try {
      const { nome, sobrenome, telefone, cpf, email } = dadosUsuario;

      if (!nome || !sobrenome || !telefone || !cpf || !email) {
        return {
          success: false,
          status: 422,
          message: 'Todos os campos são obrigatórios',
          required: ['nome', 'sobrenome', 'telefone', 'cpf', 'email']
        };
      }

      const result = await db.run(
        'INSERT INTO usuarios (nome, sobrenome, telefone, cpf, email) VALUES (?, ?, ?, ?, ?)',
        [nome, sobrenome, telefone, cpf, email]
      );

      const novoUsuario = await db.get('SELECT * FROM usuarios WHERE id = ?', [result.lastID]);

      return {
        success: true,
        status: 201,
        data: novoUsuario,
        message: 'Usuário criado com sucesso'
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return {
          success: false,
          status: 422,
          message: 'CPF ou Email já cadastrado'
        };
      }
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  static async atualizar(id, dadosUsuario) {
    try {
      const { nome, sobrenome, telefone, cpf, email } = dadosUsuario;

      const usuarioExistente = await this.buscarPorId(id);
      if (!usuarioExistente.success) {
        return UsuarioNaoEncontrado;
      }

      if (!nome || !sobrenome || !telefone || !cpf || !email) {
        return {
          success: false,
          status: 422,
          message: 'Todos os campos são obrigatórios',
          required: ['nome', 'sobrenome', 'telefone', 'cpf', 'email']
        };
      }

      await db.run(
        'UPDATE usuarios SET nome = ?, sobrenome = ?, telefone = ?, cpf = ?, email = ? WHERE id = ?',
        [nome, sobrenome, telefone, cpf, email, id]
      );

      const usuarioAtualizado = await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        data: usuarioAtualizado,
        message: 'Usuário atualizado com sucesso'
      };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        return {
          success: false,
          status: 422,
          message: 'CPF ou Email já cadastrado'
        };
      }
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  static async deletar(id) {
    try {
      const usuario = await this.buscarPorId(id);
      if (!usuario.success) {
          return UsuarioNaoEncontrado;
      }

      await db.run('DELETE FROM usuarios WHERE id = ?', [id]);

      return {
        success: true,
        status: 200,
        message: 'Usuário deletado com sucesso'
      };
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }
}