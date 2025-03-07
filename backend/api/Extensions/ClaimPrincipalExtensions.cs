namespace api.Extensions;

public static class ClaimPrincipalExtensions
{
    public static string? GetHashedUserId(this ClaimsPrincipal user) // principal
    {
        return user.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    // public static string? GetUserEmail(this ClaimsPrincipal user)
    // {
    //     return user.FindFirstValue(ClaimTypes.Email);
    // }
}