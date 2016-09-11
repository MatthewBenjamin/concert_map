// venue-api-utils.js
define(function () {
    var venueApiUtils = {};

    function parseAddress(data, provider) {
        var formattedAddress;
        var locationInfo;
        if (provider === 'Four Square') {
            locationInfo = data.location || null;
            formattedAddress = locationInfo.formattedAddress.join(', ') || null;
        } else if (provider === 'Google Places') {
            formattedAddress = data.formatted_address || null;
        }
        return formattedAddress;
    }

    function parsePhone(data, provider) {
        var formattedPhone;
        var contactInfo;
        if (provider === 'Four Square') {
            contactInfo = data.contact || null;
            formattedPhone = contactInfo.formattedPhone || null;
        } else if (provider === 'Google Places') {
            formattedPhone = data.formatted_phone_number || null;
        }
        return formattedPhone;
    }

    function parseRating(data, provider) {
        var rating = data.rating || null;

        if (rating) {
            rating = rating.toString();
            if (provider === 'Four Square') {
                rating += ' / 10';
            } else if (provider === 'Google Places') {
                rating += ' / 5';
            }
        }

        return rating;
    }

    function parseCategories(data, provider) {
        var categoryInfo;
        var categories;
        if (provider === 'Four Square') {
            categoryInfo = data.categories || null;
            categories = categoryInfo.map(function (c) {
                return c.shortName;
            });
        } else if (provider === 'Google Places') {
            categories = data.types || null;
        }
        return categories;
    }

    function parseOfficialURL(data, provider) {
        var officialURL;

        if (provider === 'Four Square') {
            officialURL = data.url || null;
        } else if (provider === 'Google Places') {
            officialURL = data.website || null;
        }
        return officialURL;
    }

    function parseProviderURL(data, provider) {
        var providerURL;

        if (provider === 'Four Square') {
            providerURL = data.url || null;
        } else if (provider === 'Google Places') {
            providerURL = data.url || null;
        }
        return providerURL;
    }

    venueApiUtils.parseResults = function (data, provider) {
        return {
            formattedAddress: parseAddress(data, provider),
            formattedPhone: parsePhone(data, provider),
            name: data.name || null,
            rating: parseRating(data, provider),
            categories: parseCategories(data, provider),
            description: data.description || null,
            officialURL: parseOfficialURL(data, provider),
            providerURL: parseProviderURL(data, provider),
            provider: provider,
        };
    };

    venueApiUtils.checkCurrentVenue = function (venueIndex) {
        return (self.currentVenue() === self.concertVenues()[venueIndex]);
    };

    venueApiUtils.showNotFoundStatusIfNeeded = function (foundVenue, venueDetails, errorMsg) {
        if (!foundVenue) {
            venueDetails({
                status: errorMsg,
                data: null,
            });
        }
    };

    venueApiUtils.venueNotFound = function (venue, errorMsg) {
        venue().detailedInfo = {
            data: null,
            status: errorMsg,
        };
        venue(venue());
    };

    return venueApiUtils;
});
