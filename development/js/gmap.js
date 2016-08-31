// map-init.js
define(['settings', 'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI&libraries=places'],
        function(settings){

    var mapCanvas = document.getElementsByClassName("map-canvas")[0];
    var mapOptions = {
        center: {
            lat: settings.initLatlng.latitude,
            lng: settings.initLatlng.longitude
        },
        zoom: 13
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);

    // Google Map Error Handling
    setTimeout(function() {
        if (!map) {
            $('.map-error').append('Google Map could not be loaded');
        }
    }, 8000);

    return map;
});