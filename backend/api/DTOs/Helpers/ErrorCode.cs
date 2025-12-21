namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsNotFound,
    IsClassRoomNotFound,
    IsCourseNotFound,
    IsUserNotFound,
    IsSiteNotFound,
    IsClasssNotFound,
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
    IsDuplicateUser,
    IsDuplicateEmail,
    IsDuplicatePhone,
    IsNumberOfPaymentsUnderZero,
    IsAlreadyEnrolled,
    IsNotEnrolled,
    IsAnyUpdateMake,
    IsAnyDeleteMake,
    IsGenderValid,
    IsPaymentNotFound
}