// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true, // Garante que cada e-mail seja único no banco de dados
        lowercase: true, // Converte o e-mail para minúsculas antes de salvar
        trim: true // Remove espaços em branco do início e do fim
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
    }
}, {
    // Adiciona os campos createdAt e updatedAt automaticamente
    timestamps: true 
});

const User = mongoose.model('User', userSchema);

module.exports = User;