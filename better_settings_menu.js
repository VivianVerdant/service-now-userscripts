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

    set_option_item = (name, value) => {
        let options = this.saved_options;
        options[name] = value;
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

    make_readable = (str) => {
        let result = str.replaceAll(/(_)/g, " ");
        result = result.split(" ")
        for (let i = 0; i < result.length; i++) {
            result[i] = result[i][0].toUpperCase() + result[i].substr(1);
        }
       return result.join(" ");
    }

    create_bool_setting = (key, value) => {
        let setting = this.modal_container.addNode("div", key, ["bool_setting", "setting_entry"]);
        let name = setting.addNode("span", "");
        name.innerHTML = this.make_readable(key);
        let toggle = setting.addNode("input", "", ["checkbox_switch"]);
        toggle.setAttribute("type","checkbox");
        toggle.setAttribute("name",key);
		toggle.checked = value;
        toggle.addEventListener("input", this.update_all_settings());
    }

    create_string_setting = (key, value) => {
        let setting = this.modal_container.addNode("div", key, ["string_setting", "setting_entry"]);
        let name = setting.addNode("span", "");
        name.innerHTML = this.make_readable(key);
        let string = setting.addNode("input", "", ["string_field"]);
        string.setAttribute("type","text");
        string.setAttribute("placeholder","Hex Value");
        string.setAttribute("name", key);
        string.value = value;
        string.addEventListener("input", this.update_all_settings());
    }

    update_modal = () => {
        //TODO: Update modal code
        //- Read settings
        let options = this.saved_options;
        //- Iterate through entries
        for (const [key, value] of Object.entries(options)) {
            console.log(key, value);
            if (this.modal.querySelector("#" + key)){
                //update element
            } else {
                //create element
                switch (typeof value){
                    case 'boolean':
                        this.create_bool_setting(key, value);
                        break;
                    case 'string':
                        this.create_string_setting(key, value);
                        break;
                    default:
                        //default
                }
            }
        }
        // Update existing DOM elements
    }
}
