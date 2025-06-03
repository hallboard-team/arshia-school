using api.Helpers;

namespace api.Interfaces;

public interface IManagerRepository
{
    public Task<LoggedInDto?> CreateSecretaryAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<LoggedInDto?> CreateStudentAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<LoggedInDto?> CreateTeacherAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    public Task<PagedList<AppUser>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken);
    public Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync();
    public Task<EnrolledCourse> AddEnrolledCourseAsync(AddEnrolledCourseDto managerInput, string targetUserName, CancellationToken cancellationToken);
    public Task<UpdateResult?> UpdateEnrolledCourseAsync(UpdateEnrolledDto updateEnrolledDto, string targetUserName, CancellationToken cancellationToken);
    public Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken);
    public Task<List<AppUser>> GetAllTeachersAsync(CancellationToken cancellationToken);
    public Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken);
    public Task<TargetMemberDto?> GetMemberByUserNameAsync(string targetUserName, CancellationToken cancellationToken);
    public Task<bool> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken);
    public Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken);
    public Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken);
    public Task<List<Course?>> GetTargetMemberCourseAsync(string targetUserName, CancellationToken cancellationToken);
    public Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(string targetUserName, string courseTitle, CancellationToken cancellationToken);
    public Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken);
    public Task<List<string>> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken);
}