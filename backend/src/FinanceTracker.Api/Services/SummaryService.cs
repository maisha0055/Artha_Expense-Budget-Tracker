using System.Globalization;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Summary;
using FinanceTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Services;

public class SummaryService : ISummaryService
{
    private readonly AppDbContext _dbContext;

    public SummaryService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MonthlySummaryDto> GetMonthlySummaryAsync(int userId, string? monthString, CancellationToken cancellationToken = default)
    {
        DateOnly startOfMonth;
        string formattedMonth;

        if (string.IsNullOrWhiteSpace(monthString))
        {
            var now = DateTime.UtcNow;
            startOfMonth = new DateOnly(now.Year, now.Month, 1);
            formattedMonth = now.ToString("yyyy-MM");
        }
        else
        {
            if (!DateTime.TryParseExact(monthString, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                throw new ArgumentException("Month must be in 'yyyy-MM' format (e.g. 2026-10).");
            }

            startOfMonth = new DateOnly(parsed.Year, parsed.Month, 1);
            formattedMonth = monthString;
        }

        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

        // 1. Grouped total income aggregation in database
        var totalIncome = await _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.Date >= startOfMonth && t.Date <= endOfMonth && t.Type == TransactionType.Income)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        // 2. Grouped total expenses aggregation in database
        var totalExpenses = await _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.Date >= startOfMonth && t.Date <= endOfMonth && t.Type == TransactionType.Expense)
            .SumAsync(t => (decimal?)t.Amount, cancellationToken) ?? 0m;

        // 3. Balance
        var balance = totalIncome - totalExpenses;

        // 4. Per-category expense spending aggregation in database
        var categoryExpenses = await _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId && t.Date >= startOfMonth && t.Date <= endOfMonth && t.Type == TransactionType.Expense)
            .GroupBy(t => t.CategoryId)
            .Select(g => new
            {
                CategoryId = g.Key,
                Spent = g.Sum(t => t.Amount)
            })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Spent, cancellationToken);

        // 5. Budgets for this month
        var categoryBudgets = await _dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId && b.Month == startOfMonth)
            .ToDictionaryAsync(b => b.CategoryId, b => b.LimitAmount, cancellationToken);

        // 6. User's categories
        var userCategories = await _dbContext.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToListAsync(cancellationToken);

        // 7. Compose category breakdown: include if spent > 0 or if a budget is set
        var categoriesList = new List<CategorySummaryDto>();
        foreach (var category in userCategories)
        {
            var spent = categoryExpenses.TryGetValue(category.Id, out var s) ? s : 0m;
            var hasBudget = categoryBudgets.TryGetValue(category.Id, out var limit);

            if (spent > 0 || hasBudget)
            {
                decimal? budgetLimit = hasBudget ? limit : null;
                var percentUsed = BudgetStatusCalculator.CalculatePercentUsed(budgetLimit, spent);
                var status = BudgetStatusCalculator.CalculateStatus(budgetLimit, spent);

                categoriesList.Add(new CategorySummaryDto(
                    category.Id,
                    category.Name,
                    spent,
                    budgetLimit,
                    percentUsed,
                    status
                ));
            }
        }

        return new MonthlySummaryDto(
            formattedMonth,
            totalIncome,
            totalExpenses,
            balance,
            categoriesList
        );
    }
}
