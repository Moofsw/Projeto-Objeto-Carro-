const mongoose = require('mongoose');

const veiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, 'A placa é obrigatória.'],
        unique: true,
        uppercase: true,
        trim: true
    },
    marca: { 
        type: String, 
        required: [true, 'A marca é obrigatória.'] 
    },
    modelo: { 
        type: String, 
        required: [true, 'O modelo é obrigatório.'] 
    },
    ano: {
        type: Number,
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'],
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.']
    },
    cor: { 
        type: String,
        required: [true, 'A cor é obrigatória.']
    },
    tipo: { // 'CarroEsportivo' ou 'Caminhao'
        type: String,
        required: true,
        enum: ['CarroEsportivo', 'Caminhao']
    },
    // Propriedades específicas podem ser adicionadas aqui
    capacidadeCarga: {
        type: Number,
        // Só é obrigatório se o tipo for 'Caminhao'
        required: function() { return this.tipo === 'Caminhao'; }
    },
    // CAMPO MODIFICADO/ADICIONADO
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // A referência ao modelo 'User'
      required: [true, 'O veículo precisa estar associado a um usuário.']
    }
}, {
    timestamps: true // Adiciona createdAt e updatedAt
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

module.exports = Veiculo;