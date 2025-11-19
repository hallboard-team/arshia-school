namespace api.DTOs;

public record PasswordDto(
    string? CurrentPassword,
    string? NewPassword,
    string? ConfirmPassword
);