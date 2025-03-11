using api.Models.Helpers;
using api.Validations;

namespace api.Controllers;

[Authorize(Policy = "RequiredManagerRole")]
public class ManagerController(IManagerRepository _managerRepository, ITokenService _tokenService) : BaseApiController
{
    [HttpPost("create-secretary")]
    public async Task<ActionResult<LoggedInDto>> CreateSecretary(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("پسوردها درست نیستند");

        LoggedInDto? loggedInDto = await _managerRepository.CreateSecretaryAsync(managerInput, cancellationToken);

        return !string.IsNullOrEmpty(loggedInDto.Token)
            ? Ok(loggedInDto)
            : loggedInDto.Errors.Count != 0
            ? BadRequest(loggedInDto.Errors)
            : BadRequest("Registration has failed. Try again or contact the support.");
    }

    [HttpPost("create-student")]
    public async Task<ActionResult<LoggedInDto>> CreateStudent(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("پسوردها درست نیستند");

        LoggedInDto? loggedInDto = await _managerRepository.CreateStudentAsync(managerInput, cancellationToken);

        return !string.IsNullOrEmpty(loggedInDto.Token)
            ? Ok(loggedInDto)
            : loggedInDto.Errors.Count != 0
            ? BadRequest(loggedInDto.Errors)
            : BadRequest("Registration has failed. Try again or contact the support.");
    }

    [HttpPost("create-teacher")]
    public async Task<ActionResult<LoggedInDto>> CreateTeacher(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("پسوردها درست نیستند");

        LoggedInDto? loggedInDto = await _managerRepository.CreateTeacherAsync(managerInput, cancellationToken);

        return !string.IsNullOrEmpty(loggedInDto.Token)
            ? Ok(loggedInDto)
            : loggedInDto.Errors.Count != 0
            ? BadRequest(loggedInDto.Errors)
            : BadRequest("Registration has failed. Try again or contact the support.");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll([FromQuery] PaginationParams paginationParams, CancellationToken cancellationToken)
    {
        PagedList<AppUser> pagedAppUsers = await _managerRepository.GetAllAsync(paginationParams, cancellationToken);

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
        
        // bool IsAbsent;
        //inja dasti daram false midam chon manager niyaz be isAbsent student ha nadare
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
        [FromForm] UpdateEnrolledDto updateEnrolledDto, string targetUserName,
        [AllowedFileExtensions, FileSize(500 * 500, 2000 * 2000)]
        IFormFile? file, 
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(targetUserName))
            return BadRequest("Username is required.");

        if (string.IsNullOrWhiteSpace(updateEnrolledDto.TitleCourse))
            return BadRequest("Course title is required.");
        
        if (file is null)
            return BadRequest("No file is selected");

        var updateResult = await _managerRepository.UpdateEnrolledCourseAsync(updateEnrolledDto, targetUserName, file, cancellationToken);

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

        // List<TeacherDto> teacherDtos = appUserTeachers.Select(doc => new TeacherDto
        // {
        //     UserName = doc.UserName,
        //     Name = doc.Name,
        //     LastName = doc.LastName,
        //     PhoneNum = doc.PhoneNum,
        //     Gender = doc.Gender
        // }).ToList();

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

    [HttpPut("update-member/{targetMemberEmail}")]
    public async Task<ActionResult> UpdateMember(string targetMemberEmail, ManagerUpdateMemberDto updatedMember, CancellationToken cancellationToken)
    {
        if (updatedMember == null)
            return BadRequest("Invalid user data.");

        bool isUpdated = await _managerRepository.UpdateMemberAsync(targetMemberEmail, updatedMember, cancellationToken);

        if (!isUpdated)
            return NotFound("User not found or no changes were made.");

        return Ok();
    }

    // [HttpPost("add-photo/{targetPaymentId}")]
    // public async Task<ActionResult<Photo>> AddPhoto(
    //         [AllowedFileExtensions, FileSize(500 * 500, 2000 * 2000)]
    //         IFormFile file, ObjectId targetPaymentId, CancellationToken cancellationToken
    //     )
    // { 
    //     if (file is null) 
    //     return BadRequest("No file is selected with this request.");

    //     Photo? photo = await _managerRepository.AddPhotoAsync(file, targetPaymentId, cancellationToken);

    //     return photo is null ? NotFound("No product with this ID found") : photo;
    // }

    [HttpDelete("delete-photo/{targetPaymentId}")]
    public async Task<ActionResult> DeletePhoto(ObjectId targetPaymentId, CancellationToken cancellationToken)
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
}