// Google map
var map;

// Google Map Error Handling
setTimeout(function() {
    if (!map) {
        $('.map-error').append('Google Map could not be loaded');
    }
}, 8000);

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
        //console.log(value);
        map.setCenter( { lat: latitude, lng: longitude } );
    }
};

// Grab HTML for infoWindow
var infoWindowView = function(){
    var html = '<div class="info-window" data-bind="with: currentVenue">' +
                    '<h2 class="window-header clickable" data-bind="text: name, click: selectVenue;"></h2>' +
                    '<ul class="window-list" data-bind="foreach: concerts">' +
                        '<li class="window-list-element clickable" data-bind="click: selectEvent">' +
                            '<hr>' +
                            //'<h4 class="window-event-name" data-bind="text: title">blah</h4>' +
                            //'<h4 class="window-event-name" data-bind="text: artists[0].name">blah</h4>' +
                            '<p>' +
                                '<span class="bold" data-bind="text: artists[0].name"></span> ' +
                                '<span class="italic" data-bind="text: subtitle"></span>' +
                            '</p>' +
                            '<p class="window-event-date date">' +
                                // TODO: make new timeinfo
                                //'<span data-bind="text: datetime"></span>, ' +
                                '<span data-bind="text: timeInfo.day"></span>, ' +
                                '<span data-bind="text: timeInfo.date"></span>' +
                            '</p>' +
                        '</li>' +
                '</div>';
    html = $.parseHTML(html)[0];
    return html;
};


