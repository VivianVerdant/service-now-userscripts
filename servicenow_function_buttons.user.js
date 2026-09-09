// ==UserScript==
// @name         Service-Now Function Buttons
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.1.1
// @description  Add buttons to do stuff, I guess
// @author       Vivian Roerig Willett
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @match        https://*.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/refs/heads/main/lib/Service-Now-Utilities.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/refs/heads/main/lib/wait_for_element.js
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

/* globals page_header create_node create_button create_header_button add_header_button*/
/* globals wait_for_element */
/* globals GlideRecord g_form g_user g_navigation*/

function email() {

}

function incident() {

}

function event() {
    add_header_button("Informational",() => {
        g_form.setValue("u_category", "Informational");
        g_form.setValue("u_subcategory", "Escalation");
        g_form.setValue("u_trouble_code", "96b743276fdc8a001ef4eef11c3ee4c9", "Informational");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("Switch Offline",() => {
        g_form.setValue("u_category", "Network");
        g_form.setValue("u_subcategory", "Switch");
        g_form.setValue("u_trouble_code", "fd8128276fd31100ad775ddd5d3ee401", "Switch Offline");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("Firewall Offline",() => {
        g_form.setValue("u_category", "Network");
        g_form.setValue("u_subcategory", "Firewall");
        g_form.setValue("u_trouble_code", "efb128276fd31100ad775ddd5d3ee4b2", "FIrewall Offline");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("VM Offline",() => {
        g_form.setValue("u_category", "Infrastructure");
        g_form.setValue("u_subcategory", "Vmware");
        g_form.setValue("u_trouble_code", "c51164276fd31100ad775ddd5d3ee4b1", "Host Offline");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("Server Perf",() => {
        g_form.setValue("u_category", "Infrastructure");
        g_form.setValue("u_subcategory", "Server");
        g_form.setValue("u_trouble_code", "a90011346f32f9006f41cf30be3ee46d", "Performance");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("UPS",() => {
        g_form.setValue("u_category", "Facilities");
        g_form.setValue("u_subcategory", "UPS");
        g_form.setValue("u_trouble_code", "d257d1a06f146d40e2e1a14d5d3ee409", "UPS");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("VM CPU",() => {
        g_form.setValue("u_category", "Infrastructure");
        g_form.setValue("u_subcategory", "Vmware");
        g_form.setValue("u_trouble_code", "3bf0a4276fd31100ad775ddd5d3ee403", "CPU");
        setTimeout(() => {g_form.save();}, 200);
    });

    add_header_button("Auto Cleared",() => {
        g_form.setValue("state", 3);
        g_form.setValue("u_close_code", "Auto-Cleared");
        setTimeout(() => {g_form.save();}, 200);
    }, "icon-checkbox-checked");
}

function kb() {

}

var handled_user_ids = [];

/* INDEV
wait_for_element(".sn-card-component:has([data-presence-id])", (node) => {
    const id = node.querySelector("[data-presence-id]").getAttribute("data-presence-id");
    if (!handled_user_ids.includes(id)) {
        console.warn(id);
    }
}, false);
*/

'use strict';

document.onkeydown = function(e) {
    if( e.ctrlKey && e.key === 's' ){
        e.preventDefault();
        try {
            g_form.save();
        } catch(e) {}
    }
};

var location = new URL(window.location.href);

if (location.pathname.startsWith("/now/")) {
    location = location.pathname.match(/\/[a-z_]*(?=%)/);
} else {
    location = location.pathname;
}
console.debug(location);

switch (location){
    case "/u_email.do":
        email();
        break
    case "/incident.do":
        incident();
        break
    case "/u_event.do":
        event();
        break
    case "/kb":
        kb();
        break
    case "/kb_view.do":
        kb();
        break
    default:
        break
}

const url_regex = /(http|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gmi

wait_for_element("[name$='.description']", (node) => {
    const text = node.value;
    const results = text.matchAll(url_regex);
    for (const url of results) {
        let link_button = create_node(node.parentNode, "a", "btn btn-default compact");
        link_button.innerText = url;
        link_button.href = url;
        link_button.target = "_blank"
    }
}, false);

wait_for_element(".sn-widget-textblock-body", (node) => {
    const text = node.innerText;
    console.debug(text);
    const results = text.matchAll(url_regex);
    for (const url of results) {
        console.debug(url);
        let link_button = create_node(node.parentNode, "a", "btn btn-default compact");
        link_button.innerText = url;
        link_button.href = url;
        link_button.target = "_blank"
    }
}, false);
