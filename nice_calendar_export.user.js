// ==UserScript==
// @name         Nice Calendar Export
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.3
// @description  Auto export daily calendar in .ics format
// @author       Vivian
// @match        https://*.niceincontact.com/*
// @match        https://*.nice-incontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals find_or_observe_for_element */

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

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
