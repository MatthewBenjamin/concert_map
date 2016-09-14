// init.js - RequireJS Config

requirejs.config({
    baseUrl: 'js',
    //urlArgs: 'bust=' + (new Date()).getTime(),
    paths: {
        // TODO: what about global jQuery/$ ? check requireJS docs: http://requirejs.org/docs/jquery.html
        // libraries
        jquery: [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min',
            './libraries/jquery-2.1.3.min',
        ],
        knockout: [
            'http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.3.0',
            './libraries/knockout-3.3.0',
        ],
        komapping: [
            'https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min',
            './libraries/knockout.mapping-latest',
        ],
        async: 'libraries/async',
        //google: [
        //    'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI&libraries=places',
        //],
        google: 'apis/google',
        text: 'libraries/text',
        // app scripts //
        app: 'app',
        registerKoComponents: 'kocomponents/register-kocomponents',
        searchUtil: 'search-util',
        settings: 'settings',
        utils: 'utils',

        // APIs //
        // concerts
        bandsInTown: 'apis/bands-in-town',
        // google maps
        geocode: 'apis/google-geocode',
        gmap: 'apis/gmap',
        infoWindow: 'apis/info-window',
        mapMarkers: 'apis/map-markers',
        // venues
        fourSquare: 'apis/four-square',
        googlePlaces: 'apis/google-places',
        venueApiUtils: 'apis/venue-api-utils',
        // artists
        lastFm: 'apis/last-fm',
        youtube: 'apis/youtube',
        // ko components
        koConcertsList: 'kocomponents/concerts-list',
        koCurrentArtist: 'kocomponents/current-artist',
        koCurrentEvent: 'kocomponents/current-event',
        koCurrentVenue: 'kocomponents/current-venue',
        koInfoListToggle: 'kocomponents/info-list-toggle',
        koMenuToggle: 'kocomponents/menu-toggle',
        koRequestAllLastFm: 'kocomponents/request-all-lastfm',
        koVenuesList: 'kocomponents/venues-list',
        // template only ko components
        koStatusMessages: 'kocomponents/status-messages',
        koInfoWindow: 'kocomponents/info-window',
        // ko templates
        concertsListTemplate: 'kotemplates/concerts-list-template',
        currentArtistTemplate: 'kotemplates/current-artist-template',
        currentEventTemplate: 'kotemplates/current-event-template',
        currentVenueTemplate: 'kotemplates/current-venue-template',
        infoListToggleTemplate: 'kotemplates/info-list-toggle-template',
        menuToggleTemplate: 'kotemplates/menu-toggle-template',
        requestAllLastFmTemplate: 'kotemplates/request-all-lastfm-template',
        venuesListTemplate: 'kotemplates/venues-list-template',
    },
    shim: {
        komapping: {
            deps: ['knockout'],
            exports: ['komapping'],
        },
    },
});

// launch app w/ require dependencies
require(['knockout', 'app', 'registerKoComponents'],
    function (ko, ViewModel) {
    ko.applyBindings(ViewModel);
});