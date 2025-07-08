namespace api.DTOs;

public record MemberUpdateDto(
    string Email,
    // string UserName,
    string CurrentPassword,
    string Password,
    string ConfirmPassword
);