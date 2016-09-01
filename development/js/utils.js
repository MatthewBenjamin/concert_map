// utils.js
define(function() {
    var utils = {};

    utils.findVenue = function(venueId, venues) {
        for (var i = 0; i < venues.length; i++) {
            if (venueId === venues[i].id) {
                return i;
            }
        }
        return -1;
    };

    utils.buildVenues = function(events, allVenues) {
        //console.log('building those venues!');
        var venues = [];
        if (typeof(allVenues) === 'undefined') { var allVenues = venues; }
        var venueIndex;
        var venue;
        // TODO: separate out functions inside for loop?
        for (var i = 0; i < events.length; i++) {
            venueIndex = utils.findVenue(events[i].venue.id, venues);
            venue = events[i].venue;
            if (venueIndex === -1) {
                // venue not yet in list
                venue.concerts = [];
                venue.concerts.push(events[i]);
                venues.push(venue);
                events[i].venueIndex = allVenues.indexOf(venue);
            } else {
                // venue already in list
                events[i].venueIndex = venueIndex;
                venues[venueIndex].concerts.push(events[i]);
            }

        }
        return venues;
    };

    // Update mapCenter with new latLng when currentAddress changes & save in localStorage
    utils.storeLocation = function(address, latitude, longitude) {
        if (localStorage) {
            localStorage.setItem('lastAddress', address);
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
        }
    };

    return utils;
});
