// ==UserScript==
// @name         F%$K AI
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      2026-09-09
// @description  F%$K AI
// @author       Vivian Roerig Willett
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @match        https://partner.microsoft.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/refs/heads/main/lib/wait_for_element.js
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

/* globals wait_for_element */

wait_for_element("he-shell", (node) => {
    const s = document.createElement("style");
    s.innerText = `[slot='aside'] {display: none !important}`
    node.shadowRoot.appendChild(s);
});
