using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IMemberRepository
{
    public Task<OperationResult<ProfileDto>> GetProfileAsync(string hashedUserId, CancellationToken cancellationToken);
    public Task<OperationResult<PagedList<Attendance>>> GetAllAttendenceAsync(AttendanceParams attendenceParams, ObjectId? userId, string targetClassTitle, CancellationToken cancellationToken);
    public Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(MemberUpdateDto memberUpdateDto, ObjectId userId, CancellationToken cancellationToken);
    public Task<OperationResult<List<ClassRoom>>> GetClassesAsync(string hashedUserId, CancellationToken cancellationToken);
    public Task<OperationResult<EnrolledClassRoom>> GetEnrolledCourseAsync(string hashedUserId, string courseTitle, CancellationToken cancellationToken);
}