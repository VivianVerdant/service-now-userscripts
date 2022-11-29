async function find_or_observe_for_element(query, func, parent_query, once) {
	
	setTimeout(() => {
		if (document.body === undefined) {
			console.error("No body found");
			return;
		}
	}, 6000);
	
	while (document.body === undefined) {
		await setTimeout(() => {return;}, 150);
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
		}, 3000);
		while (parent_node === undefined) {
		    parent_node = document.querySelector(parent_query);
		    setTimeout(() => {;}, 150);
        	}
	}

	const node_list = parent_node.querySelectorAll(query);
	if (node_list.length) {
		for (const node of node_list) {
			func(node);
			if (once) {
				return;
			}
		}
	}

	const observer = new MutationObserver((mutations_list, observer) => {
		const mutation_fn = (n_list) => {
			for (const added_node of n_list) {
				if (added_node.children){
					mutation_fn(added_node.children);
				}
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
