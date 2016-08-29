// main.js - launch app w/ require dependencies

// TODO: does app.js belong in init and/or this require statement?
require(['init'], function() {
    // TODO: is this require statement needed? --> YES, if I want to assign ko.mapping
    //       and ko.applyBindings, otherwise can just use define in app.js
    require(['jquery', 'knockout', 'komapping', 'bandsInTown', 'app'],
             function($, ko, komapping, bandsInTown, ViewModel) {
        ko.applyBindings(ViewModel);
    });
});
