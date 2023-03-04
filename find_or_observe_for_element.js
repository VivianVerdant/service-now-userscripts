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
