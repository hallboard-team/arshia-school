public record ManagerUpdateMemberDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    string Gender,
    DateOnly DateOfBirth
);