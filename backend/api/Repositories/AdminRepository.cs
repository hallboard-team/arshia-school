using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class AdminRepository : IAdminRepository
{
    #region Vars and Constructor
    private readonly IMongoCollection<AppUser>? _collectionAppUser;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;

    public AdminRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);

        _userManager = userManager;
        _tokenService = tokenService;
    }
    #endregion Vars and Constructor

    public async Task<OperationResult<LoggedInDto>> CreateAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        bool doaseNameExist = await _collectionAppUser.Find<AppUser>(doc =>
            doc.NormalizedEmail == registerDto.Email).AnyAsync(cancellationToken);

        if (doaseNameExist)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateUser,
                    "User already exist"
                )
            );
        }

        AppUser appUser = Mappers.ConvertRegisterDtoToAppUser(registerDto);

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (!userCreatedResult.Succeeded)
        {
            string? errorMessages = string.Join(",", userCreatedResult.Errors.Select(e => e.Description));
            return new(
                false,
                Error: new(
                    ErrorCode.IsIdentityFailed,
                    errorMessages
                )
            );
        }

        IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "manager");
        if (!roleResult.Succeeded)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsRoleIdentityFailed,
                    "Assigning role failed."
                )
            );
        }

        string? token = await _tokenService.CreateToken(appUser, cancellationToken);
        if (string.IsNullOrEmpty(token))
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsTokenGenerationFailed,
                    "User created but token generation failed."
                )
            );
        }

        return new(
            true,
            Mappers.ConvertAppUserToLoggedInDto(appUser, token),
            null
        );
    }
}