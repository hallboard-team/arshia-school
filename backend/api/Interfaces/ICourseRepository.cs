using api.DTOs.Helpers;

namespace api.Interfaces;

public interface ICourseRepository
{
    public Task<OperationResult<ShowCourseDto>> AddCourseAsync(CreateCourseDto managerInput, CancellationToken cancellationToken);
    public Task<OperationResult<PagedList<Course>>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<OperationResult<ShowCourseDto>> UpdateCourseAsync(UpdateCourseDto updateCourseDto, string targetCourseTitle, CancellationToken cancellationToken);
    public Task<OperationResult<ShowCourseDto>> GetCourseByTitleAsync(string courseTitle, CancellationToken cancellationToken);
    public Task<OperationResult<ShowCourseDto>> GetCourseByIdAsync(ObjectId courseId, CancellationToken cancellationToken);
    public Task<OperationResult> DeleteCourseAsync(string courseName, CancellationToken cancellationToken);
}