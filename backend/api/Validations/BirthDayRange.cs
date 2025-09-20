namespace api.Validations;

public sealed class BirthDateRangeAttribute : ValidationAttribute
{
    public int MinYears { get; set; } = 11;
    public int MaxYears { get; set; } = 99;

    protected override ValidationResult? IsValid(object? value, ValidationContext _)
    {
        if (value is not DateOnly dob) return ValidationResult.Success;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var age = today.Year - dob.Year;
        if (dob > today.AddYears(-age)) age--;

        if (age < MinYears) return new ValidationResult($"حداقل سن {MinYears} سال است.");
        if (age > MaxYears) return new ValidationResult($"حداکثر سن {MaxYears} سال است.");
        return ValidationResult.Success;
    }
}