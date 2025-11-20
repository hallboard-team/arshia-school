namespace api.DTOs;

public record MemberUpdateDto(
    [MinLength(2, ErrorMessage = "نام باید حداقل ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام باید حداکثر ۳۰ حرف باشد.")]
    string Name,

    [MinLength(2, ErrorMessage = "نام خانوادگی باید حداقل ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام خانوادگی باید حداکثر ۳۰ حرف باشد.")]
    string LastName,

    [Optional]
    [RegularExpression(@"^98\d{10}$", ErrorMessage = "شماره تلفن باید با 98 شروع شود و ۱۲ رقم باشد.")]
    string? PhoneNum,

    [Optional]
    [BirthDateRange(MinYears = 11, MaxYears = 99)]
    DateOnly DateOfBirth
);