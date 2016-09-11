// map-markers.js
define(['gmap', 'infoWindow'], function (gmap, infoWindow) {
    var mapMarkers = {};

    mapMarkers.clearMarkers = function (markers) {
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
    };

    mapMarkers.createMarkers = function (concertVenuesCallBack, currentVenueCallBack) {
        var markers = [];
        var venues = concertVenuesCallBack();
        var marker;

        for (var i = 0; i < venues.length; i++) {
            var latLng = new google.maps.LatLng(
                            venues[i].latitude,
                            venues[i].longitude);

            marker = new google.maps.Marker({
                position: latLng,
                title: venues[i].name,
                icon: 'images/red.png',
                map: gmap,
                venueIndex: i,
            });

            google.maps.event.addListener(marker, 'mouseup', function () {
                var m = this;
                currentVenueCallBack(concertVenuesCallBack()[m.venueIndex]);
                infoWindow.window.open(gmap, m);
                m.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    m.setAnimation(google.maps.Animation.null);
                }, 700);
            });

            markers.push(marker);
        }
        return markers;
    };
    return mapMarkers;
});
