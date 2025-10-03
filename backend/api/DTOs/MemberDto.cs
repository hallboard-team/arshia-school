public record MemberDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    GenderType Gender,
    int Age,
    DateOnly DateOfBirth,
    bool IsAbsent
);