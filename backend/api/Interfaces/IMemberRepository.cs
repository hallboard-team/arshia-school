using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IMemberRepository
{
    public Task<ProfileDto?> GetProfileAsync(string hashedUserId, CancellationToken cancellationToken);
    public Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, ObjectId? userId, string targetClassTitle, CancellationToken cancellationToken);
    public Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(MemberUpdateDto memberUpdateDto, ObjectId userId, CancellationToken cancellationToken);
    public Task<List<Class>> GetClassAsync(string hashedUserId, CancellationToken cancellationToken);
    public Task<EnrolledClass?> GetEnrolledCourseAsync(string hashedUserId, string courseTitle, CancellationToken cancellationToken);
}