using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Repositories;

public class SiteRepository : ISiteRepository
{
    private readonly IMongoClient _client;
    private readonly IMongoCollection<AppUser> _collectionAppUser;
    private readonly IMongoCollection<Site> _collectionSite;

    public SiteRepository(IMongoClient client, IMyMongoDbSettings dbSettings)
    {
        _client = client;
        IMongoDatabase database = client.GetDatabase(dbSettings.DatabaseName);

        _collectionAppUser = database.GetCollection<AppUser>(AppVariablesExtensions.CollectionUsers);
        _collectionSite = database.GetCollection<Site>(AppVariablesExtensions.CollectionSites);
    }

    public async Task<OperationResult<ShowSiteDto>> CreateSiteAsync(CreateSiteDto request, CancellationToken cancellationToken)
    {
        Site? targetSite = await _collectionSite.Find(doc => doc.Name.ToUpper() == request.Name.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetSite is not null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsDuplicateSite,
                    "This room is already registered"
                )
            );
        }

        Site site = Mappers.ConvertCreateSiteDtoToSite(request);

        return new(
            true,
            Mappers.ConvertSiteToShowSiteDto(site),
            null
        );
    }

    public async Task<IEnumerable<ShowSiteDto>> GetAllSitesAsync(CancellationToken cancellationToken)
    {
        IEnumerable<Site> sites = await _collectionSite.Find(new BsonDocument()).ToListAsync();

        List<ShowSiteDto> showSiteDtos = [];

        foreach (Site site in sites)
        {
            showSiteDtos.Add(Mappers.ConvertSiteToShowSiteDto(site));
        }

        return showSiteDtos;
    }

    public async Task<OperationResult<ShowSiteDto>> GetSiteByNameAsync(string siteName, CancellationToken cancellationToken)
    {
        Site? site = await _collectionSite.Find(doc => doc.Name.ToUpper() == siteName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (site is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Site not found"
                )
            );
        }

        return new(
            true,
            Mappers.ConvertSiteToShowSiteDto(site),
            null
        );
    }

    public async Task<OperationResult<ShowSiteDto>> GetSiteById(ObjectId siteId, CancellationToken cancellationToken)
    {
        Site? site = await _collectionSite.Find(doc => doc.Id == siteId).FirstOrDefaultAsync(cancellationToken);

        if (site is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Site not found"
                )
            );
        }

        return new(
            true,
            Mappers.ConvertSiteToShowSiteDto(site),
            null
        );
    }

    public async Task<OperationResult<ShowSiteDto>> UpdateSiteAsync(string siteName, UpdateSiteDto request, CancellationToken cancellationToken)
    {
        Site? targetSite = await _collectionSite.Find(doc => doc.Name.ToUpper() == request.Name.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetSite is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Site not found"
                )
            );
        }

        var builder = Builders<Site>.Update;
        var updateDefinitions = new List<UpdateDefinition<Site>>();

        if (!string.Equals(targetSite.Name, request.Name, StringComparison.Ordinal))
            updateDefinitions.Add(builder.Set(doc => doc.Name, request.Name));

        if (!string.Equals(targetSite.Department, request.Department, StringComparison.Ordinal))
            updateDefinitions.Add(builder.Set(doc => doc.Department, request.Department));

        if (!int.Equals(targetSite.Floor, request.Floor))
            updateDefinitions.Add(builder.Set(doc => doc.Floor, request.Floor));

        if (!int.Equals(targetSite.Capacity, request.Capacity))
            updateDefinitions.Add(builder.Set(doc => doc.Capacity, request.Capacity));

        if (updateDefinitions.Count > 0)
        {
            var filter = Builders<Site>.Filter.Eq(doc => doc.Id, targetSite.Id);
            var combinedUpdate = builder.Combine(updateDefinitions);

            await _collectionSite.UpdateOneAsync(filter, combinedUpdate, null, cancellationToken);
        }

        Site? updatedSite = await _collectionSite.Find(doc => doc.Name.ToUpper() == siteName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        return new(
            true,
            Mappers.ConvertSiteToShowSiteDto(updatedSite),
            null
        );
    }

    public async Task<OperationResult> DeleteSiteAsync(string siteName, CancellationToken cancellationToken)
    {
        Site? targetSite = await _collectionSite.Find(doc => doc.Name.ToUpper() == siteName.ToUpper()).FirstOrDefaultAsync(cancellationToken);

        if (targetSite is null)
        {
            return new(
                false,
                Error: new(
                    ErrorCode.IsNotFound,
                    "Site not found"
                )
            );
        }

        await _collectionSite.DeleteOneAsync(doc => doc.Id == targetSite.Id);

        return new(
            true,
            null
        );
    }
}