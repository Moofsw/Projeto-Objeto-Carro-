const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'O nome é obrigatório.'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);