namespace api.Extensions;

public static class AppVariablesExtensions
{
    public const string TokenKey = "TokenKey";
    public const string CollectionUsers = "users";
    public const string CollectionCourses = "courses";
    public const string CollectionAttendences = "attendences";
    public const string CollectionAttendencesDemo = "attendences";
    public const string CollectionFollows = "follows";
    public const string CollectionExceptionLogs = "exception-logs";

    public static readonly string[] AppVersions = ["1", "1.0.2"];

    public static readonly AppRole[] roles = [
            new() {Name = Roles.Admin.ToString()},
            new() {Name = Roles.Manager.ToString()},
            new() {Name = Roles.Secretary.ToString()},
            new() {Name = Roles.Teacher.ToString()},
            new() {Name = Roles.Student.ToString()}
        ];
}

public enum Roles
{
    Admin,
    Manager,
    Secretary,
    Teacher,
    Student
}
