# Segurança

## Regras da V1

- HTTPS obrigatório em produção.
- cookies HttpOnly, Secure e SameSite apropriados.
- proteção contra CSRF quando aplicável.
- validação de entrada em todas as rotas.
- logs estruturados sem registrar senhas, cookies ou tokens.
- rate limiting no login e proteção contra brute force.
- CORS restritivo e headers de segurança.

## Boas práticas

- manter secrets em variáveis de ambiente;
- não serializar a senha em JWT;
- nunca retornar stack trace ao cliente;
- manter formato de erro padronizado.
