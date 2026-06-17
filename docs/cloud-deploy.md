# Deploy inicial no endereço do GCP/Firebase

## Resultado esperado

Depois do deploy, o app ficara disponivel nos dominios gerados pelo Firebase Hosting:

- `https://terreiro360.web.app`
- `https://terreiro360.firebaseapp.com`

Esses enderecos ja usam HTTPS e servem bem para o MVP antes de comprar ou conectar um dominio proprio.

## Preparacao no console

1. Criar um projeto no Google Cloud ou Firebase.
2. Ativar Billing, mesmo usando cotas gratuitas, para evitar bloqueios de recursos.
3. Criar um Budget Alert com limites baixos.
4. Ativar Firebase Hosting.
5. Ativar Firestore em modo nativo.
6. Ativar Firebase Authentication com e-mail/senha.

## Preparacao local

1. Instalar Firebase CLI.
2. Rodar `firebase login`.
3. Copiar `.firebaserc.example` para `.firebaserc`.
4. Confirmar que o projeto esta como `terreiro360`.
5. Definir a variavel do projeto:

```powershell
$env:FIREBASE_PROJECT_ID="terreiro360"
```

## Deploy

```powershell
.\scripts\deploy-firebase.ps1
```

## Validacao

1. Abrir `https://terreiro360.web.app`.
2. Confirmar que painel, filhos, mensalidades, contas, produtos e vendas carregam.
3. Confirmar no Firebase Console que `firestore.rules` foi publicado.
4. Criar os primeiros usuarios no Authentication.

## Proxima etapa

O MVP atual salva dados no navegador. A etapa seguinte e trocar o `localStorage` pelo Firebase SDK, usando Auth + Firestore com as colecoes descritas em `docs/gcp-setup.md`.
