import express from 'express';
import db from './database.js';
import usuariosRouter from './routes/usuarios.js';
import projetosRouter from './routes/projetos.js';
import boletosRouter from './routes/boletos.js';
import notasFiscaisRouter from './routes/notasFiscais.js';
import blipRouter from './routes/blip.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rotas
app.use('/usuarios', usuariosRouter);
app.use('/projetos', projetosRouter);
app.use('/boletos', boletosRouter);
app.use('/notas-fiscais', notasFiscaisRouter);
app.use('/blip', blipRouter);
app.get('/health', (res) => {
  res.status(200).json({
    status: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (res) => {
  res.status(200).json({
    status: true,
    message: 'API CRM - Blip!',
    endpoints: {
      usuarios: '/usuarios',
      projetos: '/projetos',
      boletos: '/boletos',
      notasFiscais: '/notas-fiscais',
      blip: {
        getProjetosPorEmail: '/blip/getProjetosPorEmail?email=xxx',
        getBoletosPorCpf: '/blip/getBoletosPorCpf?cpf=xxx',
        getNotasFiscaisPorCpf: '/blip/getNotasFiscaisPorCpf?cpf=xxx'
      }
    }
  });
});

app.use((err, res) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    status: false,
    message: 'Erro interno do servidor',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco de dados:', err.message);
    } else {
      console.log('Banco de dados fechado.');
    }
    process.exit(0);
  });
});

export default app;

