namespace api.DTOs;

public record ProfileDto(
    string Email,
    string UserName,
    string Name,
    string LastName,
    string? PhoneNum,
    string Gender,
    int Age,
    List<EnrolledCourse> EnrolledCourses
);