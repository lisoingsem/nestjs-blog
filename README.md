# 🚀 NestJS Blog API with Dynamic GraphQL & Authentication

A modern, production-ready blog API built with **NestJS**, **Prisma ORM**, and **GraphQL** featuring dynamic module loading, JWT authentication, role-based authorization, and enterprise-level security.

## ✨ Special Features

### 🔄 **Dynamic Module Loading**
- **Zero manual imports** - Modules are automatically discovered and loaded
- **Hot module addition** - Add new modules without touching `app.module.ts`
- **Schema-first approach** - Each module controls its own GraphQL schema
- **Automatic schema merging** - All schemas are combined dynamically

### 🔐 **Enterprise Security**
- **JWT Authentication** with refresh token support
- **Role-based Authorization** (user/admin roles)
- **Rate Limiting** (100 requests/minute)
- **Input Validation** with GraphQL schema validation
- **CSRF Protection** built-in
- **Secure Headers** automatically applied

### 🏗️ **Clean Architecture**
- **Path Aliases** (`@shared/*`, `@core/*`, `@modules/*`)
- **Modular Design** - Each feature is a separate module
- **Type Safety** - Full TypeScript support
- **Database Migrations** with Prisma
- **Environment Configuration** with validation

## 🏗️ Architecture

```
src/
├── config/           # Environment variables + validation
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── index.ts
├── core/             # Core services (Prisma, Auth, Logger)
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   └── auth/
│       ├── auth.service.ts
│       ├── auth.resolver.ts
│       ├── auth.module.ts
│       ├── jwt.strategy.ts
│       └── auth.graphql
├── shared/           # Guards, Pipes, Filters, Decorators, Base Schema
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── throttler.guard.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── schema/
│   │   ├── base.graphql
│   │   ├── schema-loader.service.ts
│   │   └── schema.module.ts
│   └── index.ts
├── modules/          # Feature modules with DTOs, Entities, Services, Resolvers, Schemas
│   ├── user/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── user.service.ts
│   │   ├── user.resolver.ts
│   │   ├── user.module.ts
│   │   └── user.graphql
│   └── [other-modules]/
├── utils/            # Helper functions
│   ├── helpers.ts
│   └── index.ts
└── app.module.ts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **SQLite** (or MySQL/PostgreSQL if configured)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd blog
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="1d"

# Optional: Production settings
NODE_ENV="development"
PORT=3000
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npm run seed
```

### 4. Start Development Server
```bash
npm run start:dev
```

### 5. Access GraphQL Playground
Open [http://localhost:3000/graphql](http://localhost:3000/graphql)

## 🔐 Authentication & Authorization

### User Roles
- **`user`** - Basic access to own data
- **`admin`** - Full access to all data

### Creating Users
```graphql
mutation {
  createUser(createUserInput: {
    name: "Alice"
    email: "alice@example.com"
    password: "password123"
  }) {
    id
    name
    email
    role
  }
}
```

### Login & Get JWT Token
```graphql
mutation {
  login(email: "alice@example.com", password: "password123")
}
```

### Using JWT Token
In GraphQL Playground, add to **HTTP HEADERS**:
```json
{
  "Authorization": "Bearer <your-jwt-token>"
}
```

### Protected Queries
```graphql
# Get current user (requires authentication)
query {
  me {
    id
    name
    email
    role
  }
}

# Get all users (requires admin role)
query {
  users {
    id
    name
    email
    role
  }
}
```

## 🔄 Dynamic Module System

### Adding New Modules
1. **Create module directory:**
   ```bash
   mkdir src/modules/post
   ```

2. **Create module files:**
   ```typescript
   // src/modules/post/post.module.ts
   import { Module } from '@nestjs/common';
   
   @Module({
     providers: [PostService, PostResolver],
   })
   export class PostModule {}
   ```

3. **Create GraphQL schema:**
   ```graphql
   # src/modules/post/post.graphql
   type Post {
     id: Int!
     title: String!
     content: String!
     authorId: Int!
     author: User!
   }
   
   extend type Query {
     posts: [Post!]!
     post(id: Int!): Post!
   }
   ```

4. **That's it!** The module is automatically loaded.

### Module Discovery Rules
- **Modules**: `src/modules/*/module-name.module.ts`
- **Core**: `src/core/*/module-name.module.ts`
- **Schemas**: `src/modules/*/module-name.graphql`

## 🛡️ Security Features

### Guards Usage
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, GqlThrottlerGuard } from '@shared/guards';
import { Roles } from '@shared/decorators';

