namespace api.DTOs;

public record AddCourseDto(
    [Required, MinLength(2, ErrorMessage = "عنوان حداقل ۲ کاراکتر است"),
     MaxLength(30, ErrorMessage = "عنوان حداکثر ۳۰ کاراکتر است")]
    string Title,

    [Required, MinLength(1, ErrorMessage = "نام کلاس باید حداقل ۲ کاراکتر باشد"),
        MaxLength(30, ErrorMessage = "نام کلاس باید حداکثر ۳۰ کاراکتر باشد")]
    string ClassName,

    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    int Tuition,

    [Required, Range(0.5, 20000, ErrorMessage = "ساعت دوره باید بین ۰٫۵ ساعت تا ۲۰,۰۰۰ ساعت باشد")]
    double Hours,

    [Required, HalfStepRange(0.5, 10, ErrorMessage = "ساعت هر کلاس باید بین ۰,۵ تا ۱۰ ساعت باشد.")]
    double HoursPerClass,

    [Required, StartDateNotBeforeToday(ErrorMessage = "تاریخ شروع نمی‌تواند قبل از امروز باشد.")]
    DateTime Start
);

public record ShowClassAndTitleDto(
    string Title,
    string ClassName
);

public class ShowCourseDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string ClassName { get; set; } = string.Empty;
    public List<string> ProfessorUserNames { get; init; } = new();
    public List<string> ProfessorNames { get; init; } = new();
    public int Tuition { get; init; }
    public double Hours { get; init; }
    public double HoursPerClass { get; init; }
    public int Days { get; init; }
    public DateTime Start { get; init; }
    public bool IsStarted { get; init; }
};

public class CourseResponse
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public List<string> ProfessorUserNames { get; init; } = new();
    public List<string> ProfessorNames { get; init; } = new();
    public int Tuition { get; init; }
    public int TotalMinutes { get; init; }
    public int ClassMinutes { get; init; }
    public int Days { get; init; }
    public DateTime Start { get; init; }
    public bool IsStarted { get; init; }
}

public class UpdateCourseDto
{
    [Required, MinLength(2, ErrorMessage = "عنوان حداقل ۲ کاراکتر است"),
     MaxLength(30, ErrorMessage = "عنوان حداکثر ۳۰ کاراکتر است")]
    public string Title { get; init; } = string.Empty;

    [Required, Range(10_000, 100_000_000, ErrorMessage = "مبلغ باید بین ۱۰,۰۰۰ تومن و ۱۰۰,۰۰۰,۰۰۰ تومن باشد."),]
    public int Tuition { get; init; }

    [Required, Range(0.5, 20000, ErrorMessage = "ساعت دوره باید بین ۰٫۵ ساعت تا ۲۰,۰۰۰ ساعت باشد")]
    public double Hours { get; init; }

    [Required, HalfStepRange(0.5, 10, ErrorMessage = "ساعت هر کلاس باید بین ۰,۵ تا ۱۰ ساعت باشد.")]
    public double HoursPerClass { get; init; }

    [Required, StartDateNotBeforeToday(ErrorMessage = "تاریخ شروع نمی‌تواند قبل از امروز باشد.")]
    public DateTime Start { get; init; }

    public bool IsStarted { get; init; }
}