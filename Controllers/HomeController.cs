using Microsoft.AspNetCore.Mvc;
using Practice.Entities.DataModels;
using Practice.Entities.Model;
using Practice.Models;
using Practice.Repository.IRepository;
using System.Diagnostics;

namespace Practice.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private ImagesdbContext _context;
        private IPracticeRepository _practiceRepository;

        public HomeController(ImagesdbContext context, ILogger<HomeController> logger, IPracticeRepository practiceRepository)
        {
            _logger = logger;
            _context = context;
            _practiceRepository = practiceRepository;
        }

        public IActionResult Index()
        {
            ImageDataModel imageRecords = _practiceRepository.GetAllData();
            return View(imageRecords);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        const int number = 0;

        [HttpPost]
        public IActionResult Storydatasave(ImageDataModel formData)
        {
            // delete image
            var oldimage = _context.ImgRecords.Where(user => user.Userno == 1).ToList();

            for (int i = 0; i < oldimage.Count(); i++)
            {
                var oldImage = oldimage[i].Path;
                System.IO.File.Delete(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "MissionImages", oldImage));
            }
            _context.ImgRecords.RemoveRange(oldimage);
            _context.SaveChanges();

            foreach (var Images in formData.Images)
            {

                if (Images != null)
                {
                    var imageNames = Images.FileName;
                    var randomGenerate = Guid.NewGuid().ToString().Substring(0, 8);
                    var fileName = $"{randomGenerate}_{imageNames}";

                    string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "MissionImages", fileName);

                    using (var fileStrem = new FileStream(filePath, FileMode.Create))
                    {
                        Images.CopyTo(fileStrem);
                    }

                    var allimages = new ImgRecord
                    {
                        Userno = number + 1,
                        Path = fileName,
                    };

                    _context.ImgRecords.Add(allimages);
                    _context.SaveChanges();
                }
            }

            return Json(true);
        }

        [HttpPost]
        public IActionResult Draftdata()
        {
            var draftdata = _context.ImgRecords.Where(imgdata => imgdata.Userno == 1).Select(imgdata => imgdata.Path).ToList();

            var datarecords = new
            {
                imgdata = draftdata
            };
            return Json(new { success = true, data = datarecords });
        }

        [HttpPost]

        public IActionResult UserRating(int userRating)
        {
            var data = _context.ImgRecords.Where(user => user.Userno == 1).FirstOrDefault();
            data.Rating = userRating;
            _context.SaveChanges();

            var  datarating = new {

                userRating = userRating,
            };

            return Json(new { success = true, data = datarating });
        }
    }
}