// venues-view-model.js
define(['knockout', 'utils', 'venuesListTemplate'],
    function (ko, utils, htmlString) {
    var venuesList = function (params) {
        var self = this;

        self.concerts = params.concerts;
        self.concertVenues = params.concertVenues;

        self.buildAllVenues = ko.computed(function () {
            var events = self.concerts();
            self.concertVenues(utils.buildVenues(events));
        });
    };

    return { viewModel: venuesList, template: htmlString };
});
