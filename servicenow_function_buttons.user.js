// ==UserScript==
// @name         Service-Now Function Buttons
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.1.0
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
(function() {
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
        default:
            break
    }

})();

function email() {
    const page_type = "email";
    add_header_button("Email",()=>{g_form.addInfoMessage(page_type);});
}

function incident() {
    const page_type = "email";
    add_header_button("Incident",()=>{g_form.addInfoMessage(page_type);});
}

function event() {
    const page_type = "email";
    add_header_button("Event",()=>{g_form.addInfoMessage(page_type);});
}

function kb() {
    const page_type = "email";
    add_header_button("KB",()=>{g_form.addInfoMessage(page_type);});
}
