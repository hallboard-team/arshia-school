namespace api.Helpers;

public class MemberParams : PaginationParams
{   
    [MaxLength(100)]
    public string? Search { get; set; } = string.Empty;
    
    [Range(11, 99)]
    public int MinAge { get; set; }
    
    [Range(11, 99)]
    public int MaxAge { get; set; }
}