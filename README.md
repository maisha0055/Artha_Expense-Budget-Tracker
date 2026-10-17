# Personal Finance Tracker

A full-stack application where users track income and expenses, set monthly budgets per category, and view a dashboard with budget warnings.

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
Use `dotnet user-secrets` to configure your local development JWT signing key without hardcoding secrets:
```bash
cd backend/src/FinanceTracker.Api
dotnet user-secrets set "Jwt:Key" "YourDevelopmentSuperSecretJwtKeyThatIsLongEnough32Bytes!"
dotnet user-secrets set "Jwt:Issuer" "FinanceTrackerApi"
dotnet user-secrets set "Jwt:Audience" "FinanceTrackerClient"
```

### 3. Run the Backend API
```bash
cd backend/src/FinanceTracker.Api
dotnet run
```
Access Swagger UI at `http://localhost:5000/swagger` or `https://localhost:5001/swagger`.

### 4. Run Migrations (if modified)
```bash
cd backend
dotnet tool run dotnet-ef database update --project src/FinanceTracker.Api --startup-project src/FinanceTracker.Api
```

### 5. Run Unit Tests
```bash
dotnet test backend/FinanceTracker.sln
```
