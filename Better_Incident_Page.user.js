// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/
// @version      0.5
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

/* Changelog
v0.5 - Made Incident fields that are mandatory but not filled out have a more prominent styling.
v0.4 - Made company notes on Incident edit page into a toggleable static div.
v0.3 - Made more reliable, less buggy, and hopefully more performant.
v0.2 - Added more features,
        - Auto show Close Notes when you press the Resolve button.
	- Auto fill user's First name into the Close Notes.
	- Responsive sizing on the Work Notes field.
v0.1 - Initial release
*/

/* globals waitForKeyElements */

'use strict';

// CSS
function addGlobalStyle(css){
	var head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

//addGlobalStyle("div.is-required input{background: red;}");
//addGlobalStyle(".form-control{color: black !important;}");
//addGlobalStyle(".label-text{color: black !important;}");

// CSS

var INC;
var resolve_tab;
var run_once = false;
var options_btn;

function newIncidentPage(){
	options_btn.setAttribute("style", "position: relative; top: 4px;");

	console.log("RUN");
	var text_desc = document.getElementsByClassName("question_textarea_input")[0];
	text_desc.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(true)');
	text_desc.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(true)');
	text_desc.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");

	var company_popup = document.getElementsByClassName("outputmsg_div")[0];
	company_popup.setAttribute("style", "position: absolute; right: 0px; top: 40px; max-width: 45%;");

}

var btn_style = "position: fixed;"+
  "width: max-content;"+
  "height: 35px;"+
  "background: #ffffff;"+
  "top: 0px;"+
  "left: 30%;"+
  "margin: -6px;"+
  "color: black;"+
  "text-align: center;"+
  "font-size: 18px;"+
  "z-index: 10000;"+
  "box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.3);"+
  "cursor: pointer;"

async function onClickResolveBtn(){
	console.log("clicking");
	resolve_tab.click();
	document.getElementById("tabs2_section").scrollIntoView(true);

	var user_name = document.getElementById("sys_display.incident.u_affected_user").getAttribute("value");
	console.log(user_name);
	var close_field = document.getElementById("incident.close_notes");
	close_field.innerHTML = close_field.innerHTML.concat(user_name);
	console.log(close_field);

}

function kbToClipboard(){
	navigator.clipboard.writeText(INC);
	this.setAttribute("class", "icon-cog");
	setTimeout(() => {this.setAttribute("class", "icon-cog");}, 500);

}

function msg_click(){
	if (this.nextSibling.getAttribute("style") == "display: block;"){
		this.nextSibling.setAttribute("style", "display: none;");
	}else{
		this.nextSibling.setAttribute("style", "display: block;");
	}
}

function company_notes(){
	var first_msg_txt = document.getElementsByClassName("outputmsg_text")[0];
	if (first_msg_txt && first_msg_txt.innerHTML.startsWith("Incident")){
		let p = first_msg_txt.parentNode;
		p.remove()
	}

	var msg_box = document.getElementById("output_messages");
	var msg_close_btn = document.getElementById("close-messages-btn");
	var msg_icon = document.getElementsByClassName("notification-icon")[0];
	var msg_info_box = document.getElementsByClassName("outputmsg_info")[0];
	var msg_txt = document.getElementsByClassName("outputmsg_text")[0];


	msg_box.setAttribute("style", "position: fixed; max-width: 50vw; top: 45px; right: 25px;");
	msg_close_btn.setAttribute("style", "display: none;");
	msg_info_box.setAttribute("style", "min-width: 38px; min-height: 32px;");
	msg_txt.setAttribute("style", "display: none;");

	msg_icon.setAttribute("visible", false);
	msg_icon.setAttribute("style", "float: right;");
	msg_icon.setAttribute("class", "btn-icon notification-icon icon-info");
	msg_icon.addEventListener("click", msg_click);
}

function editIncidentPage(){
	addGlobalStyle("div.is-required input{background: #ffb1ab;}");
	addGlobalStyle("div.is-required select{background: #ffb1ab;}");
	addGlobalStyle("div.is-required textarea{background: #ffb1ab;}");

	company_notes();

	//document.getElementsByClassName("col-xs-12")[0].scrollIntoView(true);

	var text_notes = document.getElementById("activity-stream-work_notes-textarea");
	if (!text_notes){
		text_notes = document.getElementById("activity-stream-textarea");
	}
	text_notes.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px";');
	text_notes.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px";');
	text_notes.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
	text_notes.style.height = text_notes.scrollHeight + 24 + "px";

	//.required-marker:before

	INC = document.getElementById("incident.number").value;
	let btn = document.createElement("button");
	btn.setAttribute("style", btn_style);
	document.body.appendChild(btn)
	btn.addEventListener("click", kbToClipboard);
	let inner = document.createElement("span");
	inner.innerHTML = INC;
	btn.appendChild(inner);
	console.log(btn);

	var tabs = document.getElementsByClassName("tabs2_tab");
	resolve_tab = tabs[2];
	console.log("resolver: ", resolve_tab);

	var close_btn = document.getElementById("resolve_incident");
	close_btn.addEventListener("click", onClickResolveBtn);
	console.log("btn: ", close_btn);
}


function main(element) {
	console.log("main");
	let loc = window.location.href;
	if (run_once){
		return
	}
	run_once = true;

	var header = document.querySelectorAll("div[role='navigation'],nav[role='navigation']")[0].firstChild.childNodes[1].firstChild;
	options_btn = document.createElement("button");
	options_btn.setAttribute("class", "icon-cog");
	header.appendChild(options_btn, header);

	if (loc.includes("b47514e26f122500a2fbff2f5d3ee4d0")){
		console.log("NEW INC");
		newIncidentPage();
	}else if (loc.includes("incident.do")){
		console.log("EDIT INC");
		editIncidentPage();
	}else{
		console.log("exiting better incidents");
		return;
	}
}
console.warn("Better Incidents Start");
waitForKeyElements("#output_messages", main, true);
console.warn("Better Incidents End");



