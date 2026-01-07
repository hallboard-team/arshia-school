using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IManagerRepository
{
    Task<OperationResult> UpdateAccountAsync(ManagerUpdateProfile managerUpdateProfile, ObjectId userId, CancellationToken cancellationToken);
    Task<OperationResult<RegisteredUserDto>> CreateSecretaryAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<OperationResult<RegisteredUserDto>> CreateStudentAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<OperationResult<RegisteredUserDto>> CreateTeacherAsync(RegisterDto managerInput, CancellationToken cancellationToken);
    Task<OperationResult<PagedList<AppUser>>> GetAllAsync(MemberParams memberParams, CancellationToken cancellationToken);
    Task<OperationResult<IEnumerable<UserWithRoleDto>>> GetUsersWithRolesAsync();
    Task<OperationResult<EnrolledClassRoom>> AddEnrolledClassAsync(AddEnrolledClassRoomDto managerInput, string targetUserName, CancellationToken cancellationToken);
    Task<OperationResult> UpdateEnrolledClassAsync(UpdateEnrolledDto updateEnrolledDto, string targetUserName, CancellationToken cancellationToken);
    Task<OperationResult> DeleteAsync(string targetMemberUserName, CancellationToken cancellationToken);
    Task<OperationResult<List<AppUser>>> GetAllTeachersAsync(CancellationToken cancellationToken);
    Task<OperationResult<MemberDto>> GetMemberByEmailAsync(string targetMemberEmail, CancellationToken cancellationToken);
    Task<OperationResult<TargetMemberDto>> GetMemberByUserNameAsync(string targetUserName, CancellationToken cancellationToken);
    Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken);
    public Task<OperationResult<MemberPhoto>> UploadMemberPhotoAsync(IFormFile file, string userName, CancellationToken cancellationToken);
    Task<OperationResult<Photo>> AddPhotoAsync(IFormFile file, ObjectId targetPaymentId, CancellationToken cancellationToken);
    Task<OperationResult> DeletePhotoAsync(ObjectId targetPaymentId, CancellationToken cancellationToken);
    Task<OperationResult<List<ShowClassRoomDto>>> GetTargetMemberClassesAsync(string targetUserName, CancellationToken cancellationToken);
    Task<OperationResult<EnrolledClassRoom>> GetTargetMemberEnrolledClassAsync(string targetUserName, string classTitle, CancellationToken cancellationToken);
    Task<OperationResult<Payment>> GetTargetPaymentByIdAsync(ObjectId targetPaymentId, CancellationToken cancellationToken);
    Task<OperationResult<List<string>>> GetTargetClassTitlesAsync(string targetUserName, CancellationToken cancellationToken);
    Task<OperationResult<PagedList<Attendance>>> GetAllAttendanceAsync(AttendanceParams attendenceParams, string targetMemberUserName, string targetClassTitle, CancellationToken cancellationToken);
    Task<OperationResult<List<AppRole>>> GetAllRoleAsync(CancellationToken cancellationToken);
}