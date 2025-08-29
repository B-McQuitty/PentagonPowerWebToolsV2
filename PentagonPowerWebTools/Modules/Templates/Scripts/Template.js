window.InitTemplate = function (ribbon, meridianDoc, vaultName, baseURL) {

    // Add ribbon section and buttons
    const s2 = meridianDoc.customAPI.AddRibbonSection(ribbon, 'Template', '');
    const btnBatchDownload = meridianDoc.customAPI.AddRibbonCommand(ribbon, s2, 'Template', null, 1, 'cmdTemplate', '/Images/Template.png');

    meridianDoc.addEventListener('bc:CommandSelected', function (event) {
        if (event.CommandName === 'cmdTemplate') {
            

        }
    });

    meridianDoc.addEventListener("bc:SelectItem", function (event) {
        if (!event.oid) return;

        if (event.checkboxClicked) {
           
        } else {
            
        }
    });
};