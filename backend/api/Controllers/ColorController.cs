namespace api.Controllers;
    
public class ColorController : BaseApiController
{
    private static string UserColor = "#ffffff";

    [HttpPost("set-color")]
    public ActionResult SetColor(ColorRequest request)
    {
        UserColor = request.Color;
        return Ok(new { success = true, color = UserColor });
    }

    [HttpGet("get-color")]
    public ActionResult GetColor()
    {
        return Ok(new { color = UserColor });
    }
}