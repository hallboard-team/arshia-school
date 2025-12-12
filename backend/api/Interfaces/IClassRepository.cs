using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IClassRepository
{
    public Task<OperationResult<ShowClassDto>> CreateClassAsync(CreateClassDto request, CancellationToken cancellationToken);
    public Task<PagedList<Class>> GetAllClassAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassDto>> GetClassByNameAsync(string className, CancellationToken cancellationToken);
    public Task<List<string>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassDto>> UpdateClassAsync(string className, UpdateClassDto updateClassDto, CancellationToken cancellationToken);
    public Task<OperationResult> AddProfessorToClassAsync(string targetClassTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<OperationResult> RemoveProfessorFromClassAsync(string targetClassTitle, string professorName, CancellationToken cancellationToken);
    public Task<ObjectId?> GetClassIdByName(string className, CancellationToken cancellationToken);
}