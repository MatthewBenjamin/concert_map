// bands-in-town.js
define(['jquery'], function($) {
    var bandsInTown = {};

    function concertTickets(ticketStatus) {
        if (ticketStatus === "available") {
            return true;
        } else {
            return false;
        }
    }

    function makeSubtitle(artistCount) {
        var subtitle;
        if (artistCount > 1) {
            artistCount -= 1;
            subtitle = "& " + artistCount + " more act";
            if (artistCount > 1) {
                subtitle += "s";
            }
        } else {
            subtitle = null;
        }
        return subtitle;
    }

    function makeTimeInfo(time) {
        time = new Date(Date.parse(time));
        var timeString = time.toDateString();
        return {
            day: timeString.substring(0,3),
            date: timeString.substring(4,10),
            year: time.getFullYear(),
            time: time.toUTCString().substring(17,22)
        };
    }

    function parseConcerts(concerts) {
        //console.log(data);
        var time;
        var artistCount;
        //var parsedConcerts = [];
        for (var i = 0; i < concerts.length; i++) {
            // assign tickets boolean
            concerts[i].tickets_available = concertTickets(concerts[i].ticket_status);
            // write subtitle
            artistCount = concerts[i].artists.length;
            concerts[i].subtitle = makeSubtitle(artistCount);
            // write timeInfo
            concerts[i].timeInfo = makeTimeInfo(concerts[i].datetime);
            //parseConcerts.push(concerts[i]);
        }
        //return parseConcerts;
    }

    bandsInTown.makeRequestURL = function(latitude, longitude) {
        var requestURL = 'http://api.bandsintown.com/events/search.json?' +
            'api_version=2.0&' +
            'app_id=google-map-mashup&' +
            'location=' + latitude + ',' + longitude + '&' +
            'per_page=100&' +
            'format=json';
        return requestURL;
    }

    bandsInTown.requestSettings = {
        dataType: "jsonp",
        crossDomain: "true",
        timeout: 11000,
        success: function(data, status, jqXHR) {
            if (data) {
                self.concertsStatus(null);
                parseConcerts(data);
                self.concerts(data);
            } else {
                self.concertsStatus(data.message);
            }
        },
        error: function() {
                self.concertsStatus('Concert data could not be loaded. Please try again.');
        }
    };

    return bandsInTown;
});