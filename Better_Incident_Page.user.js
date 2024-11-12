// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      2.1
// @description  Description
// @author       Vivian
// @match        https://virteva.service-now.com/*
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/pseudorandom.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/better_settings_menu.js
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
/* globals find_or_observe_for_element createBetterSettingsMenu AJAXCompleter getColorFromSeed better_settings_menu GlideRecord g_form getLocalInfo */


/* Changelog
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
    custom_layout: false,
    custom_notes: false,
    header_random_color: false,
    custom_color_theme: false,
	auto_open_kb_search: false,
    background: "255,255,255",
    primary_text: "0,0,0",
    required: "255,0,0",
};

var settings = GM_getValue("settings", default_settings);

for (const [key, value] of Object.entries(default_settings)) {
    if (!settings[key]) {
        settings[key] = value;
    }
}

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

function overrideAJAX(){
	var open = window.XMLHttpRequest.prototype.open,
		send = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		if (url.includes("rectangle")){
			//url = url.concat("&u_company=");
		}
		this._url = url;
		console.log(arguments);
		return open.apply(this, arguments);
	}

	function sendReplacement(data) {
		//console.log(data);

        if (data && typeof data == "string") {
            const i = data.indexOf("sysparm_chars");
            console.log(i);
            if (i >= 0) {
                data = data.replace("sysparm_chars=", "sysparm_chars=*");
                console.warn(data);
            }

            //let formData = new FormData(data);
        }

		if(this.onreadystatechange) {
			this._onreadystatechange = this.onreadystatechange;
		}
		//this.onreadystatechange = onReadyStateChangeReplacement;

		function loadEvent(data) {
            console.log(data);
		}
		this.addEventListener('load', loadEvent);

		return send.apply(this, arguments);
	}

	function onReadyStateChangeReplacement() {
		if (this.readyState == 4 && this._url.includes("rectangle" )){

		}
		if(this._onreadystatechange) {
			return this._onreadystatechange.apply(this, arguments);
		}
	}

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

}

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

function create_notes(node) {
	let saved_notes = GM_getValue("saved_notes", new Object());
	const company = document.querySelector("[id='sys_display.incident.company']").value;
	let note;
	//console.log(Object.keys(saved_notes));
	if (Object.keys(saved_notes).includes(company)){
		note = saved_notes[company];
	} else {
		note = "Personal " + company + " notes:";
		saved_notes[company] = note;
		GM_setValue("saved_notes", saved_notes);
	}

    let classlist;
    if (settings.custom_layout) {
        classlist = ["personalNotes", "notification-info", "notification"];
    } else {
        classlist = ["personalNotes"];
    }
	const notes = node.addNode("div", "custom_notes", classlist);

	const notes_text = notes.addNode("textarea", "custom_notes_text", ["personalNotesText", "form-control", "hidden"]);
	notes_text.value = note;

	const notes_div = notes.addNode("div", "custom_notes_div");
	notes_div.innerHTML = note;

	const lock_button = notes.addNode("button", "toggle_notes_lock", ["btn", "btn-default", "btn-ref"]);
	lock_button.addNode("span", "toggle_notes_img", ["icon", "icon-locked"]);
	lock_button.onclick = (e) => {
		e.preventDefault();

		const text_node = document.querySelector("#custom_notes_text");
		text_node.classList.toggle("hidden");

		const div_node = document.querySelector("#custom_notes_div");
		div_node.classList.toggle("hidden");

        const img = document.querySelector("#toggle_notes_img");
		img.classList.toggle("icon-locked");
		img.classList.toggle("icon-unlocked");
		saveNote();
	};

	//icon icon-locked
}

async function create_localtime(node) {
    console.warn("foobar time");
    console.warn(node);
    let addons_node = node.querySelector(".form-field-addons");
    // class="btn btn-default btn-ref reference_decoration icon-alert-triangle"
    let local_time_button = addons_node.addNode("a", "local_time_button", ["btn", "btn-default", "reference_decoration"]);

    let input_field_node = node.querySelector("[id='incident.u_phone']") || node.querySelector("[id='incident.u_contact_phone']");
    console.warn(input_field_node);
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

async function new_main(element) {
	console.log("new main");
	if (run_once){
		return
	}
	run_once = true;

	GM_addStyle(GM_getResourceText("better_new_incident_css"));

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

	document.onkeydown = function(e) {
		if( e.ctrlKey && (e.key === 's' || e.key === 'd') ){
			e.preventDefault();
			document.querySelector("#submit_button").click();
		}
	};

	if (settings.custom_notes) {
        find_or_observe_for_element("[id='ac.status']", (node) => {
            console.log('insert notes after:-------------------------------------------');
            console.log(node);
			const observer = new MutationObserver((mutations_list) => {
				create_notes(node);
			});
			observer.observe(document, { subtree: true, childList: true });
			/*
		node.addEventListener("", async (e) => {
		});*/
        });
    }
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
        const menu = new better_settings_menu(node, settings, "Better Settings Menu", GM_getResourceText("settings_css"));
        console.warn(menu);
        menu.main_button.classList.add("btn", "btn-default", "action_context", "header", "btn-icon", "icon-cog", "form_action_button");
        menu.close_button.classList.add("btn", "btn-icon", "icon-connect-close-sm");
        //menu.set_option_item("Bar", false);
        GM_setValue("settings", menu.saved_options);
	}, undefined, true);

    if (settings.custom_layout) {
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

    if (settings.custom_color_theme) {
        // insert custom colors
        const custom_css = `
.-polaris \{
    --now-color_text--primary: ${settings.primary_text} !important;
    --now-form-field--color: ${settings.primary_text} !important;
    --now-button--bare_primary--color: ${settings.primary_text} !important;
    --now-button--secondary--color: ${settings.primary_text} !important;
    --now-color--primary-1: ${settings.primary_text} !important;
    --now-color_text--secondary: ${settings.primary_text} !important;
    --now-checkbox_label--color: ${settings.primary_text} !important;
    --now-tabs--color: ${settings.primary_text} !important;

    --now-color_background--primary: ${settings.background} !important;
    --now-color_background--secondary: ${settings.background} !important;

    --now-color_alert--critical-2: ${settings.required} !important;

\}`;
        console.warn(custom_css);
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

        if (settings.header_random_color) {
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

    if (settings.custom_notes) {
        find_or_observe_for_element("body > div > form > span.tabs2_section.tabs2_section_0.tabs2_section0 > span > div.section-content.with-overflow > div:nth-child(3)", (node) => {
            console.log('insert notes after:-------------------------------------------');
            console.log(node);
            create_notes(node);
            /*
		node.addEventListener("", async (e) => {
		});*/
        });
    }

    if (settings.custom_notes) {
        find_or_observe_for_element("[id='element.incident.u_phone']", (node) => {
            console.log('insert local time:-------------------------------------------');
            console.log(node);
            create_localtime(node);
            /*
		node.addEventListener("", async (e) => {
		});*/
        });
    }

    if (settings.custom_notes) {
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
			if (settings.auto_open_kb_search) {
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
		console.log(node);
		const btn = node.parentNode.addNode("a", "custom_btn", ["icon-info"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: right;");
        const sys_id = node.value.split(' ')[0];
        btn.href = "https://virteva.service-now.com/kb_view.do?sysparm_article=" + sys_id;
		btn.innerHTML = "Open";
        btn.target = "_blank";
	}, undefined, true);

    /*
    find_or_observe_for_element("li.h-card.h-card_md.h-card_comments", (node) => {
        const is_system_msg = node.querySelector("div.sn-card-component_accent-bar:not(.sn-card-component_accent-bar_dark)");
		if (is_system_msg) {
            console.warn(node);
            const created_by = node.querySelector(".sn-card-component-createdby");
            if (created_by) {
                console.warn(created_by.innerText);
            }
            for (const n in node.querySelectorAll("*")) {
                console.warn(n.classList || "");
                if (n.classList && n.classList.contains("sn-widget-list-table-cell")) {
                    console.warn(n.innerText);
                }
            }
        }
	}, undefined, false);
    */
}

console.warn("Better Incidents Start");
if (location.includes("b47514e26f122500a2fbff2f5d3ee4d0")){
    //overrideAJAX();
	new_main();
}

if (location.includes("incident.do")){
    //overrideAJAX();
	edit_main();
}
console.warn("Better Incidents End");
