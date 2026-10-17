namespace FinanceTracker.Api.Exceptions;

public class EmailAlreadyExistsException : Exception
{
    public EmailAlreadyExistsException(string message = "A user with this email already exists.") 
        : base(message)
    {
    }
}

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException(string message = "Invalid email or password.") 
        : base(message)
    {
    }
}
