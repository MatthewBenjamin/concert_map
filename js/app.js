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
var infoWindowView = function(venueObject){
    // TODO: instead of creating strings, create nodes/HTML objects with JS/jQuery?
    //ko.mapping.toJS(venueObject);
    var venueName = '<a href=' + venueObject.website + '>' + venueObject.name + '</a>';

    // include this in venue more info window?
    //var venueAddress = venueObject.location.street;
    var htmlContent = venueName;

    var concertContainer = '<hr><div class="concertWindow">#data#</div>';
    var concertTitle = '<p class="infoConcertTitle">#title#</p>';
    var concertDate = '<p class="infoConcertDate">#date#</p>';

    var concerts = venueObject.concerts;

    for (var i = 0; i < concerts.length; i++) {
        var title = concertTitle.replace('#title#', concerts[i].title);
        var date = concertDate.replace('#date#', concerts[i].startDate.substring(0, 11));
        var titleDate = title + date;
        var concertInfo = concertContainer.replace('#data#', titleDate);
        htmlContent = htmlContent + concertInfo;
    }

    return htmlContent;
};

var ViewModel =  function () {
    var self = this;

    // map location
    var defaultLocation = 'Austin, TX';
    self.currentAddress = ko.observable(defaultLocation);
    self.mapCenter = ko.observable( { latitude: 30.267153, longitude: -97.74306079999997 } );

    // toggle drawer menu
    self.displayMobile = ko.observable(false);
    self.closeMobile = function() {
        self.displayMobile(false);
    };
    self.openMobile = function() {
        self.displayMobile(true);
    };

    // toggle large screen menu
    self.displayBigMenu = ko.observable(true);
    self.toggleBigMenu = function() {
        if (self.displayBigMenu()) {
            self.displayBigMenu(false);
        } else {
            self.displayBigMenu(true);
        }
    };

    // Last.fm event API results
    self.lastFmEvents = ko.observableArray();
    //self.mappedEvents = ko.mapping.fromJS(self.lastFmEvents);

    // search last fm results
    self.filteredList = ko.observableArray();
    self.searchInput = ko.observable();

    // display detailed info for an event, venue, or artist
    self.currentEvent = ko.observable();
    self.currentVenue = ko.observable();
    self.currentArtist = ko.observable();

    self.showEventInfo = ko.observable(false);
    self.showVenueInfo = ko.observable(false);
    self.showArtistInfo = ko.observable(false);

    self.selectEvent = function(lastFmEvent) {
        self.currentEvent(ko.mapping.fromJS(lastFmEvent));
        self.showEventInfo(true)
    };
    // Activates a map marker's click event when an event for that venue is clicked in the list view
    self.selectMarker = function(lastFmEvent) {
        self.selectEvent(lastFmEvent);
        var eventIndex = lastFmEvent.venueIndex;
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
                        // TODO: remove this else state (or just the console.log?)
                        console.log('init');
                    }
            } else {
                alert('Geocoder error because: ' + status);
            }
        })
    });

    // clean up some lastFm that would otherwise cause problems
    function parseLastFmEvents(data) {
        console.log(data);
        var artistArray = []
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].artists.artist === 'string') {
                artistArray.push(data[i].artists.artist);
                data[i].artists.artist = artistArray;
                artistArray = [];
            }
        }
    };

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
                    parseLastFmEvents(data.events.event);
                    self.lastFmEvents(data.events.event);
                }
            };
            $.ajax(requestURL,requestSettings)
        }
    });

    // List of venue objects with associated concerts
    self.lastFmVenues = ko.observableArray();

    // check if venue is already in self.lastFmVenues
    self.newVenue = function(venueId, venues) {
        for (var i = 0; i < venues.length; i++) {
            if (venueId === venues[i].id) {
                //console.log('id match');
                return i;
            }
        }
        //console.log('new');
        return -1;
    }

    // Build venue array from last.fm API data
    self.buildVenues = ko.computed(function() {
        var events = self.lastFmEvents();
        var venues = [];
        for (var i = 0; i < events.length; i++) {
            var venueIndex = self.newVenue(events[i].venue.id, venues)
            var venue = events[i].venue;
            if (venueIndex === -1) {
                //console.log("it's new");
                venue.concerts = [];
                venue.concerts.push(events[i]);
                venues.push(venue);
                events[i].venueIndex = venues.indexOf(venue);
            } else {
                //console.log('not new');
                //events[i].venueIndex = i;
                events[i].venueIndex = venueIndex;
                venues[venueIndex].concerts.push(events[i]);
            }

        }
        //console.log(venues);
        self.lastFmVenues(venues);
    });

    // Create google map markers from lastFmVenues
    self.mapMarkers = ko.computed(function() {
        var markers = [];
        var infoWindow = new google.maps.InfoWindow();

        var venues = self.lastFmVenues();
        console.log(venues);

        for (var i = 0; i < venues.length; i++){
            var latLng = new google.maps.LatLng(
                            venues[i].location['geo:point']['geo:lat'],
                            venues[i].location['geo:point']['geo:long']);

            var marker = new google.maps.Marker({
                position: latLng,
                title: venues[i].name,
                content: infoWindowView(venues[i]),
                icon: 'images/red.png',
                map: map
            });

            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent(this.content);
                infoWindow.open(map, this);
                // TODO: fine tune centering location with mobile side menu
                //map.setCenter(latLng);
                //map.panBy(300,0);
            });
            markers.push(marker);

        }

        return markers;
    });

    /*** SEARCH FUNCTIONS ***/
    function doesStringContain(targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        return targetString.indexOf(searchTerm) > -1;
    };
    function doesListContain(targetList, searchTerm) {
        for (var i = 0; i < targetList.length; i++) {
            if (doesStringContain(targetList[i], searchTerm)) {
                return true;
            }
        }
    };
    // Check if last.fm data has 'tags' field. If so, search them
    function searchTags(currentEvent, searchTerm) {
        if (currentEvent.tags) {
            return doesListContain(currentEvent.tags.tag, searchTerm)
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
            self.filteredList(searchResults);
        } else {
            self.filteredList(self.lastFmEvents())
        }
    });

    // change marker icon based on search results
    self.mapMarkersSearch = ko.computed(function() {
        var venues = self.lastFmVenues();
        var searchedEvents = self.filteredList();
        var allEvents = self.lastFmEvents();

        for (var i = 0; i < venues.length; i++) {
            var searchedFor;
            for (var j = 0; j < venues[i].concerts.length; j++) {
                searchedFor = searchedFor || self.filteredList().indexOf(venues[i].concerts[j]) > -1;
            }

            if (self.filteredList() == self.lastFmEvents()) {
                self.mapMarkers()[i].setIcon('images/red.png');
            } else if (searchedFor) {
                self.mapMarkers()[i].setIcon('images/blue.png');
            } else {
                self.mapMarkers()[i].setIcon('images/clear.png');
            }
            searchedFor = null;
        }

    });
};

ko.applyBindings(ViewModel);