// settings.js
define(function () {
    var initAddress;
    var initLatlng;
    var latitude;
    var longitude;
    // use last location
    if (localStorage &&
        localStorage.lastAddress &&
        localStorage.latitude &&
        localStorage.longitude) {
        latitude = Number(localStorage.latitude);
        longitude = Number(localStorage.longitude);
        initAddress = localStorage.lastAddress;
        initLatlng = { latitude: latitude, longitude: longitude };
    } else {
        // program default
        initAddress = 'Milwaukee, WI';
        initLatlng = { latitude: 43.07772111168133, longitude: -88.10023715 };
    }
    return {
        initAddress: initAddress,
        initLatlng: initLatlng,
    };
});
