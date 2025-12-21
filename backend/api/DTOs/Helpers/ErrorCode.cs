namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsNotFound,
    IsCourseNotFound,
    IsUserNotFound,
    IsSiteNotFound,
    IsOperationFailed,
    IsInvalidType,
    IsPasswordInvalid,
    IsIdentityFailed,
    IsRoleIdentityFailed,
    ArePasswordsNotMatch,
    IsDuplicateSite,
    IsDuplicateCourse,
    IsDuplicateClass,
    IsTokenGenerationFailed,
    IsInvalidUserReference,
    IsDuplicateUser
}