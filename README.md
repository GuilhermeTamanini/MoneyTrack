# Sistema de Controle de Gastos

## Descrição

Este projeto é uma aplicação web para **controle financeiro pessoal**, permitindo o cadastro e gerenciamento de receitas, despesas e categorias, além da visualização de relatórios e saldo mensal.

O objetivo é fornecer uma ferramenta simples, organizada e confiável para auxiliar no acompanhamento financeiro.

---

## Stack Utilizada

- **Backend:** [Rust](https://www.rust-lang.org/)
- **Frontend:** [React](https://react.dev/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)

---

## Arquitetura

A aplicação segue uma arquitetura baseada em **API REST**:

- O **React** é responsável pela interface do usuário.
- O **Rust** implementa a API e as regras de negócio.
- O **PostgreSQL** realiza a persistência e gerenciamento dos dados.

A comunicação entre frontend e backend ocorre via **HTTP** utilizando **JSON**.

---

## Justificativa das Tecnologias

### Rust (Backend)

Escolhido por oferecer:

- Alta performance
- Forte sistema de tipos
- Concorrência segura

Essas características tornam a aplicação mais robusta e preparada para evoluções futuras.

---

### React (Frontend)

Escolhido por:

- Criação de interfaces reativas e dinâmicas
- Componentização e reutilização de código
- Grande ecossistema e comunidade ativa

Proporciona uma experiência moderna e organizada ao usuário.

---

### PostgreSQL (Banco de Dados)

Escolhido devido a:

- Integridade transacional (ACID)
- Modelagem relacional sólida
- Excelente desempenho em consultas
- Suporte a recursos avançados como JSON e índices

Para um sistema financeiro, consistência e confiabilidade são fundamentais.

---

## Funcionalidades

- Cadastro de receitas
- Cadastro de despesas
- Organização por categorias
- Cálculo automático de saldo
- Visualização de relatórios financeiros

# Divisão de Tarefas

## Guilherme Tamanini

### Estrutura e Banco de Dados
- Modelar entidades
- Criar scripts de criação das tabelas no PostgreSQL
- Configurar migrations
- Auxiliar na definição do contrato da API

### Backend
- Configurar projeto em Rust
- Criar estrutura inicial da API
- Implementar endpoints de cadastro
- Implementar validações básicas e regras de negócio

### Frontend
- Criar estrutura inicial do projeto em React
- Desenvolver componentes reutilizáveis (Button, Input, Card)
- Criar tela de cadastro de receitas

---

## Vinicius Henrique da Silva

### Estrutura e Planejamento
- Definir junto com o Guilherme o modelo de dados
- Definir padrão de respostas da API
- Organizar estrutura de pastas do frontend

### Backend
- Implementar endpoints de consulta
- Implementar tratamento de erros
- Criar testes básicos dos endpoints

### Frontend
- Desenvolver tela de cadastro de despesas
- Desenvolver tela de listagem de transações
- Implementar integração com a API
- Gerenciar estado da aplicação

---

## Tarefas Conjuntas

- Testes integrados
- Ajustes de integração entre frontend e backend
- Revisão de código
- Documentação final no README
- Preparação para deploy
