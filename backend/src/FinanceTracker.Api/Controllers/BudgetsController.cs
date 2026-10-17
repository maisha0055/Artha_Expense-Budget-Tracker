using System.Globalization;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Budgets;
using FinanceTracker.Api.Extensions;
using FinanceTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Controllers;

/// <summary>
/// Manages category monthly budgets for the authenticated user.
/// </summary>
[Authorize]
[ApiController]
[Route("budgets")]
public class BudgetsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public BudgetsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves all categories of the user with their budget limit for the given month (limit is null if not set).
    /// </summary>
    /// <param name="month">Target month in 'yyyy-MM' format (defaults to current month).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryBudgetDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<CategoryBudgetDto>>> GetBudgets(
        [FromQuery] string? month,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        DateOnly normalizedMonth;
        if (string.IsNullOrWhiteSpace(month))
        {
            var now = DateTime.UtcNow;
            normalizedMonth = new DateOnly(now.Year, now.Month, 1);
        }
        else
        {
            if (!DateTime.TryParseExact(month, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: "Month must be in 'yyyy-MM' format (e.g. 2026-10)."
                );
            }

            normalizedMonth = new DateOnly(parsed.Year, parsed.Month, 1);
        }

        var categories = await _dbContext.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name })
            .ToListAsync(cancellationToken);

        var budgets = await _dbContext.Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId && b.Month == normalizedMonth)
            .ToDictionaryAsync(b => b.CategoryId, b => b.LimitAmount, cancellationToken);

        var result = categories.Select(c => new CategoryBudgetDto(
            c.Id,
            c.Name,
            budgets.TryGetValue(c.Id, out var limit) ? limit : null
        ));

        return Ok(result);
    }

    /// <summary>
    /// Sets, updates, or removes the budget limit for a category and month. LimitAmount 0 or null removes the budget.
    /// </summary>
    /// <param name="request">Budget details with categoryId, month, and limitAmount.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut]
    [ProducesResponseType(typeof(CategoryBudgetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryBudgetDto>> SetBudget(
        [FromBody] SetBudgetRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        if (!DateTime.TryParseExact(request.Month, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedMonth))
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Bad Request",
                detail: "Month must be in 'yyyy-MM' format (e.g. 2026-10)."
            );
        }

        var normalizedMonth = new DateOnly(parsedMonth.Year, parsedMonth.Month, 1);

        var category = await _dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == userId, cancellationToken);

        if (category == null)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Bad Request",
                detail: "Category does not exist or does not belong to the authenticated user."
            );
        }

        var existingBudget = await _dbContext.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.CategoryId == request.CategoryId && b.Month == normalizedMonth, cancellationToken);

        // Limit 0 or null removes the budget
        if (!request.LimitAmount.HasValue || request.LimitAmount.Value <= 0)
        {
            if (existingBudget != null)
            {
                _dbContext.Budgets.Remove(existingBudget);
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            return Ok(new CategoryBudgetDto(category.Id, category.Name, null));
        }

        if (existingBudget != null)
        {
            existingBudget.LimitAmount = request.LimitAmount.Value;
        }
        else
        {
            var newBudget = new Budget
            {
                UserId = userId,
                CategoryId = request.CategoryId,
                Month = normalizedMonth,
                LimitAmount = request.LimitAmount.Value
            };
            _dbContext.Budgets.Add(newBudget);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new CategoryBudgetDto(category.Id, category.Name, request.LimitAmount.Value));
    }
}
