// init.js - RequireJS Config

requirejs.config({
    baseUrl: 'js/libraries',
    paths: {
        // TODO: what about global jQuery/$ ? check requireJS docs: http://requirejs.org/docs/jquery.html
        // libraries
        jquery: [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min',
            'jquery-2.1.3.min',
        ],
        knockout: [
            'http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.3.0',
            'knockout-3.3.0',
        ],
        komapping: [
            'https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min',
            'knockout.mapping-latest',
        ],

        // app scripts //
        app: '../app',
        registerKoComponents: '../kocomponents/register-kocomponents',
        searchUtil: '../search-util',
        settings: '../settings',
        utils: '../utils',

        // APIs //
        // concerts
        bandsInTown: '../apis/bands-in-town',
        // google maps
        geocode: '../apis/google-geocode',
        gmap: '../apis/gmap',
        infoWindow: '../apis/info-window',
        mapMarkers: '../apis/map-markers',
        // venues
        fourSquare: '../apis/four-square',
        googlePlaces: '../apis/google-places',
        venueApiUtils: '../apis/venue-api-utils',
        // artists
        lastFm: '../apis/last-fm',
        youtube: '../apis/youtube',
    },
    shim: {
        komapping: {
            deps: ['knockout'],
            exports: ['komapping'],
        },
    },
});
