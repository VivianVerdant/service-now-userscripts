// ==UserScript==
// @name         Better Service-Now Theming
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.0.1
// @description  try to take over the world!
// @author       Vivian
// @match        https://virteva.service-now.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    const custom_theme = `

:root {
    --link-text-color: #AAF;
    --primary-text-color: #FFF;

    --primary-background-color: #555;

}

body,
form,
.panel,
.panel-default,
.panel-heading,
[id="incident.form_scroll"],
.h-card_comments,
.tab_section .section,
.nav-tabs, .tabs2_strip, div.tabs2_strip,
.form_body>.tabs2_section,
.kb-wrapper,
.panel-body kb-desktop,
.kb-summary-block,
.knowledge-articles,
.list-group-item,
.list_nav,
.tabs2_list,
.list_v2,
.breadcrumb_container,
[id="incident.incident.parent_incident"],
.tab_section #cxs_widget_container, .tab_section #cxs_widget_container .cxs_results_header .horizontal-rule::before, .tab_section #cxs_widget_container::after, .tab_section #cxs_widget_container::before, .tabs2_section_0 #cxs_widget_container, .tabs2_section_0 #cxs_widget_container .cxs_results_header .horizontal-rule::before, .tabs2_section_0 #cxs_widget_container::after, .tabs2_section_0 #cxs_widget_container::before {
    color: var(--primary-text-color) !important;
    background-color: var(--primary-background-color) !important;;
}

.list-group-item .secondary-info,
.knowledge-articles .kb-description,
.has-error .control-label, .has-success .control-label, .has-warning .control-label, .is-filled .control-label, .is-required .control-label,
.sn-card-component_records .sn-widget-list-table-cell:last-of-type,
.h-card_comments * {
    color: var(--primary-text-color);
}


a,
a:hover,
a:focus {
    color: var(--link-text-color) !important;
}

a:hover,
a:focus {
    text-decoration: underline;
}

    `

    GM_addStyle(custom_theme);

})();