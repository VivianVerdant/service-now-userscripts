// ==UserScript==
// @name         Max Timer Alerts
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.7
// @description  Set blinking backround and audio alert for timer over/under certain values
// @author       Vivian
// @match        https://max.niceincontact.com/*
// @match        https://max.nice-incontact.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_max_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_max.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==
/* globals find_or_observe_for_element */

/*
    Changelog
	v0.7 - merged alternate UI from Nice script, added setting for audio alert volume
    v0.6 - Fixed bugs with previous new code
    v0.5 - added visual and audio notifications for when an inbox item (support chat) comes in
    v0.4 - set up enums instead of consts for state times, added state based audio alert option
    v0.3 - cleaned up code
    v0.2 - bugfixes
    v0.1 - Initial release
*/


// ------------------------------------------- set your desired values here ----------------------------------

// User alternate layout (true/false)
const use_alternate_layout = true;

// Notification volume (decimal value 0.0-1.0)
const notification_volume = 0.1;

// Will flash the agent state UI element when the timer is above the set value
// format your desired time to be HHMMSS
const state_times = {
	"Assisting Analyst": 999999,
	"Board Mgmt": 999999,
	"Break": 940,
	"Lunch": 5940,
	"Meeting": 999999,
	"Outbound": 59,
	"Priority 1": 200,
	"Project": 999999,
	"Remote Assistance": 999999,
	"Training": 999999,
	"Unscheduled": 30,
	"Wrap-up Research": 200,
	"WORKING": 999999,
	"After Call Work": 10 // <-- "After Call Work" timer counts down instead of up
}

// do you want an audio alert to sound when the timer exceeds the value set above?
const state_audio_alert = {
	"Assisting Analyst": false,
	"Board Mgmt": false,
	"Break": true,
	"Lunch": true,
	"Meeting": false,
	"Outbound": true,
	"Priority 1": false,
	"Project": false,
	"Remote Assistance": false,
	"Training": false,
	"Unscheduled": true,
	"Wrap-up Research": true,
	"WORKING": false,
	"After Call Work": false
}

// set audio alerts to sound at arbitrary times
// format your desired times to be HHMMSS
const time_alarms = [ "993000", "993300"];

// list of available, built-in audio alerts
const audio_alerts = {
	none: null,
	contact: '/styles/audio/new-contact.wav',
	ring1: '/styles/audio/ring1.wav',
	ring2: '/styles/audio/ring2.wav',
	ring3: '/styles/audio/ring3.wav'
}

const selected_audio_alert = audio_alerts.contact; // chose which audio alert you want, or none


// ------------------------------------------- You do not need to edit anything past here ----------------------

// Script variables
var timer; // current timer as HHMMSS
var agent_state; // available, unavialable, or working
var agent_out_state; // reason for being unavailable, if not available
var last_timer_state; // previous tick's agent out state

var current_time; // current time as HHMMSS

var inbox_count = 0;
var inbox_node;

// Element references
var state_element; // main HTML div element for the state

// Module references
var utilities; // reference to loaded utilities module

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function audio_alert() {
	utilities.playAudioNotification(selected_audio_alert);
}

async function blink_timer(state) {
	// If state hasn't changed, do nothing
	if (state === last_timer_state) {
		return
	}

	// if new state is true, add the blinkey class to the state element and play a notification sound, else clear blinkey class
	if (state) {
		state_element.classList.add("blinkey");
		if (state_audio_alert[agent_out_state]) {
			utilities.playAudioNotification(selected_audio_alert);
		}
	} else {
		state_element.classList.remove("blinkey");
	}

	// update last tick's state
	last_timer_state = state;
}

async function on_timer_update() {
	if (agent_state === "Available") {
		blink_timer(false);
		return
	}

	if (agent_state === "WORKING") {
		if (timer <= state_times[agent_out_state]) {
			blink_timer(true);
		} else {
			blink_timer(false);
		}
		return
	}

	if (agent_out_state === "After Call Work") {
		blink_timer(timer <= state_times[agent_out_state]);
	} else {
		blink_timer(timer >= state_times[agent_out_state]);
	}

	for (const t of time_alarms) {
		//console.log("t: ", t);
		if (current_time == t) {
			//console.log("Current time: ", current_time);
			audio_alert();
		}
	}
}

async function update_inbox(num) {
	if (num > inbox_count) {
		utilities.playAudioNotification(selected_audio_alert);
	}
	inbox_count = num;
	document.querySelector(".digital-workspace-container").classList.add("inbox-alert");
}

