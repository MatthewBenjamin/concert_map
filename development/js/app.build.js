// app.build.js

({
    appDir: "../",
    baseUrl: "js",
    mainConfigFile: 'init.js',
    dir: "../../build",
    modules: [
        {
            name: 'init',
            include: [
                'app',
                'registerKoComponents',
                'searchUtil',
                'settings',
                'utils',
                'koConcertsList',
                'koCurrentArtist',
                'koCurrentEvent',
                'koCurrentVenue',
                'koInfoListToggle',
                'koMenuToggle',
                'koRequestAllLastFm',
                'koVenuesList',
                'koStatusMessages',
                'koInfoWindow',
            ],
            findNestedDependencies: true,
        },
    ],
    optimizeCss: "standard",
    paths: {
        jquery: 'empty:',
        knockout: 'empty:',
        komapping: 'empty:',
    },
    shim: {
        komapping: {
            deps: ['knockout'],
            exports: ['komapping']
        }
    },
    removeCombined: true,
});
