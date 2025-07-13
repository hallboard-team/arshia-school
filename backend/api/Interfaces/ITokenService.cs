namespace api.Interfaces;

public interface ITokenService
{
    public Task<string?> CreateToken(AppUser user, CancellationToken cancellationToken);
    public Task<ObjectId?> GetActualUserIdAsync(string? userIdHashed, CancellationToken cancellationToken);
}