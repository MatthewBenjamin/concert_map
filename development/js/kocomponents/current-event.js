// current-event.js
define(['knockout', 'text!../kotemplates/current-event.html'], function(ko, htmlString) {
    var currentEvent = function(params) {
        var self = this;

        self.currentEvent = params.currentEvent;
    }

    return { viewModel: currentEvent, template: htmlString }
});