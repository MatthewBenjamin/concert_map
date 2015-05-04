// Custom Handler for Google Map
ko.bindingHandlers.googlemap = {
    map: null,
    createMap: function(element, latitude, longitude) {
        var mapOptions = {
            zoom: 12,
            center: new google.maps.LatLng(latitude, longitude)
        };
        ko.bindingHandlers.googlemap.map = new google.maps.Map(element, mapOptions);
    },
    createMarkers: function(mapMarkers) {
        for (var i = 0; i < mapMarkers.length; i++){
            var latLng = new google.maps.LatLng(
                            mapMarkers[i].latitude,
                            mapMarkers[i].longitude);
            var marker = new google.maps.Marker({
                position: latLng,
                map: ko.bindingHandlers.googlemap.map
            });
        }
    },
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode( { 'address': value.currentAddress }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0]['geometry']['location']['A'];
                    var longitude = results[0]['geometry']['location']['F'];
                    ko.bindingHandlers.googlemap.createMap(element, latitude, longitude);
                    ko.bindingHandlers.googlemap.createMarkers(value.mapMarkers());
            } else {
                alert('Geocoder error because: ' + status);
            }
        });
    }
};

var mapMarkers = [
    {name: "Seoul", latitude: 37.5667 , longitude: 126.9667},
    {name: "Gangnam", latitude: 37.4967, longitude: 127.0275}
];

var ViewModel =  function () {
    var self = this;

    self.mapMarkers = ko.observableArray(mapMarkers);

    var defaultLocation = 'Seoul, South Korea';
    self.currentAddress = ko.computed(function(address) {
        address = address || defaultLocation;
        return address;
    });

/*
    self.init = function() {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': self.defaultLocation }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log('LAT: ' + results[0]['geometry']['location']['A']);
                console.log('LNG: ' + results[0]['geometry']['location']['F']);
            } else {
                alert('Geocoder error because: ' + status);
            }
        });
    }
*/

    self.getLastFmEvents = function(latitude, longitude) {
        var result;
        var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&' +
        'lat=' + latitude + '&' +
        'long=' + longitude + '&' +
        'limit=10&' +               // TODO: fine tune OR make editable or self correcting
        'api_key=d824cbbb7759624aa8b3621a627b70b8' +
        '&format=json'

        var requestSettings = {
            success: function(data, status, jqXHR) {
                /*
                // TODO: pass data to function to create markers/list items
                var lastFmEvents = data.events.event
                //console.log(data);
                for (var i = 0; i < lastFmEvents.length; i++) {
                    //console.log(lastFmEvents[i]);
                }
                */
            }
        }
        $.ajax(requestURL,requestSettings);
    };

    //self.getLastFmEvents(self.mapCenter().centerLat, self.mapCenter().centerLon);
};

ko.applyBindings(ViewModel);