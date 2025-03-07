using api.Helpers;

namespace api.Interfaces;

public interface ITeacherRepository
{
    public Task<List<Course?>> GetCourseAsync(string hashedUserId, CancellationToken cancellationToken);
    public Task<ShowStudentStatusDto> AddAsync(AddStudentStatusDto teacherInput, string targetCourseTitle, CancellationToken cancellationToken);
    public Task<bool> DeleteAsync(ObjectId userId, string targetUserName, string targetCourseTitle, DateOnly currentDate, CancellationToken cancellationToken);
    // public Task<List<string>> GetAbsentStudentsAsync(string targetCourseTitle, CancellationToken cancellationToken);
    public Task<PagedList<AppUser>> GetAllAsync(PaginationParams paginationParams, string targetTitle, string hashedUserId, CancellationToken cancellationToken);
    public Task<Dictionary<ObjectId, bool>> CheckIsAbsentAsync(List<ObjectId> studentIds, ObjectId courseId, CancellationToken cancellationToken);
}