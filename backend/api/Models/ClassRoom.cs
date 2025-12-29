namespace api.Models;

[CollectionName("classes")]
public class ClassRoom
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; init; }
    public string ClassRoomName { get; set; } = string.Empty;
    public ObjectId? CourseId { get; init; }
    public ObjectId? SiteId { get; init; }
    public List<ObjectId> ProfessorsIds { get; init; } = [];
    public int Tuition { get; init; }
    public int ClassRoomMinutes { get; init; }
    public int Days { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndedDate { get; init; }
    public bool IsStarted { get; init; }
    public bool IsEnded { get; init; }
    public bool IsActive { get; init; }
}

public record EnrolledClassRoom(
    ObjectId ClassRoomId,
    int NumberOfPayments,
    int PaidNumber,
    int NumberOfPaymentsLeft,
    int PaymentPerMonth,
    int PaidAmount,
    int TuitionRemainder,
    int LastPaymentPerMonth,
    List<Payment> Payments
);

public record Payment(
    [property: BsonId] ObjectId Id,
    string ClassRoomTitle,
    int Amount,
    DateTime PaidOn,
    PaymentMethod Method,
    Photo? Photo
);