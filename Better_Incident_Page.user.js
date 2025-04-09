// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      2.5.1
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/pseudorandom.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/better_settings_menu.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/textarea_autoenter.js
// @require      https://github.com/VivianVerdant/chronomouse/raw/refs/heads/master/chronomouse.2.4.0.min.js
// @resource     settings_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_settings_menu.css
// @resource     better_incident_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_incident.css
// @resource     better_new_incident_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_new_incident.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==
/* globals find_or_observe_for_element showRelatedRecList createBetterSettingsMenu AJAXCompleter getColorFromSeed better_settings_menu GlideRecord g_form g_navigation g_user getLocalInfo */


/* Changelog
v2.5.1 - Added a default button addon for company work notes to insert the generic signature text
       - Added several new dynamic variables that can be used
v2.5 - Added support for custom buttons in custom work notes, see support doc for more information https://github.com/VivianVerdant/service-now-userscripts/wiki/Better-Incident-Page#custom-company-notes
v2.4 - Will close the popup window of related tickets if one exists after creating a new ticket
v2.3.1 - Bugix: apply newline feature to both single and double field work notes textareas
v2.3 - Total rework of setting menu
     - Added auto entering of newline characters in Work Notes textarea
     - Added setting for how far back related Incident popup window shoud search (does not affect number displayed on page)
v2.2 - Added settings for new incident screen and button in header to access
         - Custom layout enable
		 - Auto open related icidents window
v2.1 - Added Company Domain and Short description to the Permalink copy button
v2.0 - Added local time to phone field based off areacode or country code
v1.7 - Initial Better Settings implementation
v1.5 - Fixes for Utah release of SN
v1.3	- So many bug fixes
	- Added custom company notes
v1.1	- Bugfixes with z-sorting
	- Added random color to header to differentiate tickets
	- Added Copy Permalink button to header
	- Cleaned up header
v1.0 - Added ctrl+s to save, ctrl+d to resolve, fixed autocompleter bug
v0.9 - Better tabbing navigation
v0.8.1 - More bugfixes
v0.8 - Bugfixes
v0.7 - refactor
v0.6 - overhaul
v0.5 - Made Incident fields that are mandatory but not filled out have a more prominent styling.
v0.4 - Made company notes on Incident edit page into a toggleable static div.
v0.3 - Made more reliable, less buggy, and hopefully more performant.
v0.2 - Added more features,
        - Auto show Close Notes when you press the Resolve button.
		- Auto fill user's First name into the Close Notes.
		- Responsive sizing on the Work Notes field.
v0.1 - Initial release
*/

'use strict';

function testAlert(e) {
    e.preventDefault();
    alert("foo");
}

let default_settings = {
    new_incident_page: {value: null, type: "null", description: "New Incident Page Settings"},
    custom_new_layout: {value: false, type: "bool", description: "Enable custom layout on Create Incident page:"},
	auto_open_related_incidents: {value: false, type: "bool", description: "Auto open related Incidents:"},
    edit_incident_page: {value: null, type: "null", description: "Edit Incident Page Settings"},
	custom_edit_layout: {value: false, type: "bool", description: "Enable custom layout on Edit Incident page:"},
    custom_notes: {value: false, type: "bool", description: "Display custom company notes:"},
    header_random_color: {value: false, type: "bool", description: "Use a random color for incident header:"},
	auto_open_kb_search: {value: false, type: "bool", description: "Automatically open the KB Search tool:"},
    related_inc_days_ago: {value: 90, type: "int", description: "How many days back should related Incidents search:"},
    work_notes_newline_character: {value: "", type: "string", description: "Auto enter string every newline in work notes:<br/><h6>Leave empty to disable</h6>"},
    custom_signature: {value: "\nThanks,\n${analyst}\n${company} IT Service Desk", type: "multistring", description: "Custom text to insert at end of additional comments text field:"},
    custom_color_theme: {value: false, type: "bool", description: "Enable custom colors below:"},
    link_to_google_colorwheel: {value: "null", type: "null", description: "Open link to <a href='https://g.co/kgs/Zf8Gdpg' target='_blank'>Google color picker</a>"},
    background: {value: "255,255,255", type: "rgb", description: "Page background:"},
    primary_text: {value: "0,0,0", type: "rgb", description: "Primary text:"},
    required: {value: "255,0,0", type: "rgb", description: "Required field background:"}
};

