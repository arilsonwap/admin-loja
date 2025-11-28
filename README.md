# Admin Loja - Painel Administrativo

Painel administrativo completo para gerenciamento de loja online, desenvolvido com Next.js 14, TypeScript, TailwindCSS e Firebase.

## Funcionalidades

- **Autenticação**: Login com Firebase Authentication
- **Dashboard**: Visão geral com estatísticas
- **Produtos**: CRUD completo com upload de múltiplas imagens
- **Categorias**: Gerenciamento de categorias com ícones
- **Banners**: CRUD de banners promocionais
- **Layout Responsivo**: Sidebar fixa e design moderno

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Firebase (Firestore + Storage + Auth)
- React Hook Form
- Zod (validação)
- React Icons

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/arilsonwap/admin-loja.git
cd admin-loja
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Edite o arquivo `.env.local` com suas credenciais do Firebase:
```
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

5. Execute o projeto:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
admin-loja/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/         # Página principal
│   │   ├── produtos/          # CRUD de produtos
│   │   ├── categorias/        # CRUD de categorias
│   │   └── banners/           # CRUD de banners
│   └── login/                 # Página de login
├── components/                # Componentes reutilizáveis
├── hooks/                     # Custom hooks
├── lib/                       # Services Firebase
└── types/                     # TypeScript types
```

## Firebase Setup

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative os seguintes serviços:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**
3. Copie as credenciais do projeto para o `.env.local`
4. Configure as regras de segurança do Firestore e Storage

### Regras sugeridas para Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Regras sugeridas para Storage:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa o linter

## Primeiro Acesso

Para criar o primeiro usuário admin, use o Firebase Console:
1. Acesse **Authentication** no Firebase Console
2. Clique em **Add user**
3. Crie um usuário com email e senha
4. Use essas credenciais para fazer login no painel

## Deploy

O projeto pode ser facilmente deployado na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/arilsonwap/admin-loja)

Lembre-se de configurar as variáveis de ambiente no painel da Vercel.
