// Custom Handler for Google Map
var mapCenter = {};

ko.bindingHandlers.googlemap = {
    map: null,
    createMap: function(element, latitude, longitude) {
        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(latitude, longitude)
        };
        ko.bindingHandlers.googlemap.map = new google.maps.Map(element, mapOptions);
    },
    createMarkers: function(mapMarkers) {
        var infoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < mapMarkers.length; i++){
            console.log(mapMarkers[i]);
            var latLng = new google.maps.LatLng(
                            mapMarkers[i].venue.location['geo:point']['geo:lat'],
                            mapMarkers[i].venue.location['geo:point']['geo:long']);

            var marker = new google.maps.Marker({
                position: latLng,
                title: mapMarkers[i].title,
                content: mapMarkers[i].title,       // TODO: make function(outside of viewmodel) that sets HTML content
                map: ko.bindingHandlers.googlemap.map
            });
            var infoWindow = new google.maps.InfoWindow({
                content: marker.content
            });
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(this.content);
                infoWindow.open(ko.bindingHandlers.googlemap.map, this);
            });
        }
    },
    getLastFmEvents: function(latitude, longitude) {
        console.log(latitude, longitude);
        var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&' +
        'lat=' + latitude + '&' +
        'long=' + longitude + '&' +
        'limit=20&' +               // TODO: fine tune OR make editable or self correcting
        'api_key=d824cbbb7759624aa8b3621a627b70b8' +
        '&format=json'

        var requestSettings = {
            success: function(data, status, jqXHR) {
                //console.log(data.events.event);
                ko.bindingHandlers.googlemap.createMarkers(data.events.event);
                // TODO:
                // interate through data
                // create mapMarkers
                // create list items
            }
        }
        $.ajax(requestURL,requestSettings)
    },
    init: function (element, valueAccessor) {
        var value = valueAccessor();

        var geocoder = new google.maps.Geocoder();

        geocoder.geocode( { 'address': value.currentAddress }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0]['geometry']['location']['A'];
                    var longitude = results[0]['geometry']['location']['F'];
                    ko.bindingHandlers.googlemap.createMap(element, latitude, longitude);
                    ko.bindingHandlers.googlemap.getLastFmEvents(latitude, longitude);
                    //ko.bindingHandlers.googlemap.createMarkers(value.mapMarkers());
                    //mapCenter.latitude = latitude;
                    //mapCenter.longitude = longitude;
            } else {
                alert('Geocoder error because: ' + status);
            }
        });
    }
};

var ViewModel =  function () {
    var self = this;

    //self.mapMarkers = ko.observableArray(mapMarkers);

    var defaultLocation = 'Austin, TX';
    self.currentAddress = ko.computed(function(address) {
        address = address || defaultLocation;
        return address;
    });
    //self.mapCenter = ko.observable(mapCenter);
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
    function getLastFmEvents(latitude, longitude) {
        console.log(latitude, longitude);
        var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&' +
        'lat=' + latitude + '&' +
        'long=' + longitude + '&' +
        'limit=10&' +               // TODO: fine tune OR make editable or self correcting
        'api_key=d824cbbb7759624aa8b3621a627b70b8' +
        '&format=json'

        var requestSettings = {
            success: function(data, status, jqXHR) {
                // TODO:
                // interate through data
                // create mapMarkers
                // create list items
            }
        }
        $.ajax(requestURL,requestSettings);
    };
    //getLastFmEvents(self.mapCenter().latitude, self.mapCenter().longitude);
    //self.getLastFmEvents(self.mapCenter().centerLat, self.mapCenter().centerLon);
};

ko.applyBindings(ViewModel);