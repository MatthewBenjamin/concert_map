// current-artist.js
define(['knockout', 'lastFm', 'text!../kotemplates/current-artist.html'],
   function (ko, lastFm, htmlString) {

    var currentArtist = function(params) {
        var self = this;
        self.currentArtist = params.currentArtist;

        self.getArtistInfo = ko.computed(function() {
            var artist = self.currentArtist();
                if (artist && !artist.lastfm) {
                    artist.lastfm = {};
                    artist.lastfm.status = "Loading detailed artist info..."
                    lastFm.requestArtistInfo(artist);
                }
        });
    }

    return { viewModel: currentArtist, template: htmlString }
})