public record ManagerUpdateMemberDto(
    [Required]
    [EmailAddress(ErrorMessage = "فرمت ایمیل درست نیست.")]
    [MaxLength(50)]
    string Email,

    [Required]
    [MinLength(2, ErrorMessage = "نام حداقل باید ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام نمی‌تواند بیش از ۳۰ حرف باشد.")]
    string Name,

    [Required]
    [MinLength(2, ErrorMessage = "نام خانوادگی حداقل باید ۲ حرف باشد.")]
    [MaxLength(30, ErrorMessage = "نام خانوادگی نمی‌تواند بیش از ۳۰ حرف باشد.")]
    string LastName,

    [RegularExpression(@"^98\d{10}$", ErrorMessage = "شماره تلفن باید با 98 شروع شود و ۱۲ رقم باشد.")]
    string? PhoneNum,

    [Required]
    [RegularExpression(@"^(male|female)$", ErrorMessage = "مقدار جنسیت باید male یا female باشد.")]
    string Gender,

    [Required(ErrorMessage = "تاریخ تولد الزامی است.")]
    DateOnly DateOfBirth
);