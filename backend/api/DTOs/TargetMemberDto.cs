namespace api.DTOs;

public record TargetMemberDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    string Gender,
    int Age,
    List<EnrolledCourse> EnrolledCourses
);