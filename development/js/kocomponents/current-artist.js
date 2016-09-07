// current-artist.js
define(['knockout', 'lastFm', 'youtube', 'text!../kotemplates/current-artist.html'],
   function (ko, lastFm, youtube, htmlString) {

    var currentArtist = function(params) {
        var self = this;

        self.currentArtist = params.currentArtist;
        self.selectEvent = params.selectEvent;

        self.getArtistExtras = ko.computed(function() {
            var artist = self.currentArtist();
                if (artist && !artist.lastfm) {
                    artist.lastfm = {};
                    artist.lastfm.status = "Loading detailed artist info..."
                    lastFm.requestArtistInfo(artist);
                }

                if (artist && !artist.youtube) {
                    console.log('get videos!');
                    artist.youtube = {};
                    artist.youtube.status = "Loading Youtube search results...";
                    youtube.requestArtistVideos(artist);
                }
        });

        self.backToEvent = function(mappedConcert) {
            selectEvent(ko.mapping.toJS(mappedConcert));
        };
    }

    return { viewModel: currentArtist, template: htmlString }
})