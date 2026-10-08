# Levantamento técnico inicial para Datasul + Portal

## Resumo executivo

Este projeto precisa ser implementado como uma camada moderna de autenticação e experiência sobre o ecossistema Datasul, sem duplicar usuários ou senhas. A decisão crítica é a autenticação: a solução deve seguir o mecanismo oficial disponível no ambiente Datasul real (PASOE, REST oficial, OAuth2/OIDC, ou serviço específico do OpenEdge), nunca uma base própria de usuários.

Como o ambiente Datasul alvo não foi acessado neste workspace, todos os itens que dependem do ambiente real devem ser tratados como UNKNOWN até a validação no cliente. A arquitetura do projeto foi pensada para permitir troca de mecanismo sem impactar o restante da aplicação.

## 1) Angular recomendado

Recomendação: Angular 17.x

- Compatível com PO UI 17.x.
- Mantém ciclo de vida estável para enterprise applications.
- Boa compatibilidade com TypeScript 5.x e RxJS 7.x.
- Adequado para layout corporativo e arquitetura modular.

Status: recomendado pela compatibilidade com PO UI e contexto corporativo.

## 2) Node recomendado

Recomendação: Node.js 20 LTS

- Compatível com NestJS 10.x.
- Estável para desenvolvimento e produção em ambientes corporativos.
- Melhor suporte para arquiteturas modernas e gerenciamento de dependências.

Status: recomendado.

## 3) PO UI compatível

Recomendação: PO UI 17.x

- Alinhado com Angular 17.
- Compatível com padrões corporativos TOTVS.
- Usa componentes nativos para layout, menu, toolbar, formulário e tabela.

Status: recomendado para esse projeto devido ao requisito de layout PO UI.

## 4) NestJS recomendado

Recomendação: NestJS 10.x

- Baseline moderna e bem suportada.
- Estrutura modular, ideal para separação de Datasul, auth, session e futuras aplicações.
- Boa integração com TypeScript e validação via class-validator, config e interceptors.

Status: recomendado.

## 5) Mecanismo de autenticação Datasul identificado

Resultado: identificado no ambiente de desenvolvimento do Chile

Foi confirmado no formulário oficial do Datasul em:

https://erp-chile-desenv.renner.com.br/totvs-login/loginForm

que a autenticação do ambiente utiliza a tela nativa do produto TOTVS, com formulário POST para:

- `ACS?login`

Campos observados no HTML:

- `j_username`
- `j_password`
- `j_domain`
- `j_use_domain`
- `j_one_domain`
- `_csrf`

A página também expõe a identidade do ambiente:

- "Linha Datasul"
- "CHILE"
- "12.1.2603.2"
- "Progress 12.8.11"

Isso indica que o mecanismo oficial do ambiente é o login nativo do Datasul/TOTVS, e não uma autenticação customizada criada pelo portal.

### Recomendação arquitetural

- Implementar um módulo `DatasulModule` isolado.
- Definir uma interface de autenticação que encapsule o fluxo nativo do Datasul.
- Não inventar qualquer endpoint customizado além do que o ambiente oficial expõe.
- Usar o backend como proxy único para a autenticação do Datasul e manter o portal sem base própria de usuários.
- Mantém a sessão do portal própria, mas validada pela identidade do Datasul.

## 6) Mecanismo para obter usuário

Resultado: UNKNOWN

No Datasul 12.1.x, a obtenção do usuário autenticado pode ocorrer por:

- endpoint REST oficial do PASOE;
- serviço integrado ao auth provider;
- serviço de identidade corporativa;
- API do OpenEdge/Progress do ambiente.

Sem validação real do ambiente, não é seguro assumir que exista um endpoint único, nome fixo ou contrato de payload específico.

## 7) Mecanismo para obter grupos

Resultado: UNKNOWN

A obtenção de grupos/perfis do usuário normalmente depende do mecanismo oficial do Datasul e pode assumir qualquer uma das seguintes formas:

- endpoint de perfil/grupos do PASOE;
- resposta de JWT/OIDC com claims de grupos;
- serviço de autorização de segurança do ERP;
- integração com serviço específico em OpenEdge.

