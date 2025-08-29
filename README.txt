# Garagem Inteligente Unificada v3.1 (Refatorado com Backend)

## O que é?

Esta é uma aplicação web que simula uma garagem virtual. O frontend é construído com HTML, CSS e JavaScript (orientado a objetos), e agora é servido e aprimorado por um **backend Node.js/Express**.

*   **Frontend:** Permite adicionar, controlar e gerenciar carros esportivos e caminhões, agendar manutenções e planejar viagens com previsão do tempo real.
*   **Backend:** Atua como uma API, fornecendo dados dinâmicos como dicas de manutenção e, no futuro, gerenciando a lógica de negócios da aplicação.

## Funcionalidades

*   **Gerenciamento de Veículos:** Adicione, controle (ligar/desligar, acelerar/frear) e remova veículos.
*   **Ações Especiais:** Ative o turbo nos carros ou gerencie a carga dos caminhões.
*   **Histórico de Manutenção (Local):** Adicione e visualize o histórico de manutenção de cada veículo (dados persistidos no LocalStorage do navegador).
*   **Histórico de Manutenção (Banco de Dados):** **NOVO!** Adicione e visualize registros de manutenção persistidos no MongoDB para cada veículo, através da API.
*   **Persistência de Dados:** A garagem (veículos e históricos locais) é salva no `LocalStorage` do navegador, e os dados de manutenção do banco de dados são salvos no MongoDB.
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

### 3. Gerenciamento de Manutenções por Veículo (Sub-Recurso)

Estes endpoints permitem gerenciar os registros de manutenção associados a um veículo específico no banco de dados MongoDB.

*   **POST /api/veiculos/:veiculoId/manutencoes**
    *   **Descrição:** Cria um novo registro de manutenção para o veículo especificado pelo `veiculoId`.
    *   **Parâmetros de Rota:**
        *   `veiculoId` (string): O `_id` do veículo ao qual a manutenção será associada.
    *   **Corpo da Requisição (JSON):**
        ```json
        {
            "descricaoServico": "Troca de Pastilhas de Freio",
            "custo": 350.75,
            "quilometragem": 55000
            // "data" será definida automaticamente no backend como a data atual
        }
        ```
    *   **Exemplo de Resposta (201 Created) (JSON):**
        ```json
        {
            "descricaoServico": "Troca de Pastilhas de Freio",
            "custo": 350.75,
            "quilometragem": 55000,
            "data": "2025-08-29T14:30:00.000Z",
            "veiculo": "65e2b0e8c7c7f3e4a5b6c7d8", // ID do veículo associado
            "_id": "65e2b0e8c7c7f3e4a5b6c7d9",
            "createdAt": "2025-08-29T14:30:00.000Z",
            "updatedAt": "2025-08-29T14:30:00.000Z",
            "__v": 0
        }
        ```
    *   **Respostas de Erro:**
        *   `404 Not Found`: `{ "error": "Veículo não encontrado." }` se o `veiculoId` não existir.
        *   `400 Bad Request`: `{ "error": "Descrição do serviço é obrigatória." }` (ou outras mensagens de validação).
        *   `500 Internal Server Error`: Erro inesperado no servidor.

*   **GET /api/veiculos/:veiculoId/manutencoes**
    *   **Descrição:** Retorna todos os registros de manutenção associados a um veículo específico, ordenados pela data mais recente.
    *   **Parâmetros de Rota:**
        *   `veiculoId` (string): O `_id` do veículo cujas manutenções serão listadas.
    *   **Exemplo de Resposta (200 OK) (JSON):**
        ```json
        [
            {
                "descricaoServico": "Troca de Óleo e Filtro",
                "data": "2025-07-10T10:00:00.000Z",
                "custo": 250.00,
                "quilometragem": 50000,
                "veiculo": "65e2b0e8c7c7f3e4a5b6c7d8",
                "_id": "65e2b0e8c7c7f3e4a5b6c7e0",
                "createdAt": "2025-08-29T14:00:00.000Z",
                "updatedAt": "2025-08-29T14:00:00.000Z",
                "__v": 0
            },
            {
                "descricaoServico": "Verificação de Freios",
                "data": "2025-05-20T11:30:00.000Z",
                "custo": 80.50,
                "quilometragem": 45000,
                "veiculo": "65e2b0e8c7c7f3e4a5b6c7d8",
                "_id": "65e2b0e8c7c7f3e4a5b6c7e1",
                "createdAt": "2025-08-29T14:00:00.000Z",
                "updatedAt": "2025-08-29T14:00:00.000Z",
                "__v": 0
            }
        ]
        ```
    *   **Respostas de Erro:**
        *   `404 Not Found`: `{ "error": "Veículo não encontrado." }` se o `veiculoId` não existir.
        *   `500 Internal Server Error`: Erro inesperado no servidor.

---

## Como Executar Localmente

### Pré-requisitos
*   [Node.js](https://nodejs.org/) instalado (que inclui o `npm`).
*   Acesso a uma instância do MongoDB (local ou MongoDB Atlas). Certifique-se de que a variável de ambiente `MONGODB_URI` no seu arquivo `.env` esteja configurada corretamente para a sua conexão com o banco de dados.

### Passos
1.  **Baixe o Código:** Clone o repositório ou baixe o arquivo ZIP.

2.  **Instale as Dependências do Backend:**
    *   Abra um terminal na pasta raiz do projeto.
    *   Execute o comando:
        ```bash
        npm install
        ```
    *   Isso instalará o `express`, `cors`, `dotenv` e `mongoose` listados no `package.json`.

3.  **Crie um arquivo `.env`:**
    *   Na pasta raiz do projeto, crie um arquivo chamado `.env`.
    *   Adicione a string de conexão do seu MongoDB:
        ```
        MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority"
        # OU para MongoDB local:
        # MONGODB_URI="mongodb://localhost:27017/garagem-inteligente"
        ```
        Substitua `<user>`, `<password>`, `<cluster-name>` e `<database-name>` pelos seus dados do MongoDB Atlas, ou use a string de conexão local.

4.  **Inicie o Servidor Backend:**
    *   No mesmo terminal, execute:
        ```bash
        node server.js
        ```
    *   Você verá uma mensagem indicando que o servidor está rodando na porta 3001 (ou a porta que você configurou no `.env`). **Mantenha este terminal aberto.**

5.  **Abra o Frontend:**
    *   Encontre o arquivo `index.html` na pasta do projeto.
    *   **Dê um duplo clique** nesse arquivo. Ele abrirá diretamente no seu navegador web padrão.

Pronto! A Garagem Inteligente estará funcionando, com o frontend consumindo os dados fornecidos pelo seu backend local e gerenciando as manutenções no MongoDB.

---