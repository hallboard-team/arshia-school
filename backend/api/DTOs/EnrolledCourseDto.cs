namespace api.DTOs;

public record AddEnrolledCourseDto(
    [Required(ErrorMessage = "Course title is required.")]
    string Title,

    [Required(ErrorMessage = "Course title is required.")]
    string className,

    [Range(1, 99)]
    int NumberOfPayments, //4

    [Range(10000, int.MaxValue, ErrorMessage = "The minimum payment amount must not be less than 10,000 Tomans.")]
    int PaidAmount //2_000_000
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
    public int LastILastpaymentPerMonth { get; init; }  
    public int TuitionRemainder { get; init; }
};

public class UpdateEnrolledDto
{
    [Required(ErrorMessage = "Course title is required.")]
    public string TitleCourse { get; init; } = string.Empty;

    // [Range(500000, int.MaxValue, ErrorMessage = "Paid amount must be greater than zero.")]
    [Range(10000, int.MaxValue, ErrorMessage = "The minimum payment amount must not be less than 10,000 Tomans.")]
    public int PaidAmount { get; init; }

    [Required]
    [EnumDataType(typeof(PaymentMethod), ErrorMessage = "Invalid payment method.")]
    public PaymentMethod Method { get; init; }
}