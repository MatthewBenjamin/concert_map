// current-venue.js
define(['knockout','text!../kotemplates/current-venue.html'], function(ko, htmlString) {
    var currentVenue = function(params) {
        var self = this;

        self.currentVenue = params.currentVenue;
    }

    return { viewModel: currentVenue, template: htmlString }
})