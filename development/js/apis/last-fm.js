// last-fm.js
define(['jquery', 'knockout'], function($, ko) {
    var lastFm = {};

    var apiErrorMessage = "Sorry, additional information from Last.fm " +
        "could not be loaded.";

    function getArtistSearch(artist) {
        if (artist.mbid) {
            return 'mbid=' + artist.mbid;
        } else {
            return 'artist=' + artist.name;
        }
    }

    lastFm.makeRequestURL = function(artist) {
        //console.log('make request url');
        var artistSearch = getArtistSearch(ko.mapping.toJS(artist));
        var lastFmRequestURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&' +
            'api_key=d824cbbb7759624aa8b3621a627b70b8' +
            '&format=json&' + artistSearch;
        return lastFmRequestURL;
    }

    lastFm.requestArtistInfo = function(artist) {
        var requestURL = lastFm.makeRequestURL(artist);
        var requestSettings = {
            success: function(data, status, jqXHR) {
                if (!data.error) {
                    artist.lastfm = data;
                    artist.lastfm.status = null;
                    self.currentArtist(ko.mapping.fromJS(artist));
                } else {
                    artist.lastfm.status = apiErrorMessage;
                    self.currentArtist(ko.mapping.fromJS(artist));
                }
            },
            error: function(data, status, jqXHR) {
                artist.lastfm.status = apiErrorMessage;
                self.currentArtist(ko.mapping.fromJS(artist));
            },
            timeout: 11000
        };
        $.ajax(requestURL, requestSettings);
    };

    function artistSuccess(concertIndex, artistIndex, data) {
        //console.log(concertIndex);
        if (!data.error) {
            self.concerts()[concertIndex].artists[artistIndex].lastfm = data;
            self.concerts()[concertIndex].artists[artistIndex].lastfm.status = null;
        } else {
            // TODO: use different error msg when not found vs. error?
            //console.log("NOT FOUND")
            self.concerts()[concertIndex].artists[artistIndex].lastfm.status = apiErrorMessage;
        }
    }

    lastFm.requestAllArtistInfo = function(artistCount) {
        var requestSettings;
        var artistSearch;
        var requestURL;

        for (var i = 0; i < self.concerts().length; i++) {
            for (var j = 0; j < self.concerts()[i].artists.length; j++) {
                requestURL = lastFm.makeRequestURL(self.concerts()[i].artists[j]);
                artistCount(artistCount() + 1);
                (function(i,j) {
                    requestSettings = {
                        success: function(data, status, jqXHR) {
                                artistSuccess(i, j, data, status);
                        },
                        error: function(data, status, jqXHR) {
                            //console.log('last.fm error');
                            self.concerts()[i].artists[j].lastfm.status = apiErrorMessage;
                        },
                        complete: function(jqXHR, textStatus) {
                            artistCount(artistCount() - 1);
                            console.log(textStatus);
                            // TODO: keep track on timeouts/errors and add option to resubmit
                            // request
                            //if (textStatus == "success") {
                            //    errors/timeouts++;
                            //} else if ()
                        },
                        timeout: 11000
                    };
                    self.concerts()[i].artists[j].lastfm = {};
                    $.ajax(requestURL, requestSettings);
                })(i,j);
            }
        }
    };
    return lastFm;
});