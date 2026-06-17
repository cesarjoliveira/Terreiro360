# Primeiro administrador

## URL do app

Abra:

```text
https://terreiro360.web.app
```

## Firebase Authentication

Se o cadastro mostrar `CONFIGURATION_NOT_FOUND` ou `Login por e-mail/senha ainda não está habilitado`, inicialize o Firebase Authentication uma vez:

1. Abra `https://console.firebase.google.com/project/terreiro360/authentication`.
2. Clique em `Get started`.
3. Em `Sign-in method`, habilite `Email/Password`.
4. Mantenha `Email link` desligado por enquanto.

## Criar o primeiro admin

Na tela inicial do Terreiro360, use a seção `Primeiro acesso`.

O código de implantação atual foi criado no Firestore em `config/bootstrap`. Ele é de uso único: depois que o primeiro admin for criado, o app desativa o bootstrap automaticamente.

Depois disso, o administrador consegue:

- criar usuários básicos para filhos;
- cadastrar filhos e vincular cada cadastro ao usuário;
- lançar mensalidades;
- cadastrar contas a pagar e receber;
- cadastrar produtos;
- registrar vendas.

## Reativar bootstrap

Se a criação do primeiro admin falhar depois de criar o usuário de Auth, recrie ou reative `config/bootstrap` no Firestore com:

- `enabled`: `true`
- `code`: novo código temporário

Depois de usar, volte `enabled` para `false`.
