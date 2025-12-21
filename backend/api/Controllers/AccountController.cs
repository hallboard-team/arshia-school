using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize]
public class AccountController(IAccountRepository _accountRepository, ITokenService _tokenService) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoggedInDto>> Login(LoginDto userInput, CancellationToken cancellationToken)
    {
        OperationResult<LoggedInDto>? opResult = await _accountRepository.LoginAsync(userInput, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsWrongCreds => BadRequest(opResult.Error.Message),
                ErrorCode.IsTokenGenerationFailed => throw new Exception("Internal error in token issuance"),
                _ => BadRequest("Operation failed! Try again or contact support.")
            };
    }

    [HttpGet]
    public async Task<ActionResult<LoggedInDto>> ReloadLoggedInUser(CancellationToken cancellationToken)
    {
        // obtain token value
        string? token = null;

        bool isTokenValid = HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader);

        if (isTokenValid)
            token = authHeader.ToString().Split(' ').Last();

        if (string.IsNullOrEmpty(token))
            return Unauthorized("Token is expired or invalid. Login again.");

        // obtain userId
        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this user Id.");

        // get loggedInDto
        OperationResult<LoggedInDto> opResult = await _accountRepository.ReloadLoggedInUserAsync(hashedUserId, token, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsInvalidUserReference => Unauthorized(opResult.Error.Message),
            ErrorCode.IsUserNotFound => Unauthorized(opResult.Error.Message),
            _ => BadRequest("Opersstion failed! Try again or contact support.")  
        };
    }

    [HttpPut("update-password")]
    public async Task<ActionResult<Response>> UpdatePassword(PasswordDto request, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("شما ورود نکرده اید. لطفا ابتدا ورود کنید.");

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return Unauthorized("لطفا وارد شوید.");

        OperationResult opResult = await _accountRepository.UpdatePasswordAsync(request, userId.Value, cancellationToken);

        return opResult.IsSuccess
            ? Ok(new Response("رمز عبور با موفقیت بروزرسانی شد."))
            : opResult.Error?.Code switch
            {
                ErrorCode.IsPasswordInvalid => BadRequest(opResult.Error.Message),
                ErrorCode.ArePasswordsNotMatch => BadRequest(opResult.Error.Message),
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("عملیات انجام نشد. دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.")
            };
    }

}
