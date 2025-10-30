namespace api.Controllers;

[Authorize(Policy = "RequiredAdminRole")]
public class AdminController(IAdminRepository _adminRepository) : BaseApiController
{
    [HttpPost("add-manager")]
    public async Task<ActionResult<LoggedInDto>> Create(RegisterDto adminInput, CancellationToken cancellationToken)
    {
        if (adminInput.Password != adminInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        LoggedInDto? loggedInDto = await _adminRepository.CreateAsync(adminInput, cancellationToken);

        return loggedInDto switch
        {
            null => BadRequest("ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."),
            { Token: not null and not "" } => Ok(loggedInDto),
            { Errors.Count: > 0 } => BadRequest(loggedInDto.Errors),
            _ => BadRequest("ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.")
        };
    }
}