using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Categories;
using FinanceTracker.Api.Extensions;
using FinanceTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Api.Controllers;

/// <summary>
/// Manages income and expense categories for the authenticated user.
/// </summary>
[Authorize]
[ApiController]
[Route("categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CategoriesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves all categories for the authenticated user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var categories = await _dbContext.Categories
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    /// <summary>
    /// Creates a new category for the authenticated user.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<CategoryDto>> CreateCategory(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var trimmedName = request.Name.Trim();

        var exists = await _dbContext.Categories
            .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (exists)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: $"A category named '{trimmedName}' already exists for this user."
            );
        }

        var category = new Category
        {
            UserId = userId,
            Name = trimmedName
        };

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var responseDto = new CategoryDto(category.Id, category.Name);
        return StatusCode(StatusCodes.Status201Created, responseDto);
    }

    /// <summary>
    /// Deletes a category if it belongs to the user and has no associated transactions.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        var category = await _dbContext.Categories
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category == null || category.UserId != userId)
        {
            return NotFound();
        }

        var hasTransactions = await _dbContext.Transactions
            .AnyAsync(t => t.CategoryId == id && t.UserId == userId, cancellationToken);

        if (hasTransactions)
        {
            return Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: "Cannot delete category because it has associated transactions."
            );
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
