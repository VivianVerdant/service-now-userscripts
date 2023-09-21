// ==UserScript==
// @name         Better Task
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  try to take over the world!
// @author       Vivian
// @match        https://*.service-now.com/sc_task.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element */

(function() {
    'use strict';

    find_or_observe_for_element("#cxs_widget_container", (node) => {
		console.log(node);
        const widget = node.parentNode.parentNode.parentNode.parentNode.parentNode;
        widget.style = "max-height: 158px; overflow-y: auto; overflow-x: clip; min-height: 58px;";
	}, undefined, true);

    find_or_observe_for_element("hr", (node) => {
		console.log(node);
        node.parentNode.style = "display: none;";
	}, undefined, false);

    find_or_observe_for_element("#cxs_maximize_results", (node) => {
		console.log(node);
        node.parentNode.parentNode.style = "position: absolute; right: 0;";
        node.style = "z-index: 99999;";
	}, undefined, true);

    find_or_observe_for_element("#cxs_search_container", (node) => {
		console.log(node);
        //node.style = "padding: 0;";
        node.firstElementChild.style = "padding-right: 180px;";
	}, undefined, true);

    find_or_observe_for_element("#output_messages", (node) => {
		console.log(node);
        node.style = "display: none;";
	}, undefined, true);

})();