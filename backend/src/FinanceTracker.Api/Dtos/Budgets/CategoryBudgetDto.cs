namespace FinanceTracker.Api.Dtos.Budgets;

public record CategoryBudgetDto(
    int CategoryId,
    string CategoryName,
    decimal? LimitAmount
);