var ViewModel =  function () {
    var self = this;

    /*** VARIABLES/OBSERVABLES ***/

    /* Data observables */

    // map location
    self.currentAddress = ko.observable();
    self.mapCenter = ko.observable();

    // Last.fm event API results
    self.concerts = ko.observableArray();
    // List of venue objects with associated concerts
    self.concertVenues = ko.observableArray();

    // search last fm data
    self.searchInput = ko.observable();
    self.filteredEvents = ko.observableArray();
    self.filteredVenues = ko.observableArray();

    // display detailed info for an event, venue, or artist
    self.currentEvent = ko.observable();
    self.currentVenue = ko.observable();
    //self.currentVenueFourSquare = ko.observable();
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
    self.hideLargeMenu = ko.observable(false);
    // toggle list display between events and venues
    self.listEvents = ko.observable(true);
    self.listVenues = ko.observable(false);

    // API Status Messages
    self.geocoderStatus = ko.observable();
    self.lastFmStatus = ko.observable();
    self.lastFmArtistStatus = ko.observable();
    //self.fourSquareStatus = ko.observable();
    self.youtubeStatus = ko.observable();

    // initialize location
    (function() {
        // use last location
        if (localStorage.lastAddress &&
            localStorage.latitude &&
            localStorage.longitude) {
            var latitude = Number(localStorage.latitude);
            var longitude = Number(localStorage.longitude);
            self.currentAddress(localStorage.lastAddress);
            self.mapCenter({ latitude: latitude, longitude: longitude });
        } else {
            // program default
            self.currentAddress('Austin, TX');
            self.mapCenter({ latitude: 30.267153, longitude: -97.74306079999997 });
        }
    })();

    /*** COMPUTED OBSERVABLES ***/

    // remove spaces from artist name
    self.currentArtistSearch = ko.computed(function() {
        var artist;
        if (self.currentArtist()) {
            artist = self.currentArtist().name().replace(/\s+/g, '+');
        }
        return artist;
    });

    // toggle extra-info display
    self.showExtraInfo = ko.computed(function() {
        if ( (self.showEventInfo() || self.showVenueInfo() || self.showArtistInfo()) &&
            self.extraInfoBoolean() ) {
            return true;
        } else {
            return false;
        }
    });

    // check if venue is already in self.concertVenues
    function findVenue(venueId, venues) {
        for (var i = 0; i < venues.length; i++) {
            if (venueId === venues[i].id) {
                return i;
            }
        }
        return -1;
    }

    // Build venues array from last.fm data
    function buildVenues(events) {
        var venues = [];
        for (var i = 0; i < events.length; i++) {
            var venueIndex = findVenue(events[i].venue.id, venues);
            var venue = events[i].venue;
            if (venueIndex === -1) {
                // venue not yet in list
                venue.concerts = [];
                venue.concerts.push(events[i]);
                venues.push(venue);
                events[i].venueIndex = venues.indexOf(venue);
            } else {
                // venue already in list
                events[i].venueIndex = venueIndex;
                venues[venueIndex].concerts.push(events[i]);
            }

        }
        //console.log(venues);
        return venues;
    }

    self.buildAllVenues = ko.computed(function() {
        var events = self.concerts();
        self.concertVenues(buildVenues(events));
    });

    // Create google map markers from concertVenues
    self.mapMarkers = ko.computed(function() {
        var markers = [];
        var infoWindow = new google.maps.InfoWindow();

        var venues = self.concertVenues();
        //console.log(venues);

        for (var i = 0; i < venues.length; i++){
            var latLng = new google.maps.LatLng(
                            venues[i].latitude,
                            venues[i].longitude);

            var marker = new google.maps.Marker({
                position: latLng,
                title: venues[i].name,
                content: infoWindowView(),
                icon: 'images/red.png',
                map: map,
                venueIndex: i
            });

            google.maps.event.addListener(marker, 'mouseup', function() {
                var m = this;
                infoWindow.setContent(m.content);
                self.currentVenue(self.concertVenues()[m.venueIndex]);
                infoWindow.open(map, m);
                m.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    m.setAnimation(google.maps.Animation.null);
                }, 700);
            });

            markers.push(marker);
            ko.applyBindings(self, marker.content);

        }
        //console.log($('.infoVenueWindow'));
        return markers;
    });

    // Search Functions

    function doesStringContain(targetString, searchTerm) {
        targetString = targetString.toLowerCase();
        return targetString.indexOf(searchTerm) > -1;
    }
    function doesObjectListContain(targetList, searchTerm, property) {
        for (var i = 0; i < targetList.length; i++) {
            if (doesStringContain(targetList[i][property], searchTerm)) {
                return true;
            }
        }
    }
    function searchArtists(artistsList, searchTerm) {
        if (doesObjectListContain(artistsList, searchTerm, 'name')) {
            return true;
        } else {
            for (var i = 0; i < artistsList.length; i++) {
                if (artistsList[i].lastfm) {
                    if (doesStringContain(artistsList[i].lastfm.artist.bio.content,searchTerm) ||
                        doesObjectListContain(artistsList[i].lastfm.artist.tags.tag, searchTerm, 'name')) {
                        return true;
                    }
                }
            }
        }
    }
    // Search last.fm data
    self.searchConcerts = ko.computed(function() {
        if (self.searchInput()) {
            var searchTerm = self.searchInput().toLowerCase();
            var eventResults = [];
            var venueResults;
            for (var i = 0; i < self.concerts().length; i++) {
                var currentEvent = self.concerts()[i];
                if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                    doesStringContain(currentEvent.venue.city, searchTerm) ||
                    searchArtists(currentEvent.artists, searchTerm)) {

                        eventResults.push(currentEvent);
                        venueResults = buildVenues(eventResults);
                }
            }
            self.filteredEvents(eventResults);
            self.filteredVenues(venueResults);
        } else {
            self.filteredEvents(self.concerts());
            self.filteredVenues(self.concertVenues());
        }
    });

    // change marker icon based on search results
    self.mapMarkersSearch = ko.computed(function() {
        var venues = self.concertVenues();
        var searchedEvents = self.filteredEvents();
        var allEvents = self.concerts();

        for (var i = 0; i < venues.length; i++) {
            var searchedFor;
            for (var j = 0; j < venues[i].concerts.length; j++) {
                searchedFor = searchedFor || searchedEvents.indexOf(venues[i].concerts[j]) > -1;
            }

            if (searchedEvents === allEvents) {
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
        if (self.hideLargeMenu()) {
            self.hideLargeMenu(false);
        } else {
            self.hideLargeMenu(true);
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
    };

    self.showVenues = function() {
        self.listEvents(false);
        self.listVenues(true);
    };

    self.selectEvent = function(concert) {
        self.selectMarker(concert.venueIndex);
        self.currentEvent(ko.mapping.fromJS(concert));
        self.showEventInfo(true);
        self.showVenueInfo(false);
        self.showArtistInfo(false);
    };

    self.selectFilteredVenue = function(filteredVenue) {
        var unfilteredIndex = findVenue(filteredVenue.id, self.concertVenues());
        self.selectVenue(self.concertVenues()[unfilteredIndex]);
    };

    self.selectVenue = function(venue) {
        // can't pass venue object from currentEvent extra-info
        var currentVenue = venue || self.concertVenues()[self.currentEvent().venueIndex()];
        self.selectMarker(self.concertVenues.indexOf(currentVenue));
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
    // Activate a map marker's click event
    self.selectMarker = function(venueIndex) {
        google.maps.event.trigger(self.mapMarkers()[venueIndex], 'mouseup');
        map.panTo(self.mapMarkers()[venueIndex].position);
    };


    /*** API CALLS ***/

    /* Google Map */

    // Update mapCenter with new latLng when currentAddress changes & save in localStorage
    function storeLocation(address, latitude, longitude) {
        if (localStorage) {
            localStorage.setItem('lastAddress', address);
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
        }
    }

    var geocoder = new google.maps.Geocoder();
    self.getMapGeocode = ko.computed(function() {
        var geocodeTimeoutError = setTimeout(function() {
            self.geocoderStatus('Location coordinates could not be loaded.');
        }, 8000);
        geocoder.geocode( { 'address': self.currentAddress() }, function(results, status) {
            self.geocoderStatus('Setting map location...');
            if (status == google.maps.GeocoderStatus.OK) {
                clearTimeout(geocodeTimeoutError);
                self.geocoderStatus(null);
                var latitude = results[0]['geometry']['location']['lat']();
                var longitude = results[0]['geometry']['location']['lng']();
                var mapCenter = {
                    latitude: latitude,
                    longitude: longitude
                };
                if (latitude != self.mapCenter().latitude && longitude != self.mapCenter().longitude) {
                    self.mapCenter(mapCenter);
                    storeLocation(self.currentAddress(), latitude, longitude);
                } else {
                    //console.log('init');
                }
            } else {
                self.geocoderStatus('Geocoder error because: ' + status);
            }
        });
    });

    /* Last.fm */

    // clean up concert data
    function parseConcerts(data) {
        //console.log(data);
        var time;
        var timeString;
        var artistCount;
        //var emptyArray = [];
        for (var i = 0; i < data.length; i++) {
            // TODO: add for loop to store additional artist info (name here, later youtube/last.fm) as object in artist array
            /* TODO: incorporate last.fm artist data tags, etc.
            if (!data[i].tags) {
                data[i].tags = {
                    tag: []
                };
            }
            if (typeof data[i].tags.tag === 'string') {
                emptyArray.push(data[i].tags.tag);
                data[i].tags.tag = emptyArray;
                emptyArray = [];
            } */
            artistCount = data[i].artists.length;
            if (artistCount > 1) {
                artistCount -= 1;
                data[i].subtitle = "& " + artistCount + " more act";
                if (artistCount > 1) {
                    data[i].subtitle += "s";
                }
            } else {
                data[i].subtitle = null;
            }
            time = new Date(Date.parse(data[i].datetime));
            timeString = time.toDateString();
            data[i].timeInfo = {
                day: timeString.substring(0,3),
                date: timeString.substring(4,10),
                year: time.getFullYear(),
                time: time.toUTCString().substring(17,22)
            };
        }
    }

    // Get concert data when mapCenter updates
    self.getConcerts = ko.computed(function() {
        if (self.mapCenter().latitude && self.mapCenter().longitude) {
            var latitude = self.mapCenter().latitude;
            var longitude = self.mapCenter().longitude;
            var requestURL = 'http://api.bandsintown.com/events/search.json?' +
                'app_id=google-map-mashup&' +
                'location=' + latitude + ',' + longitude + '&' +
                'per_page=100&' +
                'format=json';
            var requestSettings = {
                dataType: "jsonp",
                crossDomain: "true",
                success: function(data, status, jqXHR) {
                    //clears old markers
                    self.mapMarkers().forEach(function (marker) {
                        marker.setMap(null);
                    });
                    if (data) {
                        self.lastFmStatus(null);
                        parseConcerts(data);
                        self.concerts(data);
                    } else {
                        //self.lastFmStatus(data.message);
                    }

                },
                error: function() {
                    self.lastFmStatus('Concert data could not be loaded. Please try again.');
                },
                timeout: 11000
            };
            self.concerts.removeAll();
            self.lastFmStatus('Loading Concert Data...');
            $.ajax(requestURL,requestSettings);
        }
    });

    // Get last.fm artist info
    self.getArtistInfo = ko.computed(function() {
        console.log('Searching for Artist Info...'); // TODO: add this to user display with . . .
        var requestURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&' +
            'api_key=d824cbbb7759624aa8b3621a627b70b8' +
            '&format=json&';
        var requestSettings;
        var artistSearch;
        for (var i = 0; i < self.concerts().length; i++) {
            for (var j = 0; j < self.concerts()[i].artists.length; j++) {
                if (self.concerts()[i].artists[j].mbid) {
                    artistSearch = 'mbid=' + self.concerts()[i].artists[j].mbid;
                } else {
                    artistSearch = 'artist=' + self.concerts()[i].artists[j].name;
                }

                // self.lastFmArtistStatus('Loading Last FM artist data...'); TODO: remove this?
                (function(i,j) {
                    requestSettings = {
                        success: function(data, status, jqXHR) {
                            //self.currentArtistInfo(ko.mapping.fromJS(data.artist)); TODO: need this for data binding?
                            if (!data.error) {
                                self.concerts()[i].artists[j].lastfm = data;
                            }
                        },
                        error: function(data, status, jqXHR) {
                            //console.log(status,i,j);
                        },
                        timeout: 11000
                    };
                    $.ajax(requestURL + artistSearch, requestSettings);
                })(i,j);
            }
            if (i == self.concerts().length - 1) {
                console.log('artist search completed(sort of...)');
            }
        }
    });

    /* Youtube */

    // get Youtube search results for currentArtist, display in extra-info
    self.getArtistVideos = ko.computed(function() {
        if (self.currentArtistSearch()) {
            var requestURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&' +
                'q=' + self.currentArtistSearch() +
                '&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI';
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    for (var i = 0; i < data.items.length; i ++) {
                        data.items[i].url = 'https://www.youtube.com/watch?v=' +
                            data.items[i].id.videoId;
                    }
                    self.youtubeStatus(null);
                    self.currentArtistYoutube(data.items);
                },
                error: function() {
                    self.youtubeStatus('Youtube search results could not be loaded.');
                },
                timeout: 8000
            };
            self.youtubeStatus('Loading Youtube search results...');
            $.ajax(requestURL, requestSettings);
        }
    });

    /* 4 Square */
/*
    // Get detailed venue info based on 4square ID
    function getFourSquareById(id) {
        var requestURL = 'https://api.foursquare.com/v2/venues/' +
        id + '?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20150702';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                //console.log(data);
                self.currentVenueFourSquare(data.response.venue);
            },
            error: function(data, status, jqXHR) {
                self.fourSquareStatus('Four Square data for venue could not be found.');
            },
            timeout: 8000
        };
        $.ajax(requestURL, requestSettings);
    }


    // Lookup 4square venue ID, then get detailed info
    self.findFourSquareVenue = ko.computed(function() {
        if (self.currentVenue()) {
            var lat = self.currentVenue().latitude;
            var lon = self.currentVenue().longitude;
            //console.log(typeof lat,lon);
            var requestURL = 'https://api.foursquare.com/v2/venues/search?' +
                'client_id=HEC4M2QKHJVGW5L5TPIBLBWBFJBBFSCIFFZDNZSGD2G5UGTI&' +
                'client_secret=AJKA10FIBJE3CUKUBYYYOGZ0BU2XNGMXNGUA43LAI0PQT3ZD&' +
                'v=20160105&' +
                'm=foursquare&' +
                'll=' + lat + ',' + lon + '&' +
                'query=' + self.currentVenue().name + '&' +
                'intent=match';
            var requestSettings = {
                success: function(data, status, jqXHR) {
                    console.log(data);
                     if (data.response.venues.length > 0) {
                        getFourSquareById(data.response.venues[0].id);
                        self.fourSquareStatus(null);
                     } else {
                        self.currentVenueFourSquare(null);
                        self.fourSquareStatus('Four Square data for venue could not be found.');
                     }
                },
                error: function(data, status, jqXHR) {
                    //console.log(data, status);
                    self.fourSquareStatus('Four Square data for venue could not be loaded.');
                },
                timeout: 8000
            };
            self.fourSquareStatus('Loading Four Square data for venue...');
            $.ajax(requestURL, requestSettings);
        }
    });
*/
};

ko.applyBindings(ViewModel);