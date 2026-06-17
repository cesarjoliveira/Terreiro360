# Terreiro360 no GCP

## Arquitetura inicial de baixo custo

- Firebase Hosting para servir a interface web responsiva.
- Firebase Authentication para login de administradores e filhos da casa.
- Firestore em modo nativo para cadastros, mensalidades, contas, produtos e vendas.
- Cloud Functions somente quando houver automacoes reais, como recibos, notificacoes ou fechamentos mensais.
- Cloud Logging com retencao padrao e alertas simples de orçamento.

Essa combinacao evita servidor sempre ligado. Para um terreiro pequeno, a tendencia e ficar dentro ou perto das cotas gratuitas no inicio, desde que anexos grandes, relatorios pesados e automacoes recorrentes sejam controlados.

## Colecoes sugeridas

- `children`: dados completos dos filhos, status, entrada, contato, endereco, observacoes e usuario vinculado.
- `dues`: mensalidades por filho, mes, valor, status e data de pagamento.
- `payables`: contas a pagar, categoria, vencimento, valor e status.
- `receivables`: contas a receber, origem, vencimento, valor e status.
- `products`: catalogo, preco, categoria e estoque.
- `sales`: vendas, produto, quantidade, comprador, total e data.
- `users`: perfil operacional quando for preciso guardar preferencias alem das claims do Auth.

## Perfis

- `admin`: acesso total a cadastros, financeiro, produtos, vendas e painel analitico.
- `basic`: acesso aos proprios dados e mensalidades vinculadas ao `uid` do Firebase Auth.

As regras em `firestore.rules` assumem uma custom claim `role` no token do Firebase Authentication.

## Passos para publicar

1. Criar ou selecionar um projeto pessoal no Google Cloud.
2. Ativar faturamento e configurar Budget Alert antes de publicar.
3. Criar um app Firebase no projeto.
4. Ativar Authentication com e-mail/senha ou Google.
5. Criar Firestore em modo nativo.
6. Instalar Firebase CLI localmente.
7. Rodar `firebase login`.
8. Rodar `firebase init hosting firestore`.
9. Usar `public` como pasta de deploy ou apontar para a raiz, mantendo `index.html`, `src/` e `firestore.rules`.
10. Rodar `firebase deploy`.

## Estimativa de custos verificada em 2026-06-17

Valide sempre no pricing oficial antes de publicar, porque valores e cotas mudam. Referencias usadas:

- Firebase Pricing: https://firebase.google.com/pricing
- Firestore Pricing: https://cloud.google.com/firestore/pricing

Para MVP:

- Firebase Spark nao exige metodo de pagamento e tem limites gratuitos generosos.
- Firebase Hosting inclui 10 GB de armazenamento e 360 MB/dia de transferencia no plano sem custo; no Blaze aparece como sem custo ate 10 GB de armazenamento e depois cobranca por GB.
- Authentication sem telefone aparece com 50K usuarios ativos mensais sem custo; login por SMS e cobrado por SMS.
- Firestore Standard tem cota gratuita de 1 GiB armazenado, 50K leituras/dia, 20K escritas/dia, 20K deletes/dia e 10 GiB/mes de saida.
- Cloud Functions so deve entrar quando houver automacoes reais; ha cota gratuita mensal, mas build, logs, rede e artefatos podem gerar custo.
- Orçamento: crie alerta mensal baixo, por exemplo R$ 25, R$ 50 e R$ 100.

## Proximos passos tecnicos

- Trocar `localStorage` por Firebase SDK.
- Criar tela real de login.
- Criar fluxo de convite de filhos.
- Adicionar exportacao CSV/PDF de mensalidades e caixa.
- Implementar filtros por mes, status e categoria.
- Criar testes automatizados para calculos financeiros e regras de permissao.
