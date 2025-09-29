using System.Text.Json.Serialization;

namespace api.Controllers.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GenderType
{
    Unknown,
    Male,
    Female,
    Other
}