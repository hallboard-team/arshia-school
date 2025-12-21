using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IAdminRepository
{
    public Task<OperationResult<LoggedInDto>> CreateAsync(RegisterDto adminInput, CancellationToken cancellationToken);
}