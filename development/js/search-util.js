// search-concerts.js
define(function () {
    var searchUtil = {};

    function doesStringContain(targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        return targetString.indexOf(searchTerm) > -1;
    }

    function doesObjectListContain(targetList, searchTerm, property) {
        for (var i = 0; i < targetList.length; i++) {
            if (doesStringContain(targetList[i][property], searchTerm)) {
                return true;
            }
        }
        return null;
    }

    searchUtil.searchArtists = function (artistsList, searchTerm) {
        if (doesObjectListContain(artistsList, searchTerm, 'name')) {
            return true;
        }
        for (var i = 0; i < artistsList.length; i++) {
            if (artistsList[i].lastFm && artistsList[i].lastFm.artist) {
                if (doesStringContain(artistsList[i].lastFm.artist.bio.content, searchTerm) ||
                    doesObjectListContain(
                        artistsList[i].lastFm.artist.tags.tag, searchTerm, 'name')) {
                    return true;
                }
            }
        }
        return null;
    };

    searchUtil.performSearch = function (searchTerm, concerts) {
        var eventResults = [];
        var currentEvent;
        for (var i = 0; i < concerts.length; i++) {
            currentEvent = concerts[i];
            if (doesStringContain(currentEvent.venue.name, searchTerm) ||
                doesStringContain(currentEvent.venue.city, searchTerm) ||
                searchUtil.searchArtists(currentEvent.artists, searchTerm)) {
                    eventResults.push(currentEvent);
            }
        }
        return eventResults;
    };

    searchUtil.resetMarkerIcons = function (markers) {
        markers.forEach(function (m) {
            m.setIcon('images/red.png');
        });
    };

    searchUtil.updateMarkerIcon = function (searchedVenues, allVenues, markers) {
        markers.forEach(function (m) {
            if (searchedVenues.indexOf(allVenues[m.venueIndex]) !== -1) {
                m.setIcon('images/blue.png');
            } else {
                m.setIcon('images/clear.png');
            }
        });
    };

    return searchUtil;
});
