// ==UserScript==
// @name         Better Outlook Calendar
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.niceincontact.com/*
// @match        https://*.nice-incontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_nice_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_outlook.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals find_or_observe_for_element */

find_or_observe_for_element("#consoleView", (node) => {
	window.setTimeout( function() {
		document.querySelector("#consoleView").click();
	}, 1000);
}, undefined, true);