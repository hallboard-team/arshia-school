namespace api.DTOs;

public record ManagerUpdateProfile(
    [MinLength(2, ErrorMessage = "نام باید حداقل ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام باید حداکثر ۳۰ حرف باشد.")]
    string? Name,

    [MinLength(2, ErrorMessage = "نام خانوادگی باید حداقل ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام خانوادگی باید حداکثر ۳۰ حرف باشد.")]
    string? LastName,

    [BirthDateRange(MinYears = 11, MaxYears = 99)]
    DateOnly? DateOfBirth,

    [RegularExpression(@"^98\d{10}$", ErrorMessage = "شماره تلفن باید با 98 شروع شود و ۱۲ رقم باشد.")]
    string? PhoneNum,

    [Required(ErrorMessage = "لطفا جنسیت را مشخص کنید.")]
    string Gender
);