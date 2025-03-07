namespace api.DTOs;
public record AddStudentStatusDto(
    // ObjectId StudentId,
    string UserName,
    // string DaysOfWeek,
    // DateTime Date,
    // string AbsentOrPresent
    bool IsAbsent
);
  
public class ShowStudentStatusDto
{
    // public AppUser? UserName { get; init; }
    // public ObjectId StudentId { get; init; }
    // public string UserName { get; init; } = string.Empty;
    // public string DaysOfWeek { get; init; }
    public DateOnly Date { get; init; }
    public string CourseId { get; init; }
    // public string AbsentOrPresent { get; init; }
    // public bool IsPresent { get; init; }
}

// public record AddStudentStatusDemo(
//     ObjectId StudentId,
//     string UserName,
//     string Time,
//     // DateOnly Date,
//     string AbsentOrPresent
// );
// public class ShowStudentStatusDtoDemo
// {
//     // public AppUser? UserName { get; init; }
//     public ObjectId StudentId { get; init; }
//     public string UserName { get; init; }
//     public DateTime Time { get; init; }
//     public string AbsentOrPresent { get; init; }
// }