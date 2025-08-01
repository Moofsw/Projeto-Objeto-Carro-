require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

// --- IMPORTAÇÃO DOS NOVOS MODELOS ---
const Dica = require('./models/Dica'); // Assumindo que o modelo Dica foi movido para models/Dica.js
const Veiculo = require('./models/Veiculo'); // <-- NOVO: Importa o modelo de Veículo

const app = express();
const PORT = process.env.PORT || 3001; // Usar a porta do ambiente ou 3001

// --- Configuração da Conexão Robusta com o MongoDB ---
const connectDB = async () => {
  // ... (código de conexão com o banco de dados permanece o mesmo)
};
connectDB();

// --- Middlewares ---
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json()); // Essencial para o backend entender o corpo das requisições POST em JSON

// ======================================================
// --- NOVAS ROTAS PARA A API DE VEÍCULOS (CRUD) ---
// ======================================================

// Rota GET /api/veiculos - para LER (Read) todos os veículos do DB
app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find(); // .find() sem argumentos busca todos
        
        console.log('[Servidor] Buscando todos os veículos do DB.');
        res.json(todosOsVeiculos);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// Rota POST /api/veiculos - para CRIAR (Create) um novo veículo no DB
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        // O Mongoose aplicará as validações do Schema aqui
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado); // Retorna o veículo criado com o _id do DB

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        // Tratamento de erros de validação e duplicidade do Mongoose
        if (error.code === 11000) { // Erro de placa duplicada (unique)
            return res.status(409).json({ error: 'Veículo com esta placa já existe.' });
        }
        if (error.name === 'ValidationError') { // Erros de campos obrigatórios, min/max, etc.
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});


// --- Rotas da API de Dicas (permanecem as mesmas) ---
app.get('/api/dicas-manutencao', async (req, res) => {
  // ... (código da rota de dicas gerais)
});

app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
  // ... (código da rota de dicas por tipo)
});


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});