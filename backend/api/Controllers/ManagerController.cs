namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class ManagerController(IManagerRepository _managerRepository, ITokenService _tokenService) : BaseApiController
{
    [HttpPost("create-secretary")]
    public async Task<ActionResult<RegisteredUserDto>> CreateSecretary(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        RegisteredUserDto? dto = await _managerRepository.CreateSecretaryAsync(managerInput, cancellationToken);

        if (dto is null)
            return BadRequest("خطا در ثبت‌نام منشی.");

        if (dto.Errors is { Count: > 0 })
            return BadRequest(dto.Errors);

        return Ok(dto);
    }

    [HttpPost("create-student")]
    public async Task<ActionResult<RegisteredUserDto>> CreateStudent(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        RegisteredUserDto dto = await _managerRepository.CreateStudentAsync(managerInput, cancellationToken);

        if (dto.Errors.Count > 0) return BadRequest(dto.Errors);
        return Ok(dto);
    }

    [HttpPost("create-teacher")]
    public async Task<ActionResult<RegisteredUserDto>> CreateTeacher(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("رمز عبور و تکرار آن یکسان نیست.");

        RegisteredUserDto? dto = await _managerRepository.CreateTeacherAsync(managerInput, cancellationToken);

        if (dto is null)
            return BadRequest("خطا در ثبت‌نام مدرس.");

        if (dto.Errors is { Count: > 0 })
            return BadRequest(dto.Errors);

        return Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll([FromQuery] MemberParams memberParams, CancellationToken cancellationToken)
    {
        PagedList<AppUser> pagedAppUsers = await _managerRepository.GetAllAsync(memberParams, cancellationToken);

        if (pagedAppUsers.Count == 0)
            return NoContent();

        PaginationHeader paginationHeader = new(
            CurrentPage: pagedAppUsers.CurrentPage,
            ItemsPerPage: pagedAppUsers.PageSize,
            TotalItems: pagedAppUsers.TotalItems,
            TotalPages: pagedAppUsers.TotalPages
        );

        Response.AddPaginationHeader(paginationHeader);

        string? userIdHashed = User.GetHashedUserId();

        ObjectId? userId = await _tokenService.GetActualUserIdAsync(userIdHashed, cancellationToken);

        if (userId is null) return Unauthorized("You are unauthorized. Login again.");


        List<MemberDto> memberDtos = [];

        foreach (AppUser appUser in pagedAppUsers)
        {
            bool isAbsent = false;

            memberDtos.Add(Mappers.ConvertAppUserToMemberDto(appUser, isAbsent));
        }

        return memberDtos;
    }

    [HttpGet("users-with-roles")]
    public async Task<ActionResult<IEnumerable<UserWithRoleDto>>> UsersWithRoles()
    {
        IEnumerable<UserWithRoleDto> users = await _managerRepository.GetUsersWithRolesAsync();

        return !users.Any() ? NoContent() : Ok(users);
    }

    [HttpPost("add-enrolledCourse/{targetUserName}")]
    public async Task<IActionResult> AddEnrolledCourse(
        [FromBody] AddEnrolledCourseDto managerInput, string targetUserName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(targetUserName))
            return BadRequest("Username is required.");

        if (string.IsNullOrWhiteSpace(managerInput.TitleCourse))
            return BadRequest("Course title is required.");

        var enrolledCourse = await _managerRepository.AddEnrolledCourseAsync(managerInput, targetUserName, cancellationToken);

        return enrolledCourse is not null
            ? Ok(enrolledCourse)
            : BadRequest("Failed to enroll user in course.");
    }

    [HttpPut("delete-member/{targetMemberUserName}")]
    public async Task<ActionResult> Delete(string targetMemberUserName, CancellationToken cancellationToken)
    {
        ObjectId? userId = await _tokenService.GetActualUserIdAsync(User.GetHashedUserId(), cancellationToken);
        if (userId is null) return Unauthorized("You are not loggedIn login again");

        DeleteResult? deleteResult = await _managerRepository.DeleteAsync(targetMemberUserName, cancellationToken);

        return deleteResult is null
        ? BadRequest("Delete member failed try again.")
        : Ok(new { message = "Delete member successfull" });
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

        if (string.IsNullOrWhiteSpace(updateEnrolledDto.TitleCourse))
            return BadRequest("Course title is required.");

        var updateResult = await _managerRepository.UpdateEnrolledCourseAsync(updateEnrolledDto, targetUserName, cancellationToken);

        return updateResult?.ModifiedCount > 0
            ? Ok(new { message = "EnrolledCourse updated successfully" })
            : BadRequest("Update failed. Try again later.");
    }

    [HttpGet("teachers")]
    public async Task<ActionResult<IEnumerable<TeacherDto>>> GetAllTeachers(CancellationToken cancellationToken)
    {
        List<AppUser> appUserTeachers = await _managerRepository.GetAllTeachersAsync(cancellationToken);

        if (appUserTeachers.Count == 0)
            return NoContent();

        List<TeacherDto> teacherDtos = appUserTeachers.Select(Mappers.ConvertAppUserToTeacherDto).ToList();

        return teacherDtos;
    }

    [HttpGet("get-target-member/{targetMemberEmail}")]
    public async Task<ActionResult<MemberDto>> GetMemberByEmail(string targetMemberEmail, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetMemberEmail))
        {
            return BadRequest("Email is required.");
        }

        MemberDto? memberDto = await _managerRepository.GetMemberByEmailAsync(targetMemberEmail, cancellationToken);

        if (memberDto == null)
        {
            return NotFound("User not found.");
        }

        return Ok(memberDto);
    }

    [HttpGet("get-member-by-userName/{targetUserName}")]
    public async Task<ActionResult<TargetMemberDto>> GetMemberByUserName(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("userName is required.");
        }

        TargetMemberDto? targetMemberDto = await _managerRepository.GetMemberByUserNameAsync(targetUserName, cancellationToken);

        if (targetMemberDto == null)
        {
            return NotFound("User not found.");
        }

        return Ok(targetMemberDto);
    }

    [HttpPut("update-member/{memberUserName}")]
    public async Task<ActionResult> UpdateMember(string memberUserName, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken)
    {
        if (memberUserName == null)
            return BadRequest("Invalid user data.");

        bool isUpdated = await _managerRepository.UpdateMemberAsync(memberUserName, updatedMember, cancellationToken);

        if (!isUpdated)
            return NotFound("User not found or no changes were made.");

        return Ok();
    }

    [HttpPost("add-photo/{targetPaymentId}")]
    public async Task<ActionResult<Photo>> AddPhoto(
            [AllowedFileExtensions]
            IFormFile file, string targetPaymentId, CancellationToken cancellationToken
        )
    {
        if (file is null)
            return BadRequest("No file is selected with this request.");

        Photo? photo = await _managerRepository.AddPhotoAsync(file, targetPaymentId, cancellationToken);

        return photo is null ? NotFound("No product with this ID found") : photo;
    }

    [HttpDelete("delete-photo/{targetPaymentId}")]
    public async Task<ActionResult> DeletePhoto(string targetPaymentId, CancellationToken cancellationToken)
    {
        string? hashedUserId = User.GetHashedUserId();
        if (string.IsNullOrEmpty(hashedUserId))
        {
            return Unauthorized("The user is not logged in.");
        }

        bool isDeleted = await _managerRepository.DeletePhotoAsync(targetPaymentId, cancellationToken);

        if (!isDeleted)
        {
            return BadRequest("Photo deletion failed. Try again later.");
        }

        return Ok(new { message = "Photo deleted successfully." });
    }

    [HttpGet("get-target-member-course/{targetUserName}")]
    public async Task<ActionResult<List<Course>>> GetTargetMemberCourse(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("userName is required.");
        }

        List<Course>? courses = await _managerRepository.GetTargetMemberCourseAsync(targetUserName, cancellationToken);

        if (courses is null || !courses.Any())
        {
            new List<Course>();
        }

        return Ok(courses);
    }

    [HttpGet("get-target-member-enrolled-course/{targetUserName}/{courseTitle}")]
    public async Task<ActionResult<EnrolledCourse>> GetTargetMemberEnrolledCourse(string targetUserName, string courseTitle, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("نام کاربری باید وارد بشود");
        }

        EnrolledCourse? enrolledCourse = await _managerRepository.GetTargetMemberEnrolledCourseAsync(targetUserName, courseTitle, cancellationToken);

        if (enrolledCourse == null)
            return NotFound("دوره مورد نظر یافت نشد");

        return enrolledCourse;
    }

    [HttpGet("get-target-payment-by-id/{targetPaymentId}")]
    public async Task<ActionResult<Payment>> GetTargetPaymentById(string targetPaymentId, CancellationToken cancellationToken)
    {
        Payment? payment = await _managerRepository.GetTargetPaymentByIdAsync(targetPaymentId, cancellationToken);

        if (payment == null)
            return NotFound("پرداخت مورد نظر یافت نشد");

        return payment;
    }

    [HttpGet("get-target-courseTitle/{targetUserName}")]
    public async Task<ActionResult<List<string>>> GetTargetCourseTitle(string targetUserName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(targetUserName))
        {
            return BadRequest("نام کاربری باید وارد بشود");
        }

        List<string> courseTitles = await _managerRepository.GetTargetCourseTitleAsync(targetUserName, cancellationToken);

        if (courseTitles is null || !courseTitles.Any())
        {
            new List<string>();
        }

        return courseTitles;
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

        PagedList<Attendence> pagedAttendences = await _managerRepository.GetAllAttendenceAsync(attendenceParams, targetMemberUserName, targetCourseTitle, cancellationToken);

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
}