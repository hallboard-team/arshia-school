using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly UserManager<AppUser> _userManager;
    private readonly IPhotoService _photoService;
    private readonly IMongoClient _client;

    public UserRepository(IMongoClient client, IMyMongoDbSettings dbSettings, UserManager<AppUser> userManager, IPhotoService photoService)
    {
        _client = client; // used for Session
        IMongoDatabase? database = client.GetDatabase(dbSettings.DatabaseName);

        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);

        _userManager = userManager;
        _photoService = photoService;
    }

    public async Task<OperationResult<MemberPhoto>> AddProflePhotoAsync(IFormFile file, ObjectId? userId, CancellationToken cancellationToken)
    {
        AppUser appUser = await _collectionAppUser.Find(doc => doc.Id == userId).SingleOrDefaultAsync(cancellationToken);

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

        string[]? imageUrls = await _photoService.AddMemberPhotoToDiskAsync(file, appUser.Photo, appUser.Id);
        if (imageUrls is not null)
        {
            MemberPhoto photo;

            photo = Mappers.ConvertPhotoUrlsToMemberPhoto(imageUrls);

            UpdateDefinition<AppUser> updatedUser = Builders<AppUser>.Update
                .Set(doc => doc.Photo, photo);

            await _collectionAppUser.UpdateOneAsync(doc => doc.Id == appUser.Id, updatedUser, null, cancellationToken);

            return new(
                true,
                photo,
                null
            );
        }

        return new(
            false,
            Error: new(
                ErrorCode.IsOperationFailed,
                "Adding profile photo failed."
            )
        );
    }
}