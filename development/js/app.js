// TODO: doublecheck if all modules are used
define(['jquery', 'knockout', 'komapping', 'utils', 'settings', 'gmap',
        'infoWindow', 'mapMarkers', 'searchUtil', 'geocode'],
    function($, ko, komapping, utils, settings, gmap, infoWindow,
             mapMarkersUtils, searchUtil, geocode) {
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

    ko.components.register('request-all-lastfm',
        { require: '../kocomponents/request-all-lastfm' }
    );

    ko.components.register('status-messages',
        { template: { require: 'text!../kotemplates/status-messages.html' }}
    );

    ko.components.register('info-window',
        { template: { require:'text!../kotemplates/info-window.html' } }
    );

    ko.components.register('info-list-toggle',
        { require: '../kocomponents/info-list-toggle' }
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
        // TODO: combine into one computed?
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
        // TODO: put geocoder in ko.component? would only have status in template,
        // but pass address, mapCenter, as params
        self.getMapGeocode = ko.computed(function() {
            if (settings.initAddress != self.currentAddress()) {
                self.geocoderStatus('Setting map location...');
                geocode.requestGeocode(self.currentAddress());
            }
        });

        /* Last.fm */
        // TODO: reorganize this w/ rest of file
        // Get last.fm all-artist info

        // show request dialog (see component)
        self.searchBarFocus = ko.observable(false);
        // how many requests have returned (see component & api module)
        self.artistCount = ko.observable(0);
        self.allArtistStatusUpdate = ko.computed(function() {
            if (self.artistCount() === 0) {
                return null;
            } else if (self.artistCount() > 0 ) {
                return "Searching for Artist Info...";
            }
        });

    };

    return ViewModel;
});
