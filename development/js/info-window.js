define(['gmap'], function() {
    var infoWindow = {};
    infoWindow.window = new google.maps.InfoWindow();
    google.maps.event.addListener(infoWindow.window, 'closeclick', infoWindowClose);

    // Grab HTML for infoWindow.window
    var infoWindowView = function(){
        //console.log('info window view');
        //var html = document.getElementsByClassName("info-content")[0];
        var html = document.getElementsByTagName("info-window")[0];
        //console.log(html);
        return html;
    };

    infoWindow.window.setContent(infoWindowView());

    // Preserve info window content, see
    // http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
    function removeContent() {
        var content = infoWindow.window.getContent();
        if (content) {
            document.getElementsByClassName("info-window-container")[0].appendChild(content);
        }
    }

    function infoWindowClose() {
        infoWindow.window.setContent(infoWindowView());
    }

    infoWindow.resetContentForNewLocation = function() {
        console.log('reset info content');
        infoWindow.window.close()
        removeContent();
    }

    return infoWindow;
});
