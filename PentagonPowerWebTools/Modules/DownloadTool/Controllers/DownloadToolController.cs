using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Xml.Linq;
using BlueCieloECM.InnoCielo.Meridian.Server;
using BlueCieloECM.InnoCielo.Meridian.Client;
using PentagonPowerWebTools.Modules.DownloadTool.Classes;

namespace PentagonPowerWebTools.Modules.DownloadTool.Controllers
{
    public class DownloadToolController : Controller
    {
        #region Web API EndPoints

        #region Get

        // GET /DownloadTool/Ping
        [HttpGet]
        public ActionResult Ping()
        {
            return Json(new { status = "ok", message = "DownloadTool API is alive" }, JsonRequestBehavior.AllowGet);
        }

        #endregion

        #region Post

        // POST /DownloadTool/DownloadFiles
        [HttpPost]
        public ActionResult DownloadFiles()
        {
            var log = new System.Text.StringBuilder();
            string filedURL = string.Empty;
            string timestamp = DateTime.Now.ToString("dd-MM-yyyy_HH-mmss");

            try
            {
                // Read JSON from request
                Request.InputStream.Seek(0, SeekOrigin.Begin);
                string json = new StreamReader(Request.InputStream).ReadToEnd();
                log.AppendLine("Received JSON: " + json);

                var payload = JsonConvert.DeserializeObject<DownloadRequest>(json);
                var documentIds = payload.Data;
                var vaultName = payload.VaultName;

                if (string.IsNullOrEmpty(vaultName))
                {
                    log.AppendLine("Vault name is null or empty.");
                    Response.StatusCode = 400;
                    return Json(new { error = "vaultName is required", log = log.ToString() });
                }

                BCRepository vault = new BCRepository(vaultName);
                if (vault == null)
                {
                    log.AppendLine("Vault could not be loaded.");
                    Response.StatusCode = 500;
                    return Json(new { error = "Vault could not be loaded", log = log.ToString() });
                }

                string batchFolder = HostingEnvironment.MapPath("~/Download Folder/Batch");
                Directory.CreateDirectory(batchFolder);

                foreach (string oid in documentIds)
                {
                    log.AppendLine("Processing document: " + oid);
                    BCDocument doc = (BCDocument)vault.GetFSObject(oid);
                    if (doc != null)
                    {
                        string filePath = Path.Combine(batchFolder, doc.DisplayName);
                        BCDocumentUI docUI = new BCDocumentUI(doc);
                        docUI.SaveToFile(filePath);
                        log.AppendLine($"Saved file: {filePath}");
                    }
                    else
                    {
                        log.AppendLine("Document not found: " + oid);
                    }
                }

                string zipPath = HostingEnvironment.MapPath($"~/Download Folder/BatchDownload_{timestamp}.zip");
                ZipFile.CreateFromDirectory(batchFolder, zipPath);
                filedURL = VirtualPathUtility.ToAbsolute($"~/Download Folder/BatchDownload_{timestamp}.zip");
                log.AppendLine("fileUrl: " + filedURL);

                // Clean up batch folder
                DeleteDirectory(batchFolder);

                return Json(new
                {
                    status = "ok",
                    message = "Batch download completed",
                    FiledURL = filedURL,
                    log = log.ToString().Replace("\r\n", "\n")
                });
            }
            catch (Exception ex)
            {
                log.AppendLine("Exception: " + ex.Message);
                log.AppendLine("StackTrace: " + ex.StackTrace);
                Response.StatusCode = 500;
                return Json(new { error = ex.Message, log = log.ToString().Replace("\r\n", "\n") });
            }
        }

        #endregion

        #endregion

        #region Helper Methods
        public void DeleteDirectory(string targetDir)
        {
            foreach (var file in Directory.GetFiles(targetDir, "*", SearchOption.AllDirectories))
            {
                System.IO.File.SetAttributes(file, FileAttributes.Normal);
                System.IO.File.Delete(file);
            }

            foreach (var dir in Directory.GetDirectories(targetDir, "*", SearchOption.AllDirectories))
            {
                System.IO.File.SetAttributes(dir, FileAttributes.Normal);
            }

            Directory.Delete(targetDir, true);
        }

        #endregion

    }
}