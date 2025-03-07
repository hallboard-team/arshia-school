using api.Helpers;

namespace api.Interfaces;

public interface ICourseRepository
{
    public Task<ShowCourseDto> AddCourseAsync(AddCourseDto managerInput, CancellationToken cancellationToken);
    public Task<PagedList<Course>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    // public Task<PagedList<ShowCourseDto>> GetAllAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<bool> UpdateCourseAsync(UpdateCourseDto updateCourseDto, string targetCourseTitle, CancellationToken cancellationToken);
    public Task<bool> AddProfessorToCourseAsync(string targetCourseTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<bool> RemoveProfessorFromCourseAsync(string targetCourseTitle, string professorName, CancellationToken cancellationToken);
    public Task<ShowCourseDto?> GetCourseByTitleAsync(string courseTitle, CancellationToken cancellationToken);
}