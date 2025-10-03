using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace backend.Serializers;

public sealed class SafeGenderSerializer : StructSerializerBase<GenderType>
{
    public override GenderType Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var t = context.Reader.GetCurrentBsonType();
        switch (t)
        {
            case BsonType.Null:
                context.Reader.ReadNull();
                return GenderType.Unknown;

            case BsonType.Int32:
                var i = context.Reader.ReadInt32();
                return System.Enum.IsDefined(typeof(GenderType), i) ? (GenderType)i : GenderType.Unknown;

            case BsonType.String:
                var s = context.Reader.ReadString();
                if (string.IsNullOrWhiteSpace(s)) return GenderType.Unknown;
                return System.Enum.TryParse<GenderType>(s, ignoreCase: true, out var g) ? g : GenderType.Unknown;

            default:
                context.Reader.SkipValue();
                return GenderType.Unknown;
        }
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, GenderType value)
    {
        context.Writer.WriteString(value.ToString());
    }
}