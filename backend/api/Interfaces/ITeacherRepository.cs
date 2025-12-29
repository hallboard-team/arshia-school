namespace api.Interfaces;

public interface ITeacherRepository
{
    Task<List<ClassRoom>> GetClassesAsync(string hashedUserId, CancellationToken cancellationToken);
    Task<ShowStudentStatusDto?> AddAsync(AddStudentStatusDto teacherInput, string targetCourseTitle, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(ObjectId userId, string targetUserName, string targetCourseTitle, DateOnly currentDate, CancellationToken cancellationToken);
    Task<PagedList<AppUser>> GetAllAsync(PaginationParams paginationParams, string targetTitle, string hashedUserId, CancellationToken cancellationToken);
    Task<Dictionary<ObjectId, bool>> CheckIsAbsentAsync(List<ObjectId> studentIds, ObjectId courseId, CancellationToken cancellationToken);
}