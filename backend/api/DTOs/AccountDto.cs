using System.Runtime.InteropServices;

namespace api.DTOs;

public record RegisterDto(
    [MaxLength(50), RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$", ErrorMessage = "فرمت ایمیل درست وارد نشده")] string Email,
    // [Length(1, 30)] string UserName,
    [DataType(DataType.Password), Length(7, 20, ErrorMessage = "حداقل باید 7 و حداکثر باید 20 کاراکتر وارد بشه")] string Password,
    [DataType(DataType.Password), Length(7, 20)] string ConfirmPassword,
    [Length(0, 30)] string Name,
    [Length(0, 30)] string LastName,
    [RegularExpression(@"^09\d{10}$", ErrorMessage = "فرمت شماره تلفن معتبر نیست")]
    string? PhoneNum,
    DateOnly DateOfBirth, // Prevent from 1/1/1
    string Gender
);

public record LoginDto(
    [MaxLength(50), RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$", ErrorMessage ="فرمت ایمیل درست وارد نشده")]
    string Email,
    [DataType(DataType.Password), MinLength(7), MaxLength(20)]
    string Password
);

public class LoggedInDto
{
    // required public string? Token { get; init; } // this one is REQUIRED
    public string? Token { get; init; }
    public string? Email { get; init; }
    public string? UserName { get; init; }
    public string? Name { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNum { get; init; }
    public string? Gender { get; init; }
    public DateOnly DateOfBirth { get; init; }
    public bool IsWrongCreds { get; set; }
    public List<string> Errors { get; init; } = [];
}