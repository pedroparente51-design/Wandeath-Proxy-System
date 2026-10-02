# Proxy System & Digital Solutions

<p align="center">
  <strong>Plataforma de e-commerce e gerenciamento de Proxies com foco em performance, automação e experiência do usuário.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-0A0A0A?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-0A0A0A?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JAVASCRIPT-0A0A0A?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
  <img src="https://img.shields.io/badge/NODE.JS-0A0A0A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PYTHON-0A0A0A?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/SUPABASE-0A0A0A?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/POSTGRESQL-0A0A0A?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

---

## Sobre o projeto

O **Proxy System & Digital Solutions** é uma plataforma de e-commerce desenvolvida para comercialização e gerenciamento de diferentes tipos de Proxies, incluindo:

* Proxies Residenciais;
* Proxies Mobile;
* Proxies Datacenter.

O sistema combina uma interface moderna e responsiva com recursos de autenticação, gerenciamento de produtos, carrinho de compras, pedidos, atendimento ao cliente e integração com infraestrutura externa.

A aplicação utiliza **Supabase** como infraestrutura de dados e autenticação, permitindo sincronização das informações entre a plataforma e o banco de dados em tempo real.

---

## Tecnologias utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-0A0A0A?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-0A0A0A?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JAVASCRIPT-0A0A0A?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
  <img src="https://img.shields.io/badge/NODE.JS-0A0A0A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PYTHON-0A0A0A?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/SUPABASE-0A0A0A?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/POSTGRESQL-0A0A0A?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/GIT-0A0A0A?style=for-the-badge&logo=git&logoColor=white" alt="Git">
  <img src="https://img.shields.io/badge/GITHUB-0A0A0A?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  <img src="https://img.shields.io/badge/DOCKER-0A0A0A?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/NGINX-0A0A0A?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx">
</p>

### Stack

* **Frontend:** HTML5, CSS3 e JavaScript Vanilla.
* **Backend / Scripts:** Node.js e Python.
* **Backend as a Service:** Supabase.
* **Banco de dados:** PostgreSQL.
* **Autenticação:** Supabase Auth.
* **Infraestrutura:** Nginx, PM2, Docker, SSH e VPS.
* **Ícones:** Lucide Icons.
* **Armazenamento local:** LocalStorage.
* **Automação:** scripts Node.js, Python e shell/infrastructure tooling.

---

## Funcionalidades

### E-commerce

* **Catálogo de produtos:** organização dos diferentes tipos de Proxies.
* **Carrinho de compras:** gerenciamento dinâmico através do `cart-engine.js`.
* **Checkout:** interface dedicada para revisão dos produtos selecionados.
* **Pedidos:** histórico e acompanhamento dos pedidos realizados.
* **Sincronização:** integração entre dados locais e Supabase.

### Área do cliente

* Autenticação de usuários;
* Gerenciamento de produtos;
* Consulta de pedidos;
* Histórico de compras;
* Sistema de atendimento;
* Interface personalizada para usuários autenticados.

### Painel administrativo

A plataforma possui uma área administrativa através da rota:

```text
/admin
```

O painel permite o gerenciamento dos produtos disponibilizados na plataforma e das informações relacionadas ao sistema.

### Sistema de atendimento

O projeto possui um sistema próprio de comunicação com clientes através dos módulos:

```text
chat/
chatbox/
```

Esses módulos são responsáveis pela interface e componentes relacionados ao atendimento.

---

## Estrutura do projeto

```text
Wandeath Proxy System/
│
├── admin/
│   └── # Painel administrativo
│
├── carrinho/
│   └── # Interface de checkout e carrinho
│
├── chat/
│   └── # Componentes do sistema de atendimento
│
├── chatbox/
│   └── # Interface de mensagens
│
├── login/
│   └── # Sistema de autenticação
│
├── pedidos/
│   └── # Histórico e detalhes dos pedidos
│
├── produto/
│   └── # Visualização individual dos produtos
│
├── proxy/
│   └── # Categorias e produtos de Proxy
│
├── index.html
│   └── # Landing Page principal
│
├── setup_products.js
│   └── # Configuração de produtos
│
├── setup_profiles.sql
│   └── # Configuração de dados do banco
│
├── supabase-config.js
│   └── # Configuração central do Supabase
│
└── ssh_fix.py
    └── # Automação relacionada à infraestrutura
```

---

## Arquitetura

