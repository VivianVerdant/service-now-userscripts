function find_or_observe_for_element(query, func, parent_query, once) {

	let parent_node;

	if (parent_query === undefined) {
		parent_node = document.body;
	} else {
		parent_node = document.querySelector(parent_query);
	}

	if (once === undefined) {
		once = true;
	}

	const node_list = parent_node.querySelectorAll(query);
	//console.log("node list: ", node_list);
	if (node_list.length) {
		for (const node of node_list) {
			//console.log("found node already existing: ", node);
			func(node);
			if (once) {
				//console.log("exiting early");
				return;
			}
		}
	}

	const observer = new MutationObserver((mutations_list, observer) => {
		const mutation_fn = (n_list) => {
			for (const added_node of n_list) {
				if (added_node.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				if (added_node.matches(query)) {
					func(added_node);
					if (once) {
						observer.disconnect();
						return;
					}
				}
			}
		}
		for (const list of mutations_list) {
			if (list.type == "childList") {
				mutation_fn(list.addedNodes);
			}
		}
	});
	observer.observe(parent_node, { subtree: true, childList: true });
}
