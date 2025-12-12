namespace api.DTOs;

public record CreateClassDto(
    [Length(1, 30, ErrorMessage = "نام کلاس باید بین ۱ و ۳۰ حرف باشد")]
    string ClassName,
    [Length(2, 30, ErrorMessage = "نام دوره باید بین ۲ و ۳۰ حرف باشد")]
    string CourseName,
    [Length(2, 30, ErrorMessage = "نام اتاق باید بین ۲ و ۳۰ حرف باشد")]
    string SiteName,
    [Required, HalfStepRange(0.5, 10, ErrorMessage = "ساعت هر کلاس باید بین ۰,۵ تا ۱۰ ساعت باشد.")]
    double ClassMinutes,
    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    int Tuition,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsActive
);

public record ShowClassDto(
    string ClassName,
    ShowCourseDto Course,
    ShowSiteDto Site,
    int Tuition,
    double ClassMinutes,
    int Days,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsEnded,
    bool IsActive
);

public record UpdateClassDto(
    [Length(1, 30, ErrorMessage = "نام کلاس باید بین ۱ و ۳۰ حرف باشد")]
    string ClassName,
    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    int Tuition,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsEnded,
    bool IsActive
);