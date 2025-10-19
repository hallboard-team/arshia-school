namespace api.DTOs;

public record AddCourseDto(
    [Required, MinLength(2, ErrorMessage = "عنوان حداقل ۲ کاراکتر است"),
     MaxLength(30, ErrorMessage = "عنوان حداکثر ۳۰ کاراکتر است")]
    string Title,

    [Required, Range(1_000_000, int.MaxValue, ErrorMessage = "کمترین مبلغ ۱,۰۰۰,۰۰۰ است"),
     MultipleOfMillion(ErrorMessage = "مبلغ باید مضربی از ۱,۰۰۰,۰۰۰ باشد و کمتر از ۱,۰۰۰,۰۰۰ نیست.")]
    int Tuition,

    [Required, Range(1, 500, ErrorMessage = "ساعت دوره باید بین ۱ تا ۵۰۰ باشد")]
    int Hours,

    [Required, HalfStepRange(1, 4, ErrorMessage = "ساعت هر کلاس باید بین ۱ تا ۴ و مضربی از ۰٫۵ باشد.")]
    double HoursPerClass,

    [Required, StartDateNotBeforeToday(ErrorMessage = "تاریخ شروع نمی‌تواند قبل از امروز باشد.")]
    DateTime Start
);

public class ShowCourseDto
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public List<string> ProfessorUserNames { get; init; } = new();
    public List<string> ProfessorNames { get; init; } = new();
    public int Tuition { get; init; }
    public int Hours { get; init; }
    public double HoursPerClass { get; init; }
    public int Days { get; init; }
    public DateTime Start { get; init; }
    public string IsStarted { get; init; } = string.Empty;
};

public class UpdateCourseDto
{
    [Required, MinLength(2, ErrorMessage = "عنوان حداقل ۲ کاراکتر است"),
     MaxLength(30, ErrorMessage = "عنوان حداکثر ۳۰ کاراکتر است")]
    public string Title { get; init; } = string.Empty;

    [Required, Range(1_000_000, int.MaxValue, ErrorMessage = "کمترین مبلغ ۱,۰۰۰,۰۰۰ است"),
     MultipleOfMillion(ErrorMessage = "مبلغ باید مضربی از ۱,۰۰۰,۰۰۰ باشد و کمتر از ۱,۰۰۰,۰۰۰ نیست.")]
    public int Tuition { get; init; }

    [Required, Range(1, 500, ErrorMessage = "ساعت دوره باید بین ۱ تا ۵۰۰ باشد")]
    public int Hours { get; init; }

    [Required, HalfStepRange(1, 4, ErrorMessage = "ساعت هر کلاس باید بین ۱ تا ۴ و مضربی از ۰٫۵ باشد.")]
    public double HoursPerClass { get; init; }

    [Required, StartDateNotBeforeToday(ErrorMessage = "تاریخ شروع نمی‌تواند قبل از امروز باشد.")]
    public DateTime Start { get; init; }

    public string IsStarted { get; init; } = string.Empty;
}