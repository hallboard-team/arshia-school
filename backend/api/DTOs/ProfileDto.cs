namespace api.DTOs;

public record ProfileDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    GenderType Gender,
    int Age
);