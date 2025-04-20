// ==UserScript==
// @name         Better Nice
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://*.niceincontact.com/*
// @match        https://*.nice-incontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_nice_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_nice.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* globals find_or_observe_for_element */

// window.inContactAppBase.api.ModuleManager.instances["uimanager-0"]
// window.inContactAppBase.api.ModuleManager.instances["resizemanager-0"]

const alert_time_wrapup = 500;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//await sleep(16000);

async function state_wrapup(time) {
	const header = document.querySelector(".state-bar");
	if (Number(time.replace(":","")) >= alert_time_wrapup) {
		header.classList.add("blinkey");
	} else {
		header.classList.remove("blinkey");
	}
}

async function main() {
    'use strict';


    // Load custom CSS
    const better_nice_css = GM_getResourceText("better_nice_css");
    GM_addStyle(better_nice_css);

    let app = null;
    let i = 0;
    while (i < 10 && app == null){
        app = document.defaultView.inContactAppBase;
        await sleep(1000);
        console.warn(app);
        i++;
    }

    //let resizeManager = app.api.ModuleManager.instances["resizemanager-0"];
    //resizeManager.destroy();

	const observer = new MutationObserver((mutations_list) => {
		const time = mutations_list[0].addedNodes[0].nodeValue;
		const state = document.querySelector(".agentstateui.agent-state-ui").getAttribute("data-outstate");
		console.warn(state, " - ", time);
		switch(state) {
			case "Lunch":
			break;
			case "Wrap-up Research":
				state_wrapup(time);
			break;
		}
	});
	console.warn(observer);
	//observer.observe(document.querySelector("#agentstateui-0_container"), {subtree: true, characterData: true, childList: true, attributes: true});
	console.warn("end");
}

async function keepAlive() {
	window.setTimeout( function() {
		window.location.reload();
	}, 1800000);
}

const convertTime12to24 = (time12h) => {
	const [time, modifier] = time12h.split(' ');

	let [hours, minutes] = time.split(':');

	if (hours === '12') {
		hours = '00';
	}

	if (modifier === 'PM') {
		hours = parseInt(hours, 10) + 12;
	}

	return `${hours}:${minutes}`;
}

find_or_observe_for_element("#agentstateui-0_container", (node) => {
	console.log(node);
	main();
});

//document.querySelector("#wfoworkspaceui-0 > div > div").click()
find_or_observe_for_element("#wfoworkspaceui-0 > div > div", (node) => {
	node.click()
}, undefined, true);

find_or_observe_for_element(".app-picker-panel", (node) => {
	document.querySelector("[iconname='icon-sidebar_toggle']").click()
	keepAlive();
}, undefined, true);

find_or_observe_for_element("[iconname='icon-sidebar_toggle']", (node) => {
	node.click();
}, undefined, true);


find_or_observe_for_element("#consoleView", (node) => {
	window.setTimeout( function() {
		document.querySelector("#consoleView").click();
	}, 1000);
}, undefined, true);

// .user-day-schedule-events

function to24hr(time) {
	console.log("before time: ", time);
	if (time.substring(time.length - 2) == "AM") {
		time = Number.parseInt(time.split(":").join(""));
	} else {
		time = Number.parseInt(time.split(":").join(""));
		if (time < 1200) {
			time += 1200;
		}
	}
	time = time.toString();
	time = time.padStart(4,"0");
	time = time.padEnd(6,"0");
	console.log("after time: ", time);
	return time
}

function saveTextAsFile(textToWrite, fileNameToSaveAs, fileType) {
    let textFileAsBlob = new Blob([textToWrite], { type: fileType });
    let downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';

    if (window.webkitURL != null) {
        downloadLink.href = window.webkitURL.createObjectURL(
            textFileAsBlob
        );
    } else {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

find_or_observe_for_element(".user-day-schedule-events", (node) => {
	sleep(1000);
	console.log("Calendar loaded: ", node);
	let events = node.querySelectorAll(".user-day-schedule-event-activity");
	const d = new Date();
	const date = d.toISOString().split("-").join("").substring(0, 8);
	let calendar = []
	for (const event of events) {
		const eventdata = {
			"date": date,
			"start": to24hr(event.getAttribute("start")),
			"end": to24hr(event.getAttribute("end")),
			"name": event.innerText.split(" - ")[1]
		}
		console.log(eventdata);
		calendar.push(eventdata);
	}
	//console.log(calendar);
	let ical_string = `
BEGIN:VCALENDAR
PRODID:-//Microsoft Corporation//Outlook 16.0 MIMEDIR//EN
VERSION:2.0
METHOD:PUBLISH

BEGIN:VTIMEZONE
TZID:CST
BEGIN:STANDARD
DTSTART:16011104T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
TZOFFSETFROM:-0500
TZOFFSETTO:-0600
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:16010311T020000
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
TZOFFSETFROM:-0600
TZOFFSETTO:-0500
END:DAYLIGHT
END:VTIMEZONE
	`;
	for (const event of calendar) {
	ical_string += `
BEGIN:VEVENT
DTEND;TZID=CST:${event.date}T${event.end}
DTSTAMP;TZID=CST:${event.date}T000000
DTSTART;TZID=CST:${event.date}T${event.start}
SEQUENCE:0
SUMMARY;LANGUAGE=en-us:${event.name}
TRANSP:OPAQUE
UID:ZVVNWzAX4kOPhONYFAAnYg==
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
	`;
	}
ical_string += `
END:VCALENDAR`;

	console.log(ical_string);
	saveTextAsFile(ical_string, "daily_schedule.ics", "text/plain");
}, undefined, true);
