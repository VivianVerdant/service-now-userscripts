// ==UserScript==
// @name         Max Timer Alerts
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Set blinking backround and audio alert for timer over/under certain values
// @author       Vivian
// @match        https://max.niceincontact.com/*
// @match        https://max.nice-incontact.com/*
// @resource     better_max_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_max.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* globals find_or_observe_for_element */

// format your desired time to be HHMMSS

const alert_time_assisting_analyst = 999999;
const alert_time_board_mgmt = 999999;
const alert_time_break = 940;
const alert_time_lunch = 5940;
const alert_time_meeting = 999999;
const alert_time_outbound = 999999;
const alert_time_priority1 = 999999;
const alert_time_project = 999999;
const alert_time_remote_assistance = 999999;
const alert_time_training = 999999;
const alert_time_unscheduled = 500;
const alert_time_wrapup_research = 500;
const alert_time_aftercall = 10; // this timer counts down instead of up

var audio_alert = {
	none: null,
	contact: '/styles/audio/new-contact.wav',
	ring1: '/styles/audio/ring1.wav',
	ring2: '/styles/audio/ring2.wav',
	ring3: '/styles/audio/ring3.wav'
}

const selected_audio_alert = audio_alert.contact;

var timer; // current timer as HHMMSS
var agent_state; // available or unavialable
var agent_out_state; // reason for being unavailable, if not available
var state_element; // main HTML div element for the state
var last_timer_state;
var utilities;

async function blink_timer(state) {
	if (state === last_timer_state) {
		return
	}
	if (state) {
		state_element.classList.add("blinkey");
		utilities.playAudioNotification(selected_audio_alert); // new-contact.wav, Ring1.wav, Ring2.wav, Ring3.wav
	} else {
		state_element.classList.remove("blinkey");
	}
	last_timer_state = state;
}

async function on_timer_update() {
	if (agent_state === "Available") {
		blink_timer(false);
		return
	}

	switch(agent_out_state) {
		case "Assisting Analyst":
			(timer >= alert_time_assisting_analyst) ? blink_timer(true) : blink_timer(false);
			break;
		case "Board Mgmt":
			(timer >= alert_time_board_mgmt) ? blink_timer(true) : blink_timer(false);
			break;
		case "Break":
			(timer >= alert_time_break) ? blink_timer(true) : blink_timer(false);
			break;
		case "Lunch":
			(timer >= alert_time_lunch) ? blink_timer(true) : blink_timer(false);
			break;
		case "Meeting":
			(timer >= alert_time_meeting) ? blink_timer(true) : blink_timer(false);
			break;
		case "Outbound":
			(timer >= alert_time_outbound) ? blink_timer(true) : blink_timer(false);
			break;
		case "Priority 1":
			(timer >= alert_time_priority1) ? blink_timer(true) : blink_timer(false);
			break;
		case "Project":
			(timer >= alert_time_project) ? blink_timer(true) : blink_timer(false);
			break;
		case "Remote Assistance":
			(timer >= alert_time_remote_assistance) ? blink_timer(true) : blink_timer(false);
			break;
		case "Training":
			(timer >= alert_time_training) ? blink_timer(true) : blink_timer(false);
			break;
		case "Unscheduled":
			(timer >= alert_time_unscheduled) ? blink_timer(true) : blink_timer(false);
			break;
		case "Wrap-up Research":
			(timer >= alert_time_wrapup_research) ? blink_timer(true) : blink_timer(false);
			break;
		case "After Call Work":
			(timer <= alert_time_aftercall) ? blink_timer(true) : blink_timer(false);
			break;
		case undefined: // Empty
			break;
	}
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    'use strict';

    // Load custom CSS
    GM_addStyle(GM_getResourceText("better_max_css"));

	// Get incontact app base
	let app = null;
    let i = 0;
    while (i < 10 && app == null){
		app = document.defaultView.inContactAppBase;
        await sleep(1000);
		console.warn(app);
		i++;
    }

	utilities = app.api.ModuleManager.instances["icappbase-0"].util;

	const moduleManager = app.api.ModuleManager;
    moduleManager.stop("resizemanager-0");

	const agent_state_ui = app.api.ModuleManager.instances["agentstateui-0"];

	state_element = agent_state_ui.stateBar;

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
			console.warn(agent_state, agent_out_state, timer);
			on_timer_update();
		}
	};
}

main();
