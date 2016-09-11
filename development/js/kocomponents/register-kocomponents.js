// register-kocomponents.js
require(['knockout'], function (ko) {
    ko.components.register('concerts-list',
        { require: '../kocomponents/concerts-list' }
    );

    ko.components.register('venues-list',
        { require: '../kocomponents/venues-list' }
    );

    // TODO: just use template (no component?) viewModel isn't needed atm
    ko.components.register('current-event',
        { require: '../kocomponents/current-event' }
    );

    ko.components.register('current-venue',
        { require: '../kocomponents/current-venue' }
    );

    ko.components.register('current-artist',
        { require: '../kocomponents/current-artist' }
    );

    ko.components.register('request-all-lastfm',
        { require: '../kocomponents/request-all-lastfm' }
    );

    ko.components.register('status-messages',
        { template: { require: 'text!../kotemplates/status-messages.html' } }
    );

    ko.components.register('info-window',
        { template: { require: 'text!../kotemplates/info-window.html' } }
    );

    ko.components.register('info-list-toggle',
        { require: '../kocomponents/info-list-toggle' }
    );

    ko.components.register('menu-toggle',
        { require: '../kocomponents/menu-toggle' }
    );
});