A implementação do portal deve abstrair essa operação em `DatasulGroupService` e consumir a fonte oficial do ambiente em produção.

## 8) APIs / serviços disponíveis

Resultado: parcialmente conhecido / ambiente dependente

O ambiente Datasul 12.1.x pode expor:

- PASOE / REST endpoints;
- serviços de autenticação e sessão;
- APIs relacionadas a usuário, perfil e segurança;
- acessos à lógica OpenEdge via serviços específicos;
- integração com OAuth2/OIDC, se configurado.

### O que é seguro afirmar

- A comunicação do frontend para o backend será via HTTPS.
- O backend deve encapsular toda comunicação com Datasul.
- Nenhuma senha deve ser armazenada no Portal.
- A estrutura de integração deve seguir um módulo isolado para Datasul.

### O que não pode ser afirmado sem validação do ambiente

- URL exata de autenticação;
- endpoint exato de consulta de usuário;
- endpoint exato de grupos;
- nomes de campo, claims ou payloads reais;
- se o ambiente usa OAuth2/OIDC ou auth interna do Datasul.

## 9) Dependências

- Angular 17.x
- PO UI 17.x
- RxJS 7.x
- Angular Router
- Angular HttpClient
- Reactive Forms
- NestJS 10.x
- TypeScript 5.x
- Node.js 20 LTS
- Docker e Docker Compose
- dotenv / config management
- class-validator / class-transformer
- Helmet, CSRF protection, rate limiting

## 10) Riscos

- Assumir uma API inexistente no Datasul real.
- Criar duplicação de usuários e senhas no portal.
- Armazenar credenciais ou cookies em localStorage.
- Dependência de endpoints internos não oficiais.
- Acoplamento do frontend à lógica de autenticação do Datasul.
- Incompatibilidade entre PO UI e Angular versionado sem validação.

## 11) Dúvidas

- Qual mecanismo oficial de login está habilitado no ambiente Datasul? Confirmado: login nativo do Datasul via formulário TOTVS (`ACS?login`)
- Existe PASOE com REST oficial habilitado? UNKNOWN, ainda depende da validação do ambiente e da documentação do produto em uso
- Existe OAuth2/OIDC para o Datasul? UNKNOWN, não confirmado neste ambiente
- Existem APIs oficiais para usuário/grupos? UNKNOWN, ainda dependem da documentação Oficial TOTVS / configuração do ambiente
- Há SSO corporativo em uso? UNKNOWN, não confirmado pela interface de login

## 12) Recomendação arquitetural

A arquitetura recomendada para a V1 é:

1. Frontend Angular com PO UI, módulos e layout corporativo.
2. Backend NestJS com módulos separados: auth, datasul, users, groups, core, health.
3. Abstração central em `DatasulModule`.
4. Autenticação via prova de identidade do Datasul e sessão própria do portal.
5. Sessão em cookie HttpOnly, Secure, SameSite, expirável e com controle de inatividade.
6. No código, políticas e contracts devem ser configuráveis por ambiente.
7. Na implementação real, a autenticação e os usuários do Datasul devem ser consultados por mecanismo oficial e validado no ambiente de destino.

## 13) Escolha de implementação para a V1

Como a autenticação real do Datasul não pode ser inferida sem acesso ao ambiente, a V1 deve seguir a abordagem abaixo:

- Implementar a camada de integração com adaptadores configuráveis.
- Estruturar rotas e serviços para autenticação, usuário e grupos.
- Usar uma interface de contrato que pode ser atendida por PASOE, OAuth2/OIDC ou serviço específico do Datasul.
- Adiar a implementação do adaptador final até a inspeção direta do ambiente real.

## 14) Conclusão

A solução proposta é segura e compatível com a regra de negócio: não duplicar identidade do usuário; não armazenar senhas; isolar a integração no backend; proteger a sessão própria do portal; e manter o Datasul como fonte de verdade.

Para a implementação final, o único item que exige confirmação no ambiente real é o mecanismo oficial de autenticação do Datasul e os endpoints específicos de usuário/grupos. Isso deve ser validado antes da ativação da autenticação em produção.
