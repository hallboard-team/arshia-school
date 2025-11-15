public record ManagerUpdateMemberDto(
    [MinLength(2, ErrorMessage = "نام حداقل باید ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام نمی‌تواند بیش از ۳۰ حرف باشد.")]
    string Name,

    [MinLength(2, ErrorMessage = "نام خانوادگی حداقل باید ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام خانوادگی نمی‌تواند بیش از ۳۰ حرف باشد.")]
    string LastName,

    [Optional]
    [RegularExpression(@"^98\d{10}$", ErrorMessage = "شماره تلفن باید با 98 شروع شود و ۱۲ رقم باشد.")]
    string? PhoneNum,
    
    [Optional]
    [BirthDateRange(MinYears = 11, MaxYears = 99)]
    DateOnly DateOfBirth
);