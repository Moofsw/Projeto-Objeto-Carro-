const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Rota: POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nome, email, password } = req.body;
        if (!nome || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            nome,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId: user._id });

    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao registrar usuário.' });
    }
});

// Rota: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
        }

        const payload = {
            userId: user._id,
            nome: user.nome,
            email: user.email
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d', // Token expira em 1 dia
        });

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao fazer login.' });
    }
});

module.exports = router;