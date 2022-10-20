// ==UserScript==
// @name         Better Nice
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.niceincontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/waitForKeyElements.js
// @resource     better_nice_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_nice.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals waitForKeyElements */

// window.inContactAppBase.api.ModuleManager.instances["uimanager-0"]
// window.inContactAppBase.api.ModuleManager.instances["resizemanager-0"]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function() {
    'use strict';
	console.warn("nice foo");

	// Load custom CSS
	const better_nice_css = GM_getResourceText("better_nice_css");
	GM_addStyle(better_nice_css);

    let app = null;
    let i = 0;
    while (i < 10 && app == null){
        app = document.defaultView.inContactAppBase;
        await sleep(1000);
        console.warn(app);
        i++;
    }

    let resizeManager = app.api.ModuleManager.instances["resizemanager-0"];
    resizeManager.resizeWidth = function() {};
    resizeManager.destroy();
    console.warn(resizeManager);
})();
