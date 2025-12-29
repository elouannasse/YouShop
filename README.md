# 🛍️ YouShop - E-Commerce Backend

Application e-commerce backend moderne construite avec NestJS, TypeScript, PostgreSQL et Prisma.

## 📋 Description

YouShop est une API REST complète pour une plateforme e-commerce avec authentification JWT, gestion des produits, commandes, panier et plus encore.

### ✨ Fonctionnalités

- 🔐 **Authentification JWT** complète (register, login, profile)
- 👥 **Gestion des rôles** (CLIENT, ADMIN)
- 📦 **Architecture modulaire** NestJS
- 🗃️ **PostgreSQL + Prisma ORM**
- 📚 **Documentation Swagger/OpenAPI**
- 🐳 **Docker & Docker Compose**
- ✅ **Validation stricte** des données
- 🛡️ **Guards & Decorators** personnalisés

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** 20+
- **Docker Desktop** (recommandé)
- **PostgreSQL** (si sans Docker)

### Option 1: Avec Docker (Recommandé)

```powershell
# 1. Cloner le projet
git clone https://github.com/votrecompte/youshop.git
cd youshop

# 2. Configurer l'environnement
Copy-Item .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer avec Docker
.\docker-start.ps1

# Ou manuellement
docker-compose up -d --build
```

**Accès:**

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- pgAdmin: http://localhost:5050

### Option 2: Sans Docker (Local)

```powershell
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
Copy-Item .env.example .env
# Configurer DATABASE_URL pour votre PostgreSQL local

# 3. Générer Prisma Client
npx prisma generate

# 4. Exécuter les migrations
npx prisma migrate dev

# 5. Démarrer l'application
npm run start:dev
```

## 🛠️ Stack Technologique

| Technologie      | Version | Description                   |
| ---------------- | ------- | ----------------------------- |
| **NestJS**       | 11.x    | Framework Node.js progressif  |
| **TypeScript**   | 5.7.x   | Superset typé de JavaScript   |
| **PostgreSQL**   | 15      | Base de données relationnelle |
| **Prisma**       | 6.0     | ORM moderne pour Node.js      |
| **Passport JWT** | 11.x    | Authentification JWT          |
| **Swagger**      | 8.x     | Documentation API             |
| **Docker**       | Latest  | Containerisation              |

## 📁 Structure du Projet

```
youshop/
├── src/
│   ├── auth/              # Module d'authentification
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── guards/       # Guards JWT & Roles
│   │   ├── decorators/   # Decorators personnalisés
│   │   └── strategies/   # Stratégies Passport
│   ├── prisma/           # Module Prisma
│   └── main.ts           # Point d'entrée
├── prisma/
│   └── schema.prisma     # Schéma de base de données
├── docs/                 # Documentation
├── docker-compose.yml    # Orchestration Docker
├── Dockerfile            # Image production
└── .env.example          # Template configuration
```

## 🐳 Docker

Voir [DOCKER.md](DOCKER.md) pour la documentation complète Docker.

### Commandes Rapides

```powershell
# Démarrer en production
docker-compose up -d --build

# Démarrer en développement (hot-reload)
docker-compose -f docker-compose.dev.yml up -d --build

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down

# Migrations
docker-compose exec app npx prisma migrate deploy
```

## 📚 Documentation API

Une fois l'application démarrée, accédez à la documentation Swagger:

**http://localhost:3000/api**

### Endpoints Disponibles

#### Authentification

| Méthode | Endpoint         | Description        | Auth |
| ------- | ---------------- | ------------------ | ---- |
| `POST`  | `/auth/register` | Créer un compte    | -    |
| `POST`  | `/auth/login`    | Se connecter       | -    |
| `GET`   | `/auth/profile`  | Profil utilisateur | JWT  |

## 🗃️ Base de Données

### Migrations Prisma

```powershell
# Créer une nouvelle migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations (production)
npx prisma migrate deploy

# Réinitialiser la base
npx prisma migrate reset

# Ouvrir Prisma Studio (GUI)
npx prisma studio
```

### Modèles

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  CLIENT
  ADMIN
}
```

## 🔐 Authentification

### Utilisation des Guards

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { GetUser } from './auth/decorators/get-user.decorator';
import { Role } from '@prisma/client';

// Route protégée JWT
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@GetUser() user: User) {
  return user;
}

// Route protégée par rôle ADMIN
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get('admin-only')
adminRoute() {
  return 'Admin access';
}
```

## 🧪 Tests

```powershell
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 🌍 Variables d'Environnement

Voir [.env.example](.env.example) pour la liste complète.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/youshop?schema=public"
JWT_SECRET=your-secret-key-32-chars-minimum
JWT_EXPIRES_IN=7d
```

## 🚢 Déploiement

Voir [DOCKER.md](DOCKER.md) pour le guide complet de déploiement Docker.

```powershell
# Production avec Docker
docker-compose up -d --build

# Appliquer les migrations
docker-compose exec app npx prisma migrate deploy
```

## 📖 Documentation

- [DOCKER.md](DOCKER.md) - Guide Docker complet
- [DOCKER_COMMANDS.md](DOCKER_COMMANDS.md) - Commandes rapides
- [SETUP.md](SETUP.md) - Installation détaillée
- [docs/AUTH_COMPLETE.md](docs/AUTH_COMPLETE.md) - Documentation auth

## 📝 Licence

MIT

---

**Version:** 1.0.0  
**Dernière mise à jour:** Décembre 2025
