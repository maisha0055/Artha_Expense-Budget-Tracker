namespace FinanceTracker.Api.Dtos.Summary;

public record CategorySummaryDto(
    int CategoryId,
    string Name,
    decimal Spent,
    decimal? Limit,
    double? PercentUsed,
    string Status
);
