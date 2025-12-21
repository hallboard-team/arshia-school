using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IClassRoomRepository
{
    public Task<OperationResult<ShowClassRoomDto>> CreateClassRoomAsync(CreateClassRoomDto request, CancellationToken cancellationToken);
    public Task<PagedList<ClassRoom>> GetAllClassRoomsAsync(PaginationParams paginationParams, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassRoomDto>> GetClassRoomByNameAsync(string classRoomName, CancellationToken cancellationToken);
    public Task<List<string>> GetProfessorUserNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<List<string>> GetProfessorNamesByIdsAsync(List<ObjectId> professorIds, CancellationToken cancellationToken);
    public Task<OperationResult<ShowClassRoomDto>> UpdateClassRoomAsync(string classRoomName, UpdateClassRoomDto updateClassDto, CancellationToken cancellationToken);
    public Task<OperationResult> AddProfessorToClassRoomAsync(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<OperationResult> RemoveProfessorFromClassRoomAsync(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken);
    public Task<ObjectId?> GetClassRoomIdByName(string classRoomName, CancellationToken cancellationToken);
}