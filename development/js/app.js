define(['jquery', 'knockout', 'komapping', 'utils', 'settings', 'gmap',
        'infoWindow', 'mapMarkers', 'searchUtil', 'lastFm'], // TODO: need lastFm here?
    function($, ko, komapping, utils, settings, gmap, infoWindow,
             mapMarkersUtils, searchUtil, lastFm) {
    ko.mapping = komapping;
    // TODO: move custom binding & component registration into own module

    // Custom Handler for Google Map
    ko.bindingHandlers.googlemap = {
        // update map center when ViewModel.mapCenter value changes
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            gmap.fitBounds(value.mapBounds);
            //console.log("map update");
        }
    };

    ko.components.register('concerts-list',
        { require: '../kocomponents/concerts-list'}
    );

    ko.components.register('venues-list',
        { require: '../kocomponents/venues-list'}
    );

    ko.components.register('current-event',
        { require: '../kocomponents/current-event'}
    );

    ko.components.register('current-venue',
        { require: '../kocomponents/current-venue'}
    );

    ko.components.register('current-artist',
        { require: '../kocomponents/current-artist'}
    );

    ko.components.register('status-messages',
        { template: { require: 'text!../kotemplates/status-messages.html' }}
    );

    ko.components.register('info-window',
        { template: { require:'text!../kotemplates/info-window.html' } }
    );

    var ViewModel =  function () {
        var self = this;

        /*** VARIABLES/OBSERVABLES ***/

        /* Data observables */

        // map location
        self.currentAddress = ko.observable(settings.initAddress);
        self.mapCenter = ko.observable(settings.initLatlng);

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
        self.showMenu = ko.observable(true);
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

        // Create google map markers from concertVenues
        self.mapMarkers = ko.computed(function() {
            if (self.mapMarkers && self.mapMarkers().length) {
                mapMarkersUtils.clearMarkers(self.mapMarkers());
            }
            var markers = mapMarkersUtils.createMarkers(
                self.concertVenues,
                self.currentVenue
            );
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

        // Search concerts
        self.searchConcerts = ko.computed(function() {
            if (self.searchInput()) {
                var searchTerm = self.searchInput().toLowerCase();
                var eventResults = searchUtil.performSearch(searchTerm);
                var venueResults = utils.buildVenues(eventResults, self.concertVenues());
                self.filteredEvents(eventResults);
                self.filteredVenues(venueResults);
                searchUtil.updateMarkerIcon(
                    self.filteredVenues(),
                    self.concertVenues(),
                    self.mapMarkers()
                );
            } else {
                self.filteredEvents(self.concerts());
                self.filteredVenues(self.concertVenues());
                searchUtil.resetMarkerIcons(self.mapMarkers());
            }
        });

        /*** UI FUNCTIONS ***/
        self.toggleMenu = function() {
            if (self.showMenu()) {
                self.showMenu(false);
            } else {
                self.showMenu(true);
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
            var unfilteredIndex = utils.findVenue(concert.venue.id, self.concertVenues());
            self.selectMarker(unfilteredIndex);
            // TODO: potential bug w/ filteredEvent/Venues - wrong venue index
            self.currentEvent(ko.mapping.fromJS(concert));
            self.showEventInfo(true);
            self.showVenueInfo(false);
            self.showArtistInfo(false);
        };

        self.selectFilteredVenue = function(filteredVenue) {
            var unfilteredIndex = utils.findVenue(filteredVenue.id, self.concertVenues());
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
            gmap.panTo(self.mapMarkers()[venueIndex].position);
        };


        /*** API CALLS ***/

        /* Google Map */
        var geocoder = new google.maps.Geocoder();
        self.getMapGeocode = ko.computed(function() {
            if (settings.initAddress != self.currentAddress()) {
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
                            utils.storeLocation(self.currentAddress(), latitude, longitude);
                            // TODO: need to reset initLatLNg?
                            settings.initLatlng = { latitude: latitude, longitude: longitude };
                        }
                    } else {
                        self.geocoderStatus('Geocoder error because: ' + status);
                    }
                });
            } else {
                //console.log('init address');
            }
        });

        /* Last.fm */

        // Get last.fm artist info
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
                lastFm.requestAllArtistInfo();
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
        // TODO: This error msg is getting set when 4square isn't found (but then Places loads...)
        var venueInfoError = 'Sorry, detailed venue information could not be loaded.';

        function placesDetails(placeId, venueIndex) {
            var placesService = new google.maps.places.PlacesService(gmap);
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
                    self.venueInfoStatus(venueInfoStatus);
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
            var placesService = new google.maps.places.PlacesService(gmap);
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
            var venueIndex = self.concertVenues().indexOf(venue);
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
                     if (data.response.venues.length > 0 &&
                        checkCurrentVenue(venueIndex)) {
                        getFourSquareById(data.response.venues[0].id, venueIndex);
                     } else {
                        // TODO: DRY, see below
                        self.venueInfoStatus(fourSquareError);
                        placesSearch(venueIndex);
                     }
                },
                error: function(data, status, jqXHR) {
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
                    // TODO: this ignores previous failed attemps (e.g. timeouts
                    // and other cases where data actually exists)
                    self.venueInfoStatus(venueInfoError);
                }
            }
        });
    };

    return ViewModel;
});
