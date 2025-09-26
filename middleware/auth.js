const jwt = require('jsonwebtoken');
require('dotenv').config(); // Carrega as variáveis de ambiente

// Define o segredo do JWT, buscando do .env ou usando um padrão
const JWT_SECRET = process.env.JWT_SECRET || 'Secret';

/**
 * Middleware para autenticação via JSON Web Token.
 * Verifica a presença e a validade de um token no cabeçalho 'Authorization'.
 * Se o token for válido, anexa o ID do usuário ao objeto `req`.
 */
const authMiddleware = (req, res, next) => {
    // 1. Extrai o token do cabeçalho da requisição
    const authHeader = req.header('Authorization');

    // 2. Se não houver cabeçalho de autorização, retorna erro 401
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    // O cabeçalho deve estar no formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>.' });
    }

    const token = parts[1];

    try {
        // 3. Verifica o token usando jwt.verify()
        // Se o token for inválido (expirado, assinatura incorreta), um erro será lançado
        const decoded = jwt.verify(token, JWT_SECRET);

        // 4. Se for válido, anexa o userId do token ao objeto req
        req.userId = decoded.userId;

        // 5. Chama next() para passar para a próxima função na rota
        next();
        
    } catch (error) {
        // Captura o erro se a verificação falhar
        console.error("[Auth Middleware] Erro de verificação do token:", error.message);
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;