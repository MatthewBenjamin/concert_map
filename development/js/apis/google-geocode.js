// google-geocode.js
define(['settings', 'utils', 'infoWindow'], function (settings, utils, infoWindow) {
    var geocode = {};
    var geocoder = new google.maps.Geocoder();

    geocode.requestGeocode = function (address) {
        var geocodeTimeoutError = setTimeout(function () {
            self.geocoderStatus('Location coordinates could not be loaded.');
        }, 8000);

        geocoder.geocode({ address: address }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                clearTimeout(geocodeTimeoutError);
                self.geocoderStatus(null);
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();
                var mapCenter = {
                    latitude: latitude,
                    longitude: longitude,
                };
                if (mapCenter !== self.mapCenter()) {
                    infoWindow.resetContentForNewLocation();
                    self.mapCenter(mapCenter);
                    utils.storeLocation(address, latitude, longitude);

                    // update init location so user can change back to original location
                    settings.initLatlng = { latitude: latitude, longitude: longitude };
                    settings.initAddress = address;
                }
            } else {
                self.geocoderStatus('Geocoder error because: ' + status);
            }
        });
    };
    return geocode;
});
