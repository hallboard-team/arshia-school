using api.DTOs.Helpers;

namespace api.Interfaces;

public interface ISiteRepository
{
    public Task<OperationResult<ShowSiteDto>> CreateSiteAsync(CreateSiteDto request, CancellationToken cancellationToken);
    public Task<IEnumerable<ShowSiteDto>> GetAllSitesAsync(CancellationToken cancellationToken);
    public Task<OperationResult<ShowSiteDto>> GetSiteByNameAsync(string siteName, CancellationToken cancellationToken);
    public Task<OperationResult<ShowSiteDto>> GetSiteById(ObjectId siteId, CancellationToken cancellationToken);
    public Task<OperationResult<ShowSiteDto>> UpdateSiteAsync(string siteName, UpdateSiteDto request, CancellationToken cancellationToken);
    public Task<OperationResult> DeleteSiteAsync(string siteName, CancellationToken cancellationToken);
}