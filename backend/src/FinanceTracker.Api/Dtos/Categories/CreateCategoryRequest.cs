using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Dtos.Categories;

public record CreateCategoryRequest(
    [Required(ErrorMessage = "Category name is required.")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Category name must be between 1 and 50 characters.")]
    string Name
);
