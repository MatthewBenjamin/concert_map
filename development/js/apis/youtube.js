// youtube.js
define(['jquery', 'knockout', 'utils'], function($, ko, utils) {
    var youtube = {};

    // remove spaces from string
    function searchableName(artistName) {
        artistName = artistName.replace(/\s+/g, '+');
        return artistName;
    }

    function parseResults(data) {
        var parsedData = [];
        var baseURL = 'https://www.youtube.com/';
        var resultURL;
        var title;

        for (var i = 0; i < data.length; i ++) {
            title = data[i].snippet.title;

            if (data[i].id.videoId) {
                resultURL = 'watch?v=' + data[i].id.videoId;
            } else if (data[i].id.channelId) {
                resultURL = 'channel/' + data[i].id.channelId;
                title += " (channel)";
            }

            parsedData.push({ url: baseURL + resultURL, title: title });
        }

        return parsedData;
    }
    youtube.requestArtistVideos = function(artist) {
        var artistName = searchableName(artist.name());
        var requestURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&' +
            'q=' + artistName +
            '&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI';
        var requestSettings = {
            success: function(data, status, jqXHR) {;
                var results = parseResults(data.items);
                artist.youtube = results;
                artist.youtube.status = null;
                self.currentArtist(ko.mapping.fromJS(artist));
            },
            error: function(textStatus) {
                //console.log(textStatus);
                artist.youtube.status = 'Youtube search results could not be loaded.';
                self.currentArtist(ko.mapping.fromJS(artist));
            },
            timeout: 8000
        };

        $.ajax(requestURL, requestSettings);
    };

    return youtube;
})