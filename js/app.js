// Custom Handler for Google Map
var map;
// TODO: implement map markers as computed function based on filteredList, otherwise mapMarkers and created but never deleted
var googleMapMarkers = []
ko.bindingHandlers.googlemap = {
    //map: null,
    createMarkers: function(mapMarkers) {
        console.log(mapMarkers);
        var infoWindow = new google.maps.InfoWindow();
        for (var i = 0; i < mapMarkers.length; i++){
            //console.log(mapMarkers[i].venue);
            var latLng = new google.maps.LatLng(
                            mapMarkers[i].venue.location['geo:point']['geo:lat'],
                            mapMarkers[i].venue.location['geo:point']['geo:long']);

            // TODO: save these markers to an array / observable array
            var marker = new google.maps.Marker({
                position: latLng,
                title: mapMarkers[i].title,
                content: mapMarkers[i].title,       // TODO: make function(outside of viewmodel) that sets HTML content
                map: map
            });
            /*
            var infoWindow = new google.maps.InfoWindow({
                //content: marker.content
            }); */
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(this.content);
                infoWindow.open(map, this);
            });
            googleMapMarkers.push(marker);
        }
    },
    init: function (element, valueAccessor) {
        var mapOptions = {
            zoom: 13,
            //center: { lat: valueAccessor.l}
        };
        map = new google.maps.Map(element, mapOptions);
    },
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        console.log(value);
        var latitude = value.mapCenter.latitude;
        var longitude = value.mapCenter.longitude;
        console.log(latitude);
        map.setCenter( { lat: latitude, lng: longitude } );
        ko.bindingHandlers.googlemap.createMarkers(value.lastFmEvents);
    }
};

var ViewModel =  function () {
    var self = this;
    self.defaultLocation = 'Austin, TX';
    self.currentAddress = ko.observable(self.defaultLocation);
    self.mapCenter = ko.observable( { latitude: 30.267153, longitude: -97.74306079999997 } );
    self.lastFmEvents = ko.observableArray();
    // TODO: search function
    //      can search through all aspects of an event (artists, venue, keywords, genre, etc)
    //      or can select a partcular aspect to search for
    //      when search box is selected (cursor is inside form for typing) display search field selection
    self.selectMarker = function(event) {
        // TODO: 2 buttons
        //  show on map --> pan to marker and infoWindow (trigger click event)
        //  more info --> pop up a new box (on top of everything with z-index) with lots of info
        //              about artists, venue, tickets, etc
        //  can close (or toggle by clicking list item again), or select a new list item
        for (var i = 0; i < googleMapMarkers.length; i++) {
            if (event.title === googleMapMarkers[i].title){
                //console.log('event name :', event.title);
                //console.log('marker name :', googleMapMarkers[i].title);
                google.maps.event.trigger(googleMapMarkers[i], 'click');
            }
        }
    }

    var geocoder = new google.maps.Geocoder();
    self.getMapGeocode = ko.computed(function() {
        geocoder.geocode( { 'address': self.currentAddress() }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    //console.log(results);
                    var latitude = results[0]['geometry']['location']['A'];
                    var longitude = results[0]['geometry']['location']['F'];
                    var mapCenter = {
                        latitude: latitude,
                        longitude: longitude
                    };
                    if (latitude != self.mapCenter().latitude && longitude != self.mapCenter().longitude) {
                        //console.log('Old map latlng: ', self.mapCenter());
                        //console.log('New map latlng: ', mapCenter);
                        self.mapCenter(mapCenter);
                    } else {
                        console.log('init');
                    }
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
    // TODO: observable based on search bar
    // observable calls self.searchLastFmEvents and puts results into a filtered array (or filtered array is like current cat...)

    self.filteredList = ko.observableArray([]);

    self.searchInput = ko.observable('search here');

    self.doesStringContain = function (targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        //console.log(targetString);
        //console.log(targetString.indexOf(searchTerm) > -1);
        return targetString.indexOf(searchTerm) > -1;
    };
    self.doesListContain = function(targetList, searchTerm) {
        for (var i = 0; i < targetList.length; i++) {
            if (self.doesStringContain(targetList[i], searchTerm)) {
                return true;
            }
        }
    };
    self.searchTags = function(currentEvent, searchTerm) {
        if (currentEvent.tags) {
            return self.doesListContain(currentEvent.tags.tag, searchTerm)
        }
    }
    self.searchLastFmEvents = ko.computed(function() {
        if (self.searchInput()) {
            var searchTerm = self.searchInput().toLowerCase();
            var searchResults = [];
            for (var i = 0; i < self.lastFmEvents().length; i++) {
                var currentEvent = self.lastFmEvents()[i];
                if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                    doesStringContain(currentEvent.venue.location.street, searchTerm) ||
                    doesStringContain(currentEvent.title, searchTerm) ||
                    doesStringContain(currentEvent.description, searchTerm) ||
                    doesListContain(currentEvent.artists.artist, searchTerm) ||
                    searchTags(currentEvent, searchTerm)) {
                        searchResults.push(currentEvent);
                }
            }
            // TODO: add "NO RESULTS" output -OR- add this to list render?
            self.filteredList(searchResults);
        } else {
            self.filteredList(self.lastFmEvents())
        }
    });
};

ko.applyBindings(ViewModel);