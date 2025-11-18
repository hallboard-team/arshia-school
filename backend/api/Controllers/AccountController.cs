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
        LoggedInDto? loggedInDto = await _accountRepository.LoginAsync(userInput, cancellationToken);

        return !string.IsNullOrEmpty(loggedInDto.Token)
            ? Ok(loggedInDto)
            : loggedInDto.IsWrongCreds //inja shart BadRequest ro minevisim
            ? Unauthorized("Wrong email or password")
            : BadRequest("Registration has failed try again.");
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
        LoggedInDto? loggedInDto = await _accountRepository.ReloadLoggedInUserAsync(hashedUserId, token, cancellationToken);

        return loggedInDto is null ? Unauthorized("User is logged out or unauthorized. Login again.") : loggedInDto;
    }

    [HttpPut("update-password")]
    public async Task<ActionResult<Response>> UpdatePassword(PasswordDto request, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("شما لاگین نیستید. دوباره لاگین کنید.");

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return Unauthorized("Please login again");

        OperationResult opResult = await _accountRepository.UpdatePasswordAsync(request, userId.Value, cancellationToken);

        return opResult.IsSuccess
            ? Ok(new Response("Password successfully updated"))
            : opResult.Error?.Code switch
            {
                ErrorCode.IsPasswordInvalid => BadRequest(opResult.Error.Message),
                ErrorCode.ArePasswordsNotMatch => BadRequest(opResult.Error.Message),
                ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed. Try again or contact support.")
            };
    }

}
