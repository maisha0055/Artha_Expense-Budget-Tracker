using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Dtos.Auth;

public record RegisterRequest(
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters.")]
    string Name,

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    [StringLength(255, ErrorMessage = "Email must not exceed 255 characters.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long.")]
    [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{8,}$", 
        ErrorMessage = "Password must be at least 8 characters long and contain at least one letter and one number.")]
    string Password
);
