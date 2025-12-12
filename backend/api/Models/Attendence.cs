namespace api.Models;

[CollectionName("attendences")]
public record Attendence(
    [Optional][property: BsonId, BsonRepresentation(BsonType.ObjectId)] ObjectId Id,
    ObjectId StudentId,
    ObjectId ClassId,
    DateOnly Date //25/6/1402
);