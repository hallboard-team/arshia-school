using api.DTOs.Helpers;

namespace api.Interfaces;

public interface ITeacherRepository
{
    Task<OperationResult<List<Class>>> GetClassesAsync(string hashedUserId, CancellationToken cancellationToken);
    Task<OperationResult<ShowStudentStatusDto>> AddAsync(AddStudentStatusDto teacherInput, string targetCourseTitle, CancellationToken cancellationToken);
    Task<OperationResult> DeleteAsync(ObjectId userId, string targetUserName, string targetCourseTitle, DateOnly currentDate, CancellationToken cancellationToken);
    Task<OperationResult<PagedList<AppUser>>> GetAllAsync(PaginationParams paginationParams, string targetTitle, string hashedUserId, CancellationToken cancellationToken);
    Task<Dictionary<ObjectId, bool>> CheckIsAbsentAsync(List<ObjectId> studentIds, ObjectId courseId, CancellationToken cancellationToken);
}