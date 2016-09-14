// register-kocomponents.js
define(['knockout'], function (ko) {
    ko.components.register('concerts-list',
        { require: 'koConcertsList' }
    );

    ko.components.register('current-artist',
        { require: 'koCurrentArtist' }
    );

    // TODO: just use template (no component?) viewModel isn't needed atm
    ko.components.register('current-event',
        { require: 'koCurrentEvent' }
    );

    ko.components.register('current-venue',
        { require: 'koCurrentVenue' }
    );

    ko.components.register('info-list-toggle',
        { require: 'koInfoListToggle' }
    );

    ko.components.register('menu-toggle',
        { require: 'koMenuToggle' }
    );

    ko.components.register('request-all-lastfm',
        { require: 'koRequestAllLastFm' }
    );

    ko.components.register('venues-list',
        { require: 'koVenuesList' }
    );

    ko.components.register('status-messages',
        { require: 'koStatusMessages' }
    );

    ko.components.register('info-window',
        { require: 'koInfoWindow' }
    );
});
