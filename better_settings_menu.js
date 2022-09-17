// Get all the dropdown from document
function createBetterSettingsMenu(e){
    var cssTxt = GM_getResourceText("customCSS");
	GM_addStyle (cssTxt);

	var menu_html =	'<li>Better Service-Now Settings</li>'+
						'<li>Keep Company Filter<input class="better-menu tgl-hidden tgl-skewed" id="cb3" type="checkbox" />'+
							'<label class="better-menu better-tgl-btn" data-tg-off="OFF" data-tg-on="ON" for="cb3"></label></li>';

	var better_options_btn = document.createElement("div");
	better_options_btn.setAttribute("class", "better-menu better-dropdown-container better-click-dropdown");
	var better_dropdown = document.createElement("li");
	better_dropdown.setAttribute("class", "better-menu better-dropdown-menu");
	better_dropdown.innerHTML = menu_html;
	e.insertAdjacentElement('afterbegin', better_dropdown);
	e.insertAdjacentElement('afterbegin', better_options_btn);
    
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
