const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rota: GET /api/posts (Pública)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Mais recentes primeiro
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar posts.' });
    }
});

// Rota: POST /api/posts (Protegida)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { titulo, conteudo } = req.body;
        if (!titulo || !conteudo) {
            return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
        }
        
        const newPost = new Post({
            titulo,
            conteudo,
            autor: req.user.nome, // Pega o nome do usuário logado (do token)
            owner: req.user.userId, // Pega o ID do usuário logado (do token)
        });

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao criar post.' });
    }
});

// Rota: DELETE /api/posts/:id (Protegida e com verificação de dono)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post não encontrado.' });
        }

        // Verifica se o usuário logado é o dono do post
        if (post.owner.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Acesso negado. Você não é o autor deste post.' });
        }
        
        await Post.deleteOne({ _id: req.params.id });

        res.json({ message: 'Post deletado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor ao deletar post.' });
    }
});

module.exports = router;