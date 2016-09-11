// last-fm.js
define(['jquery', 'knockout'], function ($, ko) {
    var lastFm = {};

    var baseError = 'Sorry, additional information from Last.fm ' +
        'could not be ';
    var apiErrorMessage = baseError + 'loaded.';
    var notFoundError = baseError + 'found.';

    function getArtistSearch(artist) {
        if (artist.mbid) {
            return 'mbid=' + artist.mbid;
        }
        return 'artist=' + artist.name;
    }

    function makeRequestURL(artist) {
        var artistSearch = getArtistSearch(ko.mapping.toJS(artist));
        var lastFmRequestURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&' +
            'api_key=d824cbbb7759624aa8b3621a627b70b8' +
            '&format=json&' + artistSearch;
        return lastFmRequestURL;
    }

    lastFm.requestArtistInfo = function (artist) {
        var requestURL = makeRequestURL(artist);
        var requestSettings = {
            success: function (data) {
                if (!data.error) {
                    artist.lastFm = data;
                    artist.lastFm.status = null;
                    self.currentArtist(ko.mapping.fromJS(artist));
                } else {
                    artist.lastFm.status = notFoundError;
                    self.currentArtist(ko.mapping.fromJS(artist));
                }
            },
            error: function (data) {
                artist.lastFm.status = apiErrorMessage;
                self.currentArtist(ko.mapping.fromJS(artist));
            },
            timeout: 11000,
        };
        $.ajax(requestURL, requestSettings);
    };

    function artistSuccess(concertIndex, artistIndex, data) {
        if (!data.error) {
            self.concerts()[concertIndex].artists[artistIndex].lastFm = data;
            self.concerts()[concertIndex].artists[artistIndex].lastFm.status = null;
        } else {
            self.concerts()[concertIndex].artists[artistIndex].lastFm.status = notFoundError;
        }
    }

    lastFm.requestAllArtistInfo = function (artistCount) {
        var requestSettings;
        var requestURL;

        for (var i = 0; i < self.concerts().length; i++) {
            for (var j = 0; j < self.concerts()[i].artists.length; j++) {
                requestURL = makeRequestURL(self.concerts()[i].artists[j]);
                artistCount(artistCount() + 1);
                (function (i, j) {
                    requestSettings = {
                        success: function (data, status) {
                                artistSuccess(i, j, data, status);
                        },
                        error: function () {
                            self.concerts()[i].artists[j].lastFm.status = apiErrorMessage;
                        },
                        complete: function (jqXHR, textStatus) {
                            artistCount(artistCount() - 1);
                            console.log(textStatus);
                            // TODO: keep track on timeouts/errors and add option to resubmit
                            // request
                            // if (textStatus !== "success") {
                            //    errors/timeouts++;
                            // } else if ()
                        },
                        timeout: 11000,
                    };
                    self.concerts()[i].artists[j].lastFm = {};
                    $.ajax(requestURL, requestSettings);
                }(i, j));
            }
        }
    };
    return lastFm;
});
