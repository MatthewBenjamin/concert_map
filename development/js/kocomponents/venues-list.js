// venues-view-model.js
define(['knockout', 'utils','text!../kotemplates/venues-list.html'],
    function(ko, utils, htmlString) {
    console.log(utils);
    var venuesList = function(params) {
        var self = this;

        self.concerts = params.concerts;
        self.concertVenues = params.concertVenues;

        self.buildAllVenues = ko.computed(function() {
            console.log('hi venues');
            var events = self.concerts();
            self.concertVenues(utils.buildVenues(events));
        });
    }

    return { viewModel: venuesList, template: htmlString }
})