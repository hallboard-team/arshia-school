using backend.Serializers;

namespace api.Models;

[CollectionName("users")]
public class AppUser : MongoIdentityUser<ObjectId>
{
    public int Schema { get; init; } = 2;
    public string? IdentifierHash { get; init; }
    public DateOnly DateOfBirth { get; init; }
    public string Name { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? PhoneNum { get; init; } = string.Empty;

    [BsonSerializer(typeof(SafeGenderSerializer))]
    public GenderType Gender { get; init; } = GenderType.Unknown;
    public List<EnrolledCourse> EnrolledCourses { get; init; } = [];
    public List<string> appRoles { get; init; } = [];
}