using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Dtos.Budgets;

public record SetBudgetRequest(
    [Required(ErrorMessage = "CategoryId is required.")]
    int CategoryId,

    [Required(ErrorMessage = "Month is required.")]
    string Month,

    [Range(0, 9999999999.99, ErrorMessage = "LimitAmount must be 0 or positive.")]
    decimal? LimitAmount
);
