// four-square.js
define(['jquery', 'knockout', 'venueApiUtils'], function($, ko, venueApiUtils) {
    var fourSquare = {};

    fourSquare.error = 'Four Square data cannot be found. Loading Google ' +
        'Places data instead...';
    fourSquare.search = 'Loading Four Square data for venue...';

    function getById(id, venue, venueDetails, venueIndex) {
        var foundVenue = false;
        var requestUrl = 'https://api.foursquare.com/v2/venues/' +
        id + '?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20160105';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                foundVenue = true;
                if (venueApiUtils.checkCurrentVenue(venueIndex)) {
                    var parsedResults = venueApiUtils.parseResults(
                        data.response.venue,
                        "Four Square"
                    )
                    venue().detailedInfo = {
                        data: parsedResults,
                        status: null
                    };
                    venue(venue());
                }
            },
            complete: function(jqXHR, textStatus) {
                venueApiUtils.showNotFoundStatusIfNeeded(
                    foundVenue, venueDetails, fourSquare.error
                );
            },
            timeout: 8000
        };
        $.ajax(requestUrl, requestSettings);
    }

    function makeRequestUrl(venue) {
        var lat = venue().latitude;
        var lon = venue().longitude;
        var requestUrl = 'https://api.foursquare.com/v2/venues/search?' +
            'client_id=HEC4M2QKHJVGW5L5TPIBLBWBFJBBFSCIFFZDNZSGD2G5UGTI&' +
            'client_secret=AJKA10FIBJE3CUKUBYYYOGZ0BU2XNGMXNGUA43LAI0PQT3ZD&' +
            'v=20160105&' +
            'm=foursquare&' +
            'll=' + lat + ',' + lon + '&' +
            'query=' + venue().name + '&' +
            'intent=match';

        return requestUrl;
    }

    fourSquare.requestVenueInfo = function(venue, venueDetails, venueIndex) {
        var foundVenue = false;
        var requestUrl = makeRequestUrl(venue);
        var requestSettings = {
            success: function(data, status, jqXHR) {
                 if (data.response.venues.length > 0) {
                    foundVenue = true;
                    getById(data.response.venues[0].id, venue, venueDetails, venueIndex);
                 }
            },
            complete: function(jqXHR, textStatus) {
                venueApiUtils.showNotFoundStatusIfNeeded(foundVenue, venueDetails, fourSquare.error)
            },
            timeout: 8000
        };

        // TODO: incorporate helper function? similar to status update after failure
        venueDetails({
            status: fourSquare.search,
            data: null
        });

        $.ajax(requestUrl, requestSettings);
    };

    return fourSquare;
});