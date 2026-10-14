// EXPORTS
/* globals page_header create_node create_button create_header_button add_header_button*/

// IMPORTS
/* globals g_form wait_for_element */

var page_header;

function create_node(type, class_list, parent) {
    parent = parent || null;
    type = type || "div";
    class_list = class_list || "";

    let new_node = document.createElement(type);
    new_node.setAttribute("class", class_list);
    if (parent) {
        parent.appendChild(new_node);
    }

    return new_node
}

function insert_node(sibling, type, class_list) {
    sibling = sibling || document;
    type = type || "div";
    class_list = class_list || "";

    let new_node = document.createElement(type);
    new_node.setAttribute("class", class_list);
    sibling.parentNode.insertBefore(new_node, sibling);
    //console.debug("new node: ", new_node)

    return new_node
}

function create_button(label, click_function, class_list) {
    class_list = class_list || "";
    class_list = class_list.concat(" btn btn-default");
    let new_button = create_node("button", class_list);
    let new_function = async function action(event) {event.preventDefault();click_function(event.target)}
    if (class_list.includes("icon")){
        new_button.setAttribute("style","width:min-content;padding: 0px 8px;display: grid;grid-template-columns: auto auto;grid-column-gap: 8px;");
    }
    new_button.addEventListener("click", new_function);
    new_button.innerText = label;

    return new_button
}

function create_header_button(label, click_function, class_list) {
    class_list = class_list || "";
    class_list = class_list.concat(" form_action_button header");
    let new_button = create_button(label, click_function, class_list, page_header);

    return new_button
}

async function no_set_function(node) {console.debug("No function set for button.");}

function get_header() {
    return new Promise(function(resolve, reject) {
        // icidents, tasks, events, emails
        wait_for_element(".container-fluid:has([title='Back']) [aria-label='additional actions']",(node) => {
            page_header = node.parentNode;
            resolve(page_header)
        });
        wait_for_element(".polaris-header-controls",(node) => {page_header = node.parentNode; resolve(page_header)});
        wait_for_element("div.head-bc",(node) => {
            const style_fix = create_node(document.querySelector("head"), "style");
            style_fix.setAttribute("type","text/css");
            style_fix.innerHTML = ".kb-navbar-header {display: flex;align-items: center;}";
            page_header = node.parentNode;
            resolve(page_header)
        });
        wait_for_element(".dropdown.kb-end-buttons",(node) => {
            const style_fix = create_node(document.querySelector("head"), "style");
            style_fix.setAttribute("type","text/css");
            style_fix.innerHTML = ".kb-panel-heading.panel-heading > span > .row > .form_action_button {display:none;}";
            page_header = node.parentNode;
            resolve(page_header)
        });
        wait_for_element(".kb-panel-heading.panel-heading > span > .row", (node) => {
            const style_fix = create_node(document.querySelector("head"), "style");
            style_fix.setAttribute("type","text/css");
            style_fix.innerHTML = ".kb-panel-heading.panel-heading > span > .row > .form_action_button {float:right;margin:2px 8px;}";
            page_header = node.parentNode;
            resolve(page_header)
        });
    });
}

function get_field_value(field_name) {
    if (g_form.getReference(field_name)){
        return g_form.getReference(field_name).name
    }
    if (g_form.getControl(field_name).tagName == "SELECT") {
        return g_form.getOption(field_name,g_form.getValue(field_name)).innerText
    }
    return g_form.getValue(field_name)
}

function get_field_reference(field_name) {
    if (g_form.getReference(field_name)){
        return g_form.getReference(field_name)
    }
    return new Error("Could not find reference")
}

class HeaderButton {
    label; click_function; class_list; node;
    constructor(label, click_function, class_list) {
        this.label = label;
        this.click_function = click_function;
        this.class_list = class_list;
        this.node = create_header_button(label, click_function, class_list);
    }
}

class HeaderButtons {
    parent;
    buttons = [];

    constructor() {
    }

    add_button(label, click_function, class_list) {
        label = label || "";
        class_list = class_list || "";
        click_function = click_function || no_set_function;

        this.buttons.push(new HeaderButton(label, click_function, class_list));
    }

    async write() {
        this.parent = await get_header();
        for (const btn of this.buttons) {
            this.parent.appendChild(btn.node);
        }
    }
}
