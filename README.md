#Concert Map

This project renders the next 100 upcoming concert events on a full page Google Map for your chosen location.
Concert data is retrieved from the Last.fm API.
Furthermore, you can access additional information about venues & artists through the application. See below for details.

To run it, simply open 'build/index.html' in a modern web browser.

##How to use the application:

Each map marker represents a venue that is hosting at least one event.
There is also a list view. This can be toggled to display either events or venues.

Clicking on an event or venue in the list view, or the map marker itself, will open its associated map marker.
Opening a map marker displays a list of events happening at that venue.

###Additional Information Display
Additional information about an event or venue can be accessed by clicking on that item in either the list view or map marker info window.
Optionally, the additional information display can be toggled on or off.

You can access information about: the selected event, venue, or an artist.

####Event Info

In the event information display, clicking on:

######An artist's name
    Displays information about the artist.

######A tag
    Will enter that tag as a search term (see below).

######A venue
    Displays information about the venue.

####Venue Info

In the venue information display, clicking on:

######An upcoming event
    Displays information for that event.

####Artist Info

In the artist information display, clicking on:

######A tag
    will enter that tag as a search term (see below)

###Searching for events:

Entering a search term will filter events and venue's for the following properties:

    -Venue's name
    -Venue's address
    -Event title
    -Event artists
    -Event description
    -Event tags
