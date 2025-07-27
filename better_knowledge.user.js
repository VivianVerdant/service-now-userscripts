// ==UserScript==
// @name         Better Knowledge
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.0.2
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/kb*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/better_settings_menu.js
// @resource     better_menu_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_settings_menu.css
// @resource     better_kb_search_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_search.css
// @resource     better_kb_view_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_view.css
// @resource     better_kb_edit_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_edit.css
// @resource     better_kb_fix_formatting_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_kb_fix_formatting.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals createBetterSettingsMenu empty_search getColorFromSeed find_or_observe_for_element */


// .transaction_cancel

// Load custom CSS
const better_menu_css = GM_getResourceText("better_menu_css");
//GM_addStyle(better_menu_css);

// Company filter variables
var companyRegex = /(?<=u_company=)\S{32}/;
var queryRegex = /()/;
var companyList = [];
var company = null;
var company_name;

var kb_num;

var XTransactionSource;
var XUserToken;

var run_once = false;

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

function save_note(company_name) {
	const saved_notes = GM_getValue("saved_notes", new Object());
	const notes_text = document.querySelector("#custom_notes_text").value;
	const notes_div = document.querySelector("#custom_notes_div");

	//console.log(notes_text);
	notes_div.innerHTML = notes_text;

	saved_notes[company_name] = notes_text;
	GM_setValue("saved_notes", saved_notes);
}

function load_note(company_name) {
	const saved_notes = GM_getValue("saved_notes", new Object());
    console.log(saved_notes);
	let notes_text;
	if (Object.keys(saved_notes).includes(company_name)){
		notes_text = saved_notes[company_name];
	} else {
		notes_text = "Personal " + company_name + " notes:";
		saved_notes[company_name] = notes_text;
		GM_setValue("saved_notes", saved_notes);
	}
	document.querySelector("#custom_notes_text").value = notes_text;
	document.querySelector("#custom_notes_div").innerHTML = notes_text;
}

// div[sn-atf-area='Company'] > div > div > div > div > div > div > div > div > div > div > span > a

function create_notes(node) {
	company_name = "generic";

	find_or_observe_for_element("div[sn-atf-area='Company'] > div > div > div > div > div > div > div > div > div > div > span > a.active", (node) => {
		console.log("notes node", node);
	}, undefined, false);

	let saved_notes = GM_getValue("saved_notes", new Object());
	console.log("company name: ", company_name);
	let note;
	//console.log(Object.keys(saved_notes));
	if (Object.keys(saved_notes).includes(company_name)){
		note = saved_notes[company_name];
	} else {
		note = "Personal " + company_name + " notes:";
		saved_notes[company_name] = note;
		GM_setValue("saved_notes", saved_notes);
	}

	const notes = node.addNode("div", "custom_notes", ["personalNotes", "notification"]);

	const notes_text = notes.addNode("textarea", "custom_notes_text", ["personalNotesText", "form-control", "hidden"]);
	notes_text.value = note;

	const notes_div = notes.addNode("div", "custom_notes_div");
	notes_div.innerHTML = note;

	const lock_button = notes.addNode("button", "toggle_notes_lock", ["btn", "btn-default", "btn-ref"]);
	lock_button.addNode("span", "", ["icon", "icon-locked"]);
	lock_button.onclick = (e) => {
		e.preventDefault();

		const text_node = document.querySelector("#custom_notes_text");
		text_node.classList.toggle("hidden");

		const div_node = document.querySelector("#custom_notes_div");
		div_node.classList.toggle("hidden");

		const btn = document.querySelector("#toggle_notes_lock").firstChild;
		btn.classList.toggle("icon-locked");
		btn.classList.toggle("icon-unlocked");
		save_note(company_name);
	};

	//icon icon-locked
}

