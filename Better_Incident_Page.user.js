// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/
// @version      0.1
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*

// @grant        none
// ==/UserScript==

/* Changelog
v0.1 - Initial release
*/

var INC;

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
  "height: 45px;"+
  "background: #ffffff;"+
  "top: 0px;"+
  "left: 40%;"+
  "margin: auto;"+
  "color: black;"+
  "text-align: center;"+
  "font-size: 23px;"+
  "z-index: 10000;"+
  "box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.3);"+
  "cursor: pointer;"

function kbToClipboard(){
	  navigator.clipboard.writeText(INC);
}

function editIncidentPage(){
	var text_notes = document.getElementById("activity-stream-work_notes-textarea");
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

}


//id="output_messages"

//document.getElementById('#something').scrollIntoView({ behavior: 'smooth', block: 'top' });
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fincident.do%3Fsys_id%3D8e78c6d5db7555907036e6ccd39619ce%26sysparm_view%3D  b47514e26f122500a2fbff2f5d3ee4d0
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fcom.glideapp.servicecatalog_cat_item_view.do%3Fv%3D1%26sysparm_id%3D       b47514e26f122500a2fbff2f5d3ee4d0  %26sysparm_preview%3Dtrue%26sysparm_stack%3Dno
//https://virtevatest.service-now.com/nav_to.do?uri=%2Fhome.do

function main() {
    'use strict';

	if (window.location.href.includes("incident.do")){
		document.getElementById("82f0fa3c4fe6420018a258211310c7e6").scrollIntoView(true);
	}


	var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            //console.log('Degugging', method, url);
			if (method == "PATCH" && window.location.href.includes("b47514e26f122500a2fbff2f5d3ee4d0")){
				newIncidentPage();
			}else if (method == "PATCH" && window.location.href.includes("incident.do")){
				editIncidentPage();
			}
        });
        origOpen.apply(this, arguments);
    };

}
main();