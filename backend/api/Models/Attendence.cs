namespace api.Models;

[CollectionName("attendences")]
public record Attendence(
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    ObjectId StudentId,
    ObjectId CourseId,
    DateOnly Date //25/6/1402
);