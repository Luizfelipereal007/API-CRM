import express from 'express';
import db from './database.js';
import boletosRouter from './routes/boletos.js';
import faqRouter from './routes/faq.js';
import notasFiscaisRouter from './routes/notasFiscais.js';
import projetosRouter from './routes/projetos.js';
import resumosRouter from './routes/resumos.js';
import usuariosRouter from './routes/usuarios.js';

const app = express();
const PORT = process.env.PORT || 3000;
const endpoints = {
      usuarios: '/usuarios',
      projetos: '/projetos',
      boletos: '/boletos',
      notasFiscais: '/notas-fiscais',
      resumos: {
        getResumoPagamentosPorCpf: '/getResumoPagamentosPorCpf?cpf=xxx'
      },
      faq: {
        buscar: 'POST /faq',
        listarAssuntos: 'GET /faq/assuntos',
        buscarPorAssunto: 'GET /faq/assunto/:assunto'
      }
    }

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
app.use('/', resumosRouter);
app.use('/faq', faqRouter);
app.get('/health', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (req, res) => {
  res.status(200).json({
    status: true,
    message: 'API CRM',
    endpoints: endpoints
  });
});
app.use('*', (req, res) => {
  res.status(404).json({
    status: false,
    message: 'essa rota nao existe verifique as informacoes',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: endpoints
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

