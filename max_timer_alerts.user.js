// ==UserScript==
// @name         Max Timer Alerts
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.5
// @description  Set blinking backround and audio alert for timer over/under certain values
// @author       Vivian
// @match        https://max.niceincontact.com/*
// @match        https://max.nice-incontact.com/*
// @resource     better_max_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_max.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/*
    Changelog
	v0.5 - added visual and audio notifications for when an inbox item (support chat) comes in
    v0.4 - set up enums instead of consts for state times, added state based audio alert option
    v0.3 - cleaned up code
    v0.2 - bugfixes
    v0.1 - Initial release
*/

// ------------------------------------------- set your desired values here ----------------------------------

// format your desired time to be HHMMSS
const state_times = {
	"Assisting Analyst": 999999,
	"Board Mgmt": 999999,
	"Break": 940,
	"Lunch": 5940,
	"Meeting": 999999,
	"Outbound": 999999,
	"Priority 1": 999999,
	"Project": 999999,
	"Remote Assistance": 999999,
	"Training": 999999,
	"Unscheduled": 30,
	"Wrap-up Research": 500,
	"WORKING": 999999,
	"After Call Work": 10,
} // "After Call Work" timer counts down instead of up

// do you want an audio alert to sound when the timer exceeds the value set above?
const state_audio_alert = {
	"Assisting Analyst": false,
	"Board Mgmt": false,
	"Break": true,
	"Lunch": true,
	"Meeting": false,
	"Outbound": false,
	"Priority 1": false,
	"Project": false,
	"Remote Assistance": false,
	"Training": false,
	"Unscheduled": true,
	"Wrap-up Research": true,
	"WORKING": false,
	"After Call Work": false,
}

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

var inbox_count = 0;
var inbox_node;

// Element references
var state_element; // main HTML div element for the state

// Module references
var utilities; // reference to loaded utilities module

async function blink_timer(state) {
	// If state hasn't changed, do nothing
	if (state === last_timer_state) {
		return
	}

	// if new state is true, add the blinkey class to the state element and play a notification sound, else clear blinkey class
	if (state) {
		state_element.classList.add("blinkey");
		(state_audio_alert[agent_out_state]) ? utilities.playAudioNotification(selected_audio_alert) : null;
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
		(timer <= state_times[agent_out_state]) ? blink_timer(true) : blink_timer(false);
		return
	}

	if (agent_out_state === "After Call Work") {
		blink_timer(timer <= state_times[agent_out_state]);
	} else {
		blink_timer(timer >= state_times[agent_out_state]);
	}
	//console.log(agent_state, agent_out_state, timer, last_timer_state);
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function update_inbox(num) {
	if (num > inbox_count) {
		utilities.playAudioNotification(selected_audio_alert);
	}
	inbox_count = num;
	document.querySelector(".digital-workspace-container").add("inbox-alert");
}

async function main() {
    'use strict';

    // Load custom CSS
    GM_addStyle(GM_getResourceText("better_max_css"));

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

	// get resize module
	let resize_manager = undefined;
    i = 0;
    while (i < 10 && moduleManager === undefined){
		resize_manager = app.api.ModuleManager.instances["resizemanager-0"];
        await sleep(1000);
		console.warn(resize_manager);
		i++;
    }
    moduleManager.stop("resizemanager-0"); // stop the resize manager

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
		}
	};


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
					document.querySelector(".digital-workspace-container").remove("inbox-alert");
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

