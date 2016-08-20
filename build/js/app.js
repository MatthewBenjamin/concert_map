function infoWindowClose(){var e=infoWindow.getContent();e&&document.getElementById("info-window-container").appendChild(e)}var map,defaultLatlng,defaultAddress;!function(){if(localStorage.lastAddress&&localStorage.latitude&&localStorage.longitude){var e=Number(localStorage.latitude),t=Number(localStorage.longitude);defaultAddress=localStorage.lastAddress,defaultLatlng={latitude:e,longitude:t}}else defaultAddress="Milwaukee, WI",defaultLatlng={latitude:43.07772111168133,longitude:-88.10023715}}(),setTimeout(function(){map||$(".map-error").append("Google Map could not be loaded")},8e3),ko.bindingHandlers.googlemap={init:function(e){var t=new google.maps.LatLng(defaultLatlng.latitude,defaultLatlng.longitude),n={center:t};map=new google.maps.Map(e,n)},update:function(e,t){var n=t();map.fitBounds(n.mapBounds)}};var infoWindow=new google.maps.InfoWindow;google.maps.event.addListener(infoWindow,"closeclick",infoWindowClose);var infoWindowView=function(){return html=document.getElementById("info-content"),html},ViewModel=function(){function e(e,t){for(var n=0;n<t.length;n++)if(e===t[n].id)return n;return-1}function t(t){for(var n,o,a=[],r=0;r<t.length;r++)n=e(t[r].venue.id,a),o=t[r].venue,n===-1?(o.concerts=[],o.concerts.push(t[r]),a.push(o),t[r].venueIndex=a.indexOf(o)):(t[r].venueIndex=n,a[n].concerts.push(t[r]));return a}function n(e,t){return e=e.toLowerCase(),e.indexOf(t)>-1}function o(e,t,o){for(var a=0;a<e.length;a++)if(n(e[a][o],t))return!0}function a(e,t){if(o(e,t,"name"))return!0;for(var a=0;a<e.length;a++)if(e[a].lastfm&&e[a].lastfm.artist&&(n(e[a].lastfm.artist.bio.content,t)||o(e[a].lastfm.artist.tags.tag,t,"name")))return!0}function r(e,t,n){localStorage&&(localStorage.setItem("lastAddress",e),localStorage.setItem("latitude",t),localStorage.setItem("longitude",n))}function s(e){for(var t,n,o,a=0;a<e.length;a++)"available"===e[a].ticket_status?e[a].tickets_available=!0:e[a].tickets_available=!1,o=e[a].artists.length,o>1?(o-=1,e[a].subtitle="& "+o+" more act",o>1&&(e[a].subtitle+="s")):e[a].subtitle=null,t=new Date(Date.parse(e[a].datetime)),n=t.toDateString(),e[a].timeInfo={day:n.substring(0,3),date:n.substring(4,10),year:t.getFullYear(),time:t.toUTCString().substring(17,22)}}function u(e){return e.mbid?"mbid="+e.mbid:"artist="+e.name}function l(e){var t=u(ko.mapping.toJS(e)),n={success:function(t,n,o){t.error?(e.lastfm.status=I,v.currentArtist(ko.mapping.fromJS(e))):(e.lastfm=t,e.lastfm.status=null,v.currentArtist(ko.mapping.fromJS(e)))},error:function(t,n,o){e.lastfm.status=I,v.currentArtist(ko.mapping.fromJS(e))},timeout:11e3};$.ajax(h+t,n)}function i(){for(var e,t,n=0;n<v.concerts().length;n++)for(var o=0;o<v.concerts()[n].artists.length;o++)t=u(v.concerts()[n].artists[o]),v.artistCount(v.artistCount()+1),function(n,o){e={success:function(e,t,a){e.error?v.concerts()[n].artists[o].lastfm.status=I:(v.concerts()[n].artists[o].lastfm=e,v.concerts()[n].artists[o].lastfm.status=null)},error:function(e,t,a){v.concerts()[n].artists[o].lastfm.status=I},complete:function(e,t){console.log(t),v.artistCount(v.artistCount()-1)},timeout:11e3},v.concerts()[n].artists[o].lastfm={},$.ajax(h+t,e)}(n,o)}function c(e){var t="https://www.googleapis.com/youtube/v3/search?part=snippet&q="+e+"&key=AIzaSyA8B9NC0lW-vqhQzWmVp8XwEMFbyg01blI",n={success:function(e,t,n){for(var o=e.items,a=0;a<o.length;a++)o[a].url="https://www.youtube.com/watch?v="+o[a].id.videoId;v.youtubeStatus(null),v.currentArtistYoutube(o),v.currentArtist().youTube=o},error:function(){v.youtubeStatus("Youtube search results could not be loaded.")},timeout:8e3};v.youtubeStatus("Loading Youtube search results..."),$.ajax(t,n)}function d(e){return v.currentVenue()===v.concertVenues()[e]}function f(e,t){var n=new google.maps.places.PlacesService(map),o={placeId:e};n.getDetails(o,function(e,n){n==google.maps.places.PlacesServiceStatus.OK&&d(t)?(v.concertVenues()[t].detailedInfo.googlePlaces=e,v.currentVenuePlaces(e),v.venueInfoStatus(null)):(v.venueInfoStatus(venueInfoStatus),console.log(e,n))})}function g(e){venueName=v.currentVenue().name,latitude=v.currentVenue().latitude,longitude=v.currentVenue().longitude;var t=new google.maps.places.PlacesService(map),n=new google.maps.LatLng(latitude,longitude),o={location:n,query:venueName,radius:"1"};t.textSearch(o,function(t,n){n==google.maps.places.PlacesServiceStatus.OK?f(t[0].place_id,e):(v.venueInfoStatus(k),console.log(n,t))})}function m(e,t){var n="https://api.foursquare.com/v2/venues/"+e+"?oauth_token=PV4PYPFODETGIN4BI22F1YN23FER1YPGAKQOBLCODUP251GX&v=20160105",o={success:function(e,n,o){d(t)&&(v.concertVenues()[t].detailedInfo.fourSquare=e.response.venue,v.currentVenueFourSquare(e.response.venue),v.venueInfoStatus(null))},error:function(e,n,o){v.venueInfoStatus(S),g(t)},timeout:8e3};$.ajax(n,o)}function p(e){var t=v.concertVenues().indexOf(e),n=e.latitude,o=e.longitude,a="https://api.foursquare.com/v2/venues/search?client_id=HEC4M2QKHJVGW5L5TPIBLBWBFJBBFSCIFFZDNZSGD2G5UGTI&client_secret=AJKA10FIBJE3CUKUBYYYOGZ0BU2XNGMXNGUA43LAI0PQT3ZD&v=20160105&m=foursquare&ll="+n+","+o+"&query="+e.name+"&intent=match",r={success:function(e,n,o){e.response.venues.length>0&&d(t)?m(e.response.venues[0].id,t):(v.venueInfoStatus(S),g(t))},error:function(e,n,o){v.venueInfoStatus(S),g(t)},timeout:8e3};e.detailedInfo={},v.venueInfoStatus("Loading Four Square data for venue..."),$.ajax(a,r)}var v=this;v.currentAddress=ko.observable(defaultAddress),v.mapCenter=ko.observable(defaultLatlng),v.concerts=ko.observableArray(),v.concertVenues=ko.observableArray(),v.searchInput=ko.observable(),v.filteredEvents=ko.observableArray(),v.filteredVenues=ko.observableArray(),v.currentEvent=ko.observable(),v.currentVenue=ko.observable(),v.currentArtist=ko.observable(),v.currentArtistYoutube=ko.observableArray(),v.currentVenueFourSquare=ko.observable(),v.currentVenuePlaces=ko.observable(),v.extraInfoBoolean=ko.observable(!0),v.showEventInfo=ko.observable(!1),v.showVenueInfo=ko.observable(!1),v.showArtistInfo=ko.observable(!1),v.displaySmallMenu=ko.observable(!1),v.hideLargeMenu=ko.observable(!1),v.listEvents=ko.observable(!0),v.listVenues=ko.observable(!1),v.geocoderStatus=ko.observable(),v.concertsStatus=ko.observable(),v.venueInfoStatus=ko.observable(),v.youtubeStatus=ko.observable(),v.showExtraInfo=ko.computed(function(){return!(!(v.showEventInfo()||v.showVenueInfo()||v.showArtistInfo())||!v.extraInfoBoolean())}),v.buildAllVenues=ko.computed(function(){var e=v.concerts();v.concertVenues(t(e))}),v.mapMarkers=ko.computed(function(){for(var e=[],t=v.concertVenues(),n=0;n<t.length;n++){var o=new google.maps.LatLng(t[n].latitude,t[n].longitude),a=new google.maps.Marker({position:o,title:t[n].name,icon:"images/red.png",map:map,venueIndex:n});google.maps.event.addListener(a,"mouseup",function(){var e=this;infoWindow.setContent(infoWindowView()),v.currentVenue(v.concertVenues()[e.venueIndex]),infoWindow.open(map,e),e.setAnimation(google.maps.Animation.BOUNCE),setTimeout(function(){e.setAnimation(google.maps.Animation["null"])},700)}),e.push(a)}return e}),v.mapBounds=ko.observable(),v.findMapBounds=ko.computed(function(){for(var e=v.mapMarkers(),t=new google.maps.LatLngBounds,n=0;n<e.length;n++)t.extend(e[n].getPosition());v.mapBounds(t)}),v.searchConcerts=ko.computed(function(){if(v.searchInput()){for(var e,o,r=v.searchInput().toLowerCase(),s=[],u=0;u<v.concerts().length;u++)o=v.concerts()[u],(n(o.venue.name,r)||n(o.venue.city,r)||a(o.artists,r))&&s.push(o);e=t(s),v.filteredEvents(s),v.filteredVenues(e)}else t(v.concerts()),v.filteredEvents(v.concerts()),v.filteredVenues(v.concertVenues())}),v.mapMarkersSearch=ko.computed(function(){for(var e=v.concertVenues(),t=v.filteredEvents(),n=v.concerts(),o=0;o<e.length;o++){for(var a,r=0;r<e[o].concerts.length;r++)a=a||t.indexOf(e[o].concerts[r])>-1;t===n?v.mapMarkers()[o].setIcon("images/red.png"):a?v.mapMarkers()[o].setIcon("images/blue.png"):v.mapMarkers()[o].setIcon("images/clear.png"),a=null}}),v.closeSmallMenu=function(){v.displaySmallMenu(!1)},v.openSmallMenu=function(){v.displaySmallMenu(!0)},v.toggleLargeMenu=function(){v.hideLargeMenu()?v.hideLargeMenu(!1):v.hideLargeMenu(!0)},v.toggleExtraInfo=function(){v.extraInfoBoolean()?v.extraInfoBoolean(!1):(v.showEventInfo(!1),v.showVenueInfo(!1),v.showArtistInfo(!1),v.extraInfoBoolean(!0))},v.showEvents=function(){v.listEvents(!0),v.listVenues(!1)},v.showVenues=function(){v.listEvents(!1),v.listVenues(!0)},v.backToEvent=function(e){selectEvent(ko.mapping.toJS(e))},v.selectEvent=function(t){var n=e(t.venue.id,v.concertVenues());v.selectMarker(n),v.currentEvent(ko.mapping.fromJS(t)),v.showEventInfo(!0),v.showVenueInfo(!1),v.showArtistInfo(!1)},v.selectFilteredVenue=function(t){var n=e(t.id,v.concertVenues());v.selectVenue(v.concertVenues()[n])},v.selectVenue=function(e){var t=e||v.concertVenues()[v.currentEvent().venueIndex()];v.selectMarker(v.concertVenues.indexOf(t)),v.showVenueInfo(!0),v.showEventInfo(!1),v.showArtistInfo(!1)},v.selectArtist=function(e){v.currentArtist(e),v.showArtistInfo(!0),v.showEventInfo(!1),v.showVenueInfo(!1)},v.closeExtraInfo=function(){v.showEventInfo(!1),v.showVenueInfo(!1),v.showArtistInfo(!1)},v.selectMarker=function(e){google.maps.event.trigger(v.mapMarkers()[e],"mouseup"),map.panTo(v.mapMarkers()[e].position)};var b=new google.maps.Geocoder;v.getMapGeocode=ko.computed(function(){if(defaultAddress!=v.currentAddress()){var e=setTimeout(function(){v.geocoderStatus("Location coordinates could not be loaded.")},8e3);b.geocode({address:v.currentAddress()},function(t,n){if(v.geocoderStatus("Setting map location..."),n==google.maps.GeocoderStatus.OK){clearTimeout(e),v.geocoderStatus(null);var o=t[0].geometry.location.lat(),a=t[0].geometry.location.lng(),s={latitude:o,longitude:a};s!=v.mapCenter()&&(console.log("map center: ",s),console.log("self center: ",v.mapCenter()),v.mapCenter(s),r(v.currentAddress(),o,a),defaultLatlng={latitude:o,longitude:a})}else v.geocoderStatus("Geocoder error because: "+n)})}}),v.getConcerts=ko.computed(function(){if(0===v.concerts().length&&v.mapCenter()===defaultLatlng||v.concerts().length>0&&v.mapCenter().latitude!==defaultLatlng.latitude&&v.mapCenter().longitude!==defaultLatlng.longitude){var e=v.mapCenter().latitude,t=v.mapCenter().longitude,n="http://api.bandsintown.com/events/search.json?api_version=2.0&app_id=google-map-mashup&location="+e+","+t+"&per_page=100&format=json",o={dataType:"jsonp",crossDomain:"true",success:function(e,t,n){v.mapMarkers().forEach(function(e){e.setMap(null)}),e&&(v.concertsStatus(null),s(e),v.concerts(e))},error:function(){v.concertsStatus("Concert data could not be loaded. Please try again.")},timeout:11e3};v.concertsStatus("Loading Concert Data..."),$.ajax(n,o)}});var h="http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=d824cbbb7759624aa8b3621a627b70b8&format=json&",I="Sorry, additional information from Last.fm could not be loaded.";v.getArtistInfo=ko.computed(function(){var e=v.currentArtist();e&&!e.lastfm&&(e.lastfm={},e.lastfm.status="Loading detailed artist info...",l(e))}),v.requestAllArtistInfo=ko.observable(!1),v.artistCount=ko.observable(0),v.allArtistStatusUpdate=ko.computed(function(){return 0===v.artistCount()?null:v.artistCount()>0?"Searching for Artist Info...":void 0}),v.searchBarFocus=ko.observable(!1),v.manualToggle=ko.observable(!1),v.anotherToggle=ko.computed(function(){v.searchBarFocus()&&v.manualToggle(!0)}),v.dontAsk=ko.observable(!1),v.askForArtistInfo=ko.computed(function(){return!v.dontAsk()&&(!(!searchBarFocus()&&!manualToggle())||void 0)}),v.getAllArtistInfo=ko.computed(function(){v.requestAllArtistInfo()&&(v.requestAllArtistInfo(!1),i())}),searchableName=function(e){return e=e.replace(/\s+/g,"+")},v.getArtistVideos=ko.computed(function(){var e=v.currentArtist();if(e)if(e.youTube)v.youtubeStatus(null),v.currentArtistYoutube(e.youTube);else{v.currentArtistYoutube(null);var t=searchableName(e.name());c(t)}});var k="Sorry, detailed venue information could not be loaded.",S="Four Square data cannot be found. Loading Google Places data instead...";v.loadDetailedVenueInfo=ko.computed(function(){var e=v.currentVenue();e&&(v.currentVenuePlaces(null),v.currentVenueFourSquare(null),e.detailedInfo?e.detailedInfo.fourSquare?v.currentVenueFourSquare(e.detailedInfo.fourSquare):e.detailedInfo.googlePlaces?v.currentVenuePlaces(e.detailedInfo.googlePlaces):v.venueInfoStatus(k):p(e))})};ko.applyBindings(ViewModel);