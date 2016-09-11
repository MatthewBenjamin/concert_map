// request-all-lastfm.js
define(['knockout', 'lastFm', 'text!../../templates/request-all-lastfm.html'],
    function (ko, lastFm, htmlString) {
    var requestAllLastFm = function (params) {
        var self = this;

        self.searchBarFocus = params.searchBarFocus;
        self.allArtistStatusUpdate = params.allArtistStatusUpdate;

        self.artistCount = ko.observable(0);
        self.manualToggle = ko.observable(false);
        self.persistentDisplay = ko.computed(function () {
            if (self.searchBarFocus()) {
                self.manualToggle(true);
            }
        });

        self.dontAskAgain = ko.observable(false);

        self.displayDialog = ko.computed(function () {
            if (self.dontAskAgain()) {
                return false;
            } else if (self.searchBarFocus() || self.manualToggle()) {
                return true;
            }
            return false;
        });

        self.submitRequest = ko.observable(false);
        self.getAllArtistInfo = ko.computed(function () {
            if (self.submitRequest()) {
                self.submitRequest(false);
                lastFm.requestAllArtistInfo(self.artistCount);
            }
        });

        self.updateStatus = ko.computed(function () {
            if (self.artistCount() > 0) {
                self.allArtistStatusUpdate('Searching for Artist Info...');
            } else {
                self.allArtistStatusUpdate(null);
            }
        });
    };

    return { viewModel: requestAllLastFm, template: htmlString };
});
