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

// Grab HTML for infoWindow
var infoWindowView = function(venueObject){
    var html = $('#info-window')[0];
    return html;
};

var ViewModel =  function () {
    var self = this;

    /*** VARIABLES/OBSERVABLES ***/

    /* Data observables */

    // map location
    var defaultLocation = 'Austin, TX';
    self.currentAddress = ko.observable(defaultLocation);
    self.mapCenter = ko.observable( { latitude: 30.267153, longitude: -97.74306079999997 } );

    // Last.fm event API results
    self.lastFmEvents = ko.observableArray();
    // List of venue objects with associated concerts
    self.lastFmVenues = ko.observableArray();

    // search last fm data
    self.searchInput = ko.observable();
    self.filteredEvents = ko.observableArray();
    //self.filteredVenues = ko.observableArray();

    // display detailed info for an event, venue, or artist
    self.currentEvent = ko.observable();
    self.currentVenue = ko.observable();
    self.currentVenueFourSquare = ko.observable();
    self.currentArtist = ko.observable();
    // last.fm artist data
    self.currentArtistInfo = ko.observable();
    self.currentArtistYoutube = ko.observableArray();

    /* UI observables */

    // toggle extra-info display
    self.extraInfoBoolean = ko.observable(true);
    // control what is shown in extra-info display
    self.showEventInfo = ko.observable(false);
    self.showVenueInfo = ko.observable(false);
    self.showArtistInfo = ko.observable(false);

    // toggle menu
    self.displaySmallMenu = ko.observable(false);
    self.displayLargeMenu = ko.observable(true);
    // toggle list display between events and venues
    self.listEvents = ko.observable(true);
    self.listVenues = ko.observable(false);


    /*** COMPUTED OBSERVABLES ***/

    // remove spaces from artist name
    self.currentArtistSearch = ko.computed(function() {
        var artist;
        if (self.currentArtist()) {
            artist = self.currentArtist().replace(/\s+/g, '+');
        }
        return artist;
    });

    // toggle extra-info display
    self.showExtraInfo = ko.computed(function() {
        if ( (self.showEventInfo() || self.showVenueInfo() || self.showArtistInfo())
            && self.extraInfoBoolean() ) {
            return true;
        } else {
            return false;
        }
    });

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

    // Build venues array from last.fm data
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
                map: map,
                venueIndex: i
            });

            google.maps.event.addListener(marker, 'mouseup', function() {
                //console.log(this.venueIndex);
                infoWindow.setContent(this.content);
                self.currentVenue(self.lastFmVenues()[this.venueIndex]);
                infoWindow.open(map, this);
                // TODO: fine tune centering location with mobile side menu
                //map.setCenter(latLng);
                //map.panBy(300,0);
            });
            markers.push(marker);

        }
        //console.log($('.infoVenueWindow'));
        return markers;
    });

    // Search Functions

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

    // Search last.fm data
    self.searchLastFmEvents = ko.computed(function() {
        if (self.searchInput()) {
            var searchTerm = self.searchInput().toLowerCase();
            var eventResults = [];
            for (var i = 0; i < self.lastFmEvents().length; i++) {
                var currentEvent = self.lastFmEvents()[i];
                if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                    doesStringContain(currentEvent.venue.location.street, searchTerm) ||
                    doesStringContain(currentEvent.title, searchTerm) ||
                    doesStringContain(currentEvent.description, searchTerm) ||
                    doesListContain(currentEvent.artists.artist, searchTerm) ||
                    doesListContain(currentEvent.tags.tag, searchTerm)) {
                        eventResults.push(currentEvent);
                }
            }
            self.filteredEvents(eventResults);
        } else {
            self.filteredEvents(self.lastFmEvents())
        }
    });

    // change marker icon based on search results
    self.mapMarkersSearch = ko.computed(function() {
        var venues = self.lastFmVenues();
        var searchedEvents = self.filteredEvents();
        var allEvents = self.lastFmEvents();

        for (var i = 0; i < venues.length; i++) {
            var searchedFor;
            for (var j = 0; j < venues[i].concerts.length; j++) {
                searchedFor = searchedFor || self.filteredEvents().indexOf(venues[i].concerts[j]) > -1;
            }

            if (self.filteredEvents() == self.lastFmEvents()) {
                self.mapMarkers()[i].setIcon('images/red.png');
            } else if (searchedFor) {
                self.mapMarkers()[i].setIcon('images/blue.png');
            } else {
                self.mapMarkers()[i].setIcon('images/clear.png');
            }
            searchedFor = null;
        }

    });

    /*** UI FUNCTIONS ***/

    self.closeSmallMenu = function() {
        self.displaySmallMenu(false);
    };
    self.openSmallMenu = function() {
        self.displaySmallMenu(true);
    };
    self.toggleLargeMenu = function() {
        if (self.displayLargeMenu()) {
            self.displayLargeMenu(false);
        } else {
            self.displayLargeMenu(true);
        }
    };
    self.toggleExtraInfo = function() {
        if (self.extraInfoBoolean()) {
            self.extraInfoBoolean(false);
        } else {
            self.showEventInfo(false);
            self.showVenueInfo(false);
            self.showArtistInfo(false);
            self.extraInfoBoolean(true);
        }
        //console.log(self.extraInfoBoolean());
    };

    self.showEvents = function() {
        self.listEvents(true);
        self.listVenues(false);
    }

    self.showVenues = function() {
        self.listEvents(false);
        self.listVenues(true);
    }

    self.selectEvent = function(lastFmEvent) {
        self.selectMarker(lastFmEvent.venueIndex);
        self.currentEvent(ko.mapping.fromJS(lastFmEvent));
        self.showEventInfo(true)
        self.showVenueInfo(false);
        self.showArtistInfo(false);
    };

    self.selectVenue = function(venue) {
        // can't pass venue object from currentEvent extra-info
        var venue = venue || self.lastFmVenues()[currentEvent().venueIndex()];
        self.selectMarker(lastFmVenues.indexOf(venue));
        //self.currentVenue(venue);
        self.showVenueInfo(true);
        self.showEventInfo(false);
        self.showArtistInfo(false);
    };

    self.selectArtist = function(artist) {
        self.currentArtist(artist);
        self.showArtistInfo(true);
        self.showEventInfo(false);
        self.showVenueInfo(false);
    };

    self.closeExtraInfo = function() {
        self.showEventInfo(false);
        self.showVenueInfo(false);
        self.showArtistInfo(false);
    };
    // Activates a map marker's click event when an event for that venue is clicked in the list view
    self.selectMarker = function(venueIndex) {
        //self.selectEvent(lastFmEvent);
        //var eventIndex = lastFmEvent.venueIndex;
        //self.currentVenue(self.lastFmVenues()[eventIndex]);
        google.maps.event.trigger(self.mapMarkers()[venueIndex], 'mouseup');
    };


    /*** API CALLS ***/

    /* Google Map */

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
                        // TODO: remove this else statement (or just the console.log?)
                        console.log('init');
                    }
            } else {
                alert('Geocoder error because: ' + status);
            }
        })
    });

    /* Last.fm */

    // clean up lastFm data
    function parseLastFmEvents(data) {
        //console.log(data);
        var emptyArray = []
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].artists.artist === 'string') {
                emptyArray.push(data[i].artists.artist);
                data[i].artists.artist = emptyArray;
                emptyArray = [];
            }
            // TODO: add for loop to store additional artist info (name here, later youtube/last.fm) as object in artist array
            if (!data[i].tags) {
                data[i].tags = {
                    tag: []
                };
            }
            if (typeof data[i].tags.tag === 'string') {
                emptyArray.push(data[i].tags.tag);
                data[i].tags.tag = emptyArray;
                emptyArray = [];
            }
            data[i].timeInfo = {
                day: data[i].startDate.substring(0,3),
                date: data[i].startDate.substring(5,11),
                year: data[i].startDate.substring(12,16),
                time: data[i].startDate.substring(17,22)
            }
        }
    };

    // Get Last.fm data when mapCenter updates
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
                },
                error: function() {
                    // TODO: display user friendlier message (in list view?)
                    alert('lastfm error', status);
                }
            };
            $.ajax(requestURL,requestSettings)
        }
    });

    // Get last.fm artist info to display in extra-info
    self.getArtistInfo = ko.computed(function() {
        if (self.currentArtistSearch()) {
            //var artist = self.currentArtist().replace(/\s+/g, '+');
            var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&' +
                'artist=' + self.currentArtistSearch() + '&' +
                'api_key=d824cbbb7759624aa8b3621a627b70b8' +
                '&format=json'
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    console.log(data);
                    self.currentArtistInfo(ko.mapping.fromJS(data.artist));
                },
                error: function() {
                    alert('ERROR', data, status, jqXHR);
                }
            };
            $.ajax(requestURL, requestSettings);
        }
    });

    /* Youtube */

    // get Youtube search results for currentArtist, display in extra-info
    self.getArtistVideos = ko.computed(function() {
        if (self.currentArtistSearch()) {
            var requestURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&' +
                'q=' + self.currentArtistSearch() +
                '&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI'
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    console.log(data.items);
                    self.currentArtistYoutube(data.items);
                },
                error: function() {
                    alert('ERROR', data, status, jqXHR);
                }
            };
            $.ajax(requestURL, requestSettings);
        }
    });

    /* 4 Square */

    // Get detailed venue info based on 4square ID
    function getFourSquareById(id) {
        var requestURL = 'https://api.foursquare.com/v2/venues/' +
        id + '?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20150702';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                console.log(data);
                self.currentVenueFourSquare(data.response.venue);
            }
        }
        $.ajax(requestURL, requestSettings);
    }

    // Lookup 4square venue ID, then get detailed info
    self.findFourSquareVenue = ko.computed(function() {
        if (self.currentVenue()) {
            var lat = self.currentVenue().location['geo:point']['geo:lat'];
            var lon = self.currentVenue().location['geo:point']['geo:long'];
            //console.log(typeof lat,lon);
            var requestURL = 'https://api.foursquare.com/v2/venues/search?' +
                'client_id=HEC4M2QKHJVGW5L5TPIBLBWBFJBBFSCIFFZDNZSGD2G5UGTI&' +
                'client_secret=AJKA10FIBJE3CUKUBYYYOGZ0BU2XNGMXNGUA43LAI0PQT3ZD&' +
                'v=20130815&' +
                'll=' + lat + ',' + lon + '&' +
                'query=' + self.currentVenue().name + '&' +
                'intent=match';
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    console.log(data);
                     if (data.response.venues.length > 0) {
                        getFourSquareById(data.response.venues[0].id);
                     }
                },
                error: function() {
                    alert('FOUR SQUARE API ERROR', status);
                }
            };
            $.ajax(requestURL, requestSettings);
        }
    });

};

ko.applyBindings(ViewModel);