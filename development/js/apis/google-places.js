// google-places.js
define(['jquery', 'gmap', 'venueApiUtils'], function($, gmap, venueApiUtils) {
    var googlePlaces = {};

    googlePlaces.error = 'Sorry, detailed venue information could not be loaded.';

    function getPlacesDetails(placeId, venue, venueDetails, venueIndex) {
        var placesService = new google.maps.places.PlacesService(gmap);
        var request = {
            placeId: placeId
        };
        placesService.getDetails(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK &&
                venueApiUtils.checkCurrentVenue(venueIndex)) {
                var parsedResults = venueApiUtils.parseResults(results, "Google Places");
                venue().detailedInfo = {
                    data: parsedResults,
                    status: null
                };
                venue(venue());
            } else {
                venueApiUtils.showNotFoundStatusIfNeeded(
                    false, venueDetails, googlePlaces.error
                );
            }

        });
    }

    function makeRequestSettings(venue) {
        var latLng = new google.maps.LatLng(venue().latitude,venue().longitude);
        return {
            location: latLng,
            query: venue().name,
            radius: '1'
        };
    }

    googlePlaces.requestVenueInfo = function(venue, venueDetails, venueIndex) {
        var placesService = new google.maps.places.PlacesService(gmap);
        var request = makeRequestSettings(venue);
        placesService.textSearch(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                getPlacesDetails(results[0].place_id, venue, venueDetails, venueIndex);
            } else {
                venueApiUtils.showNotFoundStatusIfNeeded(
                    false, venueDetails, googlePlaces.error
                );
            }
        });
    };

    return googlePlaces;
})