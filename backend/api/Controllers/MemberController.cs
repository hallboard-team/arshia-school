namespace api.Controllers;

[Authorize]
public class MemberController
    (IMemberRepository _memberRepository, ITokenService _tokenService) : BaseApiController
{
    [HttpGet("get-profile")]
    public async Task<ActionResult<ProfileDto>>
    GetProfile(CancellationToken cancellationToken)
    {
        string? HashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(HashedUserId))
            return BadRequest("No user was found with this userId.");

        ProfileDto? profileDto = await _memberRepository.GetProfileAsync(HashedUserId, cancellationToken);

        return profileDto is null
            ? Unauthorized("User is logged out or unauthorized. Login again.")
            : profileDto;
    }

    [HttpGet("get-attendences/{targetCourseTitle}")]
    public async Task<ActionResult<IEnumerable<ShowStudentStatusDto>>> GetAllAttendence([FromQuery] AttendenceParams attendenceParams, string targetCourseTitle, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(User.GetHashedUserId(), cancellationToken);

        if (userId is null)
            return Unauthorized("You are not logged in. Login in again.");

        attendenceParams.UserId = userId;

        PagedList<Attendence> pagedAttendences = await _memberRepository.GetAllAttendenceAsync(attendenceParams, userId, targetCourseTitle, cancellationToken);

        if (pagedAttendences.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedAttendences.CurrentPage,
            ItemsPerPage: pagedAttendences.PageSize,
            TotalItems: pagedAttendences.TotalItems,
            TotalPages: pagedAttendences.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowStudentStatusDto> showStudentStatusDtos = [];

        foreach (Attendence attendence in pagedAttendences)
        {
            showStudentStatusDtos.Add(Mappers.ConvertAttendenceToShowStudentStatusDto(attendence));
        }

        return showStudentStatusDtos;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto, CancellationToken cancellationToken)
    {
        if (memberUpdateDto is null)
            return BadRequest("ورودی نامعتبر است.");

        try
        {
            bool? updateResult = await _memberRepository.UpdateMemberAsync(memberUpdateDto, User.GetHashedUserId(), cancellationToken);

            return updateResult is false
                ? BadRequest("بروزرسانی انجام نشد. لطفاً دوباره تلاش کنید.")
                : Ok(new { message = "اطلاعات با موفقیت بروزرسانی شد." });
        }
        catch (ApplicationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("get-course")]
    public async Task<ActionResult<List<Course>>> GetCourse(CancellationToken cancellationToken)
    {
        string? HashedUserId = User.GetHashedUserId();

        if (string.IsNullOrEmpty(HashedUserId))
            return BadRequest("No user was found with this userId.");

        List<Course>? courses = await _memberRepository.GetCourseAsync(HashedUserId, cancellationToken);

        if (courses is null || !courses.Any())
        {
            return Ok(new List<Course>());
        }

        return Ok(courses);
    }

    [HttpGet("get-enrolled-course/{courseTitle}")]
    public async Task<ActionResult<EnrolledCourse>> GetEnrolledCourse(string courseTitle, CancellationToken cancellationToken)
    {
        string? HashedUserId = User.GetHashedUserId();

        if (string.IsNullOrEmpty(HashedUserId))
            return BadRequest("No user was found with this userId.");

        EnrolledCourse? enrolledCourse = await _memberRepository.GetEnrolledCourseAsync(HashedUserId, courseTitle, cancellationToken);

        if (enrolledCourse == null)
            return NotFound("دوره مورد نظر یافت نشد");

        return enrolledCourse;
    }
}