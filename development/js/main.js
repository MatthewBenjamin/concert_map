// main.js - launch app w/ require dependencies

require(['init'], function() {
    require(['jquery', 'knockout', 'komapping', 'app'], function($, ko, komapping, ViewModel) {
        // TODO: define ko.mapping here or in app.js, etc. files?
        //ko.mapping = komapping;
        ko.applyBindings(ViewModel);
    });
});