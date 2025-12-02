namespace api.DTOs;

public record AddEnrolledCourseDto(
    [Required(ErrorMessage = "Course title is required.")]
    string Title,

    [Required(ErrorMessage = "ClassName is required.")]
    string ClassName,

    [Range(1, 99)]
    int NumberOfPayments, //4

    [Range(0, int.MaxValue,
        ErrorMessage = "The minimum prepayment amount must be at least 0 and cannot be negative.")]
    int PaidAmount //2_000_000
);

public class ShowEnrolledCourseDto
{
    public ObjectId CourseId { get; init; }
    public int CourseTuition { get; init; }
    public int NumberOfPayments { get; init; }
    public int PaidNumber { get; init; }
    public int NumberOfPaymentsLeft { get; init; }
    public int PaymentPerMonth { get; init; }
    public int PaidAmount { get; init; }
    public int LastPaymentPerMonth { get; init; }
    public int TuitionRemainder { get; init; }
};

public class UpdateEnrolledDto
{
    [Required(ErrorMessage = "Course title is required.")]
    public string TitleCourse { get; init; } = string.Empty;

    [Range(0, int.MaxValue,
        ErrorMessage = "The minimum prepayment amount must be at least 0 and cannot be negative.")]
    public int PaidAmount { get; init; }

    [Required]
    [EnumDataType(typeof(PaymentMethod), ErrorMessage = "Invalid payment method.")]
    public PaymentMethod Method { get; init; }
}