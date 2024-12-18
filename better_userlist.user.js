// ==UserScript==
// @name         Better Userlist
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.1
// @description  try to take over the world!
// @author       Vivian Roerig Willett
// @match        https://virteva.service-now.com/*
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_dashboard_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_userlist.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-start
// ==/UserScript==
/* globals find_or_observe_for_element*/

(function() {
    'use strict';

    // https://virteva.service-now.com/sys_user_group_list.do
})();

async function main() {

}

console.warn("Better userlist Start");
if (location.includes("sys_user_group_list.do")){
    console.warn(location);
    main();
}
console.warn("Better userlist End");