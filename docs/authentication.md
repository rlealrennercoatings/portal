# Autenticação

## Regras

1. O usuário e a senha usados no portal são os mesmos do Datasul.
2. O portal não cria uma base de usuários própria.
3. A senha nunca deve ser armazenada no portal.
4. O backend realiza a validação com o mecanismo oficial do Datasul.
5. A sessão do portal é gerenciada de forma segura no backend.

## Sessão

A sessão do portal deve usar:

- cookie HttpOnly;
- Secure em produção;
- SameSite=Lax ou Strict;
- expiração por tempo de inatividade;
- logout explícito;
- reforço contra fixation e CSRF.

## Observação

A implementação concreta do mecanismo de autenticação deve ser escolhida após validação técnica do ambiente Datasul real.
