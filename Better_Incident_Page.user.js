// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/
// @version      0.2
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*

// @grant        none
// ==/UserScript==

/* Changelog
v0.2 - Added more features,
        - Auto show Close Notes when you press the Resolve button.
	- Auto fill user's First name into the Close Notes.
	- Responsive sizing on the Work Notes field.
v0.1 - Initial release
*/

var INC;
var resolve_tab;

function newIncidentPage(){
	console.log("RUN");
	var text_desc = document.getElementsByClassName("question_textarea_input")[0];
	text_desc.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(true)');
	text_desc.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(true)');
	text_desc.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
	//text_desc.setAttribute('onchange', "");

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

function kbToClipboard(){
	  navigator.clipboard.writeText(INC);
}

function editIncidentPage(){
	var text_notes = document.getElementById("activity-stream-textarea");
	text_notes.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(false)');
	text_notes.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 24 + "px"; this.scrollIntoView(false)');
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
	/*
	for (let t in tabs){
		if (!tabs[t].hasAttribute("style")){
			continue;
		}
		console.log(tabs[t].getAttribute("style"));
		if (tabs[t].getAttribute("style").includes("display: none")){
			resolve_tab = tabs[t];
		}
	}*/

	//id="resolve_incident"
	var close_btn = document.getElementById("resolve_incident");
	close_btn.addEventListener("click", onClickResolveBtn);
	console.log("btn: ", close_btn);
	//id="element.incident.close_code" get parent until tab_caption="Closure Information"

}

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

//id="output_messages"

//document.getElementById('#something').scrollIntoView({ behavior: 'smooth', block: 'top' });
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fincident.do%3Fsys_id%3D8e78c6d5db7555907036e6ccd39619ce%26sysparm_view%3D  b47514e26f122500a2fbff2f5d3ee4d0
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D       b47514e26f122500a2fbff2f5d3ee4d0  %26sysparm_preview%3Dtrue%26sysparm_stack%3Dno
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fhome.do

function main() {
    'use strict';

	if (window.location.href.includes("incident.do")){
		document.getElementsByClassName("col-xs-12")[0].scrollIntoView(true);
	}


	var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            //console.log('Degugging', method, url);
			if (method == "PATCH" && window.location.href.includes("b47514e26f122500a2fbff2f5d3ee4d0")){
				console.log("NEW INC");
				newIncidentPage();
			}else if (method == "PATCH" && window.location.href.includes("incident.do")){
				console.log("EDIT INC");
				editIncidentPage();
			}
        });
        origOpen.apply(this, arguments);
    };

}
main();
