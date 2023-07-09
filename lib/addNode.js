HTMLElement.prototype.addNode = (type, id, classes) => {
	const new_node = document.createElement(type);
	new_node.id = id;
	if (classes) {
		for (const clss of classes) {
			new_node.classList.add(clss);
		}
	}
	console.log(this);
	this.appendChild(new_node);
	return new_node;
}
