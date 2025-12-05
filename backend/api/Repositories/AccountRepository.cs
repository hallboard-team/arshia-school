using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class AccountRepository : IAccountRepository
{
  #region Vars and Constructor
  private readonly IMongoCollection<AppUser>? _collectionAppUser;
  private readonly UserManager<AppUser> _userManager;
  private readonly ITokenService _tokenService;

  public AccountRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager)
  {
    var database = client.GetDatabase(dbSettings.DatabaseName);
    _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
    _userManager = userManager;
    _tokenService = tokenService;
  }
  #endregion Vars and Constructor

  public async Task<LoggedInDto> LoginAsync(LoginDto userInput, CancellationToken cancellationToken)
  {
    LoggedInDto loggedInDto = new();

    AppUser? appUser;

    appUser = await _userManager.FindByEmailAsync(userInput.Email);

    if (appUser is null)
    {
      loggedInDto.IsWrongCreds = true;
      return loggedInDto;
    }

    bool isPassCorrect = await _userManager.CheckPasswordAsync(appUser, userInput.Password);

    if (!isPassCorrect)
    {
      loggedInDto.IsWrongCreds = true;
      return loggedInDto;
    }

    string? token = await _tokenService.CreateToken(appUser, cancellationToken);

    if (!string.IsNullOrEmpty(token))
    {
      return Mappers.ConvertAppUserToLoggedInDto(appUser, token);
    }

    return loggedInDto;
  }

  public async Task<LoggedInDto?> ReloadLoggedInUserAsync(string hashedUserId, string token, CancellationToken cancellationToken)
  {
    ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

    if (userId is null)
      return null;

    AppUser appUser = await _collectionAppUser.Find<AppUser>(appUser => appUser.Id == userId).FirstOrDefaultAsync(cancellationToken);

    return appUser is null
        ? null
        : Mappers.ConvertAppUserToLoggedInDto(appUser, token);
  }

  public async Task<OperationResult> UpdatePasswordAsync(PasswordDto request, ObjectId userId, CancellationToken cancellationToken)
  {
    if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword) || string.IsNullOrWhiteSpace(request.ConfirmPassword))
    {
      return new OperationResult(
        false,
        new CustomError(
          ErrorCode.IsPasswordInvalid,
          "برای تغییر رمز عبور، هر سه فیلد باید تکمیل شوند."
        )
      );
    }

    if (request.NewPassword != request.ConfirmPassword)
    {
      return new OperationResult(
        false,
        new CustomError(
          ErrorCode.ArePasswordsNotMatch,
          "رمز عبور جدید و تکرار رمز عبور یکسان نمی باشد."
        )
      );
    }

    AppUser? appUser = await _userManager.FindByIdAsync(userId.ToString());
    if (appUser is null)
    {
      return new OperationResult(
        false,
        new CustomError(
          ErrorCode.IsUserNotFound,
          "کاربر پیدا نشد."
        )
      );
    }

    IdentityResult? result = await _userManager.ChangePasswordAsync(appUser, request.CurrentPassword, request.NewPassword);
    if (!result.Succeeded)
    {
      string Message = string.Join(" | ", result.Errors.Select(e => e.Description));

      Message = "خطا در تغییر رمز عبور. لطفا دوباره تلاش کنید.";

      return new OperationResult(
        false,
        new CustomError(
          ErrorCode.IsIdentityFailed, Message
        )
      );
    }

    return new OperationResult(
      true,
      null
    );
  }
}