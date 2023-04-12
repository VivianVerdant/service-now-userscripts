// ==UserScript==
// @name         Better Nice
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.niceincontact.com/*
// @match        https://*.nice-incontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_nice_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_nice.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals find_or_observe_for_element */

// window.inContactAppBase.api.ModuleManager.instances["uimanager-0"]
// window.inContactAppBase.api.ModuleManager.instances["resizemanager-0"]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//await sleep(16000);

async function main() {
    'use strict';


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
    let moduleManager = app.api.ModuleManager;
    moduleManager.stop("resizemanager-0");
    //let resizeManager = app.api.ModuleManager.instances["resizemanager-0"];
    //resizeManager.destroy();

	const observer = new MutationObserver((mutations_list) => {
		const time = mutations_list[0].addedNodes[0].nodeValue;
		const state = document.querySelector(".agentstateui.agent-state-ui").getAttribute("data-outstate");
		console.warn(state, " - ", time);
		switch(state) {
			case "Lunch":
			break;
		}


	});
	console.warn(observer);
	observer.observe(document.querySelector("#agentstateui-0_container"), {subtree: true, characterData: true, childList: true, attributes: true});
	console.warn("end");
}

async function keepAlive() {
	window.setTimeout( function() {
		window.location.reload();
	}, 1800000);
}

const convertTime12to24 = (time12h) => {
	const [time, modifier] = time12h.split(' ');

	let [hours, minutes] = time.split(':');

	if (hours === '12') {
		hours = '00';
	}

	if (modifier === 'PM') {
		hours = parseInt(hours, 10) + 12;
	}

	return `${hours}:${minutes}`;
}

find_or_observe_for_element("#agentstateui-0_container", (node) => {
	console.log(node);
	main();
});

find_or_observe_for_element(".app-picker-panel", (node) => {
	document.querySelector("[iconname='icon-sidebar_toggle']").click()
	keepAlive();
}, undefined, true);

find_or_observe_for_element("[iconname='icon-sidebar_toggle']", (node) => {
	node.click();
}, undefined, true);


find_or_observe_for_element("#consoleView", (node) => {
	window.setTimeout( function() {
		document.querySelector("#consoleView").click();
	}, 1000);
}, undefined, true);

