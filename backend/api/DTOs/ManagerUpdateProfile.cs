namespace api.DTOs;

public record ManagerUpdateProfile(
    string? Name,
    string? LastName,
    DateOnly? DateOfBirth,
    string? PhoneNum,
    string? CurrentPassword,
    string? NewPassword,
    string? ConfirmPassword
);