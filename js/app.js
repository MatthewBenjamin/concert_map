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
    var html = $('#info-window')[0];
    //console.log(html);
    return html;
    /*
    // TODO: instead of creating strings, create nodes/HTML objects with JS/jQuery?
    //ko.mapping.toJS(venueObject);
    var $container = $('<div class="infoVenueWindow"></div>');
    //console.log($container);
    //var $venueName = $('<a href=' + venueObject.website + '>' + venueObject.name + '</a>').appendTo($container);
    var $venueName = $('<a data-bind="click: function() { console.log(\'hi\'); }">' + venueObject.name + '</a>').appendTo($container);
    //console.log($venueName);
    //$venueName.appendTo($container);
    //console.log(container);
    //var venueName = '<p data-bind="click: function(){ console.log(\'hi\'); }">test</p>';

    //data bind doesn't work here
    //var venueName = '<p data-bind="text: venueObject.name, click: showVenueInfo(true)"></p>';

    // include this in venue more info window?
    //var venueAddress = venueObject.location.street;
    //var htmlContent = venueName;

    var concerts = venueObject.concerts;

    for (var i = 0; i < concerts.length; i++) {
        var $concertContainer = $('<div class="concertWindow"></div>').appendTo($container);
        var concertTitle = '<p class="infoConcertTitle">#title#</p>';
        var concertDate = '<p class="infoConcertDate">#date#</p>';
        var $title = $(concertTitle.replace('#title#', concerts[i].title)).appendTo($concertContainer);
        var $date = $(concertDate.replace('#date#', concerts[i].startDate.substring(0, 11))).appendTo($concertContainer);
        //var titleDate = title + date;
        //var concertInfo = concertContainer.replace('#data#', titleDate);
        //htmlContent = htmlContent + concertInfo;
        //console.log($concertContainer);
    }
    //console.log($(htmlContent)[0]);
    //var test = $(htmlContent);
    //var testParse = $.parseHTML(htmlContent);
    //var same = test == testParse;
    //console.log(test);
    //$container.append(htmlContent);
    //console.log($container);
    //return htmlContent;
    //console.log($container);
    return $container[0];
    */
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
    // List of venue objects with associated concerts
    self.lastFmVenues = ko.observableArray();

    // search last fm data
    self.filteredEvents = ko.observableArray();
    self.filteredVenues = ko.observableArray();
    self.searchInput = ko.observable();

    // display detailed info for an event, venue, or artist
    self.currentEvent = ko.observable();
    self.currentVenue = ko.observable();
    self.currentVenueFourSquare = ko.observableArray();
    self.currentArtist = ko.observable();
    self.currentArtistSearch = ko.computed(function() {
        var artist;
        if (self.currentArtist()) {
            artist = self.currentArtist().replace(/\s+/g, '+');
        }
        return artist;
    });
    self.currentArtistInfo = ko.observable();
    self.currentArtistVideos = ko.observableArray();

    self.showEventInfo = ko.observable(false);
    self.showVenueInfo = ko.observable(false);
    self.showArtistInfo = ko.observable(false);
    self.showExtraInfo = ko.computed(function() {
        if (self.showEventInfo() || self.showVenueInfo() || self.showArtistInfo()) {
            //console.log(self.showEventInfo, self.showVenueInfo, self.showArtistInfo)
            return true;
        } else {
            return false;
        }
    });

    self.listEvents = ko.observable(true);
    self.listVenues = ko.observable(false);

    self.eventButton = function() {
        self.listEvents(true);
        self.listVenues(false);
    }

    self.venueButton = function() {
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
        // TODO: will var venue be used? or will venue always come from currentEvent?
        var venue = venue || self.lastFmVenues()[currentEvent().venueIndex()];
        self.selectMarker(lastFmVenues.indexOf(venue));
        self.currentVenue(venue);
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

    // Activates a map marker's click event when an event for that venue is clicked in the list view
    self.selectMarker = function(venueIndex) {
        //self.selectEvent(lastFmEvent);
        //var eventIndex = lastFmEvent.venueIndex;
        //self.currentVenue(self.lastFmVenues()[eventIndex]);
        google.maps.event.trigger(self.mapMarkers()[venueIndex], 'mouseup');
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
        var emptyArray = []
        for (var i = 0; i < data.length; i++) {
            if (typeof data[i].artists.artist === 'string') {
                emptyArray.push(data[i].artists.artist);
                data[i].artists.artist = emptyArray;
                emptyArray = [];
            }
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
                },
                error: function() {
                    // TODO: display user friendlier message (in list view?)
                    alert('lastfm error', status);
                }
            };
            $.ajax(requestURL,requestSettings)
        }
    });


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

    self.getArtistVideos = ko.computed(function() {
        if (self.currentArtistSearch()) {
            var requestURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&' +
                'q=' + self.currentArtistSearch() +
                '&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI'
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    console.log(data.items);
                    self.currentArtistVideos(data.items);
                },
                error: function() {
                    alert('ERROR', data, status, jqXHR);
                }
            };
            $.ajax(requestURL, requestSettings);
        }
    });

    function getFourSquareById(id) {
        var requestURL = 'https://api.foursquare.com/v2/venues/' +
        id + '?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20150702';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                //console.log(data);
            }
        }
        $.ajax(requestURL, requestSettings);
    }

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
                'intent=match'
            if (self.currentVenue().website) {
                requestURL = requestURL + '&url=' + self.currentVenue().website;
            }
            //console.log(requestURL);
            var requestSettings = {
                success: function(data, status, jqXHR) {
                     if (data.response.venues.length > 0) {
                        getFourSquareById(data.response.venues[0].id);
                     }
                },
                error: function() {
                    alert('FOUR SQUARE API ERROR', data, status, jqXHR);
                }
            };
            $.ajax(requestURL, requestSettings);
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
            var eventhResults = [];
            var venueResults = [];
            for (var i = 0; i < self.lastFmEvents().length; i++) {
                var currentEvent = self.lastFmEvents()[i];
                if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                    doesStringContain(currentEvent.venue.location.street, searchTerm) ||
                    doesStringContain(currentEvent.title, searchTerm) ||
                    doesStringContain(currentEvent.description, searchTerm) ||
                    doesListContain(currentEvent.artists.artist, searchTerm) ||
                    searchTags(currentEvent, searchTerm)) {
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
};

ko.applyBindings(ViewModel);