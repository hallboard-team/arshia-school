using backend.Serializers;
using MongoDB.Bson.Serialization;

namespace api.Serializers;

public static class BsonSerializerBootstrapper
{
    private static int _initialized;

    public static void RegisterOnce()
    {
        if (Interlocked.Exchange(ref _initialized, 1) == 1) return;

        var current = BsonSerializer.LookupSerializer<GenderType>();
        if (current is not SafeGenderSerializer)
        {
            try
            {
                BsonSerializer.RegisterSerializer(typeof(GenderType), new SafeGenderSerializer());
            }
            catch (MongoDB.Bson.BsonSerializationException)
            {
            }
        }
    }
}