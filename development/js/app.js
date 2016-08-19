// Google map
var map;

// initialize location
var defaultLatlng;
var defaultAddress;


(function init() {
    // use last location
    if (localStorage.lastAddress &&
        localStorage.latitude &&
        localStorage.longitude) {
        var latitude = Number(localStorage.latitude);
        var longitude = Number(localStorage.longitude);
        defaultAddress = localStorage.lastAddress;
        defaultLatlng = { latitude: latitude, longitude: longitude };
    } else {
        // program default
        defaultAddress = 'Milwaukee, WI';
        defaultLatlng = { latitude: 43.07772111168133, longitude: -88.10023715 };
    }
})();

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
        var center = new google.maps.LatLng(defaultLatlng.latitude,defaultLatlng.longitude);
        var mapOptions = {
            center: center
        };
        map = new google.maps.Map(element, mapOptions);
        //console.log("map init");
    },

    // update map center when ViewModel.mapCenter value changes
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        map.fitBounds(value.mapBounds);
        //console.log("map update");
    }
};

/*** INFO WINDOWS ***/
var infoWindow = new google.maps.InfoWindow();
google.maps.event.addListener(infoWindow, 'closeclick', infoWindowClose);

// Grab HTML for infoWindow
var infoWindowView = function(){
    html = document.getElementById("info-content");
    return html;
};

// Preserve info window content, see
// http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
function infoWindowClose() {
    var content = infoWindow.getContent();
    if (content) {
        document.getElementById("info-window-container").appendChild(content);
    }
}

