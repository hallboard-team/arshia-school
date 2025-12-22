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

        OperationResult<ProfileDto> opResult = await _memberRepository.GetProfileAsync(HashedUserId, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }

    [HttpGet("get-attendences/{targetCourseTitle}")]
    public async Task<ActionResult<IEnumerable<ShowStudentStatusDto>>> GetAllAttendence([FromQuery] AttendenceParams attendenceParams, string targetCourseTitle, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(User.GetHashedUserId(), cancellationToken);

        if (userId is null)
            return Unauthorized("You are not logged in. Login in again.");

        attendenceParams.UserId = userId;

        OperationResult<PagedList<Attendance>> opResult = await _memberRepository.GetAllAttendenceAsync(attendenceParams, userId, targetCourseTitle, cancellationToken);

        if (!opResult.IsSuccess)
        {
            return opResult.Error?.Code switch
            {
                ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed. Try again or contact support.")
            };
        }

        if (opResult.Result.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: opResult.Result.CurrentPage,
            ItemsPerPage: opResult.Result.PageSize,
            TotalItems: opResult.Result.TotalItemsCount,
            TotalPages: opResult.Result.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        List<ShowStudentStatusDto> showStudentStatusDtos = [];

        foreach (Attendance attendance in opResult.Result)
        {
            showStudentStatusDtos.Add(Mappers.ConvertAttendanceToShowStudentStatusDto(attendance));
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

    [HttpGet("get-classes")]
    public async Task<ActionResult<List<Class>>> GetAllClasses(CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this userId.");

        OperationResult<List<Class>> opResult = await _memberRepository.GetClassesAsync(hashedUserId, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }

    [HttpGet("get-enrolled-course/{courseTitle}")]
    public async Task<ActionResult<EnrolledClass>> GetEnrolledCourse(string courseTitle, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();

        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this userId.");

        OperationResult<EnrolledClass> opResult = await _memberRepository.GetEnrolledCourseAsync(hashedUserId, courseTitle, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsInvalidUserReference => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }
}
