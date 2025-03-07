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
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.collectionUsers);

        _userManager = userManager;
        _tokenService = tokenService;
    }
    #endregion Vars and Constructor


    public async Task<LoggedInDto?> CreateAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        LoggedInDto loggedInDto = new();

        bool doaseNameExist = await _collectionAppUser.Find<AppUser>(doc =>
            doc.Name == registerDto.Name).AnyAsync(cancellationToken);

        if (doaseNameExist) return null;

        AppUser appUser = Mappers.ConvertRegisterDtoToAppUser(registerDto);

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (userCreatedResult.Succeeded)
        {
            IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "manager");

            if (!roleResult.Succeeded)
                return loggedInDto;

            string? token = await _tokenService.CreateToken(appUser, cancellationToken);

            if (!string.IsNullOrEmpty(token))
            {
                return Mappers.ConvertAppUserToLoggedInDto(appUser, token);
            }
        }
        else
        {
            foreach (IdentityError error in userCreatedResult.Errors)
            {
                loggedInDto.Errors.Add(error.Description);
            }
        }

        return loggedInDto;
    }

    // public async Task<IEnumerable<UserWithRoleDto>> GetUsersWithRolesAsync()
    // {
    //     List<UserWithRoleDto> usersWithRoles = [];

    //     IEnumerable<AppUser> appUsers = _userManager.Users;

    //     foreach (AppUser appUser in appUsers)
    //     {
    //         IEnumerable<string> roles = await _userManager.GetRolesAsync(appUser);

    //         usersWithRoles.Add(
    //             new UserWithRoleDto(
    //                 UserName: appUser.UserName!,
    //                 Roles: roles
    //             )
    //         );
    //     }

    //     return usersWithRoles;
    // }
    
    // public async Task<UpdateResult?> SetTeacherRoleAsync(string targetStudentUserName, CancellationToken cancellationToken)
    // {
    //     ObjectId? studentId = await GetObjectIdByUserNameAsync(targetStudentUserName, cancellationToken);

    //     if (studentId is null)
    //         return null;

    //     FilterDefinition<AppUser>? filterOld = Builders<AppUser>.Filter
    //         .Where(appUser =>
    //             appUser.Id == studentId && appUser.Roles.Any<AppRole>(role => role.Name == "student"));

    //     UpdateDefinition<AppUser>? updateOld = Builders<AppUser>.Update
    //         .Set(appUser => appUser.Roles.FirstMatchingElement().Name, "teacher");

    //     return await _collectionAppUser.UpdateOneAsync(filterOld, updateOld, null, cancellationToken);

    // }

}
