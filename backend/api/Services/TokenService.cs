namespace api.Services;

public class TokenService : ITokenService
{
  private readonly IMongoCollection<AppUser> _collection;
  private readonly string? _tokenValue;
  private readonly UserManager<AppUser> _userManager;

  public TokenService(
    IConfiguration config, IMongoClient client, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager
  )
  {
    IMongoDatabase? database = client.GetDatabase(dbSettings.DatabaseName);
    _collection = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);

    _tokenValue = config.GetValue<string>(AppVariablesExtensions.TokenKey);

    _userManager = userManager;
  }

  public async Task<string?> CreateToken(AppUser appUser, CancellationToken cancellationToken)
  {
    SymmetricSecurityKey key = GenerateAndGetKey(_tokenValue);

    string? userIdHashed = await GenerateAndStoreHashedId(appUser.Id, cancellationToken);

    if (string.IsNullOrEmpty(userIdHashed))
      return null;

    var claims = new List<Claim>
    {
      new(JwtRegisteredClaimNames.NameId, userIdHashed)
    };

    IList<string>? roles = await _userManager.GetRolesAsync(appUser);
    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

    var tokenDescriptor = new SecurityTokenDescriptor
    {
      Subject = new ClaimsIdentity(claims),
      Expires = DateTime.Now.AddDays(value: 7),
      SigningCredentials = creds
    };

    var tokenHandler = new JwtSecurityTokenHandler();

    SecurityToken? securityToken = tokenHandler.CreateToken(tokenDescriptor);

    if (securityToken is null) return null;

    return tokenHandler.WriteToken(securityToken);
  }

  // /// <summary>
  // /// Gets a string hashedUserId of the token and returns the user's actual ObjectId from DB
  // /// OR returns null if conversion failes.
  // /// </summary>
  // /// <param name="userIdHashed"></param>
  // /// <param name="cancellationToken"></param>
  // /// <returns>Decrypted AppUser valid ObjedId OR null</returns>
  public async Task<ObjectId?> GetActualUserIdAsync(string? hashedUserId, CancellationToken cancellationToken)
  {
    if (hashedUserId is null) return null;

    ObjectId? userId = await _collection.AsQueryable().Where(appUser => appUser.IdentifierHash == hashedUserId).
      Select(appUser => appUser.Id).SingleOrDefaultAsync(cancellationToken);

    return ValidationsExtensions.ValidateObjectId(userId);
  }


  /// <summary>
  ///   Creates a new ObjectId, hashes it, and stores its value
  ///   into the appUser's doc using the userId param.
  /// </summary>
  /// <param name="userId"></param>
  /// <param name="cancellationToken"></param>
  /// <param name="jtiValue"></param>
  /// <returns>string: identifierHash</returns>
  private async Task<string?> GenerateAndStoreHashedId(
    ObjectId userId, CancellationToken cancellationToken, string? jtiValue = null
  )
  {
    var newObjectId = ObjectId.GenerateNewId().ToString();

    string identifierHash = BCrypt.Net.BCrypt.HashPassword(newObjectId);

    UpdateDefinition<AppUser> updatedSecuredToken = Builders<AppUser>.Update.Set(
      appUser => appUser.IdentifierHash, identifierHash
    );

    UpdateResult updateResult = await _collection.UpdateOneAsync(
      appUser => appUser.Id == userId, updatedSecuredToken, options: null, cancellationToken
    );

    if (updateResult.ModifiedCount == 1)
      return identifierHash;

    return null;
  }

  private SymmetricSecurityKey GenerateAndGetKey(string? tokenValue)
  {
    if (string.IsNullOrWhiteSpace(tokenValue))
      throw new ArgumentNullException($"{nameof(_tokenValue)}/Signing key is missing.");

    byte[] keyBytes = Convert.FromBase64String(tokenValue);
    var key = new SymmetricSecurityKey(keyBytes);

    return key ?? throw new ArgumentNullException($"{nameof(key)} cannot be null");
  }
}
