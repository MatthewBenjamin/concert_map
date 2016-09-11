// current-artist.js
define(['knockout', 'lastFm', 'youtube', 'text!../../templates/current-artist.html'],
   function (ko, lastFm, youtube, htmlString) {
    var currentArtist = function (params) {
        var self = this;

        self.currentArtist = params.currentArtist;
        self.selectEvent = params.selectEvent;

        self.getArtistExtras = ko.computed(function () {
            var artist = self.currentArtist();
                if (artist && !artist.lastFm) {
                    artist.lastFm = {};
                    artist.lastFm.status = 'Loading detailed artist info...';
                    lastFm.requestArtistInfo(artist);
                }

                if (artist && !artist.youtube) {
                    artist.youtube = {};
                    artist.youtube.status = 'Loading Youtube search results...';
                    youtube.requestArtistVideos(artist);
                }
        });

        self.backToEvent = function (mappedConcert) {
            self.selectEvent(ko.mapping.toJS(mappedConcert));
        };
    };

    return { viewModel: currentArtist, template: htmlString };
});
