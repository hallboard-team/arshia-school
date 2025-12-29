using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredAdminRole")]
public class AdminController(IAdminRepository _adminRepository) : BaseApiController
{
    [HttpPost("add-manager")]
    public async Task<ActionResult<LoggedInDto>> Create(RegisterDto adminInput, CancellationToken cancellationToken)
    {
        if (adminInput.Password != adminInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        OperationResult<LoggedInDto> opResult = await _adminRepository.CreateAsync(adminInput, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsDuplicateUser => BadRequest(opResult.Error.Message),
            ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
            ErrorCode.IsRoleIdentityFailed => BadRequest(opResult.Error.Message),
            ErrorCode.IsTokenGenerationFailed => throw new Exception("Internal error in token issuance"),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }
}