@Resolver()
@UseGuards(GqlThrottlerGuard) // Rate limiting
export class MyResolver {
  
  @Query()
  @UseGuards(JwtAuthGuard) // Authentication required
  publicQuery() { }
  
  @Query()
  @UseGuards(JwtAuthGuard, RolesGuard) // Auth + Role check
  @Roles('admin') // Admin only
  adminQuery() { }
}
```

### Rate Limiting
- **Default**: 100 requests per minute
- **Configurable** in `app.module.ts`
- **Per-endpoint** customization available

## 🏷️ Path Aliases

### Available Aliases
```typescript
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { UserService } from '@modules/user/user.service';
import { PrismaService } from '@core/prisma/prisma.service';
import { helpers } from '@utils/helpers';
```

### Configuration
- **TypeScript**: `tsconfig.json` paths
- **Runtime**: `tsconfig-paths/register`
- **Build**: Automatic path resolution

## 📊 Database Management

### Prisma Commands
```bash
# Generate client
npx prisma generate

# Run migrations
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npm run seed
```

### Making Users Admin
```bash
# Using Prisma Studio
npx prisma studio
# Then update user.role = "admin"

# Or using direct SQL
sqlite3 prisma/dev.db "UPDATE User SET role = 'admin' WHERE email = 'user@example.com';"
```

## 🚀 Production Deployment

### Build & Start
```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Environment Variables
```env
# Production settings
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@localhost:5432/blog"
JWT_SECRET="very-long-secret-key-here"
JWT_EXPIRES_IN="1h"
PORT=3000
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🧪 Testing

### Available Scripts
```bash
# Development
npm run start:dev      # Watch mode
npm run start:debug    # Debug mode

# Production
npm run build          # Build
npm run start:prod     # Production start

# Database
npm run db:migrate     # Run migrations
npm run db:generate    # Generate Prisma client
npm run db:studio      # Open Prisma Studio

# Code Quality
npm run lint           # ESLint
npm run format         # Prettier
```

## 🔧 Configuration

### JWT Configuration
```typescript
// src/config/jwt.config.ts
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
}));
```

### Database Configuration
```typescript
// src/config/database.config.ts
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
```

## 🐛 Troubleshooting

### Common Issues

**1. Dynamic modules not loading**
```bash
# Check if modules are in correct location
ls src/modules/*/module-name.module.ts

# Rebuild project
npm run build
```

**2. JWT authentication failing**
```bash
# Check JWT_SECRET in .env
# Verify token format: "Bearer <token>"
# Check token expiration
```

**3. Path aliases not working**
```bash
# Install tsconfig-paths
npm install tsconfig-paths

# Check tsconfig.json paths configuration
# Ensure tsconfig-paths/register is imported in main.ts
```

**4. Database connection issues**
```bash
# Check DATABASE_URL in .env
# Run migrations: npx prisma migrate dev
# Generate client: npx prisma generate
```

## 📝 API Examples

### Complete Authentication Flow
```bash
# 1. Create user
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createUser(createUserInput: { name: \"Test\", email: \"test@example.com\", password: \"password123\" }) { id name email role } }"}'

# 2. Login
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(email: \"test@example.com\", password: \"password123\") }"}'

# 3. Use protected endpoint
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"query":"{ me { id name email role } }"}'
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Add** your module following the dynamic loading pattern
4. **Test** with authentication and authorization
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🎯 Key Benefits

✅ **Zero Configuration** - Dynamic module loading  
✅ **Enterprise Security** - JWT + Role-based auth  
✅ **Type Safety** - Full TypeScript support  
✅ **Scalable Architecture** - Modular design  
✅ **Production Ready** - Rate limiting, validation  
✅ **Developer Friendly** - Clean imports, hot reload  

**Ready to build amazing APIs! 🚀**
