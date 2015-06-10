/*** TODOs ***

-organize code and comments

-search display
    when search box is selected (cursor is inside form for typing) display search field selection
    (i.e. all, artist, tags, venue, street/address, etc.)
-list view
    -can view by event/artist, venue, tags
    -how to handle multiple events by same artist? (at same venue, different venues?) -->or just handle with different
        list views
-event info display (make html content)
    -infoWindow
    -list view
    -2 buttons to add:
        -show on map(in list events) : pan to map marker and open infoWindow
        -more info(in markers and list view): open info window style pop up(but not actually an info window)
            -large box, displays lots of additional info, including from other APIs
-handle api (and other errors?) gracefully
-event refresh button or auto-refresh when map moves a certain distance
-instead of limiting results from last.fm, base request on map bounds (within reason?)
-search autocomplete (display possible matches underneath (would need an additional function))
-build markers based off of venue, not concerts, infoWindow shows all concerts
    -will need to make self.lastFmVenues = ko.computed return array
    -how to link click in list to marker click event?
*/

// Google map
var map;

// Custom Handler for Google Map
ko.bindingHandlers.googlemap = {
    // create map
    init: function (element) {
        var mapOptions = {
            zoom: 13,
        };
        map = new google.maps.Map(element, mapOptions);
    },
    // update map center when ViewModel.mapCenter value changes
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        var latitude = value.mapCenter.latitude;
        var longitude = value.mapCenter.longitude;
        map.setCenter( { lat: latitude, lng: longitude } );
    }
};

var ViewModel =  function () {
    var self = this;
    self.defaultLocation = 'Austin, TX';
    self.currentAddress = ko.observable(self.defaultLocation);
    self.mapCenter = ko.observable( { latitude: 30.267153, longitude: -97.74306079999997 } );

    // Last.fm API results
    self.lastFmEvents = ko.observableArray();

    // searched for Last.fm results
    self.filteredList = ko.observableArray();
    self.searchInput = ko.observable();

    // Activates a map marker's click event when same event is clicked on in the list view
    self.selectMarker = function(event) {
        var eventIndex = self.lastFmEvents().indexOf(event);
        google.maps.event.trigger(self.mapMarkers()[eventIndex], 'click');
    };

    // Update mapCenter with new latLng when currentAddress changes
    var geocoder = new google.maps.Geocoder();
    self.getMapGeocode = ko.computed(function() {
        geocoder.geocode( { 'address': self.currentAddress() }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    var latitude = results[0]['geometry']['location']['A'];
                    var longitude = results[0]['geometry']['location']['F'];
                    var mapCenter = {
                        latitude: latitude,
                        longitude: longitude
                    };
                    if (latitude != self.mapCenter().latitude && longitude != self.mapCenter().longitude) {
                        self.mapCenter(mapCenter);
                    } else {
                        console.log('init');
                    }
            } else {
                alert('Geocoder error because: ' + status);
            }
        })
    });

    // Get info from Last.fm API when mapCenter updates
    // TODO: add error handling in case of no results and/or failure
    self.getLastFmEvents = ko.computed(function() {
        if (self.mapCenter().latitude && self.mapCenter().longitude) {
            var latitude = self.mapCenter().latitude;
            var longitude = self.mapCenter().longitude;
            var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=geo.getevents&' +
                'lat=' + latitude + '&' +
                'long=' + longitude + '&' +
                'limit=20&' +               // TODO: fine tune OR make editable or self correcting
                'api_key=d824cbbb7759624aa8b3621a627b70b8' +
                '&format=json'
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    self.mapMarkers().forEach(function (marker) {
                        marker.setMap(null);
                    });
                    self.lastFmEvents(data.events.event);
                }
            };
            $.ajax(requestURL,requestSettings)
        }
    });

    // Create google map markers from last.fm API data
    self.mapMarkers = ko.computed(function() {
        var markers = []
        var infoWindow = new google.maps.InfoWindow();
        var events = self.lastFmEvents();
        console.log(events);
        for (var i = 0; i < events.length; i++){
            var latLng = new google.maps.LatLng(
                            events[i].venue.location['geo:point']['geo:lat'],
                            events[i].venue.location['geo:point']['geo:long']);

            var marker = new google.maps.Marker({
                position: latLng,
                title: events[i].title,
                content: events[i].title,       // TODO: make function(outside of viewmodel) that sets HTML content
                icon: 'images/red.png',
                map: map
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(this.content);
                infoWindow.open(map, this);
            });
            markers.push(marker);

        }
        return markers;
    });

    // Update marker icon based on search results
    self.mapMarkersSearch = ko.computed(function() {
        var events = self.lastFmEvents();
        for (var i = 0; i < events.length; i++) {
            var searchedFor = self.filteredList().indexOf(events[i]) > -1;
            if (self.filteredList() == self.lastFmEvents()) {
                self.mapMarkers()[i].setIcon('images/red.png');
            } else if (searchedFor) {
                self.mapMarkers()[i].setIcon('images/blue.png');
            } else {
                self.mapMarkers()[i].setIcon('images/clear.png');
            }
        }
    });

    /*** SEARCH FUNCTIONS ***/
    self.doesStringContain = function (targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        return targetString.indexOf(searchTerm) > -1;
    };
    self.doesListContain = function(targetList, searchTerm) {
        for (var i = 0; i < targetList.length; i++) {
            if (self.doesStringContain(targetList[i], searchTerm)) {
                return true;
            }
        }
    };
    // Check if last.fm data has 'tags' field. If so, search them
    self.searchTags = function(currentEvent, searchTerm) {
        if (currentEvent.tags) {
            return self.doesListContain(currentEvent.tags.tag, searchTerm)
        }
    };
    // Search last.fm data
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