using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IAccountRepository
{
    public Task<LoggedInDto> LoginAsync(LoginDto userInput, CancellationToken cancellationToken);
    public Task<LoggedInDto?> ReloadLoggedInUserAsync(string hashedUserId, string token, CancellationToken cancellationToken);
    public Task<OperationResult> UpdatePasswordAsync(PasswordDto request, ObjectId userId, CancellationToken cancellationToken);
}