var settings = GM_getValue("settings", default_settings);

for (const [key, value] of Object.entries(default_settings)) {
    if (!settings[key]) {
        settings[key] = value;
    }
    if (typeof settings[key] != "object") {
        settings[key] = value;
    }
}

settings = Object.assign(default_settings, settings);

console.warn(settings);

var location = window.location.href;
var run_once = false;
var better_options_btn;

var company_domain;

HTMLElement.prototype.addNode = function (type, id, classes) {
	const new_node = document.createElement(type);
	new_node.id = id;
	if (classes) {
		for (const clss of classes) {
			new_node.classList.add(clss);
		}
	}
	this.appendChild(new_node);
	return new_node;
};

async function onClickResolveBtn(){
	let resolve_tab = document.querySelectorAll("div#tabs2_section > span:nth-child(3) > span:nth-child(1) > span:nth-child(2)")[0];
	console.log("clicking reslove button: ", resolve_tab);
	resolve_tab.click();
	document.getElementById("tabs2_section").scrollIntoView(true);

	var user_name = document.getElementById("sys_display.incident.u_affected_user").getAttribute("value");
	console.log(user_name);
	var close_field = document.getElementById("incident.close_notes");
	close_field.innerHTML = close_field.innerHTML.concat(user_name.split(" ")[0] + " ");
	console.log(close_field);
}

function saveNote() {
	const company = document.querySelector("[id='sys_display.incident.company']").value;
	const saved_notes = GM_getValue("saved_notes", new Object());
	const notes_text = document.querySelector("#custom_notes_text").value;
	const notes_div = document.querySelector("#custom_notes_div");

	//console.log(notes_text);
	notes_div.innerHTML = notes_text;

	saved_notes[company] = notes_text;
	GM_setValue("saved_notes", saved_notes);
}

window.addEventListener("click",on_click_insert_text_node)

function on_click_insert_text_node(event) {
    const node = event.target;
    if (node.tagName == "TEXT-INSERT") {
        event.preventDefault();
        if (node.getAttribute("target") && (node.getAttribute("target") == "comments" || node.getAttribute("target") == "comment") && node.getAttribute("text")) {
            //alert(node.getAttribute("text"));
            const text = custom_text_parser(node.getAttribute("text"));
            if (document.querySelector("#multiple-input-journal-entry").classList.contains("ng-hide")) {
                if (document.querySelector("#activity-stream-textarea").getAttribute("aria-label") == "Additional comments") {
                    const el = document.querySelector("#activity-stream-textarea");
                    el.value += text;
                    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
                } else {
                    document.querySelector("[name='work_notes-journal-checkbox']").click()
                    document.querySelector("#activity-stream-textarea").value += text;
                }
            } else {
                    const el = document.querySelector("#activity-stream-comments-textarea");
                    el.value += text;
                    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
            }
        }

        if (node.getAttribute("target") && (node.getAttribute("target") == "worknotes" || node.getAttribute("target") == "worknote") && node.getAttribute("text")) {
            //alert(node.getAttribute("text"));
            const text = custom_text_parser(node.getAttribute("text"));
            if (document.querySelector("#multiple-input-journal-entry").classList.contains("ng-hide")) {
                if (document.querySelector("#activity-stream-textarea").getAttribute("aria-label") == "Additional comments") {
                    document.querySelector("[name='work_notes-journal-checkbox']").click()
                    const el = document.querySelector("#activity-stream-textarea");
                    el.value += text;
                    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
                } else {
                    const el = document.querySelector("#activity-stream-textarea");
                    el.value += text;
                    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
                }
            } else {
                    const el = document.querySelector("#activity-stream-work_notes-textarea");
                    el.value += text;
                    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
            }
        }
    }
}

