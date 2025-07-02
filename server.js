const path = require("path");
const express = require("express");
const cors = require('cors'); // Importando o pacote CORS

const app = express();
const PORT = 4000;

// --- Habilitando o CORS para todas as rotas ---
// Isso permite que seu frontend (mesmo em um domínio diferente, como file://)
// faça requisições para este backend.
app.use(cors());

// --- Simulação de Banco de Dados em Memória ---
const dicasManutencaoGerais = [
    { id: 1, dica: "Verifique o nível do óleo do motor regularmente." },
    { id: 2, dica: "Calibre os pneus semanalmente, incluindo o estepe." },
    { id: 3, dica: "Confira o fluido de arrefecimento e o nível da água do radiador." },
    { id: 4, dica: "Teste os freios e ouça por ruídos anormais." },
    { id: 5, dica: "Verifique todas as luzes do veículo: faróis, lanternas, setas e luz de freio." }
];

const dicasPorTipo = {
    carro: [
        { id: 10, dica: "Faça o rodízio dos pneus a cada 10.000 km para um desgaste uniforme." },
        { id: 11, dica: "Troque o filtro de ar do motor conforme recomendação do manual." },
        { id: 12, dica: "Verifique o alinhamento e balanceamento das rodas anualmente." }
    ],
    caminhao: [
        { id: 20, dica: "Inspecione a quinta roda e lubrifique-a conforme o uso." },
        { id: 21, dica: "Verifique o sistema pneumático de freios diariamente antes de iniciar a viagem." },
        { id: 22, dica: "Fique atento ao tacógrafo e mantenha o disco ou fita em dia." }
    ]
};


// --- Configurações do Express ---
app.use(express.static(path.join(__dirname))); // Servir arquivos estáticos da raiz do projeto  
app.use(express.json()); // Middleware para parsear JSON no corpo das requisições


// --- ENDPOINTS DA API ---

// Endpoint para buscar todas as dicas de manutenção gerais
app.get('/api/dicas-manutencao', (req, res) => {
    console.log("LOG: Requisição recebida em /api/dicas-manutencao");
    res.json(dicasManutencaoGerais);
});

// Em server.js, CORRIGIDO
app.get('/api/dicas-manutencao/:tipoVeiculo', (req, res) => {
    const { tipoVeiculo } = req.params;
    console.log(`LOG: Requisição recebida em /api/dicas-manutencao/${tipoVeiculo}`);

    const dicas = dicasPorTipo[tipoVeiculo.toLowerCase()]; // Busca case-insensitive

    if (dicas) {
        res.json(dicas);
    } else {
        res.status(404).json({ error: `Nenhuma dica encontrada para o tipo: ${tipoVeiculo}` });
    }
});


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
   console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
   console.log(`Acesse em http://localhost:${PORT}`);
   console.log("Endpoints de API disponíveis:");
   console.log(`  - GET http://localhost:${PORT}/api/dicas-manutencao`);
   console.log(`  - GET http://localhost:${PORT}/api/dicas-manutencao/carro`);
   console.log(`  - GET http://localhost:${PORT}/api/dicas-manutencao/caminhao`);
});

//a 