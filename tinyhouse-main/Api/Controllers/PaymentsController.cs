using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        [HttpGet("by-{email}")]
        public IActionResult GetPaymentsByEmail(string email)
        {
            return Ok(new object[] { });
        }
    }
} 