# API-CRM

API de CRM com Node.js, Express e SQLite para integração com Blip.

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
- **DELETE** `/notas-fiscais/:id` - Deletar nota fiscal

**⚠️ POST** - Notas fiscais são criadas automaticamente quando o boleto é pago

### Fluxo de Pagamento
1. Criar boleto via `POST /boletos`
2. Pagar boleto via `PUT /boletos/:id/pagar`
3. Nota fiscal é gerada automaticamente
4. Consultar notas via `/notas-fiscais` ou `/blip/getNotasFiscaisPorCpf`

## Endpoints Para a Blip

### GET /blip/getProjetosPorEmail
Busca projetos pelo email do usuário.

**URL:**
```
GET /blip/getProjetosPorEmail?email=usuario@email.com
```

### GET /blip/getBoletosPorCpf
Busca boletos pelo CPF do usuário (inclui status de pagamento).

**URL:**
```
GET /blip/getBoletosPorCpf?cpf=123.456.789-00
```

### GET /blip/getNotasFiscaisPorCpf
Busca apenas notas fiscais (boletos pagos) pelo CPF.

**URL:**
```
GET /blip/getNotasFiscaisPorCpf?cpf=123.456.789-00
```

### GET /blip/getResumoPagamentosPorCpf
Resumo completo de pagamentos por CPF.

**URL:**
```
GET /blip/getResumoPagamentosPorCpf?cpf=123.456.789-00
```

### ⚠️ Regras de Negócio Implementadas
- **Projetos**: Usuário pode ter múltiplos projetos
- **Boletos**: Apenas 1 boleto por projeto
- **Notas Fiscais**: Criadas automaticamente quando boleto é pago
- **Blip**: `getNotasFiscaisPorCpf` retorna apenas boletos pagos

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
