// ==UserScript==
// @name         Better KB Links
// @namespace    https://github.com/VivianVerdant/
// @version      0.2
// @description  Always open KBs in new tabs and choose between viewing minimal and full versions
// @author       Vivian
// @match        https://*.service-now.com/*
// @grant        none
// ==/UserScript==

function replaceKBlinks(){
	var qLinks = document.querySelectorAll("a[href*='id=kb_article_view']");

	for (var J = qLinks.length - 1; J >= 0; --J) {
		if (qLinks[J].getAttribute ('class')=="handled"){
			continue
		}
		var oldHref = qLinks[J].getAttribute ('href');
		var newHref = oldHref.replace (/(\?id=kb_article_view&)/, "kb_view.do?");
		//console.log (oldHref + "\n" + newHref);
		qLinks[J].setAttribute ('href', newHref);
		qLinks[J].setAttribute("target", "_blank");

		oldHref = "https://virteva.service-now.com/kb" + oldHref;
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
