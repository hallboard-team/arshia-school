namespace api.DTOs;

public record MemberUpdateDto(
    string Email,
    string CurrentPassword,
    string Password,
    string ConfirmPassword
);