var ViewModel =  function () {
    var self = this;

    /*** VARIABLES/OBSERVABLES ***/

    /* Data observables */

    // map location
    self.currentAddress = ko.observable(defaultAddress);
    self.mapCenter = ko.observable(defaultLatlng);

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
    self.currentArtist = ko.observable();
    // youtube results for current artist
    self.currentArtistYoutube = ko.observableArray();
    // extra venue data
    self.currentVenueFourSquare = ko.observable();
    self.currentVenuePlaces = ko.observable();

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
    self.concertsStatus = ko.observable();
    self.venueInfoStatus = ko.observable();
    self.youtubeStatus = ko.observable();

    /*** COMPUTED OBSERVABLES ***/

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
        var venueIndex;
        var venue;
        for (var i = 0; i < events.length; i++) {
            venueIndex = findVenue(events[i].venue.id, venues);
            venue = events[i].venue;
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

        var venues = self.concertVenues();
        //console.log(venues);

        for (var i = 0; i < venues.length; i++){
            var latLng = new google.maps.LatLng(
                            venues[i].latitude,
                            venues[i].longitude);

            var marker = new google.maps.Marker({
                position: latLng,
                title: venues[i].name,
                icon: 'images/red.png',
                map: map,
                venueIndex: i
            });

            google.maps.event.addListener(marker, 'mouseup', function() {
                var m = this;
                infoWindow.setContent(infoWindowView());
                self.currentVenue(self.concertVenues()[m.venueIndex]);
                infoWindow.open(map, m);
                m.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    m.setAnimation(google.maps.Animation.null);
                }, 700);
            });

            markers.push(marker);
        }

        return markers;
    });

    // Set map bounds based on markers
    self.mapBounds = ko.observable();
    self.findMapBounds = ko.computed(function() {
        var markers = self.mapMarkers();
        // TODO: optimize? (makes new object every time...)
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
        }

        self.mapBounds(bounds);
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
                if (artistsList[i].lastfm && artistsList[i].lastfm.artist) {
                    //console.log(artistsList[i].lastfm.artist.tags.tag);
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
        // TODO Instead of passing results straight to filterEvents & Venues
        // observables, just pass to filteredEvents, which will automatically use
        // buildVenues() to built a new list
        if (self.searchInput()) {
            var searchTerm = self.searchInput().toLowerCase();
            var eventResults = [];
            var venueResults;
            var currentEvent;
            for (var i = 0; i < self.concerts().length; i++) {
                currentEvent = self.concerts()[i];
                if ( doesStringContain(currentEvent.venue.name, searchTerm) ||
                    doesStringContain(currentEvent.venue.city, searchTerm) ||
                    searchArtists(currentEvent.artists, searchTerm)) {

                        eventResults.push(currentEvent);
                }
            }
            venueResults = buildVenues(eventResults);
            self.filteredEvents(eventResults);
            self.filteredVenues(venueResults);
        } else {
            buildVenues(self.concerts());
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

    // select event from artist info
    self.backToEvent = function(mappedConcert) {
        selectEvent(ko.mapping.toJS(mappedConcert));
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
        if (defaultAddress != self.currentAddress()) {
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
                    if (mapCenter != self.mapCenter()) {
                        console.log("map center: ", mapCenter);
                        console.log("self center: ", self.mapCenter());
                        self.mapCenter(mapCenter);
                        storeLocation(self.currentAddress(), latitude, longitude);
                        defaultLatlng = { latitude: latitude, longitude: longitude };
                    }
                } else {
                    self.geocoderStatus('Geocoder error because: ' + status);
                }
            });
        } else {
            //console.log('init address');
        }
    });

    /* Bands in Town */

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
            if (data[i].ticket_status === "available") {
                data[i].tickets_available = true;
            } else {
                data[i].tickets_available = false;
            }
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
        // Prevent Knockout from loading concerts twice on page load
        if ((self.concerts().length === 0 &&
             self.mapCenter() === defaultLatlng)||
            (self.concerts().length > 0 &&
             self.mapCenter().latitude !== defaultLatlng.latitude &&
             self.mapCenter().longitude !== defaultLatlng.longitude)) {
            var latitude = self.mapCenter().latitude;
            var longitude = self.mapCenter().longitude;
            var requestURL = 'http://api.bandsintown.com/events/search.json?' +
                'api_version=2.0&' +
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
                        self.concertsStatus(null);
                        parseConcerts(data);
                        self.concerts(data);
                    } else {
                        //self.concertsStatus(data.message);
                    }

                },
                error: function() {
                    self.concertsStatus('Concert data could not be loaded. Please try again.');
                },
                timeout: 11000
            };
            self.concertsStatus('Loading Concert Data...');
            //console.log("loading concert data...");
            $.ajax(requestURL,requestSettings);
        }
    });

    /* Last.fm */

    // Get last.fm artist info
    var lastFmRequestURL = 'http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&' +
            'api_key=d824cbbb7759624aa8b3621a627b70b8' +
            '&format=json&';
    var lastFmErrorMessage = "Sorry, additional information from Last.fm " +
        "could not be loaded.";

    function getArtistSearch(artist) {
        if (artist.mbid) {
            return 'mbid=' + artist.mbid;
        } else {
            return 'artist=' + artist.name;
        }
    }

    function requestArtistInfo(artist) {
        var artistSearch = getArtistSearch(ko.mapping.toJS(artist));
        //console.log(artistSearch);
        var requestSettings = {
            success: function(data, status, jqXHR) {
                if (!data.error) {
                    artist.lastfm = data;
                    artist.lastfm.status = null;
                    self.currentArtist(ko.mapping.fromJS(artist));
                } else {
                    artist.lastfm.status = lastFmErrorMessage;
                    self.currentArtist(ko.mapping.fromJS(artist));
                }
            },
            error: function(data, status, jqXHR) {
                artist.lastfm.status = lastFmErrorMessage;
                self.currentArtist(ko.mapping.fromJS(artist));
            },
            timeout: 11000
        };
        $.ajax(lastFmRequestURL + artistSearch, requestSettings);
    }

    //self.timeouts = 0;
    function requestAllArtistInfo() {
        var requestSettings;
        var artistSearch;
        //var artistCount = 0;
        for (var i = 0; i < self.concerts().length; i++) {
            for (var j = 0; j < self.concerts()[i].artists.length; j++) {
                artistSearch = getArtistSearch(self.concerts()[i].artists[j]);
                self.artistCount(self.artistCount() + 1);
                (function(i,j) {
                    requestSettings = {
                        success: function(data, status, jqXHR) {
                            if (!data.error) {
                                self.concerts()[i].artists[j].lastfm = data;
                                self.concerts()[i].artists[j].lastfm.status = null;
                            } else {
                                // TODO: use different error msg when not found vs. error?
                                //console.log("NOT FOUND")
                                self.concerts()[i].artists[j].lastfm.status = lastFmErrorMessage;
                            }
                        },
                        error: function(data, status, jqXHR) {
                            //console.log('last.fm error');
                            self.concerts()[i].artists[j].lastfm.status = lastFmErrorMessage;
                        },
                        complete: function(jqXHR, textStatus) {
                            //console.log(textStatus);
                            // TODO: keep track on timeouts/errors and add option to resubmit
                            // request
                            console.log(textStatus);
                            self.artistCount(self.artistCount() - 1);
                            //if (textStatus === "timeout") {
                            //    timeouts++;
                            //}
                        },
                        timeout: 11000
                    };
                    self.concerts()[i].artists[j].lastfm = {};
                    $.ajax(lastFmRequestURL + artistSearch, requestSettings);
                })(i,j);
            }
        }
    }

    self.getArtistInfo = ko.computed(function() {
        var artist = self.currentArtist();
            if (artist && !artist.lastfm) {
                artist.lastfm = {};
                artist.lastfm.status = "Loading detailed artist info..."
                requestArtistInfo(artist);
            }
    });

    // TODO: add option to load all artists' info at once for searching
    // TODO: refactor
    self.requestAllArtistInfo = ko.observable(false);
    //self.haveAllArtistInfo = ko.observable(false);
    //self.allArtistStatus = ko.observable();
    self.artistCount = ko.observable(0);
    self.allArtistStatusUpdate = ko.computed(function() {
        if (self.artistCount() === 0) {
            //self.allArtistStatus(null);
            return null;
        } else if (self.artistCount() > 0 ) {
            //self.allArtistStatus("Searching for Artist Info...");
            return "Searching for Artist Info...";
        }
    });

    // Ask user to load all artist info
    self.searchBarFocus = ko.observable(false);
    self.manualToggle = ko.observable(false);
    self.anotherToggle = ko.computed(function() {
        if (self.searchBarFocus()) {
            self.manualToggle(true);
        }
    });
    self.dontAsk = ko.observable(false);
    self.askForArtistInfo = ko.computed(function() {
        if (self.dontAsk()) {
            return false;
        } else if (searchBarFocus() || manualToggle()) {
            return true;
        }
    });

    self.getAllArtistInfo = ko.computed(function() {
        if (self.requestAllArtistInfo()) {
            self.requestAllArtistInfo(false);
            //self.haveAllArtistInfo(true);
            requestAllArtistInfo();
        }
    });

    /* Youtube */

    // remove spaces from artist name
    searchableName = function(artistName) {
        artistName = artistName.replace(/\s+/g, '+');
        return artistName;
    }
    // get Youtube search results for currentArtist, display in extra-info
    function requestArtistVideos (artistName) {
        var requestURL = 'https://www.googleapis.com/youtube/v3/search?part=snippet&' +
            'q=' + artistName +
            '&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                var results = data.items;
                for (var i = 0; i < results.length; i ++) {
                    results[i].url = 'https://www.youtube.com/watch?v=' +
                        results[i].id.videoId;
                }
                self.youtubeStatus(null);
                self.currentArtistYoutube(results);
                self.currentArtist().youTube = results;
            },
            error: function() {
                self.youtubeStatus('Youtube search results could not be loaded.');
            },
            timeout: 8000
        };
        self.youtubeStatus('Loading Youtube search results...');
        $.ajax(requestURL, requestSettings);
    }

    self.getArtistVideos = ko.computed(function() {
        var artist = self.currentArtist();
        //console.log(artist);
            if (artist) {
                if (artist.youTube) {
                    self.youtubeStatus(null);
                    self.currentArtistYoutube(artist.youTube);
                } else {
                    self.currentArtistYoutube(null);
                    var artistName = searchableName(artist.name());
                    requestArtistVideos(artistName);
                }
            }
    });

    /* Venue APIs */

    // in case user has changed current venue before API results arrive
    function checkCurrentVenue(venueIndex) {
        if (self.currentVenue() === self.concertVenues()[venueIndex]) {
            return true;
        } else {
            return false;
        }
    }
    // Google Places (if 4 square isn't found)
    var venueInfoError = 'Sorry, detailed venue information could not be loaded.';

    function placesDetails(placeId, venueIndex) {
        var placesService = new google.maps.places.PlacesService(map);
        var request = {
            placeId: placeId
        };
        placesService.getDetails(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK &&
                checkCurrentVenue(venueIndex)) {
                self.concertVenues()[venueIndex].detailedInfo.googlePlaces = results;
                self.currentVenuePlaces(results);
                self.venueInfoStatus(null);
            } else {
                console.log(results, status);
            }

        });
    }

    function placesSearch(venueIndex) {
        //console.log('make place request', venueIndex);
        venueName = self.currentVenue().name;
        latitude = self.currentVenue().latitude;
        longitude = self.currentVenue().longitude;
        //console.log(venueName, latitude, longitude, i);
        var placesService = new google.maps.places.PlacesService(map);
        var latLng = new google.maps.LatLng(latitude,longitude);
        var request = {
            location: latLng,
            query: venueName,
            radius: '1'
        };
        //console.log(request, i);
        placesService.textSearch(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                placesDetails(results[0].place_id, venueIndex);
            } else {
                self.venueInfoStatus(venueInfoError);
                console.log(status, results);
            }
        });
    }

    // Four Square
    var fourSquareError = 'Four Square data cannot be found. Loading Google Places data instead...';
    // Get detailed venue info based on 4square ID
    function getFourSquareById(id, venueIndex) {
        var requestURL = 'https://api.foursquare.com/v2/venues/' +
        id + '?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20160105';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                //console.log(data.response.venue);
                if (checkCurrentVenue(venueIndex)) {
                    self.concertVenues()[venueIndex].detailedInfo.fourSquare = data.response.venue;
                    self.currentVenueFourSquare(data.response.venue);
                    self.venueInfoStatus(null);
                }

            },
            error: function(data, status, jqXHR) {
                self.venueInfoStatus(fourSquareError);
                placesSearch(venueIndex);
            },
            timeout: 8000
        };
        $.ajax(requestURL, requestSettings);
    }
    // Lookup 4square venue ID, then get detailed info
    function findFourSquareVenue (venue) {
        var venueIndex = venue.concerts[0].venueIndex;
        var lat = venue.latitude;
        var lon = venue.longitude;
        var requestURL = 'https://api.foursquare.com/v2/venues/search?' +
            'client_id=HEC4M2QKHJVGW5L5TPIBLBWBFJBBFSCIFFZDNZSGD2G5UGTI&' +
            'client_secret=AJKA10FIBJE3CUKUBYYYOGZ0BU2XNGMXNGUA43LAI0PQT3ZD&' +
            'v=20160105&' +
            'm=foursquare&' +
            'll=' + lat + ',' + lon + '&' +
            'query=' + venue.name + '&' +
            'intent=match';
        var requestSettings = {
            success: function(data, status, jqXHR) {
                //console.log(venueIndex);
                //console.log(data, data.meta.code);
                 if (data.response.venues.length > 0 &&
                    checkCurrentVenue(venueIndex)) {
                    //console.log(data.response.venues[0].name);
                    getFourSquareById(data.response.venues[0].id, venueIndex);
                 } else {
                    // TODO: DRY, see below
                    self.venueInfoStatus(fourSquareError);
                    placesSearch(venueIndex);
                 }
            },
            error: function(data, status, jqXHR) {
                //console.log(data, status);
                // TODO: DRY, see above
                self.venueInfoStatus(fourSquareError);
                placesSearch(venueIndex);
            },
            timeout: 8000
        };
        venue.detailedInfo = {};
        self.venueInfoStatus('Loading Four Square data for venue...');
        $.ajax(requestURL, requestSettings);
    }

    self.loadDetailedVenueInfo = ko.computed(function() {
        var venue = self.currentVenue();
        if (venue) {
            self.currentVenuePlaces(null);
            self.currentVenueFourSquare(null);
            if (!venue.detailedInfo) {
                findFourSquareVenue(venue)
            } else if (venue.detailedInfo.fourSquare) {
                self.currentVenueFourSquare(venue.detailedInfo.fourSquare);
            } else if (venue.detailedInfo.googlePlaces) {
                self.currentVenuePlaces(venue.detailedInfo.googlePlaces);
            } else {
                // TODO: this ignores timeouts and other cases where data actually exists
                self.venueInfoStatus(venueInfoError);
            }
        }
    });
};

ko.applyBindings(ViewModel);