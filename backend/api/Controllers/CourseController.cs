using api.Helpers;
using api.Models.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class CourseController(ICourseRepository _courseRepository) : BaseApiController
{
    [HttpPost("add")]
    public async Task<ActionResult<ShowCourseDto>> AddCourse(AddCourseDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Title is null)
            return BadRequest("Title Is Empty Please Set Value");

        ShowCourseDto? showCourseDto = await _courseRepository.AddCourseAsync(managerInput, cancellationToken);

        return showCourseDto is not null
            ? Ok(showCourseDto)
            : BadRequest("add-course failed try again.");
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
            TotalItems: pagedCourses.TotalItems,
            TotalPages: pagedCourses.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowCourseDto> showCourseDtos = [];

        foreach (Course course in pagedCourses)
        {
            List<string> professorNames = await _courseRepository
                .GetProfessorNamesByIdsAsync(course.ProfessorsIds, cancellationToken);

            showCourseDtos.Add(new ShowCourseDto
            {
                Id = course.Id.ToString(),
                Title = course.Title,
                ProfessorNames = professorNames, // اضافه کردن لیست اسامی مدرسین
                Tuition = course.Tuition,
                Hours = course.Hours,
                HoursPerClass = course.HoursPerClass,
                Days = course.Days,
                Start = course.Start,
                IsStarted = course.IsStarted
            });
        }

        return showCourseDtos;
    }

    [HttpPut("update/{targetCourseTitle}")]
    public async Task<ActionResult> UpdateCourse(UpdateCourseDto updateCourseDto, string targetCourseTitle, CancellationToken cancellationToken)
    {
        bool IsSuccess = await _courseRepository.UpdateCourseAsync(updateCourseDto, targetCourseTitle, cancellationToken);

        return IsSuccess
            ? Ok(new { message = "Course has been updated successfully." })
            : BadRequest("Update failed. Try again later.");            
    }

    [HttpPost("add-professor/{targetCourseTitle}/{professorUserName}")]
    public async Task<ActionResult> AddProfessorToCourse(string targetCourseTitle, string professorUserName, CancellationToken cancellationToken)
    {
        bool isUpdated = await _courseRepository.AddProfessorToCourseAsync(targetCourseTitle, professorUserName, cancellationToken);

        if (!isUpdated)
            return NotFound("Course not found or professor already added.");

        return Ok();
    }

    [HttpDelete("remove-professor/{targetCourseTitle}/{professorUserName}")]
    public async Task<ActionResult> RemoveProfessorFromCourse(string targetCourseTitle, string professorUserName, CancellationToken cancellationToken)
    {
        bool isRemoved = await _courseRepository.RemoveProfessorFromCourseAsync(targetCourseTitle, professorUserName, cancellationToken);

        if (!isRemoved)
        {
            return NotFound("Course or professor not found.");
        }

        return Ok();
    }

    [HttpGet("get-targetCourse/{courseTitle}")]
    public async Task<ActionResult<ShowCourseDto>> GetCourseByTitle(string courseTitle, CancellationToken cancellationToken)
    {
        ShowCourseDto? course = await _courseRepository.GetCourseByTitleAsync(courseTitle, cancellationToken);

        return course is not null ? Ok(course) : NotFound("Course not found");
    }
}