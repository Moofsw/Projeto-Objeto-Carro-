# Garagem Inteligente Unificada v3.1 (Refatorado com Backend)

## O que é?

Esta é uma aplicação web que simula uma garagem virtual. O frontend é construído com HTML, CSS e JavaScript (orientado a objetos), e agora é servido e aprimorado por um **backend Node.js/Express**.

*   **Frontend:** Permite adicionar, controlar e gerenciar carros esportivos e caminhões, agendar manutenções e planejar viagens com previsão do tempo real.
*   **Backend:** Atua como uma API, fornecendo dados dinâmicos como dicas de manutenção e, no futuro, gerenciando a lógica de negócios da aplicação.

## Funcionalidades

*   **Gerenciamento de Veículos:** Adicione, controle (ligar/desligar, acelerar/frear) e remova veículos.
*   **Ações Especiais:** Ative o turbo nos carros ou gerencie a carga dos caminhões.
*   **Histórico de Manutenção:** Adicione e visualize o histórico de manutenção de cada veículo.
*   **Persistência de Dados:** A garagem (veículos e históricos) é salva no `LocalStorage` do navegador.
*   **Previsão do Tempo Detalhada:** Planeje viagens com uma previsão de 5 dias para qualquer cidade, com filtros interativos.
*   **API Backend Própria:** Um servidor Node.js/Express que fornece dados adicionais para a aplicação.

## API Endpoints do Backend

Nosso servidor backend expõe os seguintes endpoints. A URL base para o servidor local é `http://localhost:4000`.

---

### 1. Dicas de Manutenção Gerais

*   **Endpoint:** `GET /api/dicas-manutencao`
*   **Descrição:** Retorna uma lista com dicas de manutenção aplicáveis a qualquer tipo de veículo.
*   **Parâmetros:** Nenhum.
*   **Exemplo de Resposta (JSON):**
    ```json
    [
        { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
        { "id": 2, "dica": "Calibre os pneus semanalmente, incluindo o estepe." },
        { "id": 3, "dica": "Confira o fluido de arrefecimento e o nível da água do radiador." }
    ]
    ```

---

### 2. Dicas de Manutenção por Tipo de Veículo

*   **Endpoint:** `GET /api/dicas-manutencao/:tipoVeiculo`
*   **Descrição:** Retorna uma lista de dicas de manutenção específicas para o tipo de veículo informado na URL.
*   **Parâmetros de Rota:**
    *   `tipoVeiculo` (string): O tipo do veículo. Atualmente suporta `carro` e `caminhao` (não diferencia maiúsculas/minúsculas).
*   **Exemplo de Resposta para `/api/dicas-manutencao/carro` (JSON):**
    ```json
    [
        { "id": 10, "dica": "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { "id": 11, "dica": "Troque o filtro de ar do motor conforme recomendação do manual." }
    ]
    ```
*   **Resposta de Erro (404 Not Found) para `/api/dicas-manutencao/moto`:**
    ```json
    {
        "error": "Nenhuma dica encontrada para o tipo: moto"
    }
    ```

---

## Como Executar Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (que inclui o `npm`).

### Passos
1.  **Baixe o Código:** Clone o repositório ou baixe o arquivo ZIP.

2.  **Instale as Dependências do Backend:**
    *   Abra um terminal na pasta raiz do projeto.
    *   Execute o comando:
        ```bash
        npm install
        ```
    *   Isso instalará o `express` e o `cors` listados no `package.json`.

3.  **Inicie o Servidor Backend:**
    *   No mesmo terminal, execute:
        ```bash
        node server.js
        ```
    *   Você verá uma mensagem indicando que o servidor está rodando na porta 4000. **Mantenha este terminal aberto.**

4.  **Abra o Frontend:**
    *   Encontre o arquivo `index.html` na pasta do projeto.
    *   **Dê um duplo clique** nesse arquivo. Ele abrirá diretamente no seu navegador web padrão.

Pronto! A Garagem Inteligente estará funcionando, com o frontend consumindo os dados fornecidos pelo seu backend local.