// Custom Handler for Google Map
ko.bindingHandlers.googlemap = {
    map: null,
    createMarkers: function(mapMarkers) {
        console.log(mapMarkers);
        var infoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < mapMarkers.length; i++){
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
    init: function (element) {
        var mapOptions = {
            zoom: 13,
        };
        ko.bindingHandlers.googlemap.map = new google.maps.Map(element, mapOptions);
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        var latitude = value.mapCenter.latitude;
        var longitude = value.mapCenter.longitude;
        ko.bindingHandlers.googlemap.map.setCenter( { lat: latitude, lng: longitude } );
        ko.bindingHandlers.googlemap.createMarkers(value.lastFmEvents);
    }
};

//var googleMap = ko.bindingHandlers.googlemap;

var ViewModel =  function () {
    var self = this;
    self.defaultLocation = 'Austin, TX';
    self.currentAddress = ko.observable(self.defaultLocation);
    self.mapCenter = ko.observable( { latitude: null, longitude: null } );
    self.lastFmEvents = ko.observableArray();

    var geocoder = new google.maps.Geocoder();
    self.getMapGeocode = ko.computed(function() {
        geocoder.geocode( { 'address': self.currentAddress() }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0]['geometry']['location']['j'];
                    var longitude = results[0]['geometry']['location']['C'];
                    var mapCenter = {
                        latitude: latitude,
                        longitude: longitude
                    };
                    self.mapCenter(mapCenter);
            } else {
                alert('Geocoder error because: ' + status);
            }
        })
    });

    self.getLastFmEvents = ko.computed(function() {
        if (self.mapCenter().latitude && self.mapCenter().longitude) {
            var latitude = self.mapCenter().latitude;
            var longitude = self.mapCenter().longitude;
            var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&' +
                'lat=' + latitude + '&' +
                'long=' + longitude + '&' +
                'limit=10&' +               // TODO: fine tune OR make editable or self correcting
                'api_key=d824cbbb7759624aa8b3621a627b70b8' +
                '&format=json'
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    self.lastFmEvents(data.events.event);
                }
            };
            $.ajax(requestURL,requestSettings)
        }
    });
};

ko.applyBindings(ViewModel);