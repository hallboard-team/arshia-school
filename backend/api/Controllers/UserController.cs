using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

public class UserController(ITokenService _tokenService, IUserRepository _userRepository) : BaseApiController
{
    [HttpPost("add-photo")]
    public async Task<ActionResult<MemberPhoto>> AddProfilePhoto(
        [AllowedFileExtensions, FileSize(250_000, 4_000_000)]
        IFormFile file, CancellationToken cancellationToken
    )
    {
        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("You are not logged in. Please login again");

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);
        
        if(userId is null)
            return Unauthorized();

        OperationResult<MemberPhoto> opResult = await _userRepository.AddProflePhotoAsync(file, userId, cancellationToken);    

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsOperationFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("Opration failed. Try again or contact supprot")
            };
    }
}