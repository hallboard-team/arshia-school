namespace api.Interfaces;

public interface ISecretaryRepository
{
    public Task<LoggedInDto?> CreateStudentAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    // public Task<AddCorse?> AddCorseAsync(AddCorseDto managerInput, string targetStudentUserName, CancellationToken cancellationToken);
}