namespace api.Extensions;

public static class AppVariablesExtensions
{
    public const string TokenKey = "TokenKey";

    public const string collectionUsers = "users";
    public const string collectionCourses = "courses";
    public const string collectionAttendences = "attendences";
    public const string collectionAttendencesDemo = "attendences";
    public const string collectionFollows = "follows";
    public const string collectionExceptionLogs = "exception-logs";

    public readonly static string[] AppVersions = ["1", "1.0.2"];

    public readonly static AppRole[] roles = [
            new() {Name = Roles.admin.ToString()},
            new() {Name = Roles.manager.ToString()},
            new() {Name = Roles.secretary.ToString()},
            new() {Name = Roles.teacher.ToString()},
            new() {Name = Roles.student.ToString()}
        ];
}

public enum Roles
{
    admin,
    manager,
    secretary,
    teacher,
    student
}