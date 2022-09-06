// ==UserScript==
// @name         Finesse Widgetify
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make Finesse work with smaller window sizes
// @author       Vivian
// @match        https://*.crossfuze.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

/* Update Notes
 v0.1 - Initial version, likely last, will probably have to set some variables manually yourself based on your usage. 
*/


function addGlobalStyle(css) {
	var head, style;
	head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}
addGlobalStyle('.header-left-div {display: none !important;}');
addGlobalStyle('.ReactVirtualized__Table__Grid {height: fit-content;}');

function waitforme(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}

async function main(){
	var el1 = null;
    setTimeout(() => { el1 = "none"; console.warn("Can't find el1 D:") }, 3000);
    while (el1 == null){
        el1 = document.getElementById("agent-voice-state");
        //console.warn("el1? ", el1);
        await waitforme(250);
    }
	el1.setAttribute("style", el1.getAttribute("style").concat(";float: right; display: flex !important;"));

	var el2 = null;
    setTimeout(() => { el2 = "none"; console.warn("Can't find el2 D:") }, 3000);
    while (el2 == null){
        el2 = document.getElementById("nonvoice-state-menu");
        //console.warn("el2? ", el2);
        await waitforme(250);
    }
	el2.setAttribute("style", el2.getAttribute("style").concat(";display: none;"));

	var el3 = null;
    setTimeout(() => { el3 = "none"; console.warn("Can't find el3 D:") }, 3000);
    while (el3 == null){
        el3 = document.getElementsByTagName('body')[0];
        //console.warn("el3? ", el3);
        await waitforme(250);
    };
	el3.setAttribute("style", "min-width: 0px;")

	var el4 = null;
    setTimeout(() => { el4 = "none"; console.warn("Can't find el4 D:") }, 3000);
    while (el4 == null){
        el4 = document.getElementsByTagName('body')[0];
        //console.warn("el4? ", el4);
        await waitforme(250);
    };
	el4.setAttribute("style", "min-width: 1000px; overflow-x: scroll;")

	var el5 = null;
    setTimeout(() => { el5 = "none"; console.warn("Can't find el5 D:") }, 3000);
    while (el5 == null){
        el5 = document.getElementsByTagName('header')[0];
        //console.warn("el5? ", el5);
        await waitforme(250);
    };
	el5.setAttribute("style", "width: 98vw;")

	setTimeout(() => { setTableStles();}, 4000);
}

function setTableStles(){
	var tableStyle = "box-sizing: border-box; direction: ltr;height: fit-content;position: relative;width: 3000px;will-change: transform;overflow: visible;";
	var tables = document.getElementsByClassName("ReactVirtualized__Table__Grid");
	console.warn("doing tables: ", tables);
	for (let i in tables){
		try{
			console.warn("tables: ", tables[i]);
			tables[i].setAttribute("style", tableStyle);
		}catch(e){
			console.warn(e);
		}
	}
	var headers = document.getElementsByClassName("GridStyle-headerLabel-2tV80");
	console.warn("doing headers: ", headers);
	for (let i in headers){
		console.warn("headers: ", headers[i]);
		headers[i].setAttribute("style", "display: none;");
	}
	var header = document.getElementsByClassName("header-left-div")[0];
	header.setAttribute("style", "display: none;");
	var allDivs = document.getElementsByTagName("span");
	var headDiv;
	console.warn("finding headdiv");
	for(let i in allDivs){
		if (allDivs[i].innerHTML == "Cisco Finesse"){
			headDiv = allDivs[i].parentNode;
			console.warn("found headdiv: ", headDiv);
			break
		}
	}
	headDiv.setAttribute("style", "display: none");

}

main();
