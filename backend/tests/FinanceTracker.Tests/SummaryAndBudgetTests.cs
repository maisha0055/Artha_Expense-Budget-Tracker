using FinanceTracker.Api.Data;
using FinanceTracker.Api.Models;
using FinanceTracker.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Tests;

public class SummaryAndBudgetTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void BudgetStatusCalculator_StatusRules_MatchSpecification()
    {
        // No budget
        Assert.Equal("None", BudgetStatusCalculator.CalculateStatus(null, 100m));
        Assert.Equal("None", BudgetStatusCalculator.CalculateStatus(0m, 100m));
        Assert.Null(BudgetStatusCalculator.CalculatePercentUsed(null, 100m));

        // Zero spent with budget
        Assert.Equal("Ok", BudgetStatusCalculator.CalculateStatus(1000m, 0m));
        Assert.Equal(0.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 0m));

        // Less than 80%
        Assert.Equal("Ok", BudgetStatusCalculator.CalculateStatus(1000m, 799.99m));
        Assert.Equal(80.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 799.99m)); // 80.0 rounded
        Assert.Equal("Ok", BudgetStatusCalculator.CalculateStatus(1000m, 750m));
        Assert.Equal(75.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 750m));

        // Exactly 80% -> Warning
        Assert.Equal("Warning", BudgetStatusCalculator.CalculateStatus(1000m, 800m));
        Assert.Equal(80.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 800m));

        // Between 80% and 100% -> Warning
        Assert.Equal("Warning", BudgetStatusCalculator.CalculateStatus(1000m, 999.90m));

        // Exactly 100% -> Exceeded
        Assert.Equal("Exceeded", BudgetStatusCalculator.CalculateStatus(1000m, 1000m));
        Assert.Equal(100.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 1000m));

        // Greater than 100% -> Exceeded
        Assert.Equal("Exceeded", BudgetStatusCalculator.CalculateStatus(1000m, 1250m));
        Assert.Equal(125.0, BudgetStatusCalculator.CalculatePercentUsed(1000m, 1250m));
    }

    [Fact]
    public async Task Summary_Exactly80Percent_ReturnsWarningStatus()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var category = new Category { Id = 10, UserId = 1, Name = "Food" };
        var budget = new Budget
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Month = new DateOnly(2026, 10, 1),
            LimitAmount = 1000.00m
        };
        var transaction = new Transaction
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Amount = 800.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 15)
        };

        dbContext.Users.Add(user);
        dbContext.Categories.Add(category);
        dbContext.Budgets.Add(budget);
        dbContext.Transactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        var catSummary = Assert.Single(summary.Categories);
        Assert.Equal("Food", catSummary.Name);
        Assert.Equal(800.00m, catSummary.Spent);
        Assert.Equal(1000.00m, catSummary.Limit);
        Assert.Equal(80.0, catSummary.PercentUsed);
        Assert.Equal("Warning", catSummary.Status);
    }

    [Fact]
    public async Task Summary_Exactly100Percent_ReturnsExceededStatus()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var category = new Category { Id = 10, UserId = 1, Name = "Entertainment" };
        var budget = new Budget
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Month = new DateOnly(2026, 10, 1),
            LimitAmount = 500.00m
        };
        var transaction = new Transaction
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Amount = 500.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 20)
        };

        dbContext.Users.Add(user);
        dbContext.Categories.Add(category);
        dbContext.Budgets.Add(budget);
        dbContext.Transactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        var catSummary = Assert.Single(summary.Categories);
        Assert.Equal(500.00m, catSummary.Spent);
        Assert.Equal(500.00m, catSummary.Limit);
        Assert.Equal(100.0, catSummary.PercentUsed);
        Assert.Equal("Exceeded", catSummary.Status);
    }

    [Fact]
    public async Task Summary_NoBudget_ReturnsNoneStatusAndNullLimitAndPercent()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var category = new Category { Id = 10, UserId = 1, Name = "Utilities" };
        var transaction = new Transaction
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Amount = 150.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 5)
        };

        dbContext.Users.Add(user);
        dbContext.Categories.Add(category);
        dbContext.Transactions.Add(transaction);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        var catSummary = Assert.Single(summary.Categories);
        Assert.Equal(150.00m, catSummary.Spent);
        Assert.Null(catSummary.Limit);
        Assert.Null(catSummary.PercentUsed);
        Assert.Equal("None", catSummary.Status);
    }

    [Fact]
    public async Task Summary_ZeroSpentWithBudget_IsIncludedWithOkStatus()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var category = new Category { Id = 10, UserId = 1, Name = "Travel" };
        var budget = new Budget
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Month = new DateOnly(2026, 10, 1),
            LimitAmount = 1000.00m
        };

        dbContext.Users.Add(user);
        dbContext.Categories.Add(category);
        dbContext.Budgets.Add(budget);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        var catSummary = Assert.Single(summary.Categories);
        Assert.Equal("Travel", catSummary.Name);
        Assert.Equal(0.00m, catSummary.Spent);
        Assert.Equal(1000.00m, catSummary.Limit);
        Assert.Equal(0.0, catSummary.PercentUsed);
        Assert.Equal("Ok", catSummary.Status);
    }

    [Fact]
    public async Task Summary_IncomeNotCountedAsSpending()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var salaryCat = new Category { Id = 10, UserId = 1, Name = "Salary" };
        var foodCat = new Category { Id = 11, UserId = 1, Name = "Food" };

        var incomeTx = new Transaction
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Amount = 4000.00m,
            Type = TransactionType.Income,
            Date = new DateOnly(2026, 10, 1)
        };
        var expenseTx = new Transaction
        {
            Id = 2,
            UserId = 1,
            CategoryId = 11,
            Amount = 200.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 2)
        };

        dbContext.Users.Add(user);
        dbContext.Categories.AddRange(salaryCat, foodCat);
        dbContext.Transactions.AddRange(incomeTx, expenseTx);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        Assert.Equal(4000.00m, summary.TotalIncome);
        Assert.Equal(200.00m, summary.TotalExpenses);
        Assert.Equal(3800.00m, summary.Balance);

        // Salary category had NO expenses and NO budget -> not in category spending list
        Assert.DoesNotContain(summary.Categories, c => c.CategoryId == 10);

        // Food category is in list with spent = 200
        var foodSummary = Assert.Single(summary.Categories);
        Assert.Equal(11, foodSummary.CategoryId);
        Assert.Equal(200.00m, foodSummary.Spent);
    }

    [Fact]
    public async Task Summary_AnotherUsersData_DoesNotLeakIntoSummary()
    {
        using var dbContext = CreateInMemoryDbContext();
        var user1 = new User { Id = 1, Name = "Alice", Email = "alice@test.com", PasswordHash = "hash" };
        var user2 = new User { Id = 2, Name = "Bob", Email = "bob@test.com", PasswordHash = "hash" };

        var catU1 = new Category { Id = 1, UserId = 1, Name = "User1 Food" };
        var catU2 = new Category { Id = 2, UserId = 2, Name = "User2 Food" };

        var budgetU1 = new Budget { Id = 1, UserId = 1, CategoryId = 1, Month = new DateOnly(2026, 10, 1), LimitAmount = 100m };
        var budgetU2 = new Budget { Id = 2, UserId = 2, CategoryId = 2, Month = new DateOnly(2026, 10, 1), LimitAmount = 900m };

        var txU1Income = new Transaction { Id = 1, UserId = 1, CategoryId = 1, Amount = 1000m, Type = TransactionType.Income, Date = new DateOnly(2026, 10, 1) };
        var txU1Expense = new Transaction { Id = 2, UserId = 1, CategoryId = 1, Amount = 50m, Type = TransactionType.Expense, Date = new DateOnly(2026, 10, 2) };

        var txU2Income = new Transaction { Id = 3, UserId = 2, CategoryId = 2, Amount = 50000m, Type = TransactionType.Income, Date = new DateOnly(2026, 10, 1) };
        var txU2Expense = new Transaction { Id = 4, UserId = 2, CategoryId = 2, Amount = 8000m, Type = TransactionType.Expense, Date = new DateOnly(2026, 10, 2) };

        dbContext.Users.AddRange(user1, user2);
        dbContext.Categories.AddRange(catU1, catU2);
        dbContext.Budgets.AddRange(budgetU1, budgetU2);
        dbContext.Transactions.AddRange(txU1Income, txU1Expense, txU2Income, txU2Expense);
        await dbContext.SaveChangesAsync();

        var summaryService = new SummaryService(dbContext);
        var u1Summary = await summaryService.GetMonthlySummaryAsync(1, "2026-10");

        Assert.Equal(1000m, u1Summary.TotalIncome);
        Assert.Equal(50m, u1Summary.TotalExpenses);
        Assert.Equal(950m, u1Summary.Balance);

        var u1Category = Assert.Single(u1Summary.Categories);
        Assert.Equal(1, u1Category.CategoryId);
        Assert.Equal("User1 Food", u1Category.Name);
        Assert.Equal(50m, u1Category.Spent);
        Assert.Equal(100m, u1Category.Limit);
        Assert.Equal(50.0, u1Category.PercentUsed);
        Assert.Equal("Ok", u1Category.Status);
    }
}
