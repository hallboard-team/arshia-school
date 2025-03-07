namespace api.Interfaces;

public interface IAdminRepository
{
    public Task<LoggedInDto?> CreateAsync(RegisterDto adminInput, CancellationToken cancellationToken);
    // public Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync();
    
    // public Task<UpdateResult?> SetTeacherRoleAsync(string targetStudentUserName, CancellationToken cancellationToken);
}