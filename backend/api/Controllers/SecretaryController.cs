namespace api.Controllers;

[Authorize(Policy = "RequiredSecretaryRole")]
public class SecretaryController(ISecretaryRepository _secretaryRepository) : BaseApiController
{
    [HttpPost("add-student")]
    public async Task<ActionResult<LoggedInDto>> CreateStudent(RegisterDto managerInput, CancellationToken cancellationToken)
    {
        if (managerInput.Password != managerInput.ConfirmPassword)
            return BadRequest("پسوردها درست نیستند");

        LoggedInDto? loggedInDto = await _secretaryRepository.CreateStudentAsync(managerInput, cancellationToken);

        return !string.IsNullOrEmpty(loggedInDto.Token)
            ? Ok(loggedInDto)
            : loggedInDto.Errors.Count != 0
            ? BadRequest(loggedInDto.Errors)
            : BadRequest("Registration has failed. Try again or contact the support.");
    }

    // [HttpPost("add-corse/{targetStudentUserName}")]
    // public async Task<ActionResult<AddCorse>> AddCorse(
    //         AddCorseDto managerInput, string targetStudentUserName,
    //         CancellationToken cancellationToken
    //     )
    // {
    //     if (targetStudentUserName is null)
    //         return null;

    //     AddCorse? addCorse = await _secretaryRepository.AddCorseAsync(managerInput, targetStudentUserName, cancellationToken);

    //     return !string.IsNullOrEmpty(managerInput.Lesson)
    //         ? Ok(addCorse)
    //         : BadRequest("add-discription failed try again.");
    // }
    
}