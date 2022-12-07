async function find_or_observe_for_element(query, func, parent_query, once) {

	setTimeout(() => {
		if (document.body === undefined) {
			console.error("No body found");
			return;
		}
	}, 6000);

	while (document.body === undefined) {
		setTimeout(() => {;}, 150);
	}

	let parent_node;

	if (parent_query === undefined) {
		parent_node = document.body;
	} else {
        	setTimeout(() => {
			if (document.body === undefined) {
				console.warn("No custom parent found, falling back to body");
				parent_node = document.body;
			}
		}, 10000);
		while (parent_node === undefined) {
		    parent_node = document.querySelector(parent_query);
		    setTimeout(() => {;}, 150);
        	}
	}
	const node_list = parent_node.querySelectorAll(query);
	let match_list = [];
	if (once && node_list.length) {
		func(node_list[0]);
	}else if (node_list.length) {	
		for (const node of node_list) {
			func(node);
		}
	}
	const observer = new MutationObserver((mutations_list, observer) => {
		let match_list = [];
		const compare_fn = (added_node) => {
			if (added_node.matches(query)) {
				return true;
			}
			return false
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
