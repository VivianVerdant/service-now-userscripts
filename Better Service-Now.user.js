// ==UserScript==
// @name         Better Service-Now
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/waitForKeyElements.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/better_settings_menu.js
// @resource     better_menu_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_settings_menu.css
// @resource     better_kb_search_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_search.css
// @resource     better_kb_view_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_view.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals waitForKeyElements createBetterSettingsMenu */


// .transaction_cancel

// Load custom CSS
const better_menu_css = GM_getResourceText("better_menu_css");
GM_addStyle(better_menu_css);

// Company filter variables
var companyRegex = /(?<=u_company=)\S{32}/;
var queryRegex = /()/;
var company;

var run_once = false;

function overrideAJAX(){
	var open = window.XMLHttpRequest.prototype.open,
		send = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		if (url.includes("rectangle") && !url.includes("u_company")){
			url = url.concat("&u_company=" + company);
		}
		this._url = url;
		return open.apply(this, arguments);
	}

	function sendReplacement(data) {
		let d = JSON.parse(data);
		//console.log(this);
		if (this._url.includes("rectangle")){
			let p = JSON.parse(d.payload);
			if (p.variables.u_company.length < 1){
				p.variables.u_company = company;
				d.payload = JSON.stringify(p);
				const dd = JSON.stringify(d);
				data = dd;
			}
		}else if(this._url.includes("facets")){
			let p = (d.params);
			if (p.variables.u_company.length == 0){
				p.variables.u_company = company;
			}
		}
		if(this.onreadystatechange) {
			this._onreadystatechange = this.onreadystatechange;
		}

		this.onreadystatechange = onReadyStateChangeReplacement;
		return send.apply(this, arguments);
	}

	function onReadyStateChangeReplacement() {
		if (this.readyState == 4 && this._url.includes("rectangle")){
			let r = JSON.parse(this.response);
			let q = r.result.data.results.request.query.freetext;
			let c = r.result.data.results.request.query.variables.u_company;
			if(q.length == 0){q = r.result.name;console.log(q);};
			const l = new URL(window.location);
			document.title = q;
			l.searchParams.set('u_company', c);
			window.history.pushState({},"", l);
		}
		if(this._onreadystatechange) {
			return this._onreadystatechange.apply(this, arguments);
		}
	}

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

	//this.addEventListener('load', function(e){waitForKeyElements("a[href*='id=kb_article_view']", replaceKBlinks, true)});
}

function replaceKBlinks(){

	var qLinks = document.querySelectorAll("a");

	let l = window.location.host;

	for (var J = qLinks.length - 1; J >= 0; --J) {
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
		qLinks[J].setAttribute('href', newHref);
		qLinks[J].setAttribute("target", "document-reader");
		qLinks[J].setAttribute('handled', true);

		var buttonNew = document.createElement("a");
		buttonNew.setAttribute("href", oldHref);
		buttonNew.setAttribute("target", "document-reader");
		buttonNew.setAttribute("title", oldHref);
		buttonNew.setAttribute("handled", true);
		buttonNew.innerHTML = "\(Full View\)   ";
		qLinks[J].parentElement.insertBefore(buttonNew, qLinks[J]);
	}
}

function search_main() {
	if (run_once){
		return;
	}

	run_once = true
	company = companyRegex.exec(window.location.href);
}

function view_main() {
	if (run_once){
		return;
	}

	run_once = true

	let kb_num = document.querySelector(".kb-number-info").children[0].innerHTML;
	console.log(kb_num);
	//transparent-button
	let btn = document.createElement("button");
	btn.classList.add("transparent-button", "ng-binding", "better-kb-cbcopy");
	document.querySelector(".kb-panel-heading").appendChild(btn);
	btn.addEventListener("click", function() {navigator.clipboard.writeText(this.innerHTML);});
	btn.innerHTML = kb_num;
	console.log(btn)
}

const l = new URL(window.location);
if (l.searchParams.get("id") == "kb_search"){
	// Load custom CSS
	const better_kb_search_css = GM_getResourceText("better_kb_search_css");
	GM_addStyle(better_kb_search_css);

	overrideAJAX();
	waitForKeyElements(".kb-info", search_main, true);
}
if (l.searchParams.get("id") == "kb_article_view"){
	// Load custom CSS
	const better_kb_view_css = GM_getResourceText("better_kb_view_css");
	GM_addStyle(better_kb_view_css);
	waitForKeyElements(".kb-number-info", view_main, true);
}
