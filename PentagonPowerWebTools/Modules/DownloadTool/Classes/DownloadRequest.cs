using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PentagonPowerWebTools.Modules.DownloadTool.Classes
{
    public class DownloadRequest
    {
        [JsonProperty("data")]
        public List<string> Data { get; set; }

        [JsonProperty("vaultName")]
        public string VaultName { get; set; }
    }
}