function overrideAJAX(){
	var open = window.XMLHttpRequest.prototype.open,
		load = window.XMLHttpRequest.prototype.load,
		send = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		if (url.includes("rectangle") && company !== null){
			url = url.concat("&u_company=" + company);
		}
		this._url = url;
		//console.log(this, arguments);
		return open.apply(this, arguments);
	}

	function sendReplacement(data) {
		let d = JSON.parse(data);
		//console.log(this);

		if (this._url.includes("rectangle") && company !== null){
			company = companyRegex.exec(window.location.href);
			let p = JSON.parse(d.payload);
			//p.start = 0;
			//p.end = 50;
			//console.log(p);
			if (p.variables.u_company.length < 1){
				p.variables.u_company = company;
				d.payload = JSON.stringify(p);
				const dd = JSON.stringify(d);
				data = dd;
			}
		}

		if(this.onreadystatechange) {
			this._onreadystatechange = this.onreadystatechange;
		}
		this.onreadystatechange = onReadyStateChangeReplacement;

		function loadEvent(data) {
			let r = JSON.parse(data.currentTarget.response) || false;
			r = r.result || false;
			r = r.u_company || false;
			if (r){
				//console.log(r);
				companyList.length > 1 ? companyList : companyList = r;
				postCompanyList();
			}
		}
		//this.addEventListener('load', loadEvent);

		return send.apply(this, arguments);

	}

	function onReadyStateChangeReplacement() {
		if (this.readyState == 4 && this._url.includes("rectangle" ) && company !== null){
			let r = JSON.parse(this.response);
			let q = r.result.data.results.request.query.freetext;
			let c = r.result.data.results.request.query.variables.u_company;
			if(q.length == 0){q = r.result.name;/*console.log(q);*/};
			const l = new URL(window.location);
			document.title = q;
			l.searchParams.set('u_company', c);
			window.history.replaceState({},"", l);
			company = companyRegex.exec(window.location.href);
		}
		if(this._onreadystatechange) {
			return this._onreadystatechange.apply(this, arguments);
		}
	}

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

}

