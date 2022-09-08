// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/
// @version      0.3
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

/* Changelog
v0.3 - Made more reliable, less buggy, and hopefully more performant.
v0.2 - Added more features,
        - Auto show Close Notes when you press the Resolve button.
		- Auto fill user's First name into the Close Notes.
		- Responsive sizing on the Work Notes field.
v0.1 - Initial release
*/

/* globals waitForKeyElements */

'use strict';

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
}

function editIncidentPage(){
	var text_notes = document.getElementById("activity-stream-textarea");
	text_notes.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px";');
	text_notes.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px";');
	text_notes.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
	text_notes.style.height = text_notes.scrollHeight + 24 + "px";

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
		document.getElementsByClassName("col-xs-12")[0].scrollIntoView(true);
		console.log("EDIT INC");
		editIncidentPage();
	}else{
		console.log("exiting better incidents");
		return;
	}
}
console.warn("Better Incidents Start");
waitForKeyElements("div[role]", main, true);
console.warn("Better Incidents End");
