// main.js - launch app w/ require dependencies
require(['init'], function() {
    require(['knockout', 'app'],
             function(ko, ViewModel) {
        ko.applyBindings(ViewModel);
    });
});
