// info-list-toggle.js
define(['knockout', 'text!../kotemplates/info-list-toggle.html'],
    function (ko, htmlString) {
    var infoListToggle = function (params) {
        var self = this;

        self.listEvents = params.listEvents;
        self.listVenues = params.listVenues;
        self.extraInfoBoolean = params.extraInfoBoolean;
        self.showEventInfo = params.showEventInfo;
        self.showVenueInfo = params.showVenueInfo;
        self.showArtistInfo = params.showArtistInfo;

        self.showEvents = function () {
            self.listEvents(true);
            self.listVenues(false);
        };

        self.showVenues = function () {
            self.listEvents(false);
            self.listVenues(true);
        };

        self.toggleExtraInfo = function () {
            if (self.extraInfoBoolean()) {
                self.extraInfoBoolean(false);
            } else {
                self.showEventInfo(false);
                self.showVenueInfo(false);
                self.showArtistInfo(false);
                self.extraInfoBoolean(true);
            }
        };
    };

    return { viewModel: infoListToggle, template: htmlString };
});
