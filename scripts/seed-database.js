// Dados de seed para popular o banco de dados
const usuariosSeed = [
  {
    nome: 'João',
    sobrenome: 'Silva',
    telefone: '1199999-1111',
    cpf: '12345678901',
    email: 'joao.silva@email.com'
  },
  {
    nome: 'Maria',
    sobrenome: 'Santos',
    telefone: '1199999-2222',
    cpf: '23456789012',
    email: 'maria.santos@email.com'
  },
  {
    nome: 'Pedro',
    sobrenome: 'Oliveira',
    telefone: '1199999-3333',
    cpf: '34567890123',
    email: 'pedro.oliveira@email.com'
  },
  {
    nome: 'Ana',
    sobrenome: 'Costa',
    telefone: '1199999-4444',
    cpf: '45678901234',
    email: 'ana.costa@email.com'
  }
];

const projetosSeed = [
  // Usuário 1 - João Silva
  {
    nome: 'E-commerce Moderno',
    status: 'concluído',
    previsao_entrega: '2024-03-15',
    usuario_id: 1,
    valor_boleto: 2500.00
  },
  {
    nome: 'Sistema de Gestão',
    status: 'desenvolvimento',
    previsao_entrega: '2024-06-30',
    usuario_id: 1,
    valor_boleto: 1800.00
  },
  {
    nome: 'App Mobile Financeiro',
    status: 'planejamento',
    previsao_entrega: '2024-08-20',
    usuario_id: 1,
    valor_boleto: 3200.00
  },
  
  // Usuário 2 - Maria Santos
  {
    nome: 'Site Institucional',
    status: 'concluído',
    previsao_entrega: '2024-02-28',
    usuario_id: 2,
    valor_boleto: 1500.00
  },
  {
    nome: 'Plataforma de Cursos',
    status: 'desenvolvimento',
    previsao_entrega: '2024-07-15',
    usuario_id: 2,
    valor_boleto: 2800.00
  },
  
  // Usuário 3 - Pedro Oliveira
  {
    nome: 'Dashboard Analytics',
    status: 'concluído',
    previsao_entrega: '2024-01-20',
    usuario_id: 3,
    valor_boleto: 2200.00
  },
  {
    nome: 'API Gateway',
    status: 'desenvolvimento',
    previsao_entrega: '2024-05-10',
    usuario_id: 3,
    valor_boleto: 1900.00
  },
  {
    nome: 'Sistema de Notificações',
    status: 'planejamento',
    previsao_entrega: '2024-09-30',
    usuario_id: 3,
    valor_boleto: 1600.00
  },
  
  // Usuário 4 - Ana Costa
  {
    nome: 'Portal de Notícias',
    status: 'concluído',
    previsao_entrega: '2024-04-05',
    usuario_id: 4,
    valor_boleto: 2000.00
  },
  {
    nome: 'Sistema de Agendamento',
    status: 'desenvolvimento',
    previsao_entrega: '2024-08-15',
    usuario_id: 4,
    valor_boleto: 2400.00
  }
];

const checkIfDatabaseIsEmpty = async (db) => {
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM usuarios');
    return userCount.count === 0;
  } catch (error) {
    console.error('Erro ao verificar se o banco está vazio:', error.message);
    return true; // Se houver erro, assume que está vazio e procede com o seed
  }
};

