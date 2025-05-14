
# Garagem Inteligente Unificada v3.1 (Refatorado)

## O que é?

Esta é uma aplicação web simples que simula uma garagem virtual. Você pode adicionar e gerenciar diferentes tipos de veículos:

*   **Carros Esportivos:** Com opção de ativar/desativar turbo.
*   **Caminhões:** Com capacidade de carga para carregar e descarregar.

A aplicação foi construída usando **HTML**, **CSS** e **JavaScript** puro, com foco em **Programação Orientada a Objetos (POO)** para organizar o código.

## Funcionalidades

*   **Adicionar Veículos:** Coloque carros esportivos e caminhões na sua garagem.
*   **Controlar Veículos:** Ligue, desligue, acelere e freie seus veículos.
*   **Ações Especiais:** Ative o turbo nos carros ou carregue/descarregue carga nos caminhões.
*   **Manutenção:** Adicione registros de manutenção (como troca de óleo) e veja o histórico de cada veículo.
*   **Salvar Dados:** Sua garagem (veículos e históricos) fica salva no seu navegador usando `LocalStorage`.
*   **Alertas:** Receba lembretes para manutenções agendadas para hoje ou amanhã.
*   **Detalhes Extras do Veículo (API Simulada):** Busca informações adicionais sobre os veículos (FIPE, recall, dicas) de um arquivo JSON local (`dados_veiculos_api.json`).
*   **Planejador de Viagem com Previsão do Tempo Atual (API Real - OpenWeatherMap):**
    *   Permite ao usuário inserir uma cidade de destino.
    *   Busca e exibe a previsão do tempo *atual* para a cidade informada.
    *   Utiliza o endpoint "Current Weather Data" da API OpenWeatherMap. (Se esta funcionalidade estiver presente no HTML)
*   **Planejador de Viagem com Previsão Detalhada Interativa (API Real - OpenWeatherMap):**
    *   Permite ao usuário inserir uma cidade de destino.
    *   Busca e exibe a previsão do tempo para os próximos 5 dias para a cidade informada.
    *   Utiliza o endpoint "5 day / 3 hour forecast" da API OpenWeatherMap.
    *   Processa os dados da API para mostrar um resumo diário: data, temperaturas mínima e máxima, descrição do tempo, ícone, umidade média e velocidade média do vento.
    *   **Interatividade Adicionada (B2.P1.A4):**
        *   **Filtro de Dias:** O usuário pode escolher visualizar a previsão para "Hoje", "Próximos 3 dias" ou "Próximos 5 dias" usando botões de filtro.
        *   **Destaque de Condições:** O usuário pode ativar/desativar destaques visuais para dias com "Chuva", "Frio" (temperatura mínima abaixo de 10°C) ou "Calor" (temperatura máxima acima de 30°C) através de checkboxes. Os dias correspondentes terão um estilo diferenciado.

## Como Executar Localmente

1.  **Obtenha uma Chave da API OpenWeatherMap (Obrigatório para Previsão do Tempo):**
    *   Acesse [OpenWeatherMap](https://openweathermap.org/) e crie uma conta gratuita.
    *   Vá para a seção "API keys" no seu perfil e copie sua chave.
    *   Abra o arquivo `script.js`.
    *   Encontre as constantes `OPENWEATHER_API_KEY` (para previsão atual) e `OPENWEATHER_API_KEY_DETALHADA` (para previsão de 5 dias).
    *   Substitua `"SUA_CHAVE_OPENWEATHERMAP_AQUI"` (ou o placeholder similar como `"32ad5f39fc17a3b18cec5953e7a3227e"` se for um exemplo que você não quer usar) pela sua chave real em AMBAS as constantes se for usar as duas funcionalidades, ou na constante relevante. Se for usar a mesma chave para ambas, pode usar uma só constante e referenciá-la nos dois locais. **É crucial que a chave `OPENWEATHER_API_KEY_DETALHADA` seja preenchida com uma chave válida para a funcionalidade de previsão detalhada funcionar.**

2.  **Baixe o Código:**
    *   Clique em "Code" -> "Download ZIP" neste repositório e extraia os arquivos.
    *   Ou, se tiver Git, clone o repositório.

3.  **Verifique a Estrutura dos Arquivos:**
    *   Certifique-se de que os arquivos `index.html`, `style.css`, `script.js`, `manutencao.js`, `garagem.js`, e a pasta `Imagens` (com as imagens dos veículos e favicon) e a pasta `sons` (com os arquivos de áudio) estão na mesma pasta raiz do projeto.
    *   O arquivo `dados_veiculos_api.json` também deve estar na pasta raiz.

4.  **Abra o Arquivo `index.html`:**
    *   Encontre o arquivo `index.html` na pasta do projeto.
    *   **Dê um duplo clique** nesse arquivo. Ele vai abrir diretamente no seu navegador web padrão (Chrome, Firefox, Edge, etc.).

Pronto! A Garagem Inteligente estará funcionando no seu navegador.

## ALERTA DE SEGURANÇA IMPORTANTE SOBRE A API KEY

Para as funcionalidades de previsão do tempo, a chave da API OpenWeatherMap é utilizada.

**ATENÇÃO:** No contexto desta atividade didática, a chave da API é inserida diretamente no arquivo JavaScript (`script.js`). **Esta é uma prática INSEGURA e NUNCA deve ser feita em aplicações de produção que são publicadas na internet.**

*   **Por que é inseguro?** Qualquer pessoa com acesso ao código fonte do seu site no navegador poderá ver e copiar sua chave de API. Isso pode levar ao uso indevido da sua chave, esgotamento da sua cota de requisições gratuitas e, em alguns casos, até custos financeiros se a API tiver um plano pago associado a um uso excessivo.

*   **Qual a abordagem correta em produção?** A forma segura de usar chaves de API no frontend é através de um **backend (servidor) que atua como um proxy**.
    1.  O frontend faz uma requisição para o SEU backend.
    2.  O SEU backend, que armazena a chave da API de forma segura (ex: variáveis de ambiente), faz a requisição para a API externa (OpenWeatherMap).
    3.  A API externa responde ao SEU backend.
    4.  O SEU backend repassa a resposta para o frontend.
    Desta forma, a chave da API nunca fica exposta no código do cliente (navegador).

**Para esta atividade, a inclusão direta da chave no frontend é uma simplificação para focar nos aspectos de consumo da API e manipulação de dados. Tenha consciência deste risco.**

## Ver Online

Você pode testar a aplicação diretamente online aqui:

**[Link da Aplicação Online](https://seu-link-de-deploy.vercel.app/)** <0xE2><0x86><0x90> *(Substitua pelo seu link Vercel/Netlify/etc. real após o deploy)*
--- END OF FILE README.txt ---