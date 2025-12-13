using api.DTOs.Account;
using api.DTOs.Helpers;

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

        PagedList<Attendance> pagedAttendences = await _memberRepository.GetAllAttendenceAsync(attendenceParams, userId, targetCourseTitle, cancellationToken);

        if (pagedAttendences.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedAttendences.CurrentPage,
            ItemsPerPage: pagedAttendences.PageSize,
            TotalItems: pagedAttendences.TotalItemsCount,
            TotalPages: pagedAttendences.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowStudentStatusDto> showStudentStatusDtos = [];

        foreach (Attendance attendence in pagedAttendences)
        {
            showStudentStatusDtos.Add(Mappers.ConvertAttendenceToShowStudentStatusDto(attendence));
        }

        return showStudentStatusDtos;
    }

    [HttpPut]
    public async Task<ActionResult> UpdateMember(MemberUpdateDto memberUpdateDto, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("شما ورود نکرده اید. لطفا ابتدا ورود کنید.");

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return Unauthorized("شما ورود نکرده اید. لطفا ابتدا ورود کنید.");

        OperationResult<TargetMemberDto> opResult = await _memberRepository.UpdateMemberAsync(memberUpdateDto, userId.Value, cancellationToken);

        return opResult.IsSuccess
            ? Ok(opResult.Result)
            : opResult.Error?.Code switch
            {
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsInvalidType => BadRequest(opResult.Error.Message),
                ErrorCode.IsOperationFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed. Try again or contact support.")
            };
    }

    [HttpGet("get-course")]
    public async Task<ActionResult<List<Class>>> GetCourse(CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this userId.");

        var courses = await _memberRepository.GetClassesAsync(hashedUserId, cancellationToken);
        return courses.Count == 0 ? Ok(new List<Class>()) : Ok(courses);
    }

    [HttpGet("get-enrolled-course/{courseTitle}")]
    public async Task<ActionResult<EnrolledClass>> GetEnrolledCourse(string courseTitle, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();

        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this userId.");

        EnrolledClass? enrolledCourse = await _memberRepository.GetEnrolledCourseAsync(hashedUserId, courseTitle, cancellationToken);

        return enrolledCourse is null ? NotFound("دوره مورد نظر یافت نشد") : Ok(enrolledCourse);
    }
}
