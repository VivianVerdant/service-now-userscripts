// ==UserScript==
// @name         Better KB Links
// @namespace    https://github.com/VivianVerdant/
// @version      0.4
// @description  Always open KBs in new tabs and choose between viewing minimal and full versions
// @author       Vivian
// @match        https://*.service-now.com/*
// @grant        none
// ==/UserScript==

/* Changelog
v0.4 - REALLY fixed duplicate link creation this time
v0.3 - Creates correct links inside of KBs and for permalinks
v0.2 - Fixes links generated after page load and doesn't sometimes create duplicate links
v0.1 - Initial release
*/

function replaceKBlinks(){
	var qLinks = document.querySelectorAll("a[href*='id=kb_article_view']");

	for (var J = qLinks.length - 1; J >= 0; --J) {
		if (qLinks[J].getAttribute ('class')=="handled"){
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
		//console.log (oldHref + "\n" + newHref);
		qLinks[J].setAttribute('href', newHref);
		qLinks[J].setAttribute("target", "_blank");
		qLinks[J].setAttribute('class', "handled");

		var buttonNew = document.createElement("a");
		buttonNew.setAttribute("href", oldHref);
		buttonNew.setAttribute("target", "_blank");
		buttonNew.setAttribute("title", oldHref);
		buttonNew.setAttribute("class", "handled");
		buttonNew.innerHTML = "\(Full View\)   ";
		qLinks[J].parentElement.insertBefore(buttonNew, qLinks[J]);
	}
}

function main() {
    'use strict';
	if (window.location.href.includes("sysparm_article")){
		replaceKBlinks();
		return;
	}


	var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.addEventListener('load', function() {
            //console.log('Degugging', method, url);
            replaceKBlinks();
        });
        origOpen.apply(this, arguments);
    };
}
main();
