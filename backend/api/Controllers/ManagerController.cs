using api.DTOs.Account;
using api.DTOs.Helpers;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class ManagerController(IManagerRepository _managerRepository, ITokenService _tokenService) : BaseApiController
{
    [HttpPut("update-account")]
    public async Task<ActionResult<Response>> UpdateAccount(ManagerUpdateProfile managerUpdateProfile, CancellationToken cancellationToken)
    {
        if (managerUpdateProfile is null)
            return BadRequest("ورودی نامعتبر است.");

        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("شما ورود نکرده اید. لطفا ابتدا ورود کنید.");

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(hashedUserId, cancellationToken);

        if (userId is null)
            return Unauthorized("شما ورود نکرده اید. لطفا ابتدا ورود کنید.");

        OperationResult? opResult = await _managerRepository.UpdateAccountAsync(managerUpdateProfile, userId.Value, cancellationToken);

        return opResult.IsSuccess
            ? Ok(new Response("User successfully updated."))
            : opResult.Error?.Code switch
            {
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsInvalidType => BadRequest(opResult.Error.Message),
                ErrorCode.IsOperationFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("Operation failed. Try again or contact support.")
            };
    }

    [HttpPost("create-secretary")]
    public async Task<ActionResult<RegisteredUserDto>> CreateSecretary(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        OperationResult<RegisteredUserDto> opResult = await _managerRepository.CreateSecretaryAsync(managerInput, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsDuplicateEmail => BadRequest(opResult.Error.Message),
            ErrorCode.IsDuplicatePhone => BadRequest(opResult.Error.Message),
            ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
            ErrorCode.IsRoleIdentityFailed => BadRequest(opResult.Error.Message),
            _ => BadRequest("Opertion failed! Try again or contact support.")
        };
    }

    [HttpPost("create-student")]
    public async Task<ActionResult<RegisteredUserDto>> CreateStudent(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        OperationResult<RegisteredUserDto> opResult = await _managerRepository.CreateStudentAsync(managerInput, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsDuplicateEmail => BadRequest(opResult.Error.Message),
            ErrorCode.IsDuplicatePhone => BadRequest(opResult.Error.Message),
            ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
            ErrorCode.IsRoleIdentityFailed => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpPost("create-teacher")]
    public async Task<ActionResult<RegisteredUserDto>> CreateTeacher(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        OperationResult<RegisteredUserDto> opResult = await _managerRepository.CreateTeacherAsync(managerInput, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsDuplicateEmail => BadRequest(opResult.Error.Message),
            ErrorCode.IsDuplicatePhone => BadRequest(opResult.Error.Message),
            ErrorCode.IsIdentityFailed => BadRequest(opResult.Error.Message),
            ErrorCode.IsRoleIdentityFailed => BadRequest(opResult.Error.Message),
            _ => BadRequest("Opertion failed! Try again or contact support.")
        };
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll([FromQuery] MemberParams memberParams, CancellationToken cancellationToken)
    {
        OperationResult<PagedList<AppUser>> opResult = await _managerRepository.GetAllAsync(memberParams, cancellationToken);

        if (opResult.Result.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: opResult.Result.CurrentPage,
            ItemsPerPage: opResult.Result.PageSize,
            TotalItems: opResult.Result.TotalItemsCount,
            TotalPages: opResult.Result.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        string? userIdHashed = User.GetHashedUserId();

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(userIdHashed, cancellationToken);

        if (userId is null) return Unauthorized("You are unauthorized. Login again.");

        OperationResult<List<AppRole>> appRoles = await _managerRepository.GetAllRoleAsync(cancellationToken);
        Dictionary<ObjectId, string?> roleIdsToName = appRoles.Result.ToDictionary(r => r.Id, r => r.Name);

        List<MemberDto> memberDtos = [];

        foreach (AppUser appUser in opResult.Result)
        {
            bool isAbsent = false;

            memberDtos.Add(Mappers.ConvertAppUserToMemberDto(appUser, isAbsent, roleIdsToName!));
        }

        return memberDtos;
    }

    [HttpGet("users-with-roles")]
    public async Task<ActionResult<IEnumerable<UserWithRoleDto>>> UsersWithRoles()
    {
        OperationResult<IEnumerable<UserWithRoleDto>> opResult = await _managerRepository.GetUsersWithRolesAsync();

        return !opResult.Result.Any() ? NoContent() : Ok(opResult.Result);
    }

    [HttpPost("add-enrolledCourse/{targetUserName}")]
    public async Task<ActionResult<EnrolledClass>> AddEnrolledCourse(
        AddEnrolledCourseDto managerInput, string targetUserName,
        CancellationToken cancellationToken)
    {
        OperationResult<EnrolledClass> opResult = await _managerRepository.AddEnrolledClassAsync(managerInput, targetUserName, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsNumberOfPaymentsUnderZero => BadRequest(opResult.Error.Message),
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsAlreadyEnrolled => BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyUpdateMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpPut("delete-member/{targetMemberUserName}")]
    public async Task<ActionResult<Response>> Delete(string targetMemberUserName, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(User.GetHashedUserId(), cancellationToken);
        if (userId is null) return Unauthorized("You are not loggedIn login again");

        OperationResult opResult = await _managerRepository.DeleteAsync(targetMemberUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: "User deleted successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyDeleteMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpPut("update-enrolledCourse/{targetUserName}")]
    public async Task<IActionResult> UpdateEnrolledCourse(
        [FromBody] UpdateEnrolledDto updateEnrolledDto, string targetUserName,
        // [AllowedFileExtensions, FileSize(500 * 500, 2000 * 2000)]
        // IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(targetUserName))
            return BadRequest("Username is required.");

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        OperationResult opResult = await _managerRepository.UpdateEnrolledClassAsync(updateEnrolledDto, targetUserName, cancellationToken);

        return opResult.IsSuccess
        ? Ok("User has been updated succeessfully")
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsNotEnrolled => BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyUpdateMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support")
        };
    }

    [HttpGet("teachers")]
    public async Task<ActionResult<IEnumerable<TeacherDto>>> GetAllTeachers(CancellationToken cancellationToken)
    {
        OperationResult<List<AppUser>> opResult = await _managerRepository.GetAllTeachersAsync(cancellationToken);

        if (opResult.Result.Count == 0)
            return NoContent();

        List<TeacherDto> teacherDtos = [.. opResult.Result.Select(Mappers.ConvertAppUserToTeacherDto)];

        return teacherDtos;
    }

    [HttpGet("get-target-member/{targetMemberEmail}")]
    public async Task<ActionResult<MemberDto>> GetMemberByEmail(string targetMemberEmail, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetMemberEmail))
        {
            return BadRequest("Email is required.");
        }

        OperationResult<MemberDto> opResult = await _managerRepository.GetMemberByEmailAsync(targetMemberEmail, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpGet("get-member-by-userName/{targetUserName}")]
    public async Task<ActionResult<TargetMemberDto>> GetMemberByUserName(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("userName is required.");
        }

        OperationResult<TargetMemberDto> opResult = await _managerRepository.GetMemberByUserNameAsync(targetUserName, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpPut("update-member/{memberUserName}")]
    public async Task<ActionResult<TargetMemberDto>> UpdateMember(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken)
    {
        if (memberUserName == null)
            return BadRequest("Invalid user data.");

        string? hashedUserId = User.GetHashedUserId();

        if (hashedUserId is null)
            return Unauthorized("You are not logged in. Please login first.");

        OperationResult<TargetMemberDto> opResult = await _managerRepository.UpdateMemberAsync(memberUserName, updatedMember, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsGenderValid => BadRequest(opResult.Error.Message),
            _ => BadRequest("Operation failed! Try again or contact support.")
        };
    }

    [HttpPost("add-member-photo/{targetUserName}")]
    public async Task<ActionResult<MemberPhoto>> UploadMemberPhoto(
        [AllowedFileExtensions, FileSize(250_000, 4_000_000)]
        IFormFile file, string targetUserName, CancellationToken cancellationToken
    )
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file is selected with this request.");

        OperationResult<MemberPhoto> opResult = await _managerRepository.UploadMemberPhotoAsync(file, targetUserName, cancellationToken);

        return opResult.IsSuccess
            ? opResult.Result
            : opResult.Error?.Code switch
            {
                ErrorCode.IsNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsOperationFailed => BadRequest(opResult.Error.Message),
                _ => BadRequest("Something unexpected went wrong. Try again or contact support")
            };
    }

    [HttpPost("add-photo/{targetPaymentId}")]
    public async Task<ActionResult<Photo>> AddPhoto(
            [AllowedFileExtensions]
            IFormFile file, string targetPaymentId, CancellationToken cancellationToken
        )
    {
        if (file is null)
            return BadRequest("No file is selected with this request.");

        ObjectId.TryParse(targetPaymentId, out var paymentId);

        OperationResult<Photo> opResult = await _managerRepository.AddPhotoAsync(file, paymentId, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsPaymentNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyUpdateMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Something unexpected went wrong. Try again or contact support")
        };
    }

    [HttpDelete("delete-photo/{targetPaymentId}")]
    public async Task<ActionResult<Response>> DeletePhoto(string targetPaymentId, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
        {
            return Unauthorized("The user is not logged in.");
        }

        ObjectId.TryParse(targetPaymentId, out var paymentId);

        OperationResult opResult = await _managerRepository.DeletePhotoAsync(paymentId, cancellationToken);

        return opResult.IsSuccess
        ? Ok(new Response(Message: "Photo deleted successfully"))
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsPaymentNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsAnyUpdateMake => BadRequest(opResult.Error.Message),
            _ => BadRequest("Something unexpected went wrong. Try again or contact support")
        };
    }

    [HttpGet("get-target-member-course/{targetUserName}")]
    public async Task<ActionResult<List<ShowClassRoomDto>>> GetTargetMemberCourse(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("userName is required.");
        }

        List<ShowClassRoomDto>? classRes = await _managerRepository.GetTargetMemberClassesAsync(targetUserName, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Something unexpected went wrong. Try again or contact support")

        };
    }

    [HttpGet("get-target-member-enrolled-course/{targetUserName}/{courseTitle}")]
    public async Task<ActionResult<EnrolledClassRoom>> GetTargetMemberEnrolledCourse(string targetUserName, string courseTitle, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("نام کاربری باید وارد بشود");
        }

        EnrolledClassRoom? enrolledCourse = await _managerRepository.GetTargetMemberEnrolledClassAsync(targetUserName, courseTitle, cancellationToken);

        return opResult.IsSuccess
               ? opResult.Result
               : opResult.Error?.Code switch
               {
                   ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
                   ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
                   ErrorCode.IsNotEnrolled => BadRequest(opResult.Error.Message),
                   _ => BadRequest("Something unexpected went wrong. Try again or contact support")
               };
    }

    [HttpGet("get-target-payment-by-id/{targetPaymentId}")]
    public async Task<ActionResult<Payment>> GetTargetPaymentById(string targetPaymentId, CancellationToken cancellationToken)
    {
        ObjectId.TryParse(targetPaymentId, out var paymentId);

        OperationResult<Payment> opResult = await _managerRepository.GetTargetPaymentByIdAsync(paymentId, cancellationToken);

        return opResult.IsSuccess
        ? opResult.Result
        : opResult.Error?.Code switch
        {
            ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
            ErrorCode.IsPaymentNotFound => BadRequest(opResult.Error.Message),
            _ => BadRequest("Something unexpected went wrong. Try again or contact support")
        };
    }

    [HttpGet("get-target-courseTitle/{targetUserName}")]
    public async Task<ActionResult<List<string>>> GetTargetCourseTitle(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("نام کاربری باید وارد بشود");
        }

        OperationResult<List<string>> opResult = await _managerRepository.GetTargetClassTitlesAsync(targetUserName, cancellationToken);

        return Ok(opResult.Result);
    }

    [HttpGet("get-target-member-attendences/{targetMemberUserName}/{targetCourseTitle}")]
    public async Task<ActionResult<IEnumerable<ShowStudentStatusDto>>> GetAllAttendence([FromQuery] AttendenceParams attendenceParams, string targetMemberUserName, string targetCourseTitle, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetMemberUserName))
        {
            return BadRequest("نام کاربری باید وارد بشود");
        }

        if (string.IsNullOrEmpty(targetCourseTitle))
        {
            return BadRequest("دوره مورد نظر باید وارد بشود");
        }

        OperationResult<PagedList<Attendance>> opResult = await _managerRepository.GetAllAttendanceAsync(attendenceParams, targetMemberUserName, targetCourseTitle, cancellationToken);

        if (!opResult.IsSuccess)
        {
            return opResult.Error?.Code switch
            {
                ErrorCode.IsUserNotFound => BadRequest(opResult.Error.Message),
                ErrorCode.IsClassNotFound => BadRequest(opResult.Error.Message),
                _ => BadRequest("Something unexpected went wrong. Try again or contact support")
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
}
