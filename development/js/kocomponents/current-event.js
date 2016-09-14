// current-event.js
define(['knockout', 'currentEventTemplate'], function (ko, htmlString) {
    var currentEvent = function (params) {
        var self = this;

        // TODO: is viewModel needed? --> not currently
        // TODO: need component to load artists' info for event template?
        self.currentEvent = params.currentEvent;
    };

    // return { viewModel: currentEvent, template: htmlString }
    return { template: htmlString };
});
