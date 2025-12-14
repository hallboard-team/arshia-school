using System.Collections;
using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class SiteController(ISiteRepository _siteRepository) : BaseApiController
{
    [HttpPost("create-site")]
    public async Task<ActionResult<ShowSiteDto>> CreateSite(CreateSiteDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowSiteDto> opResult = await _siteRepository.CreateSiteAsync(request, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsDuplicateSite => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed! Try again or contact support")
            };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShowSiteDto>>> GetAll([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        PagedList<Site> pagedSites = await _siteRepository.GetAllSitesAsync(paginationParams, cancellationToken);

        if (!pagedSites.Any())
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedSites.CurrentPage,
            ItemsPerPage: pagedSites.PageSize,
            TotalItems: pagedSites.TotalItemsCount,
            TotalPages: pagedSites.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowSiteDto> sites = [];

        foreach(Site site in pagedSites)
        {
            sites.Add(Mappers.ConvertSiteToShowSiteDto(site));
        }

        return Ok(sites);
    }

    [HttpGet("get-site/{siteName}")]
    public async Task<ActionResult<ShowSiteDto>> GetSiteByName(string siteName, CancellationToken cancellationToken)
    {
        OperationResult<ShowSiteDto> opResult = await _siteRepository.GetSiteByNameAsync(siteName, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("update-site/{siteName}")]
    public async Task<ActionResult<ShowSiteDto>> UpdateSite(string siteName, UpdateSiteDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowSiteDto> opResult = await _siteRepository.UpdateSiteAsync(siteName, request, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpDelete("delete-site/{siteName}")]
    public async Task<ActionResult<Response>> DeleteSite(string siteName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _siteRepository.DeleteSiteAsync(siteName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: "Site deleted successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")  
        };
    }
}