using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        [HttpGet("by-{email}")]
        public IActionResult GetReviewsByEmail(string email)
        {
            return Ok(new object[] { });
        }
    }
} 