namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsNotFound,
    IsClassRoomNotFound,
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
    IsDeleteNotAllowed,
    IsDuplicateClass,
}