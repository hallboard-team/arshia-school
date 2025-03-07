using MongoDbGenericRepository.Attributes;

namespace api.Models;

[CollectionName("attendences")]
public record Attendence (
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    ObjectId StudentId, 
    ObjectId CourseId,
    // string UserName,
    // string DaysOfWeek, //shanbe //1shanbe
    DateOnly Date //25/6/1402
    // bool IsPresent
);

// [CollectionName("attendencesDemo")]
// public record AttendenceDemo (
//     [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
//     ObjectId StudentId, 
//     string UserName,
//     DateTime Time,
//     string AbsentOrPresent
// );