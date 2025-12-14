namespace api.Models;

public class Site
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public int Floor { get; init; } 
    public int Capacity { get; init; }
}