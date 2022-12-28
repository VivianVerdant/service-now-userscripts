async function find_or_observe_for_element(query, func, parent_query, once) {
	let parent_node;

	//console.log(query);

	const compare_fn = (added_node) => {
		if (added_node.matches(query)) {
			return true;
		}
		return false
	}

	function recursive_search(node){
		let results = [];
		if (node.nodeType == Node.ELEMENT_NODE && compare_fn(node)) {
			results.push(node);
		}
		if (node.children){
			for (const child of node.children) {
				if (child.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				results.push(recursive_search(child));
			}
		}
		console.log("restults: ", results);
		if (results.length) {
			return results;
		} else {
			return null;
		}

	}

	async function find_body() {
		const body_observer = new MutationObserver(() => {
			let node = document.body;
			if (node) {
				parent_node = node;
				process();
				body_observer.disconnect();
			}
		});
		body_observer.observe(document.documentElement, {childList: true});
	}

	async function find_query() {
		const query_observer = new MutationObserver(() => {
			let node = document.querySelector(parent_query);
			if (node) {
				parent_node = node;
				process();
				query_observer.disconnect();
			}
		});
		query_observer.observe(document.documentElement, {childList: true});

		setTimeout(() => {
			if (document.body === undefined) {
				console.warn("Can't find query, falling back to body");
				query_observer.disconnect();
				find_body();
			}
		}, 3000);
	}

	function process() {
		const child_observer = new MutationObserver((mutations_list, observer) => {
			let match_list = [];
			for(const node of document.querySelectorAll(query).values()) {
				match_list.push(node);
			}
			//console.log("mutations_list: ", mutations_list);

			const recursive_mutations = (obj) => {
				if (obj.constructor.name == "Array"){
					obj.forEach( (element) => {
						recursive_mutations(element);
					});
				} else if (obj.constructor.name == "MutationRecord") {
					obj.addedNodes.forEach( (element) => {
						recursive_mutations(element);
					});
				} else if (obj.nodeType == Node.ELEMENT_NODE) {
					if (obj.matches(query)) {
						//console.log("found " + query + ": ", obj);
						match_list.push(obj);
					}
					if (obj.childNodes) {
						obj.childNodes.forEach( (element) => {
							recursive_mutations(element);
						});
					}
				} else {
				}
			}
			if (match_list.length && once) {

			} else {
				recursive_mutations(mutations_list);
			}
			//console.log(match_list)

			if (once && match_list.length) {
				//console.log(match_list[0]);
				func(match_list[0]);
				child_observer.disconnect()
			} else if (match_list.length) {
				//console.log(match_list);
				for (const node of match_list) {
					func(node);
				}
			}
		});
		//console.log(child_observer);
		child_observer.observe(parent_node, { subtree: true, childList: true });
	}

	if (parent_query === undefined) {
		find_body();
	} else {
		find_query();
	}
}
