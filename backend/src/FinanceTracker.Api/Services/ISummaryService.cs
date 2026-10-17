using FinanceTracker.Api.Dtos.Summary;

namespace FinanceTracker.Api.Services;

public interface ISummaryService
{
    Task<MonthlySummaryDto> GetMonthlySummaryAsync(int userId, string? monthString, CancellationToken cancellationToken = default);
}
