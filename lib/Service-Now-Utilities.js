// EXPORTS
/* globals page_header create_node create_button create_header_button add_header_button*/

// IMPORTS
/* globals g_form wait_for_element */

var page_header;

function create_node(parent, type, class_list) {
    parent = parent || document;
    type = type || "div";
    class_list = class_list || "";

    let new_node = document.createElement(type);
    new_node.setAttribute("class", class_list);
    parent.appendChild(new_node);
    //console.debug("new node: ", new_node)

    return new_node
}

function create_button(parent, click_function, class_list) {
    if (!parent){
        throw new Error("No parent set");
        return null
    }
    class_list = class_list || "";
    class_list = class_list.concat(" btn btn-default");
    let new_button = create_node(parent, "button", class_list);
    let new_function = async function action(event) {event.preventDefault();click_function(event.target)}
    new_button.addEventListener("click", new_function);
    //console.debug("create button: ", new_button)

    return new_button
}

async function create_header_button(label, click_function, class_list) {
    if (!page_header){
        throw new Error("No page header set");
        return null
    }
    class_list = class_list || "";
    class_list = class_list.concat(" form_action_button header");
    let new_button = create_button(page_header, click_function, class_list);
    if (class_list.includes("icon")){
        new_button.setAttribute("style","width:min-content;padding: 0px 8px;display: grid;grid-template-columns: auto auto;grid-column-gap: 8px;");
    }
    new_button.innerText = label;
    //console.debug("header button: ", new_button)

    return new_button
}

async function no_set_function(node) {console.debug("No function set for button.");}

async function add_header_button(label, click_function, class_list) {
    label = label || "";
    click_function = click_function || no_set_function;
    class_list = class_list || "";
    wait_for_element(".container-fluid:has([title='Back']) [id*='section_head_right']",
        (node) => {
            page_header = node;
            //console.debug("header: ", node);
            create_header_button(label, click_function, class_list);
        }
    );
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
