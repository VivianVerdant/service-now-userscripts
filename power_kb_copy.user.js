// ==UserScript==
// @name         Power KB Copy
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy images as raw data
// @author       You
// @match        https://*.service-now.com/kb_knowledge.do*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_addStyle
// ==/UserScript==

/* globals find_or_observe_for_element */

    'use strict';

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

function powerCopy(e) {
	e.preventDefault();

    const doc = document.querySelector('iframe').contentDocument.documentElement;
	console.log(doc)

    const tempBody = doc.cloneNode(true);
    document.body.appendChild(tempBody);
	console.log(tempBody);

    const process = new Promise((resolve, reject) => {
		const images = tempBody.querySelectorAll("img");
		for (let img of images) {
			toDataURL(img.src, function (dataUrl) {img.src = dataUrl;});
		}
		console.log(tempBody.querySelectorAll("img"))
		setTimeout(() => {
			resolve();
		}, 1000);
	});

    process.then(() => {console.log(tempBody);copyToClip(tempBody.innerHTML);});
    //tempBody.remove();
}

find_or_observe_for_element(".mce-container-body.mce-flow-layout", (node) => {
	const btn_group = node.addNode("div", "power_copy_btn", ["mce-container", "mce-flow-layout-item", "mce-btn-group"]);
	const sub_divA = btn_group.addNode("div", "", []);
	const sub_divB = sub_divA.addNode("div", "", ["mce-widget", "mce-btn", "mce-first", "mce-last"]);
	const pkbc_btn = sub_divB.addNode("button", "", []);
	const pkbc_spn = pkbc_btn.addNode("span", "power_copy_btn", ["mce-txt"]);
	pkbc_spn.innerHTML = "Power Copy";
	pkbc_btn.onclick = powerCopy;
}, undefined, false);
