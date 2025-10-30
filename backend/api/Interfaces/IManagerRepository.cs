namespace api.Interfaces;

public interface IManagerRepository
{
    Task<RegisteredUserDto?> CreateSecretaryAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<RegisteredUserDto?> CreateStudentAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<RegisteredUserDto?> CreateTeacherAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<PagedList<AppUser>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken);
    Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync();
    Task<EnrolledCourse?> AddEnrolledCourseAsync(AddEnrolledCourseDto managerInput, string targetUserName, CancellationToken cancellationToken);
    Task<UpdateResult?> UpdateEnrolledCourseAsync(UpdateEnrolledDto updateEnrolledDto, string targetUserName, CancellationToken cancellationToken);
    Task<DeleteResult?> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken);
    Task<List<AppUser>> GetAllTeachersAsync(CancellationToken cancellationToken);
    Task<MemberDto?> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken);
    Task<TargetMemberDto?> GetMemberByUserNameAsync(string targetUserName, CancellationToken cancellationToken);
    Task<bool> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken);
    Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken);
    Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken);
    Task<List<Course>> GetTargetMemberCourseAsync(string targetUserName, CancellationToken cancellationToken);
    Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(string targetUserName, string courseTitle, CancellationToken cancellationToken);
    Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken);
    Task<List<string>> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken);
    Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, string targetMemberUserName, string targetCourseTitle, CancellationToken cancellationToken);
}