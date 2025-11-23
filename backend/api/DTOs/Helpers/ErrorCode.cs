namespace api.DTOs.Account;

public enum ErrorCode
{
    IsWrongCreds,
    IsUserNotFound,
    IsOperationFailed,
    IsInvalidType,
    IsPasswordInvalid,
    IsIdentityFailed,
    ArePasswordsNotMatch
}