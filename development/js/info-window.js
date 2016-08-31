define(['gmap'], function() {
    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(infoWindow, 'closeclick', infoWindowClose);

    // Grab HTML for infoWindow
    var infoWindowView = function(){
        //console.log('info window view');
        //var html = document.getElementsByClassName("info-content")[0];
        var html = document.getElementsByTagName("info-window")[0];
        //console.log(html);
        return html;
    };

    infoWindow.setContent(infoWindowView());

    // Preserve info window content, see
    // http://stackoverflow.com/questions/31970927/binding-knockoutjs-to-google-maps-infowindow-content
    function infoWindowClose() {
        var content = infoWindow.getContent();
        if (content) {
            document.getElementsByClassName("info-window-container")[0].appendChild(content);
        }
        infoWindow.setContent(infoWindowView());
    }
    return infoWindow;
})