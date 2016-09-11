// TODO: doublecheck if all modules are used
define(['jquery', 'knockout', 'komapping', 'utils', 'settings', 'gmap',
        'mapMarkers', 'searchUtil', 'geocode'],
    function ($, ko, komapping, utils, settings, gmap,
             mapMarkersUtils, searchUtil, geocode) {
    ko.mapping = komapping;

    // Custom Handler for Google Map
    ko.bindingHandlers.googlemap = {
        // update map center when ViewModel.mapCenter value changes
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            gmap.fitBounds(value.mapBounds);
        },
    };

    var ViewModel = function () {
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

        // toggle menu overlay
        self.showMenu = ko.observable(true);
        // toggle list display between events and venues
        self.listEvents = ko.observable(true);
        self.listVenues = ko.observable(false);

        // show all artist last.fm request dialog (see component)
        self.searchBarFocus = ko.observable(false);

        // API Status Messages
        self.geocoderStatus = ko.observable();
        self.concertsStatus = ko.observable();
        self.allArtistStatusUpdate = ko.observable(null);

        /*** COMPUTED OBSERVABLES ***/

        // toggle extra-info display
        self.showExtraInfo = ko.computed(function () {
            if ((self.showEventInfo() || self.showVenueInfo() || self.showArtistInfo()) &&
                self.extraInfoBoolean()) {
                return true;
            }
            return false;
        });

        // Create google map markers from concertVenues
        self.mapMarkers = ko.computed(function () {
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
        self.mapBounds = ko.computed(function () {
            var markers = self.mapMarkers();
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < markers.length; i++) {
                bounds.extend(markers[i].getPosition());
            }
            return bounds;
        });

        // Search concerts
        self.searchConcerts = ko.computed(function () {
            var concerts = self.concerts();
            if (self.searchInput()) {
                var searchTerm = self.searchInput().toLowerCase();
                var eventResults = searchUtil.performSearch(searchTerm, concerts);
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
        self.selectEvent = function (concert) {
            self.selectMarker(concert.venueIndex);
            self.currentEvent(ko.mapping.fromJS(concert));
            self.showEventInfo(true);
            self.showVenueInfo(false);
            self.showArtistInfo(false);
        };

        self.selectVenue = function (venue) {
            // can't pass venue object from currentEvent extra-info
            var currentVenue = venue || self.concertVenues()[self.currentEvent().venueIndex()];
            self.selectMarker(self.concertVenues.indexOf(currentVenue));
            self.showVenueInfo(true);
            self.showEventInfo(false);
            self.showArtistInfo(false);
        };

        self.selectArtist = function (artist) {
            self.currentArtist(artist);
            self.showArtistInfo(true);
            self.showEventInfo(false);
            self.showVenueInfo(false);
        };

        self.closeExtraInfo = function () {
            self.showEventInfo(false);
            self.showVenueInfo(false);
            self.showArtistInfo(false);
        };
        // Activate a map marker's click event
        self.selectMarker = function (venueIndex) {
            google.maps.event.trigger(self.mapMarkers()[venueIndex], 'mouseup');
            gmap.panTo(self.mapMarkers()[venueIndex].position);
        };

        /*** API CALLS ***/
        // TODO: put geocoder in ko.component? would only have status in template,
        // but pass address, mapCenter, as params
        self.getMapGeocode = ko.computed(function () {
            if (settings.initAddress !== self.currentAddress()) {
                self.geocoderStatus('Setting map location...');
                geocode.requestGeocode(self.currentAddress());
            }
        });
    };

    return ViewModel;
});
