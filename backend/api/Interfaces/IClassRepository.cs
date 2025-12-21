using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IClassRepository
{
    public Task<OperationResult<ShowClassDto>> CreateClassAsync(CreateClassDto request, CancellationToken cancellationToken);
    public Task<OperationResult<PagedList<Class>>> GetAllClassesAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassDto>> GetClassByNameAsync(string className, CancellationToken cancellationToken);
    public Task<OperationResult<IEnumerable<string>>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<OperationResult<IEnumerable<string>>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassDto>> UpdateClassAsync(string className, UpdateClassDto updateClassDto, CancellationToken cancellationToken);
    public Task<OperationResult> AddProfessorToClassAsync(string targetClassTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<OperationResult> RemoveProfessorFromClassAsync(string targetClassTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<OperationResult<ObjectId>> GetClassIdByName(string className, CancellationToken cancellationToken);
}