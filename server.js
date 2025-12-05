// ... (seus imports no topo, garanta que tem o User)
const User = require('./models/User'); 
const Veiculo = require('./models/Veiculo');
// ...

// ======================================================
// --- ROTAS PARA A API DE VEÍCULOS (CRUD + SOCIAL) ---
// ======================================================

// Rota GET: Listar MEUS veículos E os COMPARTILHADOS comigo
app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // ID do usuário logado vindo do Token

        // Busca veículos onde: (Sou o Dono) OU (Estou na lista sharedWith)
        const veiculos = await Veiculo.find({
            $or: [
                { owner: userId },
                { sharedWith: userId }
            ]
        }).populate('owner', 'nome email'); // PREENCHE os dados do dono (nome e email)

        console.log(`[Servidor] Veículos listados para o usuário ${userId}: ${veiculos.length}`);
        res.json(veiculos);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// Rota POST: CRIAR um novo veículo (Você é o dono)
app.post('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        // Pega os dados do frontend. Note que o front manda _tipoVeiculo, mapeamos para tipo
        const { modelo, cor, _tipoVeiculo, capacidadeCarga } = req.body;
        
        const novoVeiculo = new Veiculo({
            modelo,
            cor,
            tipo: _tipoVeiculo, // Salva como 'CarroEsportivo' ou 'Caminhao'
            capacidadeCarga: _tipoVeiculo === 'Caminhao' ? capacidadeCarga : undefined,
            owner: req.user.userId // O dono é quem está criando
        });

        await novoVeiculo.save();
        
        // Popula os dados do owner para retornar completinho pro front
        await novoVeiculo.populate('owner', 'nome email');
        
        console.log('[Servidor] Veículo criado:', novoVeiculo._id);
        res.status(201).json(novoVeiculo);

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// Rota POST: COMPARTILHAR veículo
app.post('/api/veiculos/:id/share', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params; // ID do Veículo
        const { email } = req.body; // Email de quem vai receber o acesso

        if (!email) return res.status(400).json({ error: 'O e-mail é obrigatório.' });

        // 1. Achar o usuário destino pelo email
        const targetUser = await User.findOne({ email });
        if (!targetUser) {
            return res.status(404).json({ error: 'Usuário não encontrado com este e-mail.' });
        }

        // Bloquear compartilhamento consigo mesmo
        if (targetUser._id.toString() === req.user.userId) {
            return res.status(400).json({ error: 'Você já é o dono deste veículo.' });
        }

        // 2. Achar o veículo e garantir que EU sou o DONO
        const veiculo = await Veiculo.findOne({ _id: id, owner: req.user.userId });
        
        if (!veiculo) {
            return res.status(403).json({ error: 'Veículo não encontrado ou você não é o dono.' });
        }

        // 3. Adicionar ao array sharedWith (se já não estiver lá)
        if (!veiculo.sharedWith.includes(targetUser._id)) {
            veiculo.sharedWith.push(targetUser._id);
            await veiculo.save();
        }

        res.json({ message: `Veículo compartilhado com sucesso com ${targetUser.nome}!` });

    } catch (error) {
        console.error("[Servidor] Erro ao compartilhar:", error);
        res.status(500).json({ error: 'Erro interno ao compartilhar.' });
    }
});

// Rota DELETE: Remover veículo (Só o dono pode)
app.delete('/api/veiculos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        // Só deleta se o owner for o usuário logado
        const resultado = await Veiculo.deleteOne({ _id: id, owner: req.user.userId });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado ou você não tem permissão para removê-lo.' });
        }

        res.json({ message: 'Veículo removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover veículo.' });
    }
});

require('dotenv').config(); // 1. Carregar variáveis de ambiente
const path = require("path");
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer'); // 2. Importar multer
const fs = require('fs');

// Imports dos modelos e middleware
const User = require('./models/User');
const Veiculo = require('./models/Veiculo');
const Manutencao = require('./models/Manutencao');
const authMiddleware = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001; // Usar variável do .env

// --- 3. Configuração do Multer (Uploads) ---
// Garante que a pasta existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Pasta de destino
    },
    filename: function (req, file, cb) {
        // Nome único: data atual + nome original
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage: storage });

// --- Conexão DB com Variável de Ambiente ---
const connectDB = async () => {
    try {
        // Usando process.env.MONGODB_URI
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado ao MongoDB com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};
connectDB();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// 4. Servir pasta uploads estaticamente
app.use('/uploads', express.static('uploads')); 

// ... (Outras rotas GET, DELETE, auth permanecem iguais) ...

// ======================================================
// --- ROTA POST ATUALIZADA (CRIAR VEÍCULO) ---
// ======================================================
// Adicionamos 'upload.single('imagem')' como middleware
app.post('/api/veiculos', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        // Nota: Quando usamos multer, os campos de texto vêm em req.body
        const { modelo, cor, _tipoVeiculo, capacidadeCarga } = req.body;
        
        // Pega o caminho da imagem se o arquivo foi enviado
        // Normaliza as barras para evitar problemas entre Windows/Linux
        const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

        const novoVeiculo = new Veiculo({
            modelo,
            cor,
            tipo: _tipoVeiculo,
            capacidadeCarga: _tipoVeiculo === 'Caminhao' ? Number(capacidadeCarga) : undefined,
            owner: req.user.userId,
            imageUrl: imageUrl // Salva o caminho no banco
        });

        await novoVeiculo.save();
        await novoVeiculo.populate('owner', 'nome email');
        
        console.log('[Servidor] Veículo criado com imagem:', imageUrl);
        res.status(201).json(novoVeiculo);

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// ... (Resto do arquivo server.js) ...

// No login/registro (auth.js ou onde estiver sua lógica), lembre de trocar a string fixa por process.env.JWT_SECRET