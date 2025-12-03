# API-CRM

API de CRM com Node.js, Express e SQLite.

## Instalação

```bash
npm install
npm start
```

API rodando em `http://localhost:3000`

## Tabelas do Banco

- **usuarios** - id, nome, sobrenome, telefone, cpf, email, created_at
- **projetos** - id, nome, status, previsao_entrega, usuario_id, created_at
- **boletos** - id, nome, valor, data_vencimento, status_projeto, pago, projeto_id, created_at
- **notas_fiscais** - id, boleto_id, data_emissao, valor, projeto_id, created_at

## Endpoints

### Usuários
- **GET** `/usuarios` - Listar usuários
- **GET** `/usuarios/:id` - Buscar por ID
- **GET** `/usuarios/email/:email` - Buscar por email
- **GET** `/usuarios/nome/:nome` - Buscar por nome
- **GET** `/usuarios/cpf/:cpf` - Buscar por CPF
- **POST** `/usuarios` - Criar usuário
- **PUT** `/usuarios/:id` - Atualizar usuário
- **DELETE** `/usuarios/:id` - Deletar usuário

**Exemplo POST:**
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "telefone": "(11) 99999-9999",
  "cpf": "123.456.789-00",
  "email": "joao@email.com"
}
```

### Projetos
- **GET** `/projetos` - Listar projetos
- **GET** `/projetos/:id` - Buscar por ID
- **GET** `/projetos/usuario/:usuarioId` - Projetos do usuário
- **GET** `/projetos/email/:email` - Buscar projetos por email do usuário
- **GET** `/projetos/nome/:nome` - Buscar projetos por nome do usuário
- **GET** `/projetos/cpf/:cpf` - Buscar projetos por CPF do usuário
- **POST** `/projetos` - Criar projeto
- **PUT** `/projetos/:id` - Atualizar projeto
- **DELETE** `/projetos/:id` - Deletar projeto

**Exemplo POST:**
```json
{
  "nome": "Site Novo",
  "status": "Em desenvolvimento",
  "previsao_entrega": "2026-01-29",
  "usuario_id": 1
}
```

### Boletos
- **GET** `/boletos` - Listar boletos
- **GET** `/boletos/projeto/:projetoId` - Boletos do projeto
- **GET** `/boletos/usuario/:usuarioId` - Boletos do usuário
- **GET** `/boletos/email/:email` - Buscar boletos por email do usuário
- **GET** `/boletos/nome/:nome` - Buscar boletos por nome do usuário
- **GET** `/boletos/cpf/:cpf` - Buscar boletos por CPF do usuário
- **POST** `/boletos` - Criar boleto
- **PUT** `/boletos/:id/pagar` - Marcar como pago (gera nota fiscal automaticamente)
- **DELETE** `/boletos/:id` - Deletar boleto

**Exemplo POST:**
```json
{
  "nome": "Boleto Site",
  "valor": 1500.00,
  "data_vencimento": "2026-02-15",
  "status_projeto": "desenvolvimento",
  "projeto_id": 1
}
```

### Notas Fiscais
- **GET** `/notas-fiscais` - Listar notas fiscais
- **GET** `/notas-fiscais/projeto/:projetoId` - Notas do projeto
- **GET** `/notas-fiscais/usuario/:usuarioId` - Notas do usuário
- **GET** `/notas-fiscais/email/:email` - Buscar notas por email do usuário
- **GET** `/notas-fiscais/nome/:nome` - Buscar notas por nome do usuário
- **GET** `/notas-fiscais/cpf/:cpf` - Buscar notas por CPF do usuário
- **DELETE** `/notas-fiscais/:id` - Deletar nota fiscal

**⚠️ POST** - Notas fiscais são criadas automaticamente quando o boleto é pago

### Fluxo de Pagamento
1. Criar boleto via `POST /boletos`
2. Pagar boleto via `PUT /boletos/:id/pagar`
3. Nota fiscal é gerada automaticamente
4. Consultar notas via `/notas-fiscais`

## Endpoints de Resumos

### GET /getResumoPagamentosPorCpf
Resumo completo de pagamentos por CPF.

**URL:**
```
GET /getResumoPagamentosPorCpf?cpf=123.456.789-00
```

## Sistema de FAQ Dinâmica

### Endpoints FAQ
Sistema inteligente de FAQ com detecção automática de assunto usando fuzzy matching otimizado.

- **POST** `/faq` - Buscar resposta para pergunta
- **GET** `/faq/assuntos` - Listar todos os assuntos disponíveis  
- **GET** `/faq/assunto/:assunto` - Buscar perguntas por assunto específico

### POST /faq
Busca resposta para pergunta usando fuzzy matching avançado.

**Body:**
```json
{
  "pergunta": "Como renovar meu plano?"
}
```

**Resposta de Sucesso (200):**
```json
{
  "status": true,
  "message": "Resposta encontrada com sucesso",
  "score": "0.950",
  "data": {
    "assunto": "Renovação de Contrato",
    "resposta": "A renovação do contrato pode ser feita diretamente no painel do cliente..."
  }
}
```

**Resposta Não Encontrada (404):**
```json
{
  "status": false,
  "message": "Não foi possível encontrar uma resposta relacionada à sua pergunta",
  "score": "0.000",
  "threshold": 0.15,
  "sugestoes": [
    {
      "assunto": "Suporte Técnico",
      "pergunta": "Como solicitar suporte técnico?",
      "score": "0.648"
    }
  ]
}
```

### Assuntos Disponíveis
1. **Cancelamento de Serviço** - Informações sobre cancelamento de serviços
2. **Localização da Soft** - Localização da empresa e atendimento presencial
3. **Renovação de Contrato** - Perguntas sobre renovação de planos e contratos
4. **Formas de Contato** - Canais de contato disponíveis (WhatsApp, telefone, email)

### Exemplo de Uso
```bash
# Pergunta com erro de digitação
curl -X POST http://localhost:3000/faq \
  -H "Content-Type: application/json" \
  -d '{"pergunta": "Como renovar meu contarto?"}'
```

```bash
# Listar assuntos disponíveis
curl http://localhost:3000/faq/assuntos
```

### ⚠️ Regras de Negócio Implementadas
- **Projetos**: Usuário pode ter múltiplos projetos
- **Boletos**: Apenas 1 boleto por projeto
- **Notas Fiscais**: Criadas automaticamente quando boleto é pago
- **Resumos**: Retorna um resumo de boletos pagos

## Status HTTP

- **200** - Sucesso
- **201** - Criado com sucesso
- **204** - Nenhum resultado
- **422** - Erro de validação  
- **500** - Erro interno

## Tecnologias

- Node.js 22.5.0
- Express 4.18.2
- SQLite
