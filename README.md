# ARTHA - Expense & Budget Tracker

A modern full-stack application where users track income and expenses, set monthly category budgets, and manage finances with real-time budget status alerts.

## Architecture & Tech Stack

### Backend
- **Framework**: .NET 8 (LTS), ASP.NET Core Web API (Controllers)
- **ORM**: Entity Framework Core 8 + Pomelo.EntityFrameworkCore.MySql
- **Database**: MySQL 8 (Docker container)
- **Authentication**: JWT Bearer Tokens with BCrypt.Net-Next password hashing
- **Documentation**: Swagger (Swashbuckle) with JWT Authorize button
- **Testing**: xUnit

### Database Tables (Exactly 4)
- **Users**: `Id`, `Name`, `Email` (Unique), `PasswordHash`
- **Categories**: `Id`, `UserId` (FK -> Users, Cascade), `Name` (Unique per user)
- **Budgets**: `Id`, `UserId` (FK -> Users, Cascade), `CategoryId` (FK -> Categories, Cascade), `Month` (Date), `LimitAmount` (decimal(12,2), Unique per user+category+month)
- **Transactions**: `Id`, `UserId` (FK -> Users, Cascade), `CategoryId` (FK -> Categories, Restrict), `Amount` (decimal(12,2)), `Type` (Income/Expense string), `Date` (Date), `Note` (varchar(255) nullable)

---

## Getting Started

### 1. Start MySQL with Docker Compose
```bash
docker compose up -d db
```

### 2. Configure Development Secrets (JWT Key)
Use `dotnet user-secrets` to configure your local development JWT signing key:
```bash
cd backend/src/FinanceTracker.Api
dotnet user-secrets set "Jwt:Key" "YourDevelopmentSuperSecretJwtKeyThatIsLongEnough32Bytes!"
dotnet user-secrets set "Jwt:Issuer" "ArthaApi"
dotnet user-secrets set "Jwt:Audience" "ArthaClient"
```

### 3. Run the Backend API
```bash
cd backend/src/FinanceTracker.Api
dotnet run --urls "http://localhost:5050"
```
Access Swagger UI at `http://localhost:5050/swagger`.

### 4. Run Migrations (if modified)
```bash
cd backend
dotnet tool run dotnet-ef database update --project src/FinanceTracker.Api --startup-project src/FinanceTracker.Api
```

### 5. Run Unit Tests
```bash
dotnet test backend/FinanceTracker.sln
```
