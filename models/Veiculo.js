const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    // ... (outros campos: modelo, cor, placa, etc.) ...
    modelo: { type: String, required: true },
    cor: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['CarroEsportivo', 'Caminhao'] },
    capacidadeCarga: { type: Number },
    turboAtivado: { type: Boolean, default: false },
    ligado: { type: Boolean, default: false },
    velocidade: { type: Number, default: 0 },
    cargaAtual: { type: Number, default: 0 },
    
    // --- CAMPO DE IMAGEM (NOVO) ---
    imageUrl: { type: String, default: null },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Veiculo', veiculoSchema);