// current-venue.js
define(['knockout','fourSquare', 'googlePlaces', 'text!../kotemplates/current-venue.html'],
    function(ko, fourSquare, googlePlaces, htmlString) {
    var currentVenue = function(params) {
        var self = this;

        self.currentVenue = params.currentVenue;
        self.concertVenues = params.concertVenues;
        self.currentVenueDetails = ko.observable(
            {
                data: null,
                status: null
        });;

        self.loadDetailedVenueInfo = ko.computed(function() {
            var venue = self.currentVenue;
            var venueDetails = self.currentVenueDetails;
            var venueIndex = self.concertVenues().indexOf(venue());

            if (venue() && venue().detailedInfo) {
                venueDetails(venue().detailedInfo);
            } else if (venue() &&
                       !venue().detailedInfo &&
                       venueDetails().status === fourSquare.error) {
                googlePlaces.requestVenueInfo(venue, venueDetails, venueIndex);
            } else if ( venue() && !venue().detailedInfo) {
                fourSquare.requestVenueInfo(venue, venueDetails, venueIndex);
            }
        });
    };

    return { viewModel: currentVenue, template: htmlString }
});
