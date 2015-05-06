// Custom Handler for Google Map
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
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        //console.log(value.mapCenter);
        var latitude = value.mapCenter.latitude;
        var longitude = value.mapCenter.longitude;
        ko.bindingHandlers.googlemap.createMap(element, latitude, longitude);
        //console.log(value.lastFmEvents);
        ko.bindingHandlers.googlemap.createMarkers(value.lastFmEvents);
        //console.log(value.lastFmEvents)
        //ko.bindingHandlers.googlemap.getLastFmEvents(latitude, longitude);
        /*
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
*/
    }
};

var ViewModel =  function () {
    var self = this;

    var defaultLocation = 'Austin, TX';
    var defaultLatLong = {
        latitude: 30.267153,
        longitude: -97.74306079999997
    };
    self.currentAddress = ko.computed(function(address) {
        address = address || defaultLocation;
        return address;
    });
    self.mapCenter = ko.computed(function(latlong) {
        latlong = latlong || defaultLatLong;
        return latlong;
    });
    self.lastFmEvents = ko.observableArray();

    self.getLastFmEvents = ko.computed(function() {
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
                //console.log(self.lastFmEvents());
            }
        }
        $.ajax(requestURL,requestSettings)
    });
};

ko.applyBindings(ViewModel);