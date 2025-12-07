using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IManagerRepository
{
    Task<OperationResult> UpdateAccountAsync(ManagerUpdateProfile managerUpdateProfile, ObjectId userId, CancellationToken cancellationToken);
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
    Task<TargetMemberDto?> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken);
    public Task<OperationResult<MemberPhoto>> UploadMemberPhotoAsync(IFormFile file, string userName, CancellationToken cancellationToken);
    Task<Photo?> AddPhotoAsync(IFormFile file, string targetPaymentId, CancellationToken cancellationToken);
    Task<bool> DeletePhotoAsync(string targetPaymentId, CancellationToken cancellationToken);
    Task<List<CourseResponse>> GetTargetMemberCourseAsync(string targetUserName, CancellationToken cancellationToken);
    Task<EnrolledCourse?> GetTargetMemberEnrolledCourseAsync(string targetUserName, string courseTitle, CancellationToken cancellationToken);
    Task<Payment?> GetTargetPaymentByIdAsync(string targetPaymentId, CancellationToken cancellationToken);
    Task<List<string>> GetTargetCourseTitleAsync(string targetUserName, CancellationToken cancellationToken);
    Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, string targetMemberUserName, string targetCourseTitle, CancellationToken cancellationToken);
    Task<List<AppRole>> GetAllRoleAsync(CancellationToken cancellationToken);
}