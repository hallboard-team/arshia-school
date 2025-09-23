namespace api.DTOs;

public record RegisterDto(
    [MaxLength(50), RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$", ErrorMessage = "فرمت ایمیل درست وارد نشده")] string Email,
    [DataType(DataType.Password), Length(7, 20, ErrorMessage = "حداقل باید 7 و حداکثر باید 20 کاراکتر وارد بشه")] string Password,
    [DataType(DataType.Password), Length(7, 20)] string ConfirmPassword,
    [Required, MinLength(2, ErrorMessage = "نام حداقل ۲ کاراکتر است"), MaxLength(30),
     RegularExpression(@"^[\p{L}\s'-]{2,30}$", ErrorMessage = "نام تنها از حروف تشکیل شود")]
    string Name,

    [Required, MinLength(2, ErrorMessage = "نام خانوادگی حداقل ۲ کاراکتر است"), MaxLength(30),
     RegularExpression(@"^[\p{L}\s'-]{2,30}$", ErrorMessage = "نام خانوادگی تنها از حروف تشکیل شود")]
    string LastName,
    [RegularExpression(@"^98\d{10}$", ErrorMessage = "فرمت شماره تلفن معتبر نیست")]
    string? PhoneNum,
    [BirthDateRange(MinYears = 11, MaxYears = 99)]
    DateOnly DateOfBirth,
    string Gender
);

public class RegisteredUserDto
{
    public string? Email { get; init; }
    public string? UserName { get; init; }
    public string? Name { get; init; }
    public string? LastName { get; init; }
    public string? PhoneNum { get; init; }
    public string? Gender { get; init; }
    public DateOnly DateOfBirth { get; init; }
    public List<string> Errors { get; init; } = [];
}

public record LoginDto(
    [MaxLength(50), RegularExpression(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,5})+)$", ErrorMessage ="فرمت ایمیل درست وارد نشده")]
    string Email,
    [DataType(DataType.Password), MinLength(7), MaxLength(20)]
    string Password
);

public class LoggedInDto
{
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
