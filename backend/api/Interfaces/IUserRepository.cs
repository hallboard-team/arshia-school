using api.DTOs.Helpers;

namespace api.Interfaces;

public interface IUserRepository
{
    public Task<OperationResult<MemberPhoto>> AddProflePhotoAsync(IFormFile formFile, ObjectId? userId, CancellationToken cancellationToken);
}