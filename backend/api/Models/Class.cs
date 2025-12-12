namespace api.Models;

[CollectionName("classes")]
public class Class
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; init; }
    public string ClassName { get; set; } = string.Empty;
    public ObjectId? CourseId { get; init; }
    public ObjectId? SiteId { get; init; }
    public List<ObjectId> ProfessorsIds { get; init; } = [];
    public int Tuition { get; init; }
    public int ClassMinutes { get; init; }
    public int Days { get; init; }
    public DateOnly StartDate  { get; init; }
    public DateOnly EndedDate { get; init; }
    public bool IsStarted { get; init; }
    public bool IsEnded { get; init; }
    public bool IsActive { get; init; }
}

public record EnrolledCourse(
    ObjectId ClassId,
    // string CourseTitle,
    // string ClassName,
    // int CourseTuition,
    int NumberOfPayments,
    int PaidNumber,
    int NumberOfPaymentsLeft,
    int PaymentPerMonth,
    int PaidAmount,
    int TuitionRemainder,
    int LastpaymentPerMonth,
    List<ObjectId> PaymentsId
);

public record Payment(
    [property: BsonId] string Id,
    string CourseTitle,
    int Amount,
    DateTime PaidOn,
    PaymentMethod Method,
    Photo? Photo
);