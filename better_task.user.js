// ==UserScript==
// @name         Better Task
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.2
// @description  try to take over the world!
// @author       Vivian
// @match        https://*.service-now.com/sc_task.do*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
'use strict';
GM_addStyle(`
[aria-label="Catalog Task form section"] > div:nth-child(2) > div > div.custom-form-group.is-wide.form-group.ng-scope {
max-height: 158px;
overflow-y: auto;
overflow-x: clip;
min-height: 58px;
}

#output_messages,
.horizontal-rule {
display: none;
}

#cxs_widget_container tr:has(#cxs_maximize_results) {
position: absolute;
right: 0;
}

#cxs_search_container > div:first-child {
padding-right: 180px;
}
`);
})();
