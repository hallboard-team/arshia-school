namespace api.DTOs;

public record AddEnrolledCourseDto(
    string TitleCourse,
    int NumberOfPayments, //4
    int PaidAmount //2_000_000
    // int PaidNumber, //0
);

public class ShowEnrolledCourseDto
{
    public ObjectId CourseId { get; init; }
    public int CourseTuition { get; init; }
    public int NumberOfPayments { get; init; }
    public int PaiedNumber { get; init; }
    public int NumberOfPaymentsLeft { get; init; }
    public int PaymentPerMonth { get; init; }
    public int PaiedAmount { get; init; }
    public int TuitionRemainder { get; init; }
    // public string Title { get; init; }
};

public class UpdateEnrolledDto{
    public string TitleCourse { get; init; } = string.Empty;
    public int PaidAmount { get; init; }
    public string Method { get; init; } = string.Empty;
}