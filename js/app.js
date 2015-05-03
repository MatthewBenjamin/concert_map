// Custom Handler for Google Map
ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var mapOptions = {
            zoom: 12,
            center: new google.maps.LatLng(value.mapCenter().centerLat, value.mapCenter().centerLon)
        };
        var map = new google.maps.Map(element, mapOptions);

        for (var l in value.mapMarkers())
        {
            var latLng = new google.maps.LatLng(
                            value.mapMarkers()[l].latitude,
                            value.mapMarkers()[l].longitude);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map
              });
        }
    }
};

// Map center on page load
var mapCenter = {
    centerLat: 37.5667,
    centerLon: 126.9667
};

var mapMarkers = [
    {name: "Seoul", latitude: 37.5667 , longitude: 126.9667},
    {name: "Gangnam", latitude: 37.4967, longitude: 127.0275}
];

// Get Meetup API data based on mapCenter
var getMeetups = function(latitude, longitude) {
    console.log(latitude, longitude);
    var request = 'https://api.meetup.com/2/open_events?' +
    'and_text=False&' +
    //'offset=0&' +
    'format=json&' +
    'lon=' + longitude + '&' +
    'limited_events=True&' +    // SHOULD THIS BE TRUE OR FALSE? (or don't include?)
    'photo-host=public&' +      // WHAT DOES THIS DO?
    'page=20&' +                // TODO: fine tune this value
    'radius=25.0&' +            // TODO: fine tune this value
    'lat=' + latitude + '&' +
    'desc=False&' +             // WHAT DOES THIS DO?
    'status=upcoming&' +        // DO I NEED THIS?
    'sig_id=2220302&' +
    'sig=cd6dba060220731727d2b23f0ae2e28283fa0a69';     // SIG (and potentialy sig_id) will need to be changed
                                                        // if certain request parameters are changed

    //console.log(request);
    console.log($.ajax(request));
};

var ViewModel =  function () {
    var self = this;

    self.mapCenter = ko.observable(mapCenter);          // TODO: base this on input from search bar or default value
    self.mapMarkers = ko.observableArray(mapMarkers);
    self.meetups = ko.observable(getMeetups(self.mapCenter().centerLat, self.mapCenter().centerLon));
};

ko.applyBindings(ViewModel);