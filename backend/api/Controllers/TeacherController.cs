using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredTeacherRole")]
public class TeacherController(ITeacherRepository _teacherRepository,
 ITokenService _tokenService
) : BaseApiController
{

    [HttpGet("get-course")]
    public async Task<ActionResult<List<ClassRoom>>> GetCourse(CancellationToken cancellationToken)
    {
        if (!HttpContext.Request.Headers.TryGetValue("Authorization", out var authHeader))
            return Unauthorized("Token is expired or invalid. Login again.");

        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
            return BadRequest("No user was found with this user Id.");

        OperationResult<List<ClassRoom>> opResult = await _teacherRepository.GetClassesAsync(hashedUserId, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsInvalidUserReference => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }

    [HttpPost("add-attendence/{targetCourseTitle}")]
    public async Task<ActionResult<ShowStudentStatusDto>> Add(AddStudentStatusDto teacherInput, string targetCourseTitle, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(teacherInput.UserName))

            return BadRequest("یوزرنیم خالی است.");

        OperationResult<ShowStudentStatusDto> opResult = await _teacherRepository.AddAsync(teacherInput, targetCourseTitle, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsAlreadyEnrolled => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }

    [HttpDelete("remove-attendence/{targetUserName}/{targetCourseTitle}")]
    public async Task<ActionResult<Response>> Delete(string targetUserName, string targetCourseTitle, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(User.GetHashedUserId(), cancellationToken);

        if (userId is null)
            return Unauthorized("You are not logged in. Login in again.");

        DateOnly currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        OperationResult opResult = await _teacherRepository.DeleteAsync(userId.Value, targetUserName, targetCourseTitle, currentDate, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: "Delete operaton was successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound =>  BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyDeleteMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed. Try again or contact support.")
        };
    }

    // [AllowAnonymous]
    // [HttpGet("get-student/{targetTitle}")]
    // public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll([FromQuery] PaginationParams paginationParams, string targetTitle, CancellationToken cancellationToken)
    // {
    //     string? userIdHashed = User.GetHashedUserId();

    //     if (userIdHashed is null)
    //         return null;

    //     ObjectId? userId = await _tokenService.GetActualUserIdAsync(userIdHashed, cancellationToken);

    //     if (userId is null)
    //         return Unauthorized("You are unauthorized. Login again.");

    //     PagedList<AppUser> pagedAppUsers = await _teacherRepository.GetAllAsync(paginationParams, targetTitle, userIdHashed, cancellationToken);

    //     if (pagedAppUsers.Count == 0)
    //         return NoContent();

    //     PaginationHeader paginationHeader = new(
    //         CurrentPage: pagedAppUsers.CurrentPage,
    //         ItemsPerPage: pagedAppUsers.PageSize,
    //         TotalItems: pagedAppUsers.TotalItemsCount,
    //         TotalPages: pagedAppUsers.TotalPages
    //     );

    //     Response.AddPaginationHeader(paginationHeader);

    //     List<ObjectId> studentIds = pagedAppUsers.Select(user => user.Id).ToList();

    //     ObjectId? courseId = pagedAppUsers.FirstOrDefault()?.EnrolledClasses
    //         .FirstOrDefault(course => course.CourseTitle == targetTitle.ToUpper())?.CourseId;

    //     if (courseId == null)
    //         return BadRequest("Course not found.");

    //     Dictionary<ObjectId, bool> absences = await _teacherRepository.CheckIsAbsentAsync(studentIds, courseId.Value, cancellationToken);

    //     List<MemberDto> memberDtos = [];

    //     bool isAbsent;
    //     foreach (AppUser appUser in pagedAppUsers)
    //     {
    //         isAbsent = absences.ContainsKey(appUser.Id) && absences[appUser.Id];

    //         memberDtos.Add(Mappers.ConvertAppUserToMemberDto(appUser, isAbsent));
    //     }

    //     return memberDtos;
    // }

    // [AllowAnonymous]
    // [HttpGet("get-student/{targetTitle}")]
    // public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll([FromQuery] PaginationParams paginationParams, string targetTitle, CancellationToken cancellationToken)
    // {
    //     string? userIdHashed = User.GetHashedUserId();
    //     if (string.IsNullOrEmpty(userIdHashed))
    //         return Unauthorized("You are unauthorized. Login again.");

    //     ObjectId? userId = await _tokenService.GetActualUserIdAsync(userIdHashed, cancellationToken);
    //     if (userId is null)
    //         return Unauthorized("You are unauthorized. Login again.");

    //     var pagedAppUsers = await _teacherRepository.GetAllAsync(paginationParams, targetTitle, userIdHashed, cancellationToken);
    //     if (pagedAppUsers.Count == 0) return NoContent();

    //     Response.AddPaginationHeader(new PaginationHeader(
    //         CurrentPage: pagedAppUsers.CurrentPage,
    //         ItemsPerPage: pagedAppUsers.PageSize,
    //         TotalItems: pagedAppUsers.TotalItemsCount,
    //         TotalPages: pagedAppUsers.TotalPages
    //     ));

    //     var studentIds = pagedAppUsers.Select(u => u.Id).ToList();

    //     ObjectId? classId = await _classRepository.GetClassIdByName(targetTitle, cancellationToken);

    //     if (classId is null)
    //         return BadRequest("Class not found");

    //     var absences = await _teacherRepository.CheckIsAbsentAsync(studentIds, classId.Value, cancellationToken);

    //     List<AppRole> appRoles = await _managerRepository.GetAllRoleAsync(cancellationToken);
    //     Dictionary<ObjectId, string?> roleIdsToName = appRoles.ToDictionary(r => r.Id, r => r.Name);

    //     var memberDtos = new List<MemberDto>();
    //     foreach (var appUser in pagedAppUsers)
    //     {
    //         bool isAbsent = absences.TryGetValue(appUser.Id, out var val) && val;
    //         memberDtos.Add(Mappers.ConvertAppUserToMemberDto(appUser, isAbsent, roleIdsToName!));
    //     }

    //     return Ok(memberDtos);
    // }
}