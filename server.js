require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

// --- IMPORTAÇÃO DOS NOVOS MODELOS ---
const Dica = require('./models/Dica'); // Assumindo que o modelo Dica foi movido para models/Dica.js
const Veiculo = require('./models/Veiculo'); // <-- NOVO: Importa o modelo de Veículo
const Manutencao = require('./models/Manutencao');
const authMiddleware = require('./auth'); // Middleware de autenticação

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
// --- ROTAS PARA A API DE VEÍCULOS (CRUD) ---
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

// ================================================================
// --- ROTAS PARA SUB-RECURSOS DE MANUTENÇÃO ---
// ================================================================

// Rota POST para CRIAR uma nova manutenção para um veículo específico
app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const novaManutencaoData = { ...req.body, veiculo: veiculoId };
        const manutencaoCriada = await Manutencao.create(novaManutencaoData);
        console.log(`[Servidor] Manutenção criada para o veículo ${veiculoId}:`, manutencaoCriada);
        res.status(201).json(manutencaoCriada);
    } catch (error) {
        console.error("[Servidor] Erro ao criar manutenção:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar manutenção.' });
    }
});

// Rota GET para LER todas as manutenções de um veículo específico
app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const manutenções = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        res.json(manutenções);
    } catch (error) {
        console.error(`[Servidor] Erro ao buscar manutenções para o veículo ${req.params.veiculoId}:`, error);
        res.status(500).json({ error: 'Erro interno ao buscar manutenções.' });
    }
});

// ================================================================
// --- [NOVA ROTA - DESAFIO] REMOVER COMPARTILHAMENTO ---
// ================================================================
app.post('/api/veiculos/:veiculoId/unshare', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { userIdToRemove } = req.body; // ID do usuário que perderá o acesso

        if (!userIdToRemove) {
            return res.status(400).json({ message: 'ID do usuário a ser removido é obrigatório.' });
        }

        const veiculo = await Veiculo.findById(veiculoId);

        if (!veiculo) {
            return res.status(404).json({ message: 'Veículo não encontrado.' });
        }

        // VERIFICAÇÃO DE PROPRIEDADE: Apenas o dono pode remover compartilhamentos
        if (veiculo.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso negado. Apenas o proprietário pode remover compartilhamentos.' });
        }

        // AÇÃO: Usar $pull para remover o userIdToRemove do array sharedWith
        await Veiculo.updateOne(
            { _id: veiculoId },
            { $pull: { sharedWith: userIdToRemove } }
        );

        res.json({ message: 'Compartilhamento removido com sucesso.' });

    } catch (error) {
        console.error("[Servidor] Erro ao remover compartilhamento:", error);
        res.status(500).json({ message: 'Erro interno no servidor ao tentar remover compartilhamento.' });
    }
});


// --- Rotas da API de Dicas (permanecem as mesmas) ---
app.get('/api/dicas-manutencao', async (req, res) => { /* ... */ });
app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => { /* ... */ });

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importação das rotas
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB com sucesso!'))
  .catch(err => console.error('Falha ao conectar com o MongoDB:', err));

// Definição das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Rota raiz para teste
app.get('/', (req, res) => {
  res.send('API do Projeto Integrador está no ar!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});