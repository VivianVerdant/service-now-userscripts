// Get all the dropdown from document
function createBetterSettingsMenu(){
    var cssTxt = GM_getResourceText("customCSS");
	GM_addStyle (cssTxt);

	var menu_html = '<div class="better-menu better-dropdown-container better-click-dropdown"></div>'+
                      '<ul class="better-menu better-dropdown-menu">'+
                        '<li>Better Service-Now Settings</li>'+
                         '<li>Keep Company Filter<input class="better-menu tgl-hidden tgl-skewed" id="cb3" type="checkbox" />'+
                        '<label class="better-menu better-tgl-btn" data-tg-off="OFF" data-tg-on="ON" for="cb3"></label></li>'+
                      '</ul>';

	var header = document.querySelectorAll("div.navbar-right")[0].firstChild;
	better_options_btn = document.createElement("div");
	better_options_btn.setAttribute("style", "float: right;");
	better_options_btn.innerHTML = menu_html;
	
	header.insertAdjacentElement('afterbegin', better_options_btn);
    
    
    document.querySelectorAll(".better-dropdown-container").forEach(dropDownFunc);
}

// Dropdown Open and Close function
function dropDownFunc(dropDown) {
    console.log(dropDown.classList.contains("better-click-dropdown"));
    dropDown.addEventListener("click", function (e) {
        e.preventDefault();
        if (
            this.nextElementSibling.classList.contains(
                "better-dropdown-active"
            ) === true
        ) {
            // Close the clicked dropdown
            this.nextElementSibling.classList.remove("better-dropdown-active");
        } else {
            // add the open and active class(Opening the DropDown)
            this.nextElementSibling.classList.add("better-dropdown-active");
        }
    });
}

// Listen to the doc click
window.addEventListener("click", function (e) {
    // Close the menu if click happen outside menu
    if (e.target.closest(".better-menu") === null) {
        // Close the opend dropdown
        closeDropdown();
    }
});

// Close the openend Dropdowns
function closeDropdown() {
    // remove the open and active class from other opened Dropdown (Closing the opend DropDown)
    document.querySelectorAll(".better-dropdown-menu").forEach(function (menu) {
        menu.classList.remove("better-dropdown-active");
    });
}
