namespace api.Models;

[CollectionName("roles")]
public class AppRole : MongoIdentityRole<ObjectId>
{
}