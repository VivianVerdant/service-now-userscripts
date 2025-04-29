// ==UserScript==
// @name         Service-Now Utilities
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      2025-04-29
// @description  Various Service-Now utility functions
// @author       Vivian Roerig Willett
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @match        https://*.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/refs/heads/main/lib/wait_for_element.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

/* globals wait_for_element GlideRecord g_form g_navigation */

var page_header;

function create_node(parent, type, class_list) {
    parent = parent || document;
    type = type || "div";
    class_list = class_list || "";

    let new_node = document.createElement(type);
    new_node.setAttribute("class", class_list);
    parent.appendChild(new_node);
    //console.debug("new node: ", new_node)

    return new_node
}

function create_button(parent, click_function, class_list) {
    if (!parent){
        throw new Error("No parent set");
        return null
    }
    class_list = class_list || "";
    class_list = class_list.concat(" btn btn-default");
    let new_button = create_node(parent, "button", class_list);
    let new_function = async function action(event) {event.preventDefault();click_function(event.target)}
    new_button.addEventListener("click", new_function);
    //console.debug("create button: ", new_button)

    return new_button
}

async function create_header_button(label, click_function, class_list) {
    if (!page_header){
        throw new Error("No page header set");
        return null
    }
    class_list = class_list || "";
    class_list = class_list.concat(" form_action_button header");
    let new_button = create_button(page_header, click_function, class_list);
    if (class_list.includes("icon")){
        new_button.setAttribute("style","width:min-content;padding: 0px 8px;display: grid;grid-template-columns: auto auto;grid-column-gap: 8px;");
    }
    new_button.innerText = label;
    //console.debug("header button: ", new_button)

    return new_button
}

async function no_set_function(node) {console.debug("No function set for button.");}

async function add_header_button(label, click_function, class_list) {
    label = label || "";
    click_function = click_function || no_set_function;
    class_list = class_list || "";
    wait_for_element(".container-fluid:has([title='Back']) [id*='section_head_right']",
        (node) => {
            page_header = node;
            //console.debug("header: ", node);
            create_header_button(label, click_function, class_list);
        }
    );
}