function postCompanyList() {

	function onSelect(el) {
		console.log(el);
		el.querySelector("input").checked = true;
	}

	function addItem(p, i) {
		console.log(i.label);
		const row = document.createElement("li");
		const btn = document.createElement("input");
		const lab = document.createElement("label");
		row.classList.add("facet-field-padding");
		row.onclick = (e) => {onSelect(e.path.find(element => element.tagName == "LI"));};
		row.setAttribute("style", "cursor: pointer;");
		btn.setAttribute("name", "u_company");
		btn.setAttribute("type", "radio");
		btn.setAttribute("id", i.id);
		btn.setAttribute("style", "display: none;");
		row.appendChild(btn);
		row.appendChild(lab);
		lab.innerHTML = i.label;
		lab.setAttribute("style", "cursor: pointer;");
		p.appendChild(row);
	}

	const parent = document.querySelector("html > body > div > section > main > div > div > sp-page-row:nth-child(2) > div");
	const col = document.createElement("ul");
	col.setAttribute("style", "grid-area: filter; list-style-type: none; padding-inline-start: 1px;");
	parent.appendChild(col);

	addItem(col, {label: "None", id: ""});
	for (const item of companyList) {
		addItem(col, item);
	}
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

async function search_main() {
	if (run_once){
		return;
	}

	run_once = true

	find_or_observe_for_element("#kb_search_input", (node) => {
		node.setAttribute("tabindex", 1);
	}, ".search-bar", true);
	find_or_observe_for_element("[aria-label='Filter Company']", (node) => {
		node.setAttribute("tabindex", 2);
	}, undefined, true);
	find_or_observe_for_element(".sidefacets-no-padding", (node) => {
		node.addEventListener('click', (e) => {
			company = companyRegex.exec(window.location.href)
		});
	}, undefined, true);

	find_or_observe_for_element("html > body > div > section > main > div > div > sp-page-row:nth-child(2) > div", (node) => {
		const frame = document.createElement("iframe");
		frame.setAttribute("name", "kbframe");
		frame.classList.add("kbframe");
		node.appendChild(frame);
	}, undefined, true);

	find_or_observe_for_element(".facet-detail.facet-scroll > div > div > span", (node) => {
		node.addEventListener('click', (e) => {
            console.log('company:-------------------------------------------');
            console.log(node);
			//const target = document.querySelector(".knowledge-articles");
			//target.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
            if (node.innerText != company_name) {
                console.log(node.innerText);
                save_note(company_name);
                company_name = node.innerText;
                load_note(company_name);
            }
		});
	}, undefined, false);

/*
	find_or_observe_for_element(".kb-info > div > h3", (node) => {
		node.addEventListener('click', (e) => {
			e.preventDefault();
			const url = e.target.href;
			const frame = document.querySelector(".kbframe");
			frame.setAttribute("src", url);
			frame.scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
			//console.log(url);
		});
	}, undefined, false);
*/

	find_or_observe_for_element(".kb-info > div > h3 > a", (node) => {
        node.setAttribute("target", "_blank");
	}, undefined, false);

    /*
    find_or_observe_for_element(".kb-facet-filter-block", (node) => {
		node.addEventListener('click', (e) => {
            e.preventDefault();

		});
    }, undefined, true);
    */

	find_or_observe_for_element(".sp-scroll", (node) => {
		console.log("scroller: ", node);
		node.addEventListener("scroll", (e) => {
			//console.log(e.target.scrollLeft);
			document.documentElement.style.setProperty('--search-offset', e.target.scrollLeft + "px");
		});
	}, undefined, true);

	find_or_observe_for_element(".search-bar > .pad-bottom", (node) => {
		console.log('insert notes after:-------------------------------------------');
		console.log(node);
		//create_notes(node);
        /*
		node.addEventListener("", async (e) => {
		});*/
	}, undefined, true);

	//company = companyRegex.exec(window.location.href);
}

async function view_main() {
	if (run_once){
		return;
	}

	run_once = true

	find_or_observe_for_element("span.panel-title > div", (node) => {
		kb_num = document.querySelector(".kb-number-info").children[0].innerHTML;
		console.log(kb_num);
		let btn = document.createElement("button");
		btn.classList.add("transparent-button", "ng-binding", "better-kb-cbcopy");
		btn.innerHTML = kb_num;
		btn.addEventListener("click", function() {navigator.clipboard.writeText(this.innerHTML);});
		node.appendChild(btn);
	}, undefined, true);

	find_or_observe_for_element(".kb-article-content", async (node) => {
		const txtnodes = document.querySelectorAll("tr");
		for (const node of txtnodes) {
			if (node.innerHTML) {
				node.innerHTML = node.innerHTML.replaceAll("&nbsp;", " ");
			}
		}
	}, undefined, true);

	find_or_observe_for_element(".kb-permalink", async (node) => {
        console.log(node);
        if (node.parentNode != document.querySelector(".kb-end-buttons")) {
            document.querySelector(".kb-end-buttons").appendChild(node);
            let btn = node.querySelector("button");
            btn.classList.add("btn", "btn-default");
            btn.classList.remove("transparent-button");
        }
	}, undefined, true);

	find_or_observe_for_element(".kb-panel-title-header", (node) => {
		//console.log(node);
		const dl_btn = document.createElement("button");
		//console.log(dl_btn);
		dl_btn.innerHTML = "save doc";
        dl_btn.classList.add("save_doc_btn");
		dl_btn.onclick = (e) => {ExportToDoc(".kb-wrapper.panel-body.kb-desktop", kb_num);};
		node.appendChild(dl_btn);
	}, undefined, true);

	function move_into_doc(node) {
		const doc = document.querySelector(".ng-scope.panel.panel-default.kb-desktop > div:nth-child(2)");
		doc.appendChild(node);
	}

	find_or_observe_for_element("sp-page-row > div > div.kb-container-column.kb_container-left.col-md-9 > span:nth-child(2)", (node) => {
		move_into_doc(node);
	}, undefined, true);

	find_or_observe_for_element("sp-page-row > div > div.kb-container-column.kb_container-right.col-md-3", (node) => {
		move_into_doc(node);
	}, undefined, true);
}

function toDataURL(url, callback) {
  let xhRequest = new XMLHttpRequest();
  xhRequest.onload = function () {
    let reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    }
    reader.readAsDataURL(xhRequest.response);
  };
  xhRequest.open('GET', url);
  xhRequest.responseType = 'blob';
  xhRequest.send();
}

