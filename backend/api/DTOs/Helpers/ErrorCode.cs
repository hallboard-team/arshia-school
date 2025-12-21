namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsNotFound,
    IsClassRoomNotFound,
    IsCourseNotFound,
    IsUserNotFound,
    IsSiteNotFound,
    IsClassNotFound,
    IsOperationFailed,
    IsInvalidType,
    IsPasswordInvalid,
    IsIdentityFailed,
    IsRoleIdentityFailed,
    ArePasswordsNotMatch,
    IsDuplicateSite,
    IsDuplicateCourse,
    IsDeleteNotAllowed,
    IsDuplicateClass,
    IsTokenGenerationFailed,
    IsInvalidUserReference,
    IsDuplicateUser
}