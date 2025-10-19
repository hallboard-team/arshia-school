namespace api.Validations;

public sealed class HalfStepRangeAttribute : ValidationAttribute
{
    public double Min { get; }
    public double Max { get; }

    public HalfStepRangeAttribute(double min, double max)
    {
        Min = min; Max = max;
        ErrorMessage = $"ساعت هر کلاس باید بین {min} تا {max} و مضربی از ۰٫۵ باشد.";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is null) return ValidationResult.Success;
        if (value is not double d) return new ValidationResult("فرمت عدد معتبر نیست.");

        if (d < Min || d > Max) return new ValidationResult(ErrorMessage);

        var timesTwo = d * 2;
        var isHalfStep = Math.Abs(timesTwo - Math.Round(timesTwo)) < 1e-9;
        return isHalfStep ? ValidationResult.Success : new ValidationResult(ErrorMessage);
    }
}
