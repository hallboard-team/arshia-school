namespace api.Repositories;

public class SecretaryRepository : ISecretaryRepository
{
     #region Vars and Constructor
    private readonly IMongoCollection<AppUser>? _collectionAppUser;
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;

    public SecretaryRepository(IMongoClient client, ITokenService tokenService, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager)
    {
        var database = client.GetDatabase(dbSettings.DatabaseName);
        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.collectionUsers);

        _userManager = userManager;
        _tokenService = tokenService;
    }
    #endregion Vars and Constructor

    public async Task<LoggedInDto?> CreateStudentAsync(RegisterDto registerDto, CancellationToken cancellationToken)
    {
        LoggedInDto loggedInDto = new();

        bool doasePhoneNumEixst = await _collectionAppUser.Find<AppUser>(doc =>
            doc.PhoneNum == registerDto.PhoneNum).AnyAsync(cancellationToken);

        if (doasePhoneNumEixst) return null;

        AppUser appUser = Mappers.ConvertRegisterDtoToAppUser(registerDto);

        IdentityResult? userCreatedResult = await _userManager.CreateAsync(appUser, registerDto.Password);

        if (userCreatedResult.Succeeded)
        {
            IdentityResult? roleResult = await _userManager.AddToRoleAsync(appUser, "student");

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

    // public async Task<AppUser?> GetByObjectIdAsync(ObjectId studentId, CancellationToken cancellationToken)
    // {
    //     AppUser? appUser = await _collectionAppUser.Find<AppUser>(doc
    //         => doc.Id == studentId).SingleOrDefaultAsync(cancellationToken);

    //     if (appUser is null)
    //         return null;

    //     return appUser;
    // }

    // public async Task<AddCorse?> AddCorseAsync(AddCorseDto addCorseDto, string targetStudentUserName, CancellationToken cancellationToken)
    // {
    //     ObjectId studentId = await _collectionAppUser.AsQueryable()
    //         .Where(doc => doc.UserName == targetStudentUserName)
    //         .Select(doc => doc.Id)
    //         .FirstOrDefaultAsync();

    //     AppUser? appUser = await GetByObjectIdAsync(studentId, cancellationToken);
    //     if (appUser is null)
    //         return null; 

    //     AddCorse addCorse;

    //     addCorse = Mappers.ConvertAddCorseDtoToCorse(addCorseDto);

    //     if (addCorse is not null)
    //     {
    //         appUser.addCorses.Add(addCorse);

    //         var updatedAppUser = Builders<AppUser>.Update
    //             .Set(doc => doc.addCorses, appUser.addCorses);

    //         UpdateResult result = await _collectionAppUser.UpdateOneAsync<AppUser>(doc =>
    //             doc.Id == studentId, updatedAppUser, null, cancellationToken);

    //         if (result is not null)
    //             return addCorse;          
    //     }
        
    //     return null;
    // }
}