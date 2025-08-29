using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PentagonPowerWebTools.Modules
{
    public class ModulesController : Controller
    {
        public JsonResult List()
        {
            var configPath = Server.MapPath("~/Modules/Modules.config.json");
            if (!System.IO.File.Exists(configPath))
                return Json(new string[0], JsonRequestBehavior.AllowGet);

            var json = System.IO.File.ReadAllText(configPath);
            var parsed = JObject.Parse(json);

            var modules = parsed["modules"]
                .Where(m => (bool)m["enabled"])
                .Select(m => (string)m["name"])
                .ToList();

            return Json(modules, JsonRequestBehavior.AllowGet);
        }
    }
}