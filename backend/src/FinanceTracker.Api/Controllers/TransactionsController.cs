using System.Globalization;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Common;
using FinanceTracker.Api.Dtos.Transactions;
using FinanceTracker.Api.Extensions;
using FinanceTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Controllers;

/// <summary>
/// Manages income and expense transactions for the authenticated user.
/// </summary>
[Authorize]
[ApiController]
[Route("transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TransactionsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves a paginated list of transactions filtered by month, category, or type.
    /// </summary>
    /// <param name="month">Optional month filter in yyyy-MM format (e.g. 2026-10).</param>
    /// <param name="categoryId">Optional category ID filter.</param>
    /// <param name="type">Optional transaction type filter (Income or Expense).</param>
    /// <param name="page">Page number (default 1).</param>
    /// <param name="pageSize">Page size (default 20, max 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<TransactionDto>>> GetTransactions(
        [FromQuery] string? month,
        [FromQuery] int? categoryId,
        [FromQuery] TransactionType? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var userId = User.GetUserId();

        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 20;
        }
        else if (pageSize > 100)
        {
            pageSize = 100;
        }

        var query = _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(month))
        {
            if (!DateTime.TryParseExact(month, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedMonth))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: "Month filter must be in 'yyyy-MM' format (e.g., 2026-10)."
                );
            }

            var startOfMonth = new DateOnly(parsedMonth.Year, parsedMonth.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            query = query.Where(t => t.Date >= startOfMonth && t.Date <= endOfMonth);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(t => t.CategoryId == categoryId.Value);
        }

        if (type.HasValue)
        {
            query = query.Where(t => t.Type == type.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransactionDto(
                t.Id,
                t.Amount,
                t.Type,
                t.CategoryId,
                t.Category.Name,
                t.Date,
                t.Note
            ))
            .ToListAsync(cancellationToken);

        return Ok(new PagedResult<TransactionDto>(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Retrieves a single transaction by ID.
    /// </summary>
    /// <param name="id">Transaction ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TransactionDto>> GetTransactionById(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var transaction = await _dbContext.Transactions
            .AsNoTracking()
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TransactionDto(
                t.Id,
                t.Amount,
                t.Type,
                t.CategoryId,
                t.Category.Name,
                t.Date,
                t.Note
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (transaction == null)
        {
            return NotFound();
        }

        return Ok(transaction);
    }

    /// <summary>
    /// Creates a new transaction for the authenticated user.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TransactionDto>> CreateTransaction(
        [FromBody] CreateTransactionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

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

        var transaction = new Transaction
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Type = request.Type,
            Date = request.Date,
            Note = request.Note?.Trim()
        };

        _dbContext.Transactions.Add(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var responseDto = new TransactionDto(
            transaction.Id,
            transaction.Amount,
            transaction.Type,
            transaction.CategoryId,
            category.Name,
            transaction.Date,
            transaction.Note
        );

        return StatusCode(StatusCodes.Status201Created, responseDto);
    }

    /// <summary>
    /// Updates an existing transaction.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(
        int id,
        [FromBody] UpdateTransactionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var transaction = await _dbContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transaction == null || transaction.UserId != userId)
        {
            return NotFound();
        }

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

        transaction.CategoryId = request.CategoryId;
        transaction.Amount = request.Amount;
        transaction.Type = request.Type;
        transaction.Date = request.Date;
        transaction.Note = request.Note?.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);

        var responseDto = new TransactionDto(
            transaction.Id,
            transaction.Amount,
            transaction.Type,
            transaction.CategoryId,
            category.Name,
            transaction.Date,
            transaction.Note
        );

        return Ok(responseDto);
    }

    /// <summary>
    /// Deletes a transaction if it belongs to the authenticated user.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTransaction(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var transaction = await _dbContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (transaction == null || transaction.UserId != userId)
        {
            return NotFound();
        }

        _dbContext.Transactions.Remove(transaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
