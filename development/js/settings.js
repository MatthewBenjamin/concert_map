// settings.js
define(function() {
    var initAddress;
    var initLatlng;
    // use last location
    if (localStorage.lastAddress &&
        localStorage.latitude &&
        localStorage.longitude) {
        var latitude = Number(localStorage.latitude);
        var longitude = Number(localStorage.longitude);
        initAddress = localStorage.lastAddress;
        initLatlng = { latitude: latitude, longitude: longitude };
    } else {
        // program default
        initAddress = 'Milwaukee, WI';
        initLatlng = { latitude: 43.07772111168133, longitude: -88.10023715 };
    }
    return {
        initAddress: initAddress,
        initLatlng: initLatlng
    }
});