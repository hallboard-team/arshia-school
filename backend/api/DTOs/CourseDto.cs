namespace api.DTOs;

public record AddCourseDto(
    string Title,
    int Tuition,
    int Hours,
    double HoursPerClass,
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
    public string Title { get; init; } = string.Empty;
    public int Tuition { get; init; }
    public int Hours { get; init; }
    public double HoursPerClass { get; init; }
    public DateTime Start { get; init; }
    public string IsStarted { get; init; } = string.Empty;
};