const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona o payload do token (com userId, nome, etc.) ao request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;