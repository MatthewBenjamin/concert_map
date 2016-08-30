// utils.js
define([], function() {
    var utils = {};

    utils.findVenue = function(venueId, venues) {
        for (var i = 0; i < venues.length; i++) {
            if (venueId === venues[i].id) {
                return i;
            }
        }
        return -1;
    }
    utils.buildVenues = function(events) {
        console.log('building those venues!');
        var venues = [];
        var venueIndex;
        var venue;
        for (var i = 0; i < events.length; i++) {
            venueIndex = utils.findVenue(events[i].venue.id, venues);
            venue = events[i].venue;
            if (venueIndex === -1) {
                // venue not yet in list
                venue.concerts = [];
                venue.concerts.push(events[i]);
                venues.push(venue);
                events[i].venueIndex = venues.indexOf(venue);
            } else {
                // venue already in list
                events[i].venueIndex = venueIndex;
                venues[venueIndex].concerts.push(events[i]);
            }

        }
        //console.log(venues);
        return venues;
    }

    return utils;
})