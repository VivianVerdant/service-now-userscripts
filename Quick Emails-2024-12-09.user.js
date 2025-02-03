// ==UserScript==
// @name         Quick Emails
// @version      2024-12-09
// @description  Buttons for quick email closing
// @author       Ziggy
// @run-at       document-start
// @match        https://*.service-now.com/u_email.do*
// @grant        GM_getValue
// ==/UserScript==
/*
	ScriptName: QuickEmails
	Purpose: Auto-closing emails
	Creator: Ziggy :3
	Credits: Thanks to Vivian for supplying script information and helper functions!!!
*/

//helper function - @author VivianVerdant
async function find_or_observe_for_element(query, func, parent_query, once) {

    const body_promise = new Promise((resolve, reject) => {
		let node = document.body;
		if (node) {
			resolve(node);
		}
		const body_observer = new MutationObserver((mutations_list) => {
            let node = document.body;
            if (node) {
                body_observer.disconnect();
				resolve(node);
            }
        });
        body_observer.observe(document.documentElement, {childList: true, attributes: true, subtree: true});
		return;
		const r = new Promise((resolve) => {
			setTimeout(() => {
				body_observer.disconnect();
				resolve();
			}, 3000);
		});
		r.then(reject(null));
	});

	console.debug("before: ",parent_query, query);

	let parent_node = await body_promise.then(node => {return node;}, () => {return null});

	console.debug("after: ", parent_node, parent_query, query);

	if (parent_node === null) {
		console.error("poopy");
		return;
	}

	const node_list = parent_node.querySelectorAll(query);
	let match_list = [];
	if (once && node_list.length) {
		func(node_list[0]);
        return;
	}else if (node_list.length) {
		for (const node of node_list) {
			func(node);
		}
	}
	const observer = new MutationObserver((mutations_list) => {
		let match_list = [];
		const compare_fn = (added_node) => {
			if (added_node.matches(query)) {
				return true;
			}
			return false;
		}
		const mutation_fn = (n_list) => {
			for (const added_node of n_list) {
				if (added_node.children){
					mutation_fn(added_node.children);
				}
				if (added_node.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				if (compare_fn(added_node)) {
					match_list.push(added_node);
				}
			}
		}
		for (const list of mutations_list) {
			if (list.type == "childList") {
				mutation_fn(list.addedNodes);
			}
		}
		if (once && match_list.length) {
			func(match_list[0]);
		} else if (match_list.length) {
			for (const node of match_list) {
				func(node);
			}
		}
	});
	observer.observe(parent_node, { subtree: true, childList: true });
}

const GCS_auto = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_contact", "7cdd78e86f870200248653a11c3ee4cc");
    g_form.setValue("u_close_code", "Informational");
	g_form.setValue("close_notes", "GCS automated notification email; closing as Informational");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 800);
}

const SPAM = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_close_code", "SPAM");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 200);
}
const Informational = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_close_code", "Informational");
    g_form.setValue("close_notes", "Informational");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 200);
}


//helper function - @author VivianVerdant
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

//helper function - @author VivianVerdant
async function add_header_button(name, func) {
    	find_or_observe_for_element(".navbar-right", (node) => {
		console.log(node);
		const btn = node.addNode("button", "custom_btn", ["btn","btn-default"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: left;");
		btn.onclick = func;
		const btn_label = btn.addNode("div", "btn_label");
		btn_label.innerHTML = name;
	}, undefined, true);
}

let run_once = false;
	async function quickEmails_main(){
		'use strict';
		if (run_once){
			return;
		}
		run_once = true
		add_header_button("GCS Notification", GCS_auto);
        add_header_button("SPAM", SPAM);
        add_header_button("Informational", Informational);
	}

quickEmails_main();

