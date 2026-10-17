using System.Text.Json.Serialization;
using FinanceTracker.Api.Models;

namespace FinanceTracker.Api.Dtos.Transactions;

public record TransactionDto(
    int Id,
    decimal Amount,
    [property: JsonConverter(typeof(JsonStringEnumConverter))]
    TransactionType Type,
    int CategoryId,
    string CategoryName,
    DateOnly Date,
    string? Note
);
