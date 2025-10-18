namespace api.Validations;

public sealed class StartDateNotBeforeTodayAttribute : ValidationAttribute
{
    public bool UseUtc { get; init; } = true;

    public StartDateNotBeforeTodayAttribute()
    {
        ErrorMessage = "تاریخ شروع نمی‌تواند قبل از امروز باشد.";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is null) return ValidationResult.Success;
        if (value is not DateTime dt) return new ValidationResult("فرمت تاریخ معتبر نیست.");

        var today = (UseUtc ? DateTime.UtcNow : DateTime.Now).Date;
        return dt.Date >= today ? ValidationResult.Success : new ValidationResult(ErrorMessage);
    }
}