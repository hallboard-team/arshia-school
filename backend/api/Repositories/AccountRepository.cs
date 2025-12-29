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

  public async Task<OperationResult<LoggedInDto>> LoginAsync(LoginDto userInput, CancellationToken cancellationToken)
  {
    AppUser? appUser;

    appUser = await _userManager.FindByEmailAsync(userInput.Email);

    if (appUser is null)
    {
      return new(
        false,
        Error: new(
          ErrorCode.IsWrongCreds,
          "Wrong Credentials"
        )
      );
    }

    bool isPassCorrect = await _userManager.CheckPasswordAsync(appUser, userInput.Password);

    if (!isPassCorrect)
    {
      return new(
        false,
        Error: new(
          ErrorCode.IsWrongCreds,
          "Wrong Credentials"
        )
      );
    }

    string? token = await _tokenService.CreateToken(appUser, cancellationToken);

    if (!string.IsNullOrEmpty(token))
    {
      return new(
        true,
        Mappers.ConvertAppUserToLoggedInDto(appUser, token),
        null
      );
    }

    return new(
      false,
      Error: new(
        ErrorCode.IsTokenGenerationFailed,
        "System encountered an issue generating your access token"
      )
    );
  }

  public async Task<OperationResult<LoggedInDto>> ReloadLoggedInUserAsync(string hashedUserId, string token, CancellationToken cancellationToken)
  {
    ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

    if (userId is null)
    {
      return new(
        false,
        Error: new(
          ErrorCode.IsInvalidUserReference,
          "The user identifier is corrupted or invalid."
        )
      );
    }

    AppUser appUser = await _collectionAppUser.Find<AppUser>(appUser => appUser.Id == userId).FirstOrDefaultAsync(cancellationToken);

    if (appUser is null)
    {
      return new(
        false,
        Error: new(
          ErrorCode.IsUserNotFound,
          "User not found"
        )
      );
    }

    return new(
      true,
      Mappers.ConvertAppUserToLoggedInDto(appUser, token),
      null
    );
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
          ErrorCode.IsNotFound,
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