define(['knockout', 'bandsInTown', 'text!../kotemplates/concerts-list.html'],
        function(ko, bandsInTown, htmlString) {

    var concertsList = function(params) {
        var self = this;

        self.mapCenter = params.mapCenter;
        self.concerts = params.concerts;
        self.concertsStatus = params.concertsStatus;

        self.getConcerts = ko.computed(function() {
            console.log('hi getConcerts');
            var latitude = self.mapCenter().latitude;
            var longitude = self.mapCenter().longitude;
            // TODO: do I still need this? seems to only load once
            // Prevent Knockout from loading concerts twice on page load
            //if ((self.concerts().length === 0 &&
            //     self.mapCenter() === defaultLatlng)||
            //    (self.concerts().length > 0 &&
            //     latitude !== defaultLatlng.latitude &&
            //     longitude !== defaultLatlng.longitude)) {
                var requestURL = bandsInTown.makeRequestURL(latitude, longitude);
                var requestSettings = bandsInTown.requestSettings;
                requestSettings.success = function(data, status, jqXHR) {
                    if (data) {
                        self.concertsStatus(null);
                        bandsInTown.parseConcerts(data);
                        self.concerts(data);
                    } else {
                        self.concertsStatus(data.message);
                    }

                }
                requestSettings.error = function() {
                    self.concertsStatus('Concert data could not be loaded. Please try again.');
                };
                self.concertsStatus('Loading Concert Data...');
                //console.log("loading concert data...");
                $.ajax(requestURL,requestSettings);
            //}
        });


    }


    return { viewModel: concertsList, template: htmlString }
});