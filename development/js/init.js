// init.js - RequireJS Config

// TODO: add google maps to requireJS?
requirejs.config({
    baseUrl: 'js/libraries',
    paths: {
        jquery: [
            'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min',
            'jquery-2.1.3.min'
        ],
        knockout: [
            'http://ajax.aspnetcdn.com/ajax/knockout/knockout-3.3.0',
            'knockout-3.3.0'
        ],
        komapping: [
            'https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min',
            'knockout.mapping-latest'
        ],
        app: '../app'
    },
    shim: {
        komapping: {
            deps: ['knockout'],
            exports: ['komapping']
        }
    }
});