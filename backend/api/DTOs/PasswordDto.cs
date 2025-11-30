namespace api.DTOs;

public record PasswordDto(
    [MinLength(7, ErrorMessage = "حداقل 7 کاراکتر.")]
    [MaxLength(20, ErrorMessage = "حداکثر ۲۰ کاراکتر.")]
    string? CurrentPassword,

    [MinLength(7, ErrorMessage = "حداقل 7 کاراکتر.")]
    [MaxLength(20, ErrorMessage = "حداکثر ۲۰ کاراکتر.")]
    string? NewPassword,

    [MinLength(7, ErrorMessage = "حداقل 7 کاراکتر.")]
    [MaxLength(20, ErrorMessage = "حداکثر ۲۰ کاراکتر.")]
    string? ConfirmPassword
);