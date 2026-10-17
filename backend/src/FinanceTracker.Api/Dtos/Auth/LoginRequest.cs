using System.ComponentModel.DataAnnotations;

namespace FinanceTracker.Api.Dtos.Auth;

public record LoginRequest(
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    string Email,

    [Required(ErrorMessage = "Password is required.")]
    string Password
);
