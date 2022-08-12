// ==UserScript==
// @name         KB - Keep company filter
// @namespace    https://github.com/VivianVerdant/kb-keep-company-filter/
// @homepageURL  https://github.com/VivianVerdant/kb-keep-company-filter/
// @supportURL   https://github.com/VivianVerdant/kb-keep-company-filter/
// @version      0.4
// @description  Keep that pesky search filter from wandering off
// @author       Vivian
// @match        https://*.service-now.com/kb*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

var currentLocation = window.location.href;
var companyRegex = /(u_company=)\w*/;

function toggle(){
    var sw = document.getElementById("ScriptToggle");
    console.log("toggle ", sw.checked);
    GM_setValue("enabled", sw.checked);
}

async function ui() {
    function addGlobalStyle(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
    addGlobalStyle('.switch {position: relative;display: inline-block;width: 60px;height: 34px;}');
    addGlobalStyle('.switch input {opacity: 0; width: 0; height: 0;}');
    addGlobalStyle('.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; -webkit-transition: .4s; transition: .4s;  max-width: 60px; max-height: 34px; min-width: 60px; min-height: 34px;}');
    addGlobalStyle('.slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; -webkit-transition: .4s; transition: .4s;}');
    addGlobalStyle('input:checked + .slider { background-color: #2196F3; max-width: 60px; max-height: 34px;}');
    addGlobalStyle('input:focus + .slider { box-shadow: 0 0 1px #2196F3;}');
    addGlobalStyle('input:checked + .slider:before {  -webkit-transform: translateX(26px);  -ms-transform: translateX(26px);  transform: translateX(26px);}');
    addGlobalStyle('.slider.round {  border-radius: 34px;}');
    addGlobalStyle('.slider.round:before {  border-radius: 50%;}');

    console.log("create ui");
    var parent = null;
    setTimeout(() => { parent = "none"; console.log("Can't find parent D:") }, 3000);
    while(parent == null){
        parent = document.getElementsByClassName("hidden-xs hidden-sm filter-class")[0];
        console.log("Parent? ", parent);
        await waitforme(250);
    }
    var sw = document.createElement("label");
    sw.innerHTML = '<label class="switch" style="position: relative; left: 4px; top: 18px;"><input id="ScriptToggle" type="checkbox" checked><span class="slider round"><div style="position: relative; left: 68px; top: 0px; font-size: 10px;">Keep Company</div></span></label>';
    parent.appendChild(sw);
    var tog = document.getElementById("ScriptToggle");
    try {
        tog.checked = GM_getValue("enabled");
    }catch(e){
        console.log(tog);
        tog.checked = true;
        console.log("Loading default value of enabled");
    }
    sw.addEventListener("click", toggle);
}

function addLocationChangeListener() {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        let ret = oldPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    let oldReplaceState = history.replaceState;
    history.replaceState = function replaceState() {
        let ret = oldReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
}

function reapplyFilter(){
    console.log("current location: ", currentLocation);
    var company = companyRegex.exec(currentLocation.concat("&"));
    console.log("current company: ",company);
    if (company==null || companyRegex.test(window.location.href) ){
        console.log("no company currently or new url already has company");
        return
    }
    if (window.location.href != currentLocation){
        var url = window.location.href.concat("&").concat(company);

        console.log("new location: ", window.location.href);
        console.log("new appended location: ", url);
        window.location.assign( url );
    }
}

function waitforme(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}

async function earlyClick(){
    if (!GM_getValue("enabled")){
        return
    }
    var button = null;
    setTimeout(() => { button = "none"; console.log("Can't find button D:") }, 3000);
    while (button == null){
        button = document.getElementById("showFilterBtn");
        console.log("button? ", button)
        await waitforme(250);
    }
    button.click();
}

function main() {
    addLocationChangeListener();
    window.addEventListener('locationchange', function () {console.log('location changed!');reapplyFilter()});
    earlyClick();
    ui();
}

main();
