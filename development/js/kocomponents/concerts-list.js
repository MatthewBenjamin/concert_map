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

            var requestURL = bandsInTown.makeRequestURL(latitude, longitude);
            var requestSettings = bandsInTown.requestSettings;

            self.concertsStatus('Loading Concert Data...');
            //console.log("loading concert data...");
            $.ajax(requestURL,requestSettings);
        });


    }


    return { viewModel: concertsList, template: htmlString }
});