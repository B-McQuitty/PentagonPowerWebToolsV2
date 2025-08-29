(function () {
    console.log("[PentagonTools] Script started");
    console.log(customscriptURL);
    let baseUrl = customscriptURL.endsWith("/") ? customscriptURL : customscriptURL + "/";

    console.log("Base URL: " + baseUrl);

    if (!window.addEventListener) return;

    let meridianDoc;
    let currentVaultDisplayName;

    // Handle context changes
    window.top.document.addEventListener("bc:Context", function (event) {
        console.log("Context changed");
        const ctx = event.ctxForCustomApi;
        if (ctx) {
            if (ctx.view_displayname) console.log("View:", ctx.view_displayname);
            if (ctx.view_oid) console.log("View OID:", ctx.view_oid);
            if (ctx.vault_displayname) {
                console.log("Vault:", ctx.vault_displayname);
                currentVaultDisplayName = ctx.vault_displayname;
            }
            if (ctx.vault_oid) console.log("Vault OID:", ctx.vault_oid);
            if (ctx.baseline_context) console.log("Baseline Context:", ctx.baseline_context);
            if (ctx.baseline_displayname) console.log("Baseline Display Name:", ctx.baseline_displayname);
        }
    });

    // Load Pentagon ribbon and modules
    window.addEventListener("load", function () {
        meridianDoc = window.top.document;

        // Add Pentagon ribbon
        const ribbon = meridianDoc.customAPI.AddRibbon('Pentagon', 'Exchange');
        console.log("[PentagonTools] Ribbon added successfully");

        // Fetch module list from server
        fetch(baseUrl + "Modules/List")
            .then(r => r.json())
            .then(modules => {
                console.log("[PentagonTools] Modules found:", modules);
                modules.forEach(m => loadModule(m, ribbon, currentVaultDisplayName));
            })
            .catch(err => console.error("[PentagonTools] Error fetching modules:", err));
    });

    function loadModule(moduleName, ribbon, currentVaultDisplayName) {
        const script = document.createElement('script');
        script.src = `${baseUrl}Modules/${moduleName}/Scripts/${moduleName}.js?v=${Date.now()}`;
        script.type = 'text/javascript';
        script.onload = function () {
            console.log(`[PentagonTools] Module loaded: ${moduleName}`);

            const initFnName = `Init${moduleName}`;
            if (window[initFnName]) {
                console.log(`[PentagonTools] Initializing module: ${initFnName}`);
                window[initFnName](ribbon, meridianDoc, currentVaultDisplayName);
                console.log(`[PentagonTools] Module initialized successfully: ${initFnName}`);
            } else {
                console.warn(`[PentagonTools] No Init function found for module: ${initFnName}`);
            }
        };
        script.onerror = function () {
            console.error(`[PentagonTools] Failed to load module: ${url}`);
        };
        document.head.appendChild(script);
    }
})();