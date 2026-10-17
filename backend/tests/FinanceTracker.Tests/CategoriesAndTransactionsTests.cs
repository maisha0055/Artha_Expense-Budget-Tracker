using System.Security.Claims;
using FinanceTracker.Api.Controllers;
using FinanceTracker.Api.Data;
using FinanceTracker.Api.Dtos.Categories;
using FinanceTracker.Api.Dtos.Common;
using FinanceTracker.Api.Dtos.Transactions;
using FinanceTracker.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceTracker.Tests;

public class CategoriesAndTransactionsTests
{
    private AppDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private void SetUserContext(ControllerBase controller, int userId)
    {
        var claims = new[]
        {
            new Claim("sub", userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task Categories_GetCategories_OnlyReturnsCurrentUserCategories()
    {
        using var dbContext = CreateInMemoryDbContext();
        dbContext.Categories.AddRange(
            new Category { UserId = 1, Name = "User1 Food" },
            new Category { UserId = 2, Name = "User2 Tech" }
        );
        await dbContext.SaveChangesAsync();

        var controller = new CategoriesController(dbContext);
        SetUserContext(controller, 1);

        var result = await controller.GetCategories(CancellationToken.None);
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var categories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);

        var list = categories.ToList();
        Assert.Single(list);
        Assert.Equal("User1 Food", list[0].Name);
    }

    [Fact]
    public async Task Categories_CreateCategory_DuplicateNameForSameUser_Returns409()
    {
        using var dbContext = CreateInMemoryDbContext();
        dbContext.Categories.Add(new Category { UserId = 1, Name = "Food" });
        await dbContext.SaveChangesAsync();

        var controller = new CategoriesController(dbContext);
        SetUserContext(controller, 1);

        var result = await controller.CreateCategory(new CreateCategoryRequest("food"), CancellationToken.None);
        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    [Fact]
    public async Task Categories_CreateCategory_DifferentUsersCanHaveSameCategoryName()
    {
        using var dbContext = CreateInMemoryDbContext();
        dbContext.Categories.Add(new Category { UserId = 1, Name = "Food" });
        await dbContext.SaveChangesAsync();

        var controller = new CategoriesController(dbContext);
        SetUserContext(controller, 2);

        var result = await controller.CreateCategory(new CreateCategoryRequest("Food"), CancellationToken.None);
        var createdResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status201Created, createdResult.StatusCode);
    }

    [Fact]
    public async Task Categories_DeleteCategory_WithTransactions_Returns409()
    {
        using var dbContext = CreateInMemoryDbContext();
        var category = new Category { Id = 10, UserId = 1, Name = "Food" };
        dbContext.Categories.Add(category);
        dbContext.Transactions.Add(new Transaction
        {
            Id = 1,
            UserId = 1,
            CategoryId = 10,
            Amount = 50.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 15)
        });
        await dbContext.SaveChangesAsync();

        var controller = new CategoriesController(dbContext);
        SetUserContext(controller, 1);

        var result = await controller.DeleteCategory(10, CancellationToken.None);
        var objectResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, objectResult.StatusCode);
    }

    [Fact]
    public async Task Transactions_CreateTransaction_WithOtherUserCategory_Returns400()
    {
        using var dbContext = CreateInMemoryDbContext();
        dbContext.Categories.Add(new Category { Id = 5, UserId = 2, Name = "User2 Category" });
        await dbContext.SaveChangesAsync();

        var controller = new TransactionsController(dbContext);
        SetUserContext(controller, 1); // User 1 trying to use User 2's category

        var request = new CreateTransactionRequest(100.00m, TransactionType.Expense, 5, new DateOnly(2026, 10, 1), "Lunch");
        var result = await controller.CreateTransaction(request, CancellationToken.None);

        var objectResult = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status400BadRequest, objectResult.StatusCode);
    }

    [Fact]
    public async Task Transactions_GetTransactionById_OtherUsersTransaction_Returns404()
    {
        using var dbContext = CreateInMemoryDbContext();
        dbContext.Categories.Add(new Category { Id = 1, UserId = 2, Name = "Tech" });
        dbContext.Transactions.Add(new Transaction
        {
            Id = 99,
            UserId = 2,
            CategoryId = 1,
            Amount = 150.00m,
            Type = TransactionType.Expense,
            Date = new DateOnly(2026, 10, 10)
        });
        await dbContext.SaveChangesAsync();

        var controller = new TransactionsController(dbContext);
        SetUserContext(controller, 1); // User 1 tries to access User 2's transaction

        var result = await controller.GetTransactionById(99, CancellationToken.None);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Transactions_GetTransactions_FiltersByMonthAndType_NewestFirst()
    {
        using var dbContext = CreateInMemoryDbContext();
        var cat = new Category { Id = 1, UserId = 1, Name = "General" };
        dbContext.Categories.Add(cat);

        dbContext.Transactions.AddRange(
            new Transaction { Id = 1, UserId = 1, CategoryId = 1, Amount = 10, Type = TransactionType.Expense, Date = new DateOnly(2026, 9, 30) },
            new Transaction { Id = 2, UserId = 1, CategoryId = 1, Amount = 20, Type = TransactionType.Expense, Date = new DateOnly(2026, 10, 1) },
            new Transaction { Id = 3, UserId = 1, CategoryId = 1, Amount = 50, Type = TransactionType.Income, Date = new DateOnly(2026, 10, 5) },
            new Transaction { Id = 4, UserId = 1, CategoryId = 1, Amount = 30, Type = TransactionType.Expense, Date = new DateOnly(2026, 10, 15) }
        );
        await dbContext.SaveChangesAsync();

        var controller = new TransactionsController(dbContext);
        SetUserContext(controller, 1);

        var result = await controller.GetTransactions(
            month: "2026-10",
            categoryId: null,
            type: TransactionType.Expense,
            page: 1,
            pageSize: 20,
            cancellationToken: CancellationToken.None
        );

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var pagedResult = Assert.IsType<PagedResult<TransactionDto>>(okResult.Value);

        Assert.Equal(2, pagedResult.TotalCount);
        Assert.Equal(2, pagedResult.Items.Count);
        // Newest first: Oct 15 before Oct 1
        Assert.Equal(4, pagedResult.Items[0].Id);
        Assert.Equal(2, pagedResult.Items[1].Id);
    }
}
