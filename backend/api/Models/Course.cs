namespace api.Models;

[CollectionName("courses")]
public record Course(
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    string Title,
    string ClassName,
    List<ObjectId> ProfessorsIds,
    int Tuition,
    int TotalMinutes,
    int ClassMinutes,
    int Days,
    DateTime Start,
    bool IsStarted
);

public record EnrolledCourse(
    ObjectId CourseId,
    string CourseTitle,
    string ClassName,
    int CourseTuition,
    int NumberOfPayments,
    int PaidNumber,
    int NumberOfPaymentsLeft,
    int PaymentPerMonth,
    int PaidAmount,
    int TuitionRemainder,
    int LastpaymentPerMonth,
    List<Payment> Payments
);

public record Payment(
    [property: BsonId] string Id,
    string CourseTitle,
    int Amount,
    DateTime PaidOn,
    PaymentMethod Method,
    Photo? Photo
);