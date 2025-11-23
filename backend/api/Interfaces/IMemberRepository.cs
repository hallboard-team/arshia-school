using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IMemberRepository
{
    public Task<ProfileDto?> GetProfileAsync(string HashedUserId, CancellationToken cancellationToken);
    public Task<PagedList<Attendence>> GetAllAttendenceAsync(AttendenceParams attendenceParams, ObjectId? userId, string targetCourseTitle, CancellationToken cancellationToken);
    public Task<OperationResult<TargetMemberDto>> UpdateMemberAsync(MemberUpdateDto memberUpdateDto, ObjectId userId, CancellationToken cancellationToken);
    public Task<List<Course>> GetCourseAsync(string HashedUserId, CancellationToken cancellationToken);
    public Task<EnrolledCourse?> GetEnrolledCourseAsync(string HashedUserId, string courseTitle, CancellationToken cancellationToken);
}