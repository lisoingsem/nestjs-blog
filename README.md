# NestJS Blog API

## 🚀 Project Setup

Follow these steps to set up and run the project:

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**
   - Copy the example environment file and update it with your database credentials:
     ```bash
     cp .env.example .env
     # Edit .env with your database connection details
     ```

4. **Set up the database**
   - Run the following command to create the database schema and apply migrations:
     ```bash
     yarn cli db migrate init
     ```
   - (Optional) Seed the database with initial data:
     ```bash
     yarn cli db seed
     ```

5. **Start the application**
   ```bash
   yarn start:dev
   ```

6. **Access the API**
   - The API will be available at: `http://localhost:3000/graphql`
   - (Optional) Access Prisma Studio for database management:
     ```bash
     yarn cli db studio
     ```

---

## 🛠️ Main Technologies

- **NestJS**: Modular, scalable Node.js framework for building server-side applications
- **GraphQL**: Code-first API with type-safe schemas and resolvers
- **Prisma ORM**: Type-safe database access and migrations (PostgreSQL)
- **JWT Authentication**: Secure authentication with role-based access control (RBAC)
- **Yarn CLI**: Custom commands for database and project management
- **Docker**: (Optional) For containerized deployment

---

## 📚 Project Rules & Conventions (Brief)

- **Modular Architecture**: Features are organized in modules under `src/modules/`.
- **Service-Only Pattern**: Business logic and data access are handled in service classes (no repository abstraction).
- **GraphQL Code-First**: All schemas and types are defined in TypeScript, not SDL files.
- **Naming Conventions**: 
  - Services: `*.service.ts`
  - Modules: `*.module.ts`
  - DTOs: `*.input.ts`, `*.args.ts`
  - Guards: `*.guard.ts`
- **Security**: Use guards and decorators for authentication and permissions (e.g., `@UseGuards(JwtGuard, PermissionGuard)`).
- **No Circular Dependencies**: Module dependencies must flow downward only.
- **Database**: Single `prisma/schema.prisma` file, migrations managed via Prisma CLI/Custom CLI.
- **Testing**: Unit tests mock PrismaService, follow Arrange-Act-Assert pattern.

For full rules and patterns, see the `.cursor/rules/` directory in the repo.

---

For more details, see the documentation or contact the project maintainer.