```text
                         ┌──────────────────────┐
                         │       USUÁRIO        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │       FRONTEND WEB          │
                    │                             │
                    │ HTML + CSS + JavaScript     │
                    └──────────────┬──────────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      ┌────────────┐       ┌────────────┐       ┌────────────┐
      │  Carrinho  │       │   Pedidos  │       │    Chat    │
      └─────┬──────┘       └─────┬──────┘       └─────┬──────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  ▼
                        ┌─────────────────────┐
                        │      SUPABASE       │
                        │                     │
                        │ PostgreSQL          │
                        │ Authentication      │
                        │ Data Synchronization│
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │   INFRAESTRUTURA    │
                        │                     │
                        │ Nginx / PM2 / VPS   │
                        │ Docker / SSH        │
                        └─────────────────────┘
```

---

## Fluxo de dados

O sistema utiliza o Supabase como camada central para autenticação, armazenamento e sincronização de dados.

```text
Produto
   │
   ▼
Supabase
   │
   ├──────────────► Catálogo
   │
   ├──────────────► Carrinho
   │
   ├──────────────► Pedidos
   │
   └──────────────► Área administrativa
```

No lado do cliente, informações que precisam de persistência local também podem ser armazenadas através do **LocalStorage**, permitindo sincronização posterior com os dados provenientes do Supabase.

---

## Banco de dados

O projeto utiliza **Supabase** como infraestrutura principal, com **PostgreSQL** como banco de dados.

Os arquivos relacionados à configuração incluem:

```text
setup_products.js
setup_profiles.sql
supabase-config.js
```

### Principais responsabilidades

* Configuração inicial de produtos;
* Estruturação de perfis;
* Comunicação com o Supabase;
* Sincronização dos dados;
* Autenticação dos usuários.

---

## Infraestrutura

Além da aplicação web, o projeto possui componentes voltados para implantação e gerenciamento de infraestrutura.

### Tecnologias

* **Nginx:** gerenciamento e distribuição das requisições.
* **PM2:** gerenciamento de processos Node.js.
* **Docker:** suporte à execução de serviços em containers.
* **SSH:** acesso e automação de servidores.
* **VPS:** infraestrutura de hospedagem.
* **Python:** automações auxiliares.

O arquivo:

```text
ssh_fix.py
```

contém automações relacionadas à configuração e manutenção da infraestrutura.

---

## Interface e experiência do usuário

A interface foi construída com foco em uma experiência moderna, responsiva e visualmente imersiva.

### Elementos utilizados

* Glassmorphism;
* Parallax;
* Aurora effects;
* Microinterações;
* Animações;
* Design responsivo;
* Lucide Icons;
* Componentes dinâmicos;
* Interfaces específicas para cliente e administração.

A aplicação busca combinar **performance, usabilidade e estética**, mantendo a navegação organizada mesmo com diferentes módulos e funcionalidades.

---

## Instalação e execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/Wandeath-Proxy-System.git
```

### 2. Acesse o diretório

```bash
cd Wandeath-Proxy-System
```

### 3. Configure as credenciais

Configure as informações necessárias para conexão com o Supabase e demais serviços utilizados pela aplicação.

A configuração principal do Supabase está relacionada ao arquivo:

```text
supabase-config.js
```

### 4. Execute localmente

Por ser baseado principalmente em arquivos estáticos, o projeto pode ser executado através do **Live Server** do VS Code ou qualquer servidor HTTP compatível.

Exemplo utilizando Python:

```bash
python -m http.server 3000
```

Depois, acesse:

```text
http://localhost:3000
```

---

## Configuração

Antes de colocar o sistema em produção, configure corretamente:

* Credenciais do Supabase;
* Chaves e variáveis de ambiente;
* Banco de dados;
* Serviços de infraestrutura;
* Configuração do Nginx;
* Processos gerenciados pelo PM2;
* Containers Docker, quando utilizados;
* Credenciais SSH.

> Credenciais, tokens e chaves privadas não devem ser armazenados diretamente no repositório.

---

## Status do projeto

Projeto desenvolvido para fins de **estudo, desenvolvimento e demonstração de conhecimentos em desenvolvimento web, integração com APIs, bancos de dados, autenticação, e-commerce e infraestrutura**.

---

## Autor

**Pedro Lucas Parente de Sousa**

Técnico em Informática em formação, com foco em:

* Desenvolvimento Web;
* APIs;
* Bancos de dados;
* Automação;
* Infraestrutura;
* Sistemas distribuídos;
* Soluções tecnológicas.

<p align="left">
  <a href="https://github.com/peehkkj">GitHub</a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://www.linkedin.com/in/peehof/">LinkedIn</a>
</p>

---

<p align="center">
  <strong>Proxy System & Digital Solutions</strong><br>
  E-commerce • Automation • Infrastructure • Web Development
</p>
