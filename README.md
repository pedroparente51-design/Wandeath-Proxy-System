# Wandeath VIP - Proxy System & Digital Solutions

Uma plataforma e-commerce moderna, responsiva e de alta performance voltada para a venda e o gerenciamento de Proxies (Residenciais, Mobile e Datacenter). O projeto entrega uma experiência de usuário premium com uma interface gráfica rica em efeitos e interações.

## Sobre o projeto

O **Wandeath Proxy System** foi criado para facilitar a aquisição e o gerenciamento de IPs para operações profissionais (marketing, automação, multilogins). Ele oferece um carrinho de compras completo, painel de administração, área do cliente e integração nativa ao Supabase para controle de produtos e sincronização de dados em tempo real.

## Tecnologias utilizadas

<p align="left">
  <img src="https://skillicons.dev/icons?i=html,css,js,nodejs,supabase,postgres,python" />
</p>

## Funcionalidades

* **Carrinho de Compras Avançado:** sistema dinâmico gerenciado pelo `cart-engine.js` para adição e controle de pedidos.
* **Autenticação e Área do Cliente:** login integrado e espaço para gerenciamento de produtos.
* **Painel de Administração:** rota `/admin` para gerenciamento dos produtos listados no sistema.
* **Gestão de Proxies:** páginas específicas para Proxies Rotativas, Mobile e Fixas.
* **Chat Interativo:** sistema próprio de mensagens com clientes por meio dos módulos `chat` e `chatbox`.
* **Módulo de Pedidos:** acompanhamento do histórico e do estado dos pedidos do usuário.
* **Design UI/UX:** interface com efeitos de parallax, aurora blobs, glassmorphism e ícones da biblioteca Lucide.
* **Sincronização de Dados:** sincronização automatizada de produtos entre Supabase e LocalStorage.

## Estrutura do projeto

O repositório está organizado em módulos de front-end estáticos e scripts relacionados ao banco de dados e infraestrutura:

```text
admin/              Painel de administração
carrinho/           Interface de checkout e visualização de itens
chat/               Componentes do sistema de atendimento
chatbox/            Interface de mensagens
login/              Interface de autenticação
pedidos/            Histórico e detalhes dos pedidos
produto/            Visualização individual dos produtos
proxy/              Categorias de proxies
index.html          Landing page principal
setup_products.js   Script de configuração de produtos
setup_profiles.sql  Scripts de configuração do banco de dados
supabase-config.js  Configuração central do Supabase
ssh_fix.py          Automação de infraestrutura e SSH
```

## Instalação e execução

O projeto é baseado principalmente em arquivos estáticos no front-end, utilizando JavaScript Vanilla, além de scripts auxiliares em Node.js para comunicação com o banco de dados.

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/Wandeath-Proxy-System.git
```

### 2. Acesse o diretório

```bash
cd Wandeath-Proxy-System
```

### 3. Configure as variáveis e credenciais

Configure as informações necessárias para conexão com o Supabase e demais serviços utilizados pelo projeto.

### 4. Execute o projeto

Como o front-end é baseado em arquivos estáticos, o projeto pode ser executado utilizando um servidor local, como o Live Server, ou outro servidor HTTP compatível.

## Arquitetura

O projeto combina uma aplicação front-end baseada em JavaScript Vanilla com serviços externos para autenticação, banco de dados e sincronização.

```text
Frontend
│
├── HTML
├── CSS
└── JavaScript
        │
        ├── Autenticação
        ├── Carrinho
        ├── Pedidos
        ├── Chat
        └── Administração
                │
                ▼
            Supabase
                │
                ├── PostgreSQL
                └── Autenticação
```

## Banco de dados

O sistema utiliza **Supabase** como infraestrutura principal para armazenamento e gerenciamento de dados, utilizando PostgreSQL como banco de dados.

Os scripts de configuração incluem:

* `setup_products.js`
* `setup_profiles.sql`

Esses arquivos auxiliam na configuração inicial das estruturas e dados utilizados pela aplicação.

## Infraestrutura

O projeto também possui scripts voltados para automação e gerenciamento de infraestrutura:

* Nginx
* PM2
* Docker
* SSH
* VPS

O arquivo `ssh_fix.py` contém automações relacionadas à configuração e manutenção da infraestrutura.

## Interface e experiência do usuário

A interface foi desenvolvida com foco em uma experiência moderna e responsiva, utilizando:

* Glassmorphism
* Parallax
* Aurora effects
* Microinterações
* Design responsivo
* Lucide Icons
* Componentes dinâmicos
* Interfaces de administração e cliente

## Status do projeto

Projeto desenvolvido para fins de estudo, desenvolvimento e demonstração de conhecimentos em desenvolvimento web, integração com APIs, bancos de dados, autenticação e infraestrutura.

## Autor

**Pedro Lucas Parente de Sousa**

Técnico em Informática em formação, com foco em desenvolvimento web, APIs, bancos de dados, automação e soluções tecnológicas.

<p align="left">
  <a href="https://peeh.dev">Portfolio</a>
  <a href="https://github.com/Xerocado">GitHub</a>
  <a href="https://www.linkedin.com/in/peehof/">LinkedIn</a>
</p>
