// menu-toggle.js
define(['knockout', 'menuToggleTemplate'], function (ko, htmlString) {
    var menuToggle = function (params) {
        var self = this;

        self.showMenu = params.showMenu;

        self.toggleMenu = function () {
            if (self.showMenu()) {
                self.showMenu(false);
            } else {
                self.showMenu(true);
            }
        };
    };

    return { viewModel: menuToggle, template: htmlString };
});