function ExportToDoc(filename = ''){

	const images = document.querySelectorAll("img");
	for (let img of images) {
		toDataURL(img.src, function (dataUrl) {img.src = dataUrl});
	}

    var HtmlHead = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";

    var EndHtml = "</body></html>";

    //complete html
    var html = HtmlHead + document.querySelector(".kb-article-wrapper").innerHTML + EndHtml;

    //specify the type
    var blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    // Specify link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    // Specify file name
    filename = filename?filename+'.doc':'document.doc';

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    if(navigator.msSaveOrOpenBlob ){
        navigator.msSaveOrOpenBlob(blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = url;

        // Setting the file name
        downloadLink.download = filename;

        //triggering the function
		downloadLink.click();
	}
	document.body.removeChild(downloadLink);
}

function Export2Doc(element, filename = '') {

	element = document.querySelector(element);

	const images64 = document.querySelectorAll("img");
	for (let img of images64) {
		toDataURL(img.src, function (dataUrl) {img.src = dataUrl});
	}

	//  _html_ will be replace with custom html
	var meta= "Mime-Version: 1.0\nContent-Base: " + location.href + "\nContent-Type: Multipart/related; boundary=\"NEXT.ITEM-BOUNDARY\";type=\"text/html\"\n\n--NEXT.ITEM-BOUNDARY\nContent-Type: text/html; charset=\"utf-8\"\nContent-Location: " + location.href + "\n\n<!DOCTYPE html>\n<html>\n_html_</html>";
	//  _styles_ will be replaced with custome css
	var head= "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">\n<style>\n_styles_\n</style>\n</head>\n";

	var html = element.innerHTML ;

	var blob = new Blob(['\ufeff', html], {
		type: 'application/msword'
	});

	var css = (
		   '<style>' +
		   'img {width:300px;}table {border-collapse: collapse; border-spacing: 0;}td{padding: 6px;}' +
		   '</style>'
		  );
//  Image Area %%%%
	var options = { maxWidth: 624};
	var images = Array();
	var img = element.querySelectorAll("img");
	for (let i = 0; i < img.length; i++) {
		// Calculate dimensions of output image
		var w = Math.min(img[i].width, options.maxWidth);
		var h = img[i].height * (w / img[i].width);
		// Create canvas for converting image to data URL
		var canvas = document.createElement("CANVAS");
		canvas.width = w;
		canvas.height = h;
		// Draw image to canvas
		var context = canvas.getContext('2d');
		context.drawImage(img[i], 0, 0, w, h);
		// Get data URL encoding of image
		var uri = canvas.toDataURL("image/png");
		img[i].setAttribute("src", img[i].src);
		img[i].width = w;
		img[i].height = h;
		// Save encoded image to array
		images[i] = {
			type: uri.substring(uri.indexOf(":") + 1, uri.indexOf(";")),
			encoding: uri.substring(uri.indexOf(";") + 1, uri.indexOf(",")),
			location: img[i].getAttribute("src"),
			data: uri.substring(uri.indexOf(",") + 1)
		};
	}

	// Prepare bottom of mhtml file with image data
	var imgMetaData = "\n";
	for (let i = 0; i < images.length; i++) {
		imgMetaData += "--NEXT.ITEM-BOUNDARY\n";
		imgMetaData += "Content-Location: " + images[i].location + "\n";
		imgMetaData += "Content-Type: " + images[i].type + "\n";
		imgMetaData += "Content-Transfer-Encoding: " + images[i].encoding + "\n\n";
		imgMetaData += images[i].data + "\n\n";

	}
	imgMetaData += "--NEXT.ITEM-BOUNDARY--";
// end Image Area %%

	var output = meta.replace("_html_", head.replace("_styles_", css) + html) + imgMetaData;

	var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(output);


	filename = filename ? filename + '.doc' : 'document.doc';


	var downloadLink = document.createElement("a");

	document.body.appendChild(downloadLink);

	if (navigator.msSaveOrOpenBlob) {
		navigator.msSaveOrOpenBlob(blob, filename);
	} else {

		downloadLink.href = url;
		downloadLink.download = filename;
		downloadLink.click();
	}

	document.body.removeChild(downloadLink);

}

async function edit_main() {
    console.warn("edit main");
    /*
	find_or_observe_for_element("button.tox-tbtn--disabled", async (node) => {
        console.warn(node, node["aria-disabled"]);
        node["aria-disabled"] = "false";
	}, undefined, false);*/

    document.addEventListener("pointerover", (e) => {
        if (e.target.classList.contains("tox-tbtn--disabled")) {
            //console.warn(e.target);
            e.target.classList.remove("tox-tbtn--disabled");
            e.target.ariaDisabled = "false";
        }
    });

}

// <span class="show-more" ng-show="c.showRange == c.options.min_scroll_count" ng-click="c.showRange = c.items.length" role="button" aria-hidden="false">Show More</span>

const l = new URL(window.location);

if (l.searchParams.get("u_company")){
	company = companyRegex.exec(window.location.href);
	console.warn(company);
}
async function main() {
	if (l.searchParams.get("id") == "kb_search"){
		// Load custom CSS
		GM_addStyle(GM_getResourceText("better_kb_search_css"));
		overrideAJAX();
		search_main();
	} else if (l.searchParams.get("id") == "kb_article_view" || l.searchParams.has("sysparm_article")){
		// Load custom CSS
		GM_addStyle(GM_getResourceText("better_kb_view_css"));
        GM_addStyle(GM_getResourceText("better_kb_fix_formatting_css"));
		view_main();
	}else if (l.pathname === "/kb_knowledge.do"){
		// Load custom CSS
		//GM_addStyle(GM_getResourceText("better_kb_edit_css"));
        edit_main();
	}
}
main();
