namespace api.DTOs;

public record AddStudentStatusDto(
    string UserName,
    bool IsAbsent
);

public class ShowStudentStatusDto
{
    public DateOnly Date { get; init; }
    public string CourseId { get; init; } = string.Empty;
}