define(['gmap'], function () {
    var infoWindow = {};

    infoWindow.window = new google.maps.InfoWindow();

    // Grab HTML for infoWindow.window
    function infoWindowView() {
        var html = document.getElementsByTagName('info-window')[0];
        return html;
    }

    // Preserve info window content, see
    // http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
    function removeContent() {
        var content = infoWindow.window.getContent();
        if (content) {
            document.getElementsByClassName('info-window-container')[0].appendChild(content);
        }
    }

    function infoWindowClose() {
        infoWindow.window.setContent(infoWindowView());
    }

    infoWindow.resetContentForNewLocation = function () {
        infoWindow.window.close();
        removeContent();
    };

    infoWindow.window.setContent(infoWindowView());
    google.maps.event.addListener(infoWindow.window, 'closeclick', infoWindowClose);

    return infoWindow;
});
