using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class ClassRoomController(IClassRoomRepository _classRoomRepository, ICourseRepository _courseRepository, ISiteRepository _siteRepository) : BaseApiController
{
    [HttpPost("create-class-room")]
    public async Task<ActionResult<ShowClassRoomDto>> CreateClassRoom(CreateClassRoomDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassRoomDto> opResult = await _classRoomRepository.CreateClassRoomAsync(request, cancellationToken);

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
    [HttpGet("get-all-class-rooms")]
    public async Task<ActionResult<IEnumerable<ShowClassRoomDto>>> GetAll([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        PagedList<ClassRoom> pagedClasses = await _classRoomRepository.GetAllClassRoomsAsync(paginationParams, cancellationToken);

        if (opResult.Result.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: opResult.Result.CurrentPage,
            ItemsPerPage: opResult.Result.PageSize,
            TotalItems: opResult.Result.TotalItemsCount,
            TotalPages: opResult.Result.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowClassRoomDto> classRoomDtos = [];

        foreach (ClassRoom model in pagedClasses)
        {
            OperationResult<ShowCourseDto> courseDto = await _courseRepository.GetCourseByIdAsync(model.CourseId!.Value, cancellationToken);
            OperationResult<ShowSiteDto> siteDto = await _siteRepository.GetSiteByIdAsync(model.SiteId!.Value, cancellationToken);

            List<string> userNames = await _classRoomRepository.GetProfessorUserNamesByIdsAsync(model.ProfessorsIds, cancellationToken);
            List<string> names = await _classRoomRepository.GetProfessorNamesByIdsAsync(model.ProfessorsIds, cancellationToken);

            classRoomDtos.Add(Mappers.ConvertClassRoomToShowClassRoomDto(model, courseDto.Result, siteDto.Result, userNames, names));
        }

        return classRoomDtos;
    }

    [HttpGet("get-target-class-room/{classRoomName}")]
    public async Task<ActionResult<ShowClassRoomDto>> GetClassRoomByName(string classRoomName, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassRoomDto> opResult = await _classRoomRepository.GetClassRoomByNameAsync(classRoomName, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("update-class-room/{classRoomName}")]
    public async Task<ActionResult<ShowClassRoomDto>> UpdateClassRoom(string classRoomName, UpdateClassRoomDto request, CancellationToken cancellationToken)
    {
        OperationResult<ShowClassRoomDto> opResult = await _classRoomRepository.UpdateClassRoomAsync(classRoomName, request, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("add-professor/{targetClassRoomTitle}/{professorUserName}")]
    public async Task<ActionResult<Response>> AddProfessorToCourse(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _classRoomRepository.AddProfessorToClassRoomAsync(targetClassRoomTitle, professorUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: $"Professor {professorUserName} added to {targetClassRoomTitle} successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpPut("remove-professor/{targetClassRoomTitle}/{professorUserName}")]
    public async Task<ActionResult<Response>> RemoveProfessorFromCourse(string targetClassRoomTitle, string professorUserName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _classRoomRepository.RemoveProfessorFromClassRoomAsync(targetClassRoomTitle, professorUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: $"Professor {professorUserName} removed from {targetClassRoomTitle} successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }
}