async function main() {
	'use strict';

	// Load custom CSS
	GM_addStyle(GM_getResourceText("better_max_css"));

	if (use_alternate_layout) {
		document.querySelector("body").classList.add("alternate-layout");

		// Click some stuff to close/hide it automatically
		find_or_observe_for_element("#wfoworkspaceui-0 > div > div", (node) => {
			node.click()
		}, undefined, true);

		find_or_observe_for_element("[iconname='icon-sidebar_toggle']", (node) => {
			node.click();
		}, undefined, true);

		find_or_observe_for_element("#consoleView", (node) => {
			window.setTimeout( function() {
				document.querySelector("#consoleView").click();
			}, 1000);
		}, undefined, true);
	}

	// Get incontact app base
	let app = undefined;
	let i = 0;
	while (i < 10 && app === undefined){
		app = document.defaultView.inContactAppBase;
		await sleep(1000);
		console.warn(app);
		i++;
	}

	// Get module manager
	let moduleManager = undefined;
	i = 0;
	while (i < 10 && moduleManager === undefined){
		moduleManager = app.api.ModuleManager;
		await sleep(1000);
		console.warn(moduleManager);
		i++;
	}

	// get utilities module
	utilities = undefined;
	i = 0;
	while (i < 10 && utilities === undefined){
		utilities = app.api.ModuleManager.instances["icappbase-0"].util;
		await sleep(1000);
		console.warn(utilities);
		i++;
	}

	// get playAudioNotification funtion instance
	// document.defaultView.inContactAppBase.api.ModuleManager.instances["audiosettingsui-0"].util.playAudioNotification
	utilities.playAudioNotification = function (audioFile, deviceId) {
		var audio = new Audio(audioFile);

		if (deviceId) {
			audio.setSinkId(deviceId);
		}

		audio.volume = notification_volume;
		audio.play();
		console.warn("triggered custom audio notification: ", audio);
	}


	// get resize module
	let resize_manager = undefined;
	i = 0;
	while (i < 10 && moduleManager === undefined){
		resize_manager = app.api.ModuleManager.instances["resizemanager-0"];
		await sleep(1000);
		console.warn(resize_manager);
		i++;
	}

	// stop the resize manager
	moduleManager.stop("resizemanager-0");

	// get agent state ui module
	let agent_state_ui = undefined;
	i = 0;
	while (i < 10 && agent_state_ui === undefined){
		agent_state_ui = app.api.ModuleManager.instances["agentstateui-0"];
		await sleep(1000);
		console.warn(agent_state_ui);
		i++;
	}
	state_element = agent_state_ui.stateBar;

	// get prototype upddateStateTime function
	i = 0;
	while (i < 10 && agent_state_ui.updateStateTime === undefined){
		await sleep(1000);
		console.warn(agent_state_ui.updateStateTime);
		i++;
	}
	// replace upddateStateTime function in active instance
	agent_state_ui.updateStateTime = function () {
		var startDate = null;

		if (this.elementsReady) {
			if (this.acwTimeout) {
				startDate = this.acwTimeoutDate;
			}
			else {
				startDate = this.stateStartDate;
			}

			// Pass the start date, timer element, true - seconds, null - localization key, true - isGranular
			this.updateTimeDurationElement(startDate, this.timerSpan, true, null, true);
			timer = this.timerSpan.innerText.replaceAll(":","");
			agent_state = this.currentState.agentState;
			agent_out_state = this.currentState.agentOutstate;

			on_timer_update();

			const current_time_full = document.querySelector(".current-time-timezone").innerText;
			const rx = new RegExp(/\d*:\d*:\d*/g);
			current_time = rx.exec(current_time_full)[0];
			current_time = current_time.replaceAll(":","");
		}
	};

	// Notifications for Nice chat messages

	// Select the node that will be observed for mutations
	inbox_node = document.querySelector(".inbox-counter");

	// Options for the observer (which mutations to observe)
	const config = { attributes: true, childList: true, subtree: true };

	// Callback function to execute when mutations are observed
	const callback = (mutationList, observer) => {
		for (const mutation of mutationList) {
			//console.log(mutation);
			try {
				if (mutation.addedNodes[0].textContent.startsWith("0")) {
					// We have no inbox count
					// Clear all inbox alerts
					document.querySelector(".digital-workspace-container").classList.remove("inbox-alert");
					inbox_count = 0;
				} else {
					// We have inbox count
					update_inbox(mutation.addedNodes[0].textContent.split(" ")[0]);
				}
			} catch {}
		}
	};

	// Create an observer instance linked to the callback function
	const observer = new MutationObserver(callback);

	// Start observing the target node for configured mutations
	observer.observe(inbox_node, config);
}

main();

