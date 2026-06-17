# Terreiro360

Sistema web responsivo para gestao basica de terreiro, com foco em baixo custo no GCP/Firebase.

## Funcionalidades do MVP

- Cadastro completo de filhos da casa.
- Marcacao de filhos que sairam da casa.
- Mensalidades em visao geral e por filho.
- Contas a pagar e contas a receber.
- Painel analitico de entradas, saidas, saldo e pendencias.
- Cadastro de produtos e controle simples de estoque.
- Tela de vendas com baixa de estoque.
- Simulacao de perfis `admin` e `filho`.

## Rodar localmente

Com Node.js no PATH:

```powershell
npm start
```

Sem Node.js no PATH, usando o runtime interno desta sessao:

```powershell
.\scripts\start-local.ps1
```

Depois abra `http://localhost:4173`.

Evite iniciar este servidor com `cmd /c start`; o Windows Defender pode marcar esse padrao como suspeito por heuristica de linha de comando.

## Publicar no Firebase Hosting

1. Copie `.firebaserc.example` para `.firebaserc`.
2. Confirme que o projeto esta como `terreiro360`.
3. Rode `firebase login`.
4. Defina `$env:FIREBASE_PROJECT_ID="terreiro360"`.
5. Rode `.\scripts\deploy-firebase.ps1`.

As regras iniciais do Firestore estao em `firestore.rules`.
O guia completo esta em `docs/cloud-deploy.md`.

## Usuários

O app publicado esta em `https://terreiro360.web.app`.

Usuários criados pela tela inicial entram como filhos. Administradores podem promover usuários na página `Usuários`.
Veja `docs/users.md`.
