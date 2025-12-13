using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class CourseController(ICourseRepository _courseRepository) : BaseApiController
{
    [HttpPost("add")]
    public async Task<ActionResult<ShowCourseDto>> AddCourse(CreateCourseDto managerInput, CancellationToken cancellationToken)
    {
        OperationResult<ShowCourseDto>? opResult = await _courseRepository.AddCourseAsync(managerInput, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsDuplicateCourse => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed! Try again or contact support")
            };
    }

    [AllowAnonymous]
    [HttpGet("get-all-courses")]
    public async Task<ActionResult<IEnumerable<ShowCourseDto>>> GetAll([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        PagedList<Course> pagedCourses = await _courseRepository.GetAllAsync(paginationParams, cancellationToken);

        if (pagedCourses.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedCourses.CurrentPage,
            ItemsPerPage: pagedCourses.PageSize,
            TotalItems: pagedCourses.TotalItemsCount,
            TotalPages: pagedCourses.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowCourseDto> showCourseDtos = [];

        foreach (Course course in pagedCourses)
        {
            showCourseDtos.Add(Mappers.ConvertCourseToShowCourseDto(course));
        }

        return showCourseDtos;
    }

    [HttpPut("update/{targetCourseTitle}")]
    public async Task<ActionResult<ShowCourseDto>> UpdateCourse(UpdateCourseDto updateCourseDto, string targetCourseTitle, CancellationToken cancellationToken)
    {
        OperationResult<ShowCourseDto> opResult = await _courseRepository.UpdateCourseAsync(updateCourseDto, targetCourseTitle, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                _ => BadRequest("operation failed! Try again or contact support")
            };
    }

    [HttpGet("get-targetCourse/{courseTitle}")]
    public async Task<ActionResult<ShowCourseDto>> GetCourseByTitle(string courseTitle, CancellationToken cancellationToken)
    {
        OperationResult<ShowCourseDto> opResult = await _courseRepository.GetCourseByTitleAsync(courseTitle, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed! Try again or contact support")
            };
    }

    [HttpDelete("delete-course/{courseName}")]
    public async Task<ActionResult<Response>> DeleteCourse(string courseName, CancellationToken cancellationToken)
    {
        OperationResult opResult = await _courseRepository.DeleteCourseAsync(courseName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: "Course deleted successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    // [HttpGet("get-all-class-course")]
    // public async Task<ActionResult<List<CourseAndSite>>> GetAllCourseAndSite(CancellationToken cancellationToken)
    // {
    //     List<ShowClassAndTitleDto> showClassAndTitleDtos = await _courseRepository.GetClassesAndTitles(cancellationToken);

    //     if (showClassAndTitleDtos.Count == 0)
    //     {
    //         return NoContent();
    //     }

    //     return showClassAndTitleDtos;
    // }
}
