# VendasBrusque - Como Usar

## Pré-requisitos

- [Node.js LTS](https://nodejs.org) instalado na máquina

---

## Primeira Vez (Setup)

Abra o terminal na pasta do projeto e execute:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
npx prisma db push
npx prisma generate

# 3. Popular com dados de exemplo
node prisma/seed.js

# 4. Iniciar o servidor
npm run dev
```

Ou simplesmente **dê duplo clique em `INICIAR.bat`** que faz tudo automaticamente.

---

## Acessar o site

Abra o navegador em: **http://localhost:3000**

## Conta de demonstração

- **Email:** demo@vendasbrusque.com.br
- **Senha:** demo123

---

## Funcionalidades

- ✅ Cadastro e login de usuários
- ✅ Criação de anúncios com fotos (até 8)
- ✅ 9 categorias: Veículos, Imóveis, Eletrônicos, Móveis, Roupas, Serviços, Alimentos, Esportes, Outros
- ✅ Busca por texto e filtros (categoria, condição, preço)
- ✅ Chat em tempo real entre comprador e vendedor
- ✅ Painel do usuário com todos os anúncios e conversas
- ✅ Marcar como vendido, pausar ou excluir anúncios
- ✅ Contador de visualizações
- ✅ Layout responsivo (mobile + desktop)

---

## Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run db:studio    # Interface visual do banco (Prisma Studio)
npm run db:seed      # Repopular dados de exemplo
```
