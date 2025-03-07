namespace api.Extensions;

public static class ValidationsExtensions
{
    public static ObjectId? ValidateObjectId(ObjectId? objectId)
    {
        return objectId is null || !objectId.HasValue || objectId.Equals(ObjectId.Empty)
        ? null
        : objectId;
    }

    // public static List<ObjectId?> ValidateListObjectId(ObjectId? objectId)
    // {
    //     return objectId is null || objectId.Equals(ObjectId.Empty)
    //     ? null
    //     : objectId;
    // }
}