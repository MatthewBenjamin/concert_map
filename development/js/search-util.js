// search-concerts.js
define(function() {
    var searchUtil = {};

    doesStringContain = function(targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        return targetString.indexOf(searchTerm) > -1;
    };

    doesObjectListContain = function(targetList, searchTerm, property) {
        for (var i = 0; i < targetList.length; i++) {
            if (doesStringContain(targetList[i][property], searchTerm)) {
                return true;
            }
        }
    };

    searchUtil.searchArtists = function(artistsList, searchTerm) {
        if (doesObjectListContain(artistsList, searchTerm, 'name')) {
            return true;
        } else {
            for (var i = 0; i < artistsList.length; i++) {
                if (artistsList[i].lastfm && artistsList[i].lastfm.artist) {
                    //console.log(artistsList[i].lastfm.artist.tags.tag);
                    if (doesStringContain(artistsList[i].lastfm.artist.bio.content,searchTerm) ||
                        doesObjectListContain(artistsList[i].lastfm.artist.tags.tag, searchTerm, 'name')) {
                        return true;
                    }
                }
            }
        }
    };

    searchUtil.performSearch = function(searchTerm) {
        var eventResults = [];
        var currentEvent;
        for (var i = 0; i < self.concerts().length; i++) {
            currentEvent = self.concerts()[i];
            if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                doesStringContain(currentEvent.venue.city, searchTerm) ||
                searchUtil.searchArtists(currentEvent.artists, searchTerm)) {

                    eventResults.push(currentEvent);
            }
        }
        return eventResults;
    };

    searchUtil.resetMarkerIcons = function(markers) {
        markers.forEach(function(m) {
            m.setIcon('images/red.png');
        })
    };

    searchUtil.updateMarkerIcon = function(searchedVenues, allVenues, markers) {
        markers.forEach(function(m) {
            if (searchedVenues.indexOf(allVenues[m.venueIndex]) !== -1) {
                m.setIcon('images/blue.png');
            } else {
                m.setIcon('images/clear.png');
            }
        });
    };

    return searchUtil;
});