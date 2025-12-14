namespace api.DTOs;

public record CreateSiteDto(
    [Length(2, 30, ErrorMessage = "نام اتاق باید بین ۲ تا ۳۰ حرف باشد")]
    string Name,
    [Length(2, 30, ErrorMessage = "نام دپارتمان باید بین ۲ تا ۳۰ حرف باشد")]
    string Department,
    int Floor,
    int Capacity
);

public record ShowSiteDto(
    string Name,
    string Department,
    int Floor,
    int Capacity
);

public record UpdateSiteDto(
    [Length(2, 30, ErrorMessage = "نام اتاق باید بین ۲ تا ۳۰ حرف باشد")]
    string Name,
    [Length(2, 30, ErrorMessage = "نام دپارتمان باید بین ۲ تا ۳۰ حرف باشد")]
    string Department,
    int Floor,
    int Capacity
);