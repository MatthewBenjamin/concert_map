// request-all-lastfm.js
define(['knockout', 'lastFm', 'text!../kotemplates/request-all-lastfm.html'],
    function(ko, lastFm, htmlString) {
    var requestAllLastFm = function(params) {
        var self = this;

        self.searchBarFocus = params.searchBarFocus;
        self.artistCount = params.artistCount;

        self.manualToggle = ko.observable(false);
        self.persistentDisplay = ko.computed(function() {
            if (self.searchBarFocus()) {
                self.manualToggle(true);
            }
        });

        self.dontAskAgain = ko.observable(false);

        self.displayDialog = ko.computed(function() {
            if (self.dontAskAgain()) {
                return false;
            } else if (self.searchBarFocus() || self.manualToggle()) {
                return true;
            }
        });

        self.submitRequest = ko.observable(false);
        self.getAllArtistInfo = ko.computed(function() {
            if (self.submitRequest()) {
                self.submitRequest(false);
                lastFm.requestAllArtistInfo(self.artistCount);
            }
        });
    };

    return { viewModel: requestAllLastFm, template: htmlString }
});