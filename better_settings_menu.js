/* globals GM_setValue */
class better_settings_menu {
    constructor(parent, saved_options, title, style) {

        this.update_all_settings = () => {
            const node_list = this.modal_container.querySelectorAll("INPUT");
            for (const node of node_list) {
                let val = node.value;
                if (node.type === "checkbox") {
                    val = node.checked;
                }
                this.set_option_item(node.name, val)
            }
        }

        this.open_modal = (event) => {
            console.log(this.modal)
            this.modal.classList.remove("hidden");
        }

        this.close_modal = (event) => {
            if (event.target.classList.contains("bsn-modal") || event.target.classList.contains("close-bsn-modal-btn")) {
                console.log(this._modal)
                this.modal.classList.add("hidden");
                this.update_all_settings();
            }
        }

        this.name = title || "Better Service Now";

        this.modal = document.createElement("div");
//        this.modal.classList.add("bsn-modal", );
        this.modal.classList.add("bsn-modal", "hidden");
        this.modal.onclick = this.close_modal;
        document.body.appendChild(this.modal);

        this.modal_container = document.createElement("div");
        this.modal_container.classList.add("bsn-modal-container");
        this.modal.appendChild(this.modal_container);

        this.style = style || "";
        const stl = document.createElement("style");
        stl.innerHTML = style;
        this.modal.appendChild(stl);

        const header = document.createElement("div");
        header.classList.add("bsn-header");
        this.modal_container.appendChild(header);

        this.title = title;
        const div = document.createElement("div");
        div.innerHTML = this.title;
        div.classList.add("h4", "bsn-title");
        header.appendChild(div);

        this.close_button = document.createElement("button");
        this.close_button.classList.add("close-bsn-modal-btn");
        header.appendChild(this.close_button);
        this.close_button.onclick = this.close_modal;

        this.main_button = document.createElement("button");
        this.main_button.classList.add("open-bsn-modal-button");
        this.main_button.onclick = this.open_modal;
        //this.main_button.innerHTML = "Settings"
        parent.after(this.main_button);

        this.saved_options = saved_options;

        this.update_modal();

        return this;
    }

    add_node = function (parent, type, id, classes) {
        const new_node = document.createElement(type);
        new_node.id = id;
        if (classes) {
            for (const clss of classes) {
                new_node.classList.add(clss);
            }
        }
        parent.appendChild(new_node);
        return new_node;
    };

    set_option_item = (name, value) => {
        let options = this.saved_options;
        options[name].value = value;
        this.saved_options = options;
        //this.update_modal();
        GM_setValue("settings", this.saved_options);
        console.log(this.saved_options);
        return this.saved_options;
    }

    get_option_item = (name) => {
        let options = this.saved_options;
        return options[name];
    }

    build_modal = () => {
        //- Based on type, create appropriate DOM elements
        //- Create and attach event listeners
    }

    create_bool_setting = (key, value) => {
        let setting = this.add_node(this.modal_container, "div", key, ["bool_setting", "form-group", "setting_entry"]);
        let name = this.add_node(setting, "span", "", ["control-label", "label-text"]);
        name.innerHTML = value.description;
        let toggle = this.add_node(setting, "input", "", ["checkbox_switch"]);
        toggle.setAttribute("type","checkbox");
        toggle.setAttribute("name",key);
		toggle.checked = value.value;
        toggle.addEventListener("input", this.update_all_settings());
        //console.warn(setting, name, toggle);
    }

    create_string_setting = (key, value) => {
        let setting = this.add_node(this.modal_container, "div", key, ["bool_setting", "form-group", "setting_entry"]);
        let name = this.add_node(setting, "span", "", ["control-label", "label-text"]);
        name.innerHTML = value.description;
        let string = this.add_node(setting, "input", "", ["string_field","form-control"]);
        string.setAttribute("type","text");
        string.setAttribute("placeholder","String");
        string.setAttribute("name", key);
        string.value = value.value;
        string.addEventListener("input", this.update_all_settings());
        //console.warn(setting, name, string);
    }

    create_int_setting = (key, value) => {
        let setting = this.add_node(this.modal_container, "div", key, ["bool_setting", "form-group", "setting_entry"]);
        let name = this.add_node(setting, "span", "", ["control-label", "label-text"]);
        name.innerHTML = value.description;
        let int = this.add_node(setting, "input", "", ["int_field","form-control"]);
        int.setAttribute("type","number");
        int.setAttribute("onkeypress", "return (event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57");
        int.setAttribute("placeholder","Integer");
        int.setAttribute("name", key);
        int.value = value.value;
        int.addEventListener("input", this.update_all_settings());
        //console.warn(setting, name, string);
    }

    create_rgb_setting = (key, value) => {
        let setting = this.add_node(this.modal_container, "div", key, ["bool_setting", "form-group", "setting_entry"]);
        let name = this.add_node(setting, "span", "", ["control-label", "label-text"]);
        name.innerHTML = value.description;
        let string = this.add_node(setting, "input", "", ["string_field","form-control"]);
        string.setAttribute("type","text");
        string.setAttribute("placeholder","R,G,B color value");
        string.setAttribute("name", key);
        string.value = value.value;
        string.addEventListener("input", this.update_all_settings());
       // console.warn(setting, name, string);
    }

    create_null_setting = (key, value) => {
        let setting = this.add_node(this.modal_container, "div", key, ["null_setting", "form-group", "setting_entry"]);
        let name = this.add_node(setting, "span", "");
        name.innerHTML = value.description;
    }

    update_modal = () => {
        //TODO: Update modal code
        //- Read settings
        let options = this.saved_options;
        //- Iterate through entries
        for (const [key, value] of Object.entries(options)) {
            //console.warn(key, value);
            if (this.modal.querySelector("#" + key)){
                //update element
            } else {
                //create element
                switch (value.type){
                    case 'bool':
                        this.create_bool_setting(key, value);
                        break;
                    case 'string':
                        this.create_string_setting(key, value);
                        break;
                    case 'rgb':
                        this.create_rgb_setting(key, value);
                        break;
                    case 'int':
                        this.create_int_setting(key, value);
                        break;
                    case 'null':
                        this.create_null_setting(key, value);
                        break;
                    default:
                        console.warn("No function to handle setting of type: ", value.value);
                }
            }
        }
        // Update existing DOM elements
    }
}
