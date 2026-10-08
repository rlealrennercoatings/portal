# Integração Datasul

## Objetivo

Isolar a comunicação com o Datasul no backend, mantendo o frontend sem acesso direto ao ERP.

## Módulo proposto

- `DatasulModule`
- `DatasulService`
- `AuthService`
- `UsersController`
- `HealthController`

## Regras

- O backend é o único ponto de contato com Datasul.
- Os endpoints de autenticação e contratação de usuários devem refletir o mecanismo oficial validado no ambiente real.
- Não devem existir tabelas paralelas de usuários ou senhas.
- As credenciais nunca devem ser armazenadas no portal.

## Observações

A autenticação concreta do Datasul precisa ser validada no ambiente de produção ou homologação antes de ativação final.
