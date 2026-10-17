using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Dtos.Transactions;

public record CreateTransactionRequest(
    [Required(ErrorMessage = "Amount is required.")]
    [Range(0.01, 9999999999.99, ErrorMessage = "Amount must be greater than 0.")]
    decimal Amount,

    [Required(ErrorMessage = "Transaction type is required.")]
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    TransactionType Type,

    [Required(ErrorMessage = "CategoryId is required.")]
    int CategoryId,

    [Required(ErrorMessage = "Date is required.")]
    DateOnly Date,

    [MaxLength(255, ErrorMessage = "Note must not exceed 255 characters.")]
    string? Note
);
