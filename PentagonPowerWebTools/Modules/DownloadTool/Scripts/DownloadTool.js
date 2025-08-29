window.InitDownloadTool = function (ribbon, meridianDoc, vaultName, baseURL) {
    const downloadToolPingEndpoint = baseURL + '/DownloadTool/Ping'
    const downloadToolDownloadFilesEndpoint = baseURL + '/DownloadTool/DownloadFiles'
    const selectedItems = {}; // Dictionary: { oid: url }
    const vaultDisplayName = vaultName;
    const selectedOids = [];

    // Add ribbon section and buttons
    const s2 = meridianDoc.customAPI.AddRibbonSection(ribbon, 'Batch Download', '');
    const btnBatchDownload = meridianDoc.customAPI.AddRibbonCommand(ribbon, s2, 'Download Files', null, 1, 'cmdBatchDownload', '/Images/PDFSearch_16.png');

    // Add batch download Server Button
    const btnBatchServerDownload = meridianDoc.customAPI.AddRibbonCommand(ribbon, s2, 'Download Files (zip)', 'cmdBatchDownload' ,1 , 'cmdBatchDownloadZip', '/Images/PDFSearch_16.png')

    // Add click handler
    meridianDoc.addEventListener('bc:CommandSelected', function (event) {
        if (event.CommandName === 'cmdBatchDownload')
        {
            console.log('Batch Download clicked!');

            const oids = Object.keys(selectedItems);
            if (oids.length === 0) {
                alert('No items selected.');
                return;
            }

            // Trigger download for each URL
            oids.forEach(oid => {
                const url = selectedItems[oid];
                console.log(`Downloading: ${url}`);

                // Create temporary <a> element
                const a = document.createElement('a');
                a.href = url;
                a.download = '';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });

        }
        if (event.CommandName === 'cmdBatchDownloadZip') {
            callBatchDownloadService(selectedOids);
        }
    });

    // Add Select Item handler
    meridianDoc.addEventListener("bc:SelectItem", function (event) {
        if (!event.oid) return;

        if (event.checkboxClicked) {
            // add oid if not already present
            if (!selectedOids.includes(event.oid)) {
                selectedOids.push(event.oid);
            }

            // Add item to dictionary
            // Replace this with real URL if you have one
            var $row = $("a[oid='" + event.oid + "']").closest("tr");
            console.log("Selected row:", $row[0]);

            const url = buildDownloadUrl($row, event.oid, vaultDisplayName);
            selectedItems[event.oid] = url;
            console.log(`Item selected: ${event.oid} -> ${url}`);
        } else {
            // Remove oid from array
            const index = selectedOids.indexOf(event.oid);
            if (index !== -1) {
                selectedOids.splice(index, 1);
            }

            // Remove item from dictionary
            delete selectedItems[event.oid];
            console.log(`Item unselected: ${event.oid}`);
        }
    });

    // Build download URL function
    function buildDownloadUrl($row, oid, vaultName) {
        const baseUrl = "http://localhost/Meridian/";
        const fileName = $(`a[oid="${oid}"]`).text().trim();

        const folders = [];
        let currentLevel = parseInt($row.attr("amlevel"), 10);

        $row.prevAll("tr").each(function () {
            const $tr = $(this);
            const classAttr = $tr.attr("class");
            if (!classAttr || classAttr.trim() === "") return;

            const amLevel = parseInt($tr.attr("amlevel"), 10);
            if (isNaN(amLevel)) return;

            if (amLevel < currentLevel) {
                const $link = $tr.find('a[cannavigate=true]').last();
                if ($link.length) {
                    const text = $link.text().trim();
                    if (!text.match(/\.[a-zA-Z0-9]{1,5}$/)) {
                        folders.push(text);
                    }
                }
                currentLevel = amLevel;
            }

            if (amLevel === 1) return false;
        });

        folders.reverse();

        // Build URL without adding vaultName twice
        const folderPath = folders.length ? folders.map(f => encodeURIComponent(f)).join("/") + "/" : "";
        return baseUrl + folderPath + encodeURIComponent(fileName);
    }

    function callBatchDownloadService(documentList) {
        const payload = {
            data: documentList,
            vaultName: vaultDisplayName
        };

        console.log("Payload being sent to server for batch download:", JSON.stringify(payload));

        fetch(downloadToolDownloadFilesEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.text().then(text => {
                let data;
                try {
                    data = JSON.parse(text);
                } catch {
                    data = { error: text || "Invalid JSON response" };
                }
                if (!response.ok) {
                    const error = new Error('HTTP error ' + response.status);
                    error.responseData = data;
                    throw error;
                }
                return data;
            }))
            .then(data => {
                console.log("Server responded:", data);

                const filedUrl = data.FiledURL;
                if (filedUrl) {
                    const encodedUrl = filedUrl.split('/').map(encodeURIComponent).join('/');
                    const fullUrl = customscriptURL + encodedUrl;

                    const link = document.createElement('a');
                    link.href = fullUrl;
                    link.download = filedUrl.substring(filedUrl.lastIndexOf('/') + 1);

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            })
            .catch(err => {
                console.error("Request failed:", err);
            });
    }
};