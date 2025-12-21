namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsNotFound,
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