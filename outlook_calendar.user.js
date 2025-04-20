// ==UserScript==
// @name         Better Outlook Calendar
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://outlook.office.com/calendar/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_outlook_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_outlook.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals find_or_observe_for_element */

GM_addStyle(GM_getResourceText("better_outlook_css"));

find_or_observe_for_element("#consoleView", (node) => {
	window.setTimeout( function() {
		document.querySelector("#consoleView").click();
	}, 1000);
}, undefined, true);

// [draggable="true"] > div > div > > div > div.innerText
// firstChild.children[1].firstChild.firstChild
// [draggable="true"] > div > [role="button"] background-color

find_or_observe_for_element("[draggable='true'] > div > div > div", (node) => {
    console.log(node);
	if (node.firstChild.innerText == "Break") {
        node.parentNode.classList.add("break-event");
    }
    if (node.firstChild.innerText == "Lunch") {
        node.parentNode.classList.add("lunch-event");
    }
}, undefined, false);
