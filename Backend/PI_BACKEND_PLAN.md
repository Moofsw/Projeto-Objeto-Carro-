# Plano de Backend - PI Blog Dinâmico

## 1. Entidade Escolhida
A entidade principal para a nossa aplicação de blog é o **Post**. Esta entidade representa uma única publicação feita por um usuário.

## 2. Schema do Modelo (Mongoose)
O modelo `Post` será definido com os seguintes campos no MongoDB.

### Schema do `Post`
- **titulo**: `String`, obrigatório, texto curto.
- **conteudo**: `String`, obrigatório, texto longo do post.
- **autor**: `String`, obrigatório, nome do autor.
- **owner**: `ObjectId`, obrigatório, referência ao `_id` do usuário que criou o post (do modelo `User`). Essencial para controle de permissões.
- **createdAt**: `Date`, gerenciado automaticamente pelo Mongoose (`timestamps`).

### Schema do `User` (para autenticação)
- **nome**: `String`, obrigatório.
- **email**: `String`, obrigatório, único, letras minúsculas.
- **password**: `String`, obrigatório (será armazenado como hash).

## 3. Rotas da API (Endpoints)

### Endpoints de Autenticação (`/api/auth`)
- `POST /api/auth/register`: Cria um novo usuário.
- `POST /api/auth/login`: Autentica um usuário e retorna um token JWT.

### Endpoints de Posts (`/api/posts`)
- `GET /api/posts`:
  - **Descrição:** Lista todos os posts.
  - **Proteção:** Pública. Qualquer um pode ver os posts.

- `POST /api/posts`:
  - **Descrição:** Cria um novo post.
  - **Proteção:** Privada. Requer token JWT. O `owner` do post será o ID do usuário logado.

- `DELETE /api/posts/:id`:
  - **Descrição:** Deleta um post específico.
  - **Proteção:** Privada. Requer token JWT. Apenas o `owner` do post pode deletá-lo.