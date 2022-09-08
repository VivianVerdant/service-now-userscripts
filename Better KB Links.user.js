// ==UserScript==
// @name         Better KB Links
// @namespace    https://github.com/VivianVerdant/
// @version      0.6
// @description  Always open KBs in new tabs and choose between viewing minimal and full versions
// @author       Vivian
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==

/* Changelog
v0.6 - Made the script much more reliable and work globally.
v0.5 - Added static button that lists KB number and copies it to clipboard when clicked.
v0.4 - REALLY fixed duplicate link creation this time
v0.3 - Creates correct links inside of KBs and for permalinks
v0.2 - Fixes links generated after page load and doesn't sometimes create duplicate links
v0.1 - Initial release
*/

/* globals waitForKeyElements */

var KB;

var run_once = false;

function replaceKBlinks(){
	//waitForKeyElements("a[href*='id=kb_article_view']", main, true);
	console.warn("replace links");
	var qLinks = document.querySelectorAll("a[href*='id=kb_article_view']");
	console.warn(qLinks.length);

	for (var J = qLinks.length - 1; J >= 0; --J) {
		console.log(qLinks[J]);
		if (qLinks[J].hasAttribute('handled')){
			continue
		}
		var oldHref = qLinks[J].getAttribute ('href');
		var newHref;
		if (oldHref.includes("sysparm_article")){
			newHref = oldHref.replace (/(\/kb?)/, "/kb_view.do?");
		}else{
			newHref = oldHref.replace (/(\?id=kb_article_view&)/, "kb_view.do?");
			oldHref = "https://virteva.service-now.com/kb" + oldHref;
		}
		console.log (oldHref + "\n" + newHref);
		qLinks[J].setAttribute('href', newHref);
		qLinks[J].setAttribute("target", "_blank");
		qLinks[J].setAttribute('handled', true);

		var buttonNew = document.createElement("a");
		buttonNew.setAttribute("href", oldHref);
		buttonNew.setAttribute("target", "_blank");
		buttonNew.setAttribute("title", oldHref);
		buttonNew.setAttribute("handled", true);
		buttonNew.innerHTML = "\(Full View\)   ";
		qLinks[J].parentElement.insertBefore(buttonNew, qLinks[J]);
	}
}


var btn_style = "position: fixed;"+
  "width: max-content;"+
  "height: 45px;"+
  "background: #ffffff;"+
  "top: 0px;"+
  "left: 50%;"+
  "margin: auto;"+
  "color: black;"+
  "text-align: center;"+
  "font-size: 23px;"+
  "z-index: 10000;"+
  "box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.3);"+
  "cursor: pointer;"

function kbToClipboard(){
	  navigator.clipboard.writeText(KB);
}

function waitforme(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}

async function kb_view_page(){
	//console.warn("view page");
	let el = null;
	if (document.location.href.includes("kb_view.do")){
		setTimeout(() => { el = "none"; console.warn("Can't find el D:") }, 5000);
		while (el == null){
			try{
				el = document.getElementById("articleNumberReadonly");
			}catch(e){
				console.warn(e);
			}
			await waitforme(250);
		}
		let reg = /\w*(-)*\w*(KB)\w+/g;
		KB = el.innerHTML.match(reg);

	}else{
		let spans = document.getElementsByClassName("ng-binding");
		setTimeout(() => {el = "none";}, 5000);
		while (el == null){
			await waitforme(250);
			//spans = document.getElementsByClassName("ng-binding");
			if (spans.length < 2) {continue};
			for (let i in spans){
				if (spans[i].innerHTML.includes("KB") && spans[i].innerHTML.length < 20){
					//if (spans[i].hasChildNodes){continue};
					el = spans[i];
					break
				}
			}
		}
		KB = el.innerHTML;
	}
	//console.warn(KB);
	let btn = document.createElement("button");
	btn.setAttribute("style", btn_style);
	document.body.appendChild(btn)
	btn.addEventListener("click", kbToClipboard);
	let inner = document.createElement("span");
	inner.innerHTML = KB;
	btn.appendChild(inner);
	//console.log(btn);
}

async function kb_search_page(){
	//console.warn("search page");
	if (run_once){
		return;
	}
	run_once = true

	var origOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function(method, url) {
		this.addEventListener('load', function() {
			//console.log('Degugging', method, url);
			replaceKBlinks();
		});
		origOpen.apply(this, arguments);
	};
}

function main() {
	//console.warn("start main");
    'use strict';
	replaceKBlinks();
}
console.warn("Starting better KB links");
var loc = window.location.href;
if (loc.includes("kb_search")){
		kb_search_page();
}else if(loc.includes("kb_article_view")||loc.includes("kb_view.do")){
	kb_view_page();
}
waitForKeyElements("a[href*='id=kb_article_view']", main, true);
console.warn("Ending better KB links");

