namespace api.DTOs;

public record TargetMemberDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    GenderType Gender,
    int Age,
    DateOnly DateOfBirth,
    List<EnrolledCourse> EnrolledCourses
);