const seedDatabase = async (db) => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Verificar se o banco já tem dados
    const isEmpty = await checkIfDatabaseIsEmpty(db);
    if (!isEmpty) {
      console.log('⚠️  Banco de dados já contém dados. Seed será ignorado.');
      return;
    }
    
    console.log('📊 Limpando dados existentes (se houver)...');
    
    // Limpar dados existentes (na ordem correta devido às foreign keys)
    await db.run('DELETE FROM notas_fiscais');
    await db.run('DELETE FROM boletos');
    await db.run('DELETE FROM projetos');
    await db.run('DELETE FROM usuarios');
    
    console.log('👥 Inserindo usuários...');
    
    // Inserir usuários
    const usuarioIds = [];
    for (const usuario of usuariosSeed) {
      const result = await db.run(
        'INSERT INTO usuarios (nome, sobrenome, telefone, cpf, email) VALUES (?, ?, ?, ?, ?)',
        [usuario.nome, usuario.sobrenome, usuario.telefone, usuario.cpf, usuario.email]
      );
      usuarioIds.push(result.lastID);
      console.log(`   ✓ Usuário inserido: ${usuario.nome} ${usuario.sobrenome}`);
    }
    
    console.log('🚀 Inserindo projetos e boletos...');
    
    // Inserir projetos
    for (let i = 0; i < projetosSeed.length; i++) {
      const projeto = projetosSeed[i];
      const usuarioId = usuarioIds[projeto.usuario_id - 1]; // -1 porque os IDs são baseados em 1
      
      // Primeiro, criar o projeto
      const projetoResult = await db.run(
        'INSERT INTO projetos (nome, status, previsao_entrega, usuario_id) VALUES (?, ?, ?, ?)',
        [projeto.nome, projeto.status, projeto.previsao_entrega, usuarioId]
      );
      
      const projetoId = projetoResult.lastID;
      
      // Depois, criar o boleto associado
      const valor = projeto.valor_boleto || 1000.00;
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30);
      
      const nomeBoleto = `Boleto Projeto ${projeto.nome}`;
      const statusProjeto = projeto.status;
      
      const boletoResult = await db.run(
        'INSERT INTO boletos (nome, valor, data_vencimento, status_projeto, projeto_id) VALUES (?, ?, ?, ?, ?)',
        [nomeBoleto, valor, dataVencimento.toISOString().split('T')[0], statusProjeto, projetoId]
      );
      
      console.log(`   ✓ Projeto criado: ${projeto.nome} (Status: ${projeto.status})`);
      
      // Marcar alguns projetos como pagos (especialmente os concluídos)
      if (projeto.status === 'concluído') {
        const dataPagamento = new Date();
        dataPagamento.setDate(dataPagamento.getDate() - Math.floor(Math.random() * 30) - 1); // 1-30 dias atrás
        
        await db.run(
          'UPDATE boletos SET pago = 1, pago_em = ? WHERE id = ?',
          [dataPagamento.toISOString(), boletoResult.lastID]
        );
        
        // Criar nota fiscal para projetos pagos
        await db.run(
          'INSERT INTO notas_fiscais (nome, boleto_id, data_vencimento, pago_em, valor, projeto_id) VALUES (?, ?, ?, ?, ?, ?)',
          [
            `NF - ${projeto.nome}`,
            boletoResult.lastID,
            dataVencimento.toISOString().split('T')[0],
            dataPagamento.toISOString(),
            valor,
            projetoId
          ]
        );
        
        console.log(`     💰 Projeto marcado como pago e nota fiscal criada`);
      }
    }
    
    // Estatísticas finais
    const totalUsuarios = await db.get('SELECT COUNT(*) as count FROM usuarios');
    const totalProjetos = await db.get('SELECT COUNT(*) as count FROM projetos');
    const totalBoletos = await db.get('SELECT COUNT(*) as count FROM boletos');
    const boletosPagos = await db.get('SELECT COUNT(*) as count FROM boletos WHERE pago = 1');
    const totalNotasFiscais = await db.get('SELECT COUNT(*) as count FROM notas_fiscais');
    
    console.log('\n✅ Seed concluído com sucesso!');
    console.log('📈 Estatísticas:');
    console.log(`   👥 Usuários: ${totalUsuarios.count}`);
    console.log(`   🚀 Projetos: ${totalProjetos.count}`);
    console.log(`   💳 Boletos: ${totalBoletos.count} (${boletosPagos.count} pagos)`);
    console.log(`   🧾 Notas Fiscais: ${totalNotasFiscais.count}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error.message);
    throw error;
  }
};

// Exportar a função para uso em outros arquivos
export { checkIfDatabaseIsEmpty, seedDatabase };

// Se executado diretamente, executar o seed (importará db aqui)
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../database.js').then(({ default: db }) => {
    seedDatabase(db)
      .then(() => {
        console.log('🎉 Seed executado com sucesso!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Erro ao executar seed:', error);
        process.exit(1);
      });
  });
}