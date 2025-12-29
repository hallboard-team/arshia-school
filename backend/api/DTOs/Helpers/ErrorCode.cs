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
    ArePasswordsNotMatch,
    IsDuplicateSite,
    IsDuplicateCourse,
    IsDuplicateClass,
}