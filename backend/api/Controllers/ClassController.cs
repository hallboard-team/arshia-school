using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class ClassController(IClassRepository _classRepository, ICourseRepository _courseRepository, ISiteRepository _siteRepository) : BaseApiController
{
    [HttpPost("create-class")]
    public async Task<ActionResult<ShowClassDto>> CreateClass(CreateClassDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassDto> opResult = await _classRepository.CreateClassAsync(request, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsDuplicateClass => BadRequest(opResult.Error.Message),
            ErrorCode.IsCourseNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsSiteNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [AllowAnonymous]
    [HttpGet("get-all-classes")]
    public async Task<ActionResult<IEnumerable<ShowClassDto>>> GetAll([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        PagedList<Class> pagedClasses = await _classRepository.GetAllClassesAsync(paginationParams, cancellationToken);

        if (pagedClasses.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedClasses.CurrentPage,
            ItemsPerPage: pagedClasses.PageSize,
            TotalItems: pagedClasses.TotalItemsCount,
            TotalPages: pagedClasses.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowClassDto> classDtos = [];

        foreach (Class model in pagedClasses)
        {
            OperationResult<ShowCourseDto> courseDto = await _courseRepository.GetCourseByIdAsync(model.CourseId!.Value, cancellationToken);
            OperationResult<ShowSiteDto> siteDto = await _siteRepository.GetSiteById(model.SiteId!.Value, cancellationToken);

            List<string> userNames = await _classRepository.GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
            List<string> names = await _classRepository.GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

            classDtos.Add(Mappers.ConvertClassToShowClassDto(model, courseDto.Result, siteDto.Result, userNames, names));
        }

        return classDtos;
    }

    [HttpGet("get-target-class/{className}")]
    public async Task<ActionResult<ShowClassDto>> GetClassByName(string className, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassDto> opResult = await _classRepository.GetClassByNameAsync(className, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("update-class/{className}")]
    public async Task<ActionResult<ShowClassDto>> UpdateClass(string className, UpdateClassDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassDto> opResult = await _classRepository.UpdateClassAsync(className, request, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("add-professor/{targetClassTitle}/{professorUserName}")]
    public async Task<ActionResult<Response>> AddProfessorToCourse(string targetClassTitle, string professorUserName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _classRepository.AddProfessorToClassAsync(targetClassTitle, professorUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: $"Professor {professorUserName} added to {targetClassTitle} successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("remove-professor/{targetClassTitle}/{professorUserName}")]
    public async Task<ActionResult<Response>> RemoveProfessorFromCourse(string targetClassTitle, string professorUserName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _classRepository.RemoveProfessorFromClassAsync(targetClassTitle, professorUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: $"Professor {professorUserName} removed from {targetClassTitle} successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }
}