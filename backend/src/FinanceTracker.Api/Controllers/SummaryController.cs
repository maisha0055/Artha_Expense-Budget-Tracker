using FinanceTracker.Api.Dtos.Summary;
using FinanceTracker.Api.Extensions;
using FinanceTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTracker.Api.Controllers;

/// <summary>
/// Provides monthly financial summaries, category expense breakdowns, and budget statuses.
/// </summary>
[Authorize]
[ApiController]
[Route("summary")]
public class SummaryController : ControllerBase
{
    private readonly ISummaryService _summaryService;

    public SummaryController(ISummaryService summaryService)
    {
        _summaryService = summaryService;
    }

    /// <summary>
    /// Retrieves monthly financial summary including total income, total expenses, balance, and per-category budget status.
    /// </summary>
    /// <param name="month">Optional month in 'yyyy-MM' format (defaults to the current month).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(MonthlySummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MonthlySummaryDto>> GetSummary(
        [FromQuery] string? month,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        try
        {
            var summary = await _summaryService.GetMonthlySummaryAsync(userId, month, cancellationToken);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Bad Request",
                detail: ex.Message
            );
        }
    }
}
