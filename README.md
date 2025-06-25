# NestJS Blog API with Prisma and GraphQL

A modern blog API built with NestJS, Prisma ORM, and GraphQL using a layered architecture with separated schemas.

## Architecture

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
│       └── auth.graphql
├── shared/           # Guards, Pipes, Filters, Decorators, Base Schema
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── schema/
│   │   ├── base.graphql
│   │   └── index.ts
│   └── index.ts
├── modules/          # Feature modules with DTOs, Entities, Services, Resolvers, Schemas
│   ├── user/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── user.service.ts
│   │   ├── user.resolver.ts
│   │   ├── user.module.ts
│   │   └── user.graphql
│   └── post/
│       ├── dto/
│       ├── entities/
│       ├── post.service.ts
│       ├── post.resolver.ts
│       ├── post.module.ts
│       └── post.graphql
├── utils/            # Helper functions
│   ├── helpers.ts
│   └── index.ts
└── app.module.ts
```

## Features

- **User Management**: Create and query users with password authentication
- **Post Management**: Create and query posts with author relationships
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **GraphQL API**: Schema-first approach with separated schemas per module
- **Database**: SQLite with Prisma ORM (easily switchable to MySQL/PostgreSQL)
- **Layered Architecture**: Clean separation of concerns
- **Modular Schemas**: Each module controls its own GraphQL schema

## Schema Separation

This project uses a **schema-first approach** with separated GraphQL schemas:

### Base Schema (`src/shared/schema/base.graphql`)
```graphql
scalar DateTime

type Query {
  _: Boolean
}

type Mutation {
  _: Boolean
}
```

### User Schema (`src/modules/user/user.graphql`)
```graphql
type User {
  id: Int!
  name: String!
  email: String!
  posts: [Post]
  createdAt: DateTime!
}

input CreateUserInput {
  name: String!
  email: String!
  id: Float
  createdAt: DateTime
  password: String!
}

extend type Query {
  users: [User!]!
  user(id: Int!): User!
}

extend type Mutation {
  createUser(createUserInput: CreateUserInput!): User!
}
```

### Post Schema (`src/modules/post/post.graphql`)
```graphql
type Post {
  id: Int!
  title: String!
  content: String!
  published: Boolean!
  authorId: Int!
  author: User!
  createdAt: DateTime!
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: Int!
}

extend type Query {
  posts: [Post!]!
  post(id: Int!): Post!
}

extend type Mutation {
  createPost(createPostInput: CreatePostInput!): Post!
}
```

### Auth Schema (`src/core/auth/auth.graphql`)
```graphql
extend type Mutation {
  login(email: String!, password: String!): String!
}
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (or MySQL/PostgreSQL if configured)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="1d"
   ```

4. **Generate Prisma client and run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run start:dev
   ```

## Usage

### GraphQL Playground

Access the GraphQL playground at: `http://localhost:3000/graphql`

### Example Queries and Mutations

#### Create a User
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
    createdAt
  }
}
```

#### Login
```graphql
mutation {
  login(email: "alice@example.com", password: "password123")
}
```

#### Create a Post
```graphql
mutation {
  createPost(createPostInput: {
    title: "My First Post"
    content: "Hello, world!"
    authorId: 1
  }) {
    id
    title
    content
    published
    author {
      name
      email
    }
    createdAt
  }
}
```

#### Query Users with Posts
```graphql
query {
  users {
    id
    name
    email
    posts {
      id
      title
      content
      published
    }
    createdAt
  }
}
```

#### Query Posts with Authors
```graphql
query {
  posts {
    id
    title
    content
    published
    author {
      id
      name
      email
    }
    createdAt
  }
}
```

## Authentication

### Using JWT Tokens

1. **Login to get a token:**
   ```graphql
   mutation {
     login(email: "alice@example.com", password: "password123")
   }
   ```

2. **Use the token in HTTP headers:**
   In GraphQL Playground, add to HTTP HEADERS:
   ```json
   {
     "Authorization": "Bearer <your-jwt-token>"
   }
   ```

### Protecting Routes

To protect routes with JWT authentication, use the `@UseGuards(JwtAuthGuard)` decorator:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Query(() => [Post])
findAll() {
  return this.postService.findAll();
}
```

## Database Configuration

### SQLite (Default)
```env
DATABASE_URL="file:./dev.db"
```

### MySQL
```env
DATABASE_URL="mysql://username:password@localhost:3306/nest_blog"
```

### PostgreSQL
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nest_blog"
```

## Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run seed` - Seed the database with sample data

## Project Structure Details

### Config Layer
- Environment variable management
- Configuration validation
- Centralized configuration for all modules

### Core Layer
- **Prisma Service**: Database connection and ORM
- **Auth Service**: JWT authentication and user validation
- **Logger**: Centralized logging (can be added)

### Shared Layer
- **Guards**: Authentication and authorization guards
- **Decorators**: Custom decorators for extracting user context
- **Base Schema**: Common GraphQL types and scalars
- **Pipes**: Validation pipes (can be added)
- **Filters**: Exception filters (can be added)

### Modules Layer
- **User Module**: User management with DTOs, entities, services, resolvers, and schema
- **Post Module**: Post management with author relationships and schema

### Utils Layer
- Helper functions for common operations
- Utility functions for data formatting and validation

## Schema Management

### Adding New Types
1. Create a new `.graphql` file in your module
2. Define your types using SDL (Schema Definition Language)
3. Use `extend type Query` or `extend type Mutation` to add operations
4. Add the schema file path to `app.module.ts` in the `typePaths` array

### Example: Adding a Comment Module
```graphql
# src/modules/comment/comment.graphql
type Comment {
  id: Int!
  content: String!
  postId: Int!
  authorId: Int!
  post: Post!
  author: User!
  createdAt: DateTime!
}

input CreateCommentInput {
  content: String!
  postId: Int!
  authorId: Int!
}

extend type Query {
  comments: [Comment!]!
  comment(id: Int!): Comment!
}

extend type Mutation {
  createComment(createCommentInput: CreateCommentInput!): Comment!
}
```

Then add to `app.module.ts`:
```typescript
typePaths: [
  // ... existing paths
  join(process.cwd(), 'src/modules/comment/comment.graphql'),
],
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
