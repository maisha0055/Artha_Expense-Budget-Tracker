namespace FinanceTracker.Api.Dtos.Summary;

public record MonthlySummaryDto(
    string Month,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Balance,
    IReadOnlyList<CategorySummaryDto> Categories
);
