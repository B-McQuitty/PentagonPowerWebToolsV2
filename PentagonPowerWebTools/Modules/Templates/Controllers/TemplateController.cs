using BlueCieloECM.InnoCielo.Meridian.Client;
using BlueCieloECM.InnoCielo.Meridian.Server;
using Newtonsoft.Json;
using PentagonPowerWebTools.Modules.DownloadTool.Classes;
using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;

namespace PentagonPowerWebTools.Modules.Templates.Controllers
{
    public class TemplateController : Controller
    {
        #region Web API EndPoints

        #region Get

        // GET /Template/Ping
        [HttpGet]
        public ActionResult Ping()
        {
            return Json(new { status = "ok", message = "DownloadTool API is alive" }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Post

        // POST /Template/DownloadFiles
        [HttpPost]
        public ActionResult PostMessage()
        {
            try
            {
                Request.InputStream.Seek(0, SeekOrigin.Begin);
                string json = new StreamReader(Request.InputStream).ReadToEnd();

                return Json(new
                {
                    status = "ok",
                    message = "PostMessage endpoint hit successfully",
                    received = json
                });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new
                {
                    status = "error",
                    error = ex.Message
                });
            }
        }

        #endregion

        #endregion

        #region Helper Methods

        #endregion
    }
}