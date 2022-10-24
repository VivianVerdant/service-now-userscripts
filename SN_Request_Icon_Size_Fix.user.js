// ==UserScript==
// @name         SN Request Icon Size Fix
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Normalize the Icons Sizes
// @author       Vivian
// @match        https://*.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @resource     better_requests_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_requests.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
	// Load custom CSS
	GM_addStyle(GM_getResourceText("better_requests_css"));
})();