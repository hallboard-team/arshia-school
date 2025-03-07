using api.Helpers;

namespace api.Interfaces;

public interface IManagerRepository
{
    public Task<LoggedInDto?> CreateSecretaryAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<LoggedInDto?> CreateStudentAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<LoggedInDto?> CreateTeacherAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<PagedList<AppUser>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync();
    public Task<EnrolledCourse> AddEnrolledCourseAsync(AddEnrolledCourseDto managerInput, string targetUserName, CancellationToken cancellationToken);
    public Task<UpdateResult?> UpdateEnrolledCourseAsync(UpdateEnrolledDto updateEnrolledDto, string targetUserName, IFormFile file, CancellationToken cancellationToken);
    public Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken);
    public Task<List<AppUser>> GetAllTeachersAsync(CancellationToken cancellationToken);
    public Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken);
    public Task<bool> UpdateMemberAsync(string targetMemberEmail, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken);
    public Task<Photo?> AddPhotoAsync(IFormFile file, ObjectId targetPaymentId, CancellationToken cancellationToken);
    public Task<bool> DeletePhotoAsync(ObjectId targetPaymentId, CancellationToken cancellationToken);
}