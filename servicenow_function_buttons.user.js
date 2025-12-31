// ==UserScript==
// @name         Service-Now Function Buttons
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.2.2
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
        case "/sc_task.do":
            task();
            break
        default:
            break
    }

})();

async function fix_text_area(e) {
    e.style.height = "0px";
    e.style.height = e.scrollHeight + 8 + "px";
    setTimeout(() => {e.click();}, 100);
}

const display_name_regex = /(?<=DisplayName\s*:\s*)(.*)/g;
const email_regex = /(?<=UserPrincipalName\s*:\s*)(.*)/g;

function task() {
    const page_type = "task";
    wait_for_element("[id='element.sc_task.request_item.company']", (node) => {
        const company_sys_id = document.getElementById("sc_task.request_item.company").getAttribute("value");
        switch (company_sys_id){
            case "59563f611b5d94d09a47524d0d4bcb45":
                archwell_task();
                break
        }
    });
}

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

wait_for_element("textarea", (node) => {
    //console.log('textarea has been added:-------------------------------------------');
    //console.debug(node);
    const text_area_fn = async (e) => {e.target.style.height = "0px"; e.target.style.height = e.target.scrollHeight + 8 + "px";}
    node.addEventListener("change", text_area_fn);
    node.addEventListener("keydown", text_area_fn);
    node.addEventListener("click", text_area_fn);
    setTimeout(() => {node.click();}, 1000);
}, false);

function archwell_task() {
    add_header_button("AD Comment",()=>{
        try {
            const work_notes = document.querySelector(".h-card-wrapper.activities-form").innerText;
            const display_name = display_name_regex.exec(work_notes)[0];
            const email = email_regex.exec(work_notes)[0];
            document.getElementById("tabs2_section").querySelector(".tab_header:nth-of-type(2) > span").click();
            const comments = document.getElementById("sc_task.request_item.comments");
            const requested_for = document.querySelector(".form-group.sc-row:has([aria-label='Requested for']) .input-group input").value;
            comments.value = `Hello ${requested_for},\n`
                + `This account has been created per your request\n`
                + `Display Name: ${display_name}\n`
                + `Email: ${email}\n`
                + `\n`
                + `Thank you,\n`
                + `${g_user.firstName}\n`
                + `Request Fulfillment`;
            fix_text_area(comments);
        } catch(e) {}
    });
}
