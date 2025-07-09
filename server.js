require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// --- Configuração da Conexão Robusta com o MongoDB ---
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ ERRO FATAL: A variável de ambiente MONGODB_URI não está definida.");
    console.error("A aplicação não pode conectar ao banco de dados. Verifique seu arquivo .env ou as variáveis de ambiente no seu provedor de hospedagem (Render).");
    process.exit(1); // Encerra o processo se a URI estiver ausente
  }

  try {
    // Evita múltiplas conexões. Se já estiver conectado ou conectando, não faz nada.
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      console.log('✅ Mongoose já está conectado ou conectando.');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('🚀 Conectado com sucesso ao MongoDB Atlas!');

    // Opcional: Ouvir por eventos de conexão para logs mais detalhados
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose foi desconectado!');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erro na conexão com o Mongoose:', err);
    });

  } catch (err) {
    console.error('❌ ERRO FATAL: Falha ao conectar ao MongoDB. Verifique sua string de conexão, acesso de rede no Atlas e credenciais.');
    console.error(err.message);
    process.exit(1); // Encerra o processo em caso de falha na conexão inicial
  }
};

// Chama a função para conectar ao banco de dados ao iniciar o servidor.
connectDB();


// Modelos do MongoDB
const DicaSchema = new mongoose.Schema({
  id: Number,
  dica: String,
  tipo: { type: String, required: false } // 'geral', 'carro', 'caminhao'
});

const Dica = mongoose.model('Dica', DicaSchema);

// --- Middlewares ---
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// --- Rotas da API ---

// Rota para buscar todas as dicas
app.get('/api/dicas-manutencao', async (req, res) => {
  try {
    const dicas = await Dica.find({ tipo: 'geral' });
    res.json(dicas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para buscar dicas por tipo de veículo
app.get('/api/dicas-manutencao/:tipoVeiculo', async (req, res) => {
  try {
    const { tipoVeiculo } = req.params;
    const dicas = await Dica.find({ tipo: tipoVeiculo.toLowerCase() });
    
    if (dicas.length === 0) {
      return res.status(404).json({ error: `Nenhuma dica encontrada para o tipo: ${tipoVeiculo}` });
    }
    
    res.json(dicas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para adicionar nova dica (exemplo)
app.post('/api/dicas-manutencao', async (req, res) => {
  try {
    const novaDica = new Dica(req.body);
    await novaDica.save();
    res.status(201).json(novaDica);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});