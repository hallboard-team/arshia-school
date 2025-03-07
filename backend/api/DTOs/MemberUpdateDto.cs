namespace api.DTOs;

public record MemberUpdateDto (
    string Email,
    // string UserName,
    string currentPassword,
    string Password,
    string ConfirmPassword
);