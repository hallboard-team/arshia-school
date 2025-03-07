using MongoDbGenericRepository.Attributes;

namespace api.Models;

[CollectionName("courses")]
public record Course(
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    string Title, // English
    List<ObjectId> ProfessorsIds, //132342344
    // List<string> ProfessorsUserNames,
    int Tuition, //6_000_000t
    int Hours, //128h
    Double HoursPerClass,
    int Days, // Cal in API
    DateTime Start, //TODO: Rename to StartOn //  1 mars 2025
    string IsStarted  
);


// enum TitleType 
// {
//     PROGRAMMING,
//     MATH,
//     ICDL
// }

public record EnrolledCourse(
    // Guid Id,
    // string CourseId,
    ObjectId CourseId,
    string CourseTitle,
    int CourseTuition, //6_000_000t
    int NumberOfPayments, //4
    int PaidNumber, //1
    int NumberOfPaymentsLeft, //3
    int PaymentPerMonth, //2_000_000
    int PaidAmount, //2_000_000
    int TuitionRemainder, //6_000_000
    List<Payment> Payments
);

public record Payment(
    // Guid Id,
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    string CourseTitle,
    int Amount,
    DateTime PaidOn,
    string Method, //aberbank / naghdi
    Photo? Photo
);

// public class Payment(
//     // Guid Id,
//     [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
//     string CourseTitle,
//     int Amount,
//     DateTime PaidOn,
//     string Method, //aberbank / naghdi
//     Photo? Photo
// );