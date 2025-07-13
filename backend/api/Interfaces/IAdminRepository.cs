namespace api.Interfaces;

public interface IAdminRepository
{
    public Task<LoggedInDto?> CreateAsync(RegisterDto adminInput, CancellationToken cancellationToken);
}