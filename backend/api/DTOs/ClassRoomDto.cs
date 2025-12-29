namespace api.DTOs;

public record CreateClassRoomDto(
    [Length(1, 30, ErrorMessage = "نام کلاس باید بین ۱ و ۳۰ حرف باشد")]
    string ClassRoomName,
    [Length(2, 30, ErrorMessage = "نام دوره باید بین ۲ و ۳۰ حرف باشد")]
    string CourseName,
    [Length(2, 30, ErrorMessage = "نام اتاق باید بین ۲ و ۳۰ حرف باشد")]
    string SiteName,
    [Required, HalfStepRange(0.5, 10, ErrorMessage = "ساعت هر کلاس باید بین ۰,۵ تا ۱۰ ساعت باشد.")]
    double ClassRoomMinutes,
    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    int Tuition,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsActive
);

public record ShowClassRoomDto(
    string ClassRoomName,
    ShowCourseDto Course,
    ShowSiteDto Site,
    List<string> ProfessorUserNames,
    List<string> ProfessorNames,
    int Tuition,
    double ClassRoomMinutes,
    int Days,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsEnded,
    bool IsActive
);

public record UpdateClassRoomDto(
    [Length(1, 30, ErrorMessage = "نام کلاس باید بین ۱ و ۳۰ حرف باشد")]
    string ClassRoomName,
    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    int Tuition,
    [Required, HalfStepRange(0.5, 10, ErrorMessage = "ساعت هر کلاس باید بین ۰,۵ تا ۱۰ ساعت باشد.")]
    double ClassRoomMinutes,
    DateOnly StartDate,
    DateOnly EndedDate,
    bool IsStarted,
    bool IsEnded,
    bool IsActive
);

public record CourseAndSite(
    string ClassRoomName,
    string CourseName
);