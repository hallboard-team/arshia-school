namespace api.Validations;

public sealed class MultipleOfMillionAttribute : ValidationAttribute
{
    public int Step { get; init; } = 1_000_000;
    public int Min { get; init; } = 1_000_000;

    public MultipleOfMillionAttribute()
    {
        ErrorMessage = "مبلغ باید مضربی از ۱,۰۰۰,۰۰۰ باشد و کمتر از ۱,۰۰۰,۰۰۰ نیست.";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is null) return ValidationResult.Success;
        if (value is not int v) return new ValidationResult("فرمت مبلغ معتبر نیست.");

        return (v >= Min && v % Step == 0) ? ValidationResult.Success : new ValidationResult(ErrorMessage);
    }
}