function create_notes(node) {
	let saved_notes = GM_getValue("saved_notes", new Object());
	const company = document.querySelector("[id='sys_display.incident.company']").value;
	let note;
	//console.log(Object.keys(saved_notes));
	if (Object.keys(saved_notes).includes(company)){
		note = saved_notes[company];
	} else {
		note = "Personal " + company + " notes:";
        note += `<br/>
<text-insert
target="comments"
text="Hello \${userFN},

My name is \${analyst} and I'm with the \${company} IT Service Desk, reaching out to you about \${shortdesc} as part of \${incident}.



Please give us a call at \${companyPN} and reference \${incident} so we can help you troubleshoot. The service desk is open 24/7 and this will be the fastest resolution to your issue.
If you do not need any further assistance, please respond to my email stating that your issue has been resolved.">Insert Comment</text-insert>`;
		saved_notes[company] = note;
		GM_setValue("saved_notes", saved_notes);
	}

    let classlist;
    if (settings.custom_edit_layout.value) {
        classlist = ["personalNotes", "notification-info", "notification"];
    } else {
        classlist = ["personalNotes"];
    }
	const notes = node.addNode("div", "custom_notes", classlist);

	const notes_text = notes.addNode("textarea", "custom_notes_text", ["personalNotesText", "form-control", "hidden"]);
	notes_text.value = note;

	const notes_div = notes.addNode("div", "custom_notes_div");
	notes_div.innerHTML = note;

    const help_button = notes.addNode("a", "help_button", ["btn", "btn-default", "btn-ref", "hidden"]);
    help_button.setAttribute("href","https://github.com/VivianVerdant/service-now-userscripts/wiki/Better-Incident-Page#custom-company-notes");
    help_button.setAttribute("target","_blank");
    help_button.addNode("span", "help_button_img", ["icon", "icon-help"]);

	const lock_button = notes.addNode("button", "toggle_notes_lock", ["btn", "btn-default", "btn-ref"]);
	lock_button.addNode("span", "toggle_notes_img", ["icon", "icon-locked"]);
    lock_button.onclick = (e) => {
		e.preventDefault();

		const text_node = document.querySelector("#custom_notes_text");
		text_node.classList.toggle("hidden");

		const div_node = document.querySelector("#custom_notes_div");
		div_node.classList.toggle("hidden");

        const help_node = document.querySelector("#help_button");
		help_node.classList.toggle("hidden");

        const img = document.querySelector("#toggle_notes_img");
		img.classList.toggle("icon-locked");
		img.classList.toggle("icon-unlocked");
		saveNote();

        const el = document.querySelector("#custom_notes_text");
        el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "80px";
	};

	//icon icon-locked
}

async function create_localtime(node) {
    console.log("foobar time");
    console.log(node);
    let addons_node = node.querySelector(".form-field-addons");
    // class="btn btn-default btn-ref reference_decoration icon-alert-triangle"
    let local_time_button = addons_node.addNode("a", "local_time_button", ["btn", "btn-default", "reference_decoration"]);

    let input_field_node = node.querySelector("[id='incident.u_phone']") || node.querySelector("[id='incident.u_contact_phone']");
    console.log(input_field_node);
    input_field_node.addEventListener("blur", phone_string_input);
    local_time_button.addEventListener("click", phone_string_input);

    let teststr = input_field_node.value;
    //teststr = parse_phone_string(teststr) || "NA";

    let time_string = getLocalInfo(teststr,{military: false}).time.display || "NA";

    local_time_button.innerHTML = time_string;
}

async function phone_string_input(event) {
    let button = document.querySelector("#local_time_button");
    let input = document.querySelector("[id='incident.u_phone']") || document.querySelector("[id='incident.u_contact_phone']");
    let str = input.value;
    //str = parse_phone_string(input.value) || "NA";
    let time_string = getLocalInfo(str,{military: false}).time.display || "NA";

    button.innerHTML = time_string;
}

function parse_phone_string(str) {
    let country_code_regex = /(\+\d{1,3})/g;
    let usarea_code_regex = /(\d{3})/g;
    let result = null;
    result = country_code_regex.exec(str);
    result = ( result ? result[0] : null );
    if (result) {return result}

    result = usarea_code_regex.exec(str);
    result = ( result ? result[0] : null );
    return result;
}

function kbToClipboard(e){
	const INC = document.getElementById('incident.number').value;
    console.log("domain: ", company_domain);
	if (e.target.classList.contains("form_action_button")) {
		let permurl = window.location;
		permurl = permurl.protocol + "//" + permurl.hostname + "/incident.do?sys_id=" + new URLSearchParams(permurl.search).get("sys_id");
        let dom = document.createElement("div");
        dom.innerHTML = company_domain + " ";
		let link = document.createElement("a");
		link.innerHTML = INC;
		link.href = permurl;
		let d = document.createElement("div");
        //d.appendChild(dom);
        d.innerText = company_domain + " ";
		d.appendChild(link);
        let desc = document.createElement("span");
        desc.innerText = " " + document.getElementById("incident.short_description").value;
        d.appendChild(desc);
		d.setAttribute("style", "display: none;");
		e.target.appendChild(d);
		function copyToClip(str) {
			function listener(e) {
				e.clipboardData.setData("text/html", str);
				e.clipboardData.setData("text/plain", str);
				e.preventDefault();
			}
			document.addEventListener("copy", listener);
			document.execCommand("copy");
			document.removeEventListener("copy", listener);
		};
		copyToClip(d.innerHTML);
	}else{
		navigator.clipboard.writeText(INC);
	}
	const el = document.querySelector(".navbar-right");
	el.classList.add("icon-clipboard");
	setTimeout(() => {el.classList.remove("icon-clipboard");}, 500);
	e.target.blur();
}

async function create_settings_menu(node) {
        const menu = new better_settings_menu(node, settings, "Better Settings Menu", GM_getResourceText("settings_css"));
        console.log(menu);
        menu.main_button.classList.add("btn", "btn-default", "action_context", "header", "btn-icon", "icon-cog", "form_action_button");
        menu.close_button.classList.add("btn", "btn-icon", "icon-connect-close-sm");
        //menu.set_option_item("Bar", false);
        GM_setValue("settings", menu.saved_options);
}

var related_record_popup

/* globals referenceField consoleDebug excludeCurrentRecord */
//Define function to call onclick of one of the links - will display a popup based on which link is clicked
async function showRelatedRecList_custom(tableName) {
    try {
        console.warn("custom related inc function");
        var userSysID = g_form.getValue(referenceField);

        var displayValue = g_form.getDisplayBox(referenceField).value;

        //Sort by sys_created_on, but float active records to the top
        var orderBy = '^ORDERBYDESCsys_updated_on';

        var title = 'Showing records related to: ' + displayValue + " (custom)";

        //Build encoded query
        var query = getTableUserQuery_custom(tableName, userSysID);
        query += orderBy;

        var popupUrl = tableName + '_list.do';
        popupUrl += '?sysparm_query=' + query;

        related_record_popup = g_navigation.openPopup(popupUrl, title, 'menubar=no,toolbar=no', false)
    }
    catch (e) {
        consoleDebug('Error showing related list popup: ' + e);
    }
}

//Define a function to return the user reference field for a specified table
function getTableUserQuery_custom(tableName, userSysID) {
    try {
        var result = '';

        //Define how many days to search records based on sys_created_on
        var daysAgo = settings.related_inc_days_ago.value;

        var activeOrRelativeTimeQuery = '';
        //Avoiding escaping issues...
        if (excludeCurrentRecord) {
            if (!g_form.isNewRecord()) {
                var excludedRecord = '';
                var formTable = g_form.getTableName();
                if (formTable == tableName) {
                    //Set current record to be excluded
                    excludedRecord = g_form.getValue('number');
                    activeOrRelativeTimeQuery += '^number!=' + excludedRecord;
                } else if (formTable == 'sc_task') {
                    excludedRecord = g_form.getDisplayBox('request_item').value;
                    activeOrRelativeTimeQuery += '^number!=' + excludedRecord;
                }
            }
        }

        //Using relative because it's more intuitive when displayed in the filter
        activeOrRelativeTimeQuery += '^active=true^ORsys_created_onRELATIVEGT@dayofweek@ago@' + daysAgo;

        var tableUserFields = [];
        switch (tableName) {
            case 'incident':
                tableUserFields.push('u_affected_user');
                tableUserFields.push('caller_id');
                tableUserFields.push('opened_by');
                break;
            case 'u_email':
                tableUserFields.push('u_contact');
                break;
            case 'sc_req_item':
                tableUserFields.push('u_requested_for');
                tableUserFields.push('requested_for');
                tableUserFields.push('u_requested_by');
                tableUserFields.push('opened_by');
                break;
            default:
                throw new Error(tableName + ' is not valid');
        }

        //Not equals instead of less than due to escaping issues (escaping solutions didn't work or were inconsistent between catalog and form UI)
        //Iterate and query for any user reference fields returned
        for (var i = 0; i != tableUserFields.length; i++) {
            result += tableUserFields[i] + '=' + userSysID;
            //Append ^OR if not last item in array
            if ((i + 1) != tableUserFields.length) {
                result += '^OR';
            }//If last item in array don't append or and add the rest of the query
            else {
                result += activeOrRelativeTimeQuery;
            }
        }
    } catch (e) {
        consoleDebug('Error building query: ' + e);
        result = false;
    }

    return result;
}

const replace_related_inc_observer = new MutationObserver((mutations_list) => {
    if (document.querySelector("#vrt_show_related_task_records_link_incident")) {
        const related_inc_node = document.querySelector("#vrt_show_related_task_records_link_incident");
        console.warn("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.warn(related_inc_node);
        console.warn(related_inc_node.onclick);
        related_inc_node.onclick = function() {showRelatedRecList_custom('incident')};
        console.warn(related_inc_node.onclick);
    }

    if (location.includes("b47514e26f122500a2fbff2f5d3ee4d0")) {
        for (const n of mutations_list) {
            if (n.addedNodes.length > 0){
                console.warn(n.addedNodes);
                for (const m of n.addedNodes) {
                    console.warn(m.data);
                    if (m.data != "(0)" && settings.auto_open_related_incidents.value ) {
                        showRelatedRecList_custom('incident');
                    }
                }
            }
        }
    }
});

async function new_main(element) {
	console.log("new main");
	if (run_once){
		return
	}
	run_once = true;

	find_or_observe_for_element("#sc_attachment_button", async (node) => {
		console.log('header has been added:-------------------------------------------');
		const button_section = node.parentNode;
		console.log(button_section);
		create_settings_menu(button_section);
		//button_section.addNode("button", "newincsettingsbutton", ["open-bsn-modal-button", "btn", "btn-default", "action_context", "header", "btn-icon", "icon-cog", "form_action_button"]);
	}, undefined, true);

	if (settings.custom_new_layout.value) {
		GM_addStyle(GM_getResourceText("better_new_incident_css"));
	}

	find_or_observe_for_element(".outputmsg", async (node) => {
		console.log('.outputmsg has been added:-------------------------------------------');
		console.log(node);
		node.firstElementChild.addEventListener("click", (e) => {
			if (e.target.classList.contains("icon-info")) {
				e.target.nextSibling.classList.toggle("hidden");
			}
		});
		//node.lastElementChild.classList.add("hidden");
	}, undefined, false);

    find_or_observe_for_element("#vrt_show_related_task_records_link_incident_count", async (node) => {
        console.warn('related incidents node:-------------------------------------------');
        console.warn(node);
        replace_related_inc_observer.observe(document.querySelector("#vrt_show_related_task_records_link_incident_count"), { subtree: true, childList: true });
    }, undefined, false);

    find_or_observe_for_element("#submit_button", async (node) => {
        node.addEventListener("click", (e) => {if (related_record_popup) {related_record_popup.close();}});
    }, undefined, true);

	document.onkeydown = function(e) {
		if( e.ctrlKey && (e.key === 's' || e.key === 'd') ){
			e.preventDefault();
            if (related_record_popup) {
                related_record_popup.close();
            }
			document.querySelector("#submit_button").click();
		}
	};

	/*
	if (settings.custom_notes) {
        find_or_observe_for_element("[id='ac.status']", (node) => {
            console.log('insert notes after:-------------------------------------------');
            console.log(node);
			const observer = new MutationObserver((mutations_list) => {
				create_notes(node);
			});
			observer.observe(document, { subtree: true, childList: true });
		node.addEventListener("", async (e) => {
		});
        });
    }*/
}

async function edit_main(element) {
	console.log("edit main");
	if (run_once){
		return
	}
	run_once = true;

     //Will normally be pulled from userscript local storage
    console.log(settings);

	find_or_observe_for_element(".navbar-right > span:first-child", async (node) => {
        create_settings_menu(node);
	}, undefined, true);

    if (settings.custom_edit_layout.value) {
        GM_addStyle(GM_getResourceText("better_incident_css"));

        find_or_observe_for_element(".outputmsg", async (node) => {
            console.log('.outputmsg has been added:-------------------------------------------');
            console.log(node);
            node.firstElementChild.addEventListener("click", (e) => {
                if (e.target.classList.contains("icon-info")) {
                    e.target.nextSibling.classList.toggle("hidden");
                }
            });
            node.lastElementChild.classList.add("hidden");
        }, undefined, false);

        find_or_observe_for_element(".fieldmsg-container", async (node) => {
            node.addEventListener("click", (e) => {
                node.classList.add("hidden");
            });
        }, undefined, false);

        find_or_observe_for_element(".section_header_content_no_scroll.touch_scroll.overflow_x_hidden-hotfix", (node) => {
            console.log('datarows:-------------------------------------------');
            console.log(node);
            node.addEventListener("scroll", async (e) => {
                const r = document.querySelector('body > div > form > span > span:not(.sn-stream-section) > div.section-content.with-overflow > div:nth-child(2)');
                let x = "translateY(" + e.target.scrollTop + "px)";
                r.style.setProperty("transform", x);
                r.previousSibling.style.setProperty("transform", x);
                //console.log(x);
            }, { passive: true });
        }, undefined, true);
    } else {
        //add css
    }

    if (settings.custom_color_theme.value) {
        // insert custom colors
        var custom_css = ".-polaris \{";
        if (settings.primary_text.value) {
            custom_css = custom_css + `
            --now-color_text--primary: ${settings.primary_text.value} !important;
            --now-form-field--color: ${settings.primary_text.value} !important;
            --now-button--bare_primary--color: ${settings.primary_text.value} !important;
            --now-button--secondary--color: ${settings.primary_text.value} !important;
            --now-color--primary-1: ${settings.primary_text.value} !important;
            --now-color_text--secondary: ${settings.primary_text.value} !important;
            --now-checkbox_label--color: ${settings.primary_text.value} !important;
            --now-tabs--color: ${settings.primary_text.value} !important;
        `}
        if (settings.background.value) {
            custom_css = custom_css + `
            --now-color_background--primary: ${settings.background.value} !important;
            --now-color_background--secondary: ${settings.background.value} !important;
        `}
        if (settings.required.value) {
            custom_css = custom_css + `--now-color_alert--critical-2: ${settings.required.value} !important;`}
        custom_css = custom_css + `\}`;
        console.log(custom_css);
        GM_addStyle(custom_css);
    }

	find_or_observe_for_element("#resolve_incident", (node) => {
		console.log('#resolve_incident has been added:-------------------------------------------');
		console.log(node);
		node.addEventListener("click", onClickResolveBtn);
	}, undefined, false);

	find_or_observe_for_element("input[id='incident.number']", (node) => {
		console.log('#resolve_incident has been added:-------------------------------------------');
		let btn = document.createElement("button");
		btn.classList.add("inc_copy_button");
		let header = document.querySelector("nav.navbar.navbar-default.section_zero > div.container-fluid");
		header.appendChild(btn);
		header.insertBefore(btn, btn.previousSibling);
		btn.addEventListener("click", kbToClipboard);
		let inner = document.createElement("span");
		inner.innerHTML = node.value;
		btn.appendChild(inner);

        if (settings.header_random_color.value) {
            const hue = parseInt(node.value.replace(/\D/g,''));
            console.log("Num: ",hue);
            document.querySelector(':root').style.setProperty('--header-color', getColorFromSeed(hue));
        }

		const doc_buttons = document.querySelector(".navbar_ui_actions");
		let permalink = document.createElement("button");
		permalink.classList.add("form_action_button", "header", "action_context", "btn", "btn-default");
		permalink.innerHTML = "Permalink";
		permalink.setAttribute("style", "white-space: nowrap;");
		permalink.addEventListener("click", kbToClipboard);
		doc_buttons.appendChild(permalink);
	}, undefined, true);

	find_or_observe_for_element(".activity-stream-textarea, #activity-stream-work_notes-textarea, .question_textarea_input", (node) => {
		//console.log('textarea has been added:-------------------------------------------');
		//console.log(node);
		const text_area_fn = async (e) => {e.target.style.height = "0px"; e.target.style.height = e.target.scrollHeight + 8 + "px";}
		node.addEventListener("change", text_area_fn);
		node.addEventListener("keydown", text_area_fn);
		node.addEventListener("click", text_area_fn);
		setTimeout(() => {node.click();}, 1000);
	}, undefined, false);

	find_or_observe_for_element("a, button, textarea, input, select", async (node) => {
		//console.log('form input added');
		if ( node.id == "sys_readonly.incident.number") {
			node.setAttribute("tabindex", 1);
		}else if (node.tagName == "A" || node.tagName == "BUTTON" || node.getAttribute("type") == "hidden" || node.getAttribute("readonly") == "readonly" || node.getAttribute("type") == "checkbox") {
			node.setAttribute("tabindex", 100);
		}else{
			node.setAttribute("tabindex", 10);
			node.classList.add("multiLinePill");
		}
	}, "form", true);

    if (settings.custom_notes.value) {
        find_or_observe_for_element("body > div > form > span.tabs2_section.tabs2_section_0.tabs2_section0 > span > div.section-content.with-overflow > div:nth-child(3)", (node) => {
            console.log('insert notes after:-------------------------------------------');
            console.log(node);
            create_notes(node);
            /*
		node.addEventListener("", async (e) => {
		});*/
        });
    }

    if (settings.custom_notes.value) {
        find_or_observe_for_element("[id='element.incident.u_phone']", (node) => {
            console.log('insert local time:-------------------------------------------');
            console.log(node);
            create_localtime(node);
            /*
		node.addEventListener("", async (e) => {
		});*/
        });
    }

    if (settings.custom_notes.value) {
        find_or_observe_for_element("[id='element.incident.u_contact_phone']", (node) => {
            console.log('insert local time:-------------------------------------------');
            console.log(node);
            create_localtime(node);
            /*
		node.addEventListener("", async (e) => {
		});*/
        });
    }

	document.onreadystatechange = function () {
		if (document.readyState == "complete") {
			if (settings.auto_open_kb_search.value) {
				document.querySelector("[id='cxs_maximize_results']").click();
			}

			/* kb name testing */

			const get_record = (id) => {
				let test = new GlideRecord('kb_knowledge');
				test.get(id);
				console.log("return: ", test);
				return test
			}

			const updater = (field_name, original_value, new_value) => {
				if (field_name === "incident.u_kb_article") {
					console.log('The field ('+ field_name + ') has a new value of: ' + new_value);
					g_form.hideFieldMsg(field_name, true);
					let kb = get_record(new_value);
					console.log(kb);
					g_form.showFieldMsg(field_name, kb.short_description, "info")
				}
			}

			//g_form.showFieldMsg("u_kb_article", "Foobar", "info");
			let init_kb = g_form.getValue("incident.u_kb_article");
			console.log(init_kb);
			let init_name = get_record(init_kb).short_description;
			g_form.showFieldMsg("incident.u_kb_article", init_name, "info");

			g_form.onUserChangeValue(updater);

			/* kb name testing */

            let comp = new GlideRecord('core_company');
            comp.get(g_form.getValue("incident.company"));
            company_domain = comp.u_id;
            console.log("domain: ", company_domain);

		}
	}

	document.onkeydown = function(e) {
		if(e.key === 's' && e.ctrlKey){
			e.preventDefault();
			document.querySelector("#sysverb_update_and_stay").click();
		}else if(e.key === 'd' && e.ctrlKey){
			e.preventDefault();
			document.querySelector("#resolve_incident").click();
        }
	};

    find_or_observe_for_element("[id='sys_display.incident.u_kb_article']", (node) => {
		const btn = node.parentNode.addNode("a", "custom_btn", ["icon-info"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: right;");
        const sys_id = node.value.split(' ')[0];
        btn.href = "https://virteva.service-now.com/kb_view.do?sysparm_article=" + sys_id;
		btn.innerHTML = "Open";
        btn.target = "_blank";
	}, undefined, true);

    find_or_observe_for_element("#vrt_show_related_task_records_link_incident_count", async (node) => {
        replace_related_inc_observer.observe(document.querySelector("#vrt_show_related_task_records_link_incident_count"), { subtree: true, childList: true });
    }, undefined, true);

    find_or_observe_for_element("#activity-stream-comments-textarea", async (node) => {
        const sigbtn = node.parentNode.parentNode.addNode("div","insert-signature-button",["btn", "btn-default"]);
        sigbtn.style = "float:right;";
        sigbtn.innerHTML = "Add signature";
        const nodeB = document.querySelector(".comment-box .pull-right");
        const sigbtnB = nodeB.addNode("div","insert-signature-buttonB",["btn", "btn-default"]);
        sigbtnB.style = "float:right;";
        sigbtnB.innerHTML = "Add signature";
        sigbtn.addEventListener("click", (e) => {e.preventDefault(); const el = document.querySelector("#activity-stream-comments-textarea"); el.value += custom_text_parser(settings.custom_signature.value); el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";});
        console.warn(sigbtn);
        console.warn(sigbtnB);
        setTimeout(() => {document.querySelector("#insert-signature-buttonB").addEventListener("click", (e) => {e.preventDefault(); const el = document.querySelector("#activity-stream-textarea"); el.value += custom_text_parser(settings.custom_signature.value); el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";})}, 8000);
    }, undefined, true);

    find_or_observe_for_element("[name='work_notes-journal-checkbox']", async (node) => {
        toggle_insert_signature_button();
        node.addEventListener("click", (e) => {toggle_insert_signature_button();});
    }, undefined, true);

    find_or_observe_for_element(".icon-stream-one-input", async (node) => {
        toggle_insert_signature_button();
        node.addEventListener("click", (e) => {toggle_insert_signature_button();});
        document.querySelector(".icon-stream-all-input").addEventListener("click", (e) => {toggle_insert_signature_button();});
    }, undefined, true);

    /* globals assign_textarea */
    if (settings.work_notes_newline_character.value != "") {
        console.log("newline character set to: ", settings.work_notes_newline_character.value);
        find_or_observe_for_element("#activity-stream-textarea", async (node) => {
            assign_textarea(node, settings.work_notes_newline_character.value);
        }, undefined, true);
        find_or_observe_for_element("#activity-stream-work_notes-textarea", async (node) => {
            assign_textarea(node, settings.work_notes_newline_character.value);
        }, undefined, true);
    }
}

console.warn("Better Incidents Start");
if (location.includes("b47514e26f122500a2fbff2f5d3ee4d0")){
	new_main();
}

if (location.includes("incident.do")){
	edit_main();
}
console.warn("Better Incidents End");

function toggle_insert_signature_button() {
    setTimeout(() => {
        if (!document.querySelector("#multiple-input-journal-entry").classList.contains("ng-hide")) {
            document.querySelector("#insert-signature-buttonB").classList.add("hidden");
            console.warn("HIDE toggled off");
        } else {
            if (document.querySelector("[name='work_notes-journal-checkbox']").checked) {
                document.querySelector("#insert-signature-buttonB").classList.add("hidden");
                console.warn("SHOW toggled off");
            } else {
                document.querySelector("#insert-signature-buttonB").classList.remove("hidden");
                console.warn("SHOW toggled on");
            }
        }
        const el = document.querySelector("#activity-stream-textarea");
        el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";

    }, 100);
}

function custom_text_parser(str) {
    function replaceStringVariable(text, data) {
        // Create regex using the keys of the replacement object.
        const regex = new RegExp('\\${(' + Object.keys(data).join('|') + ')}', 'g')

        // Replace the string by the value in object
        return text.replace(regex, (m, p1) => data[p1] || m)
    }

    const newText = replaceStringVariable(str, {
        analyst: g_user.fullName,
        analystFN: g_user.firstName,
        shortdesc: g_form.getValue('short_description'),
        incident: g_form.getValue('number'),
        company: g_form.getDisplayBox("company").value,
        userFN: g_form.getReference("u_affected_user").first_name,
        companyPN: g_form.getReference('company').u_service_desk_contact_information.replace(/(?:a|[^a])*?(?:^|\s|\()(\d{3})[^\d]{1,2}(\d{3})[^\d](\d{4})(\s|$)(?:a|[^a])*/,`$1-$2-$3`)
    })

    return newText
}
