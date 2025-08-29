// models/Manutencao.js
const mongoose = require('mongoose');

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.'],
        trim: true
    },
    data: {
        type: Date,
        required: [true, 'A data da manutenção é obrigatória.'],
        default: Date.now
    },
    custo: {
        type: Number,
        required: [true, 'O custo da manutenção é obrigatório.'],
        min: [0, 'O custo não pode ser negativo.']
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa.'],
        default: 0
    },
    veiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veiculo', // Referencia o modelo Veiculo
        required: [true, 'A manutenção deve estar associada a um veículo.']
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

module.exports = Manutencao;