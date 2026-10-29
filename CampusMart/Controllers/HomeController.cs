using CampusMart.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace CampusMart.Controllers
{
    public class HomeController : Controller
    {
        // Mao ni imong HOME
        public IActionResult HomeIndex()
        {
            return View();
        }

        // Mao ni imong ABOUT
        public IActionResult About()
        {
            return View();
        }

        // Pwede pud ka magpuno og CONTACT
        public IActionResult Contact()
        {
            return View();
        }

        // I-pabilin lang ni para sa safety sa imong app
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
