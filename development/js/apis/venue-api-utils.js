// venue-api-utils.js
define(function() {
    venueApiUtils = {};

    function parseAddress(data, provider) {
        var formattedAddress;
        if (provider === "Four Square") {
            var locationInfo = data.location || null;
            formattedAddress = locationInfo.formattedAddress.join(', ') || null;
        } else if (provider === "Google Places") {
            formattedAddress = data.formatted_address || null;
        }
        return formattedAddress;
    }

    function parsePhone(data, provider) {
        var formattedPhone;
        if (provider === "Four Square") {
            var contactInfo = data.contact || null;
            formattedPhone = contactInfo.formattedPhone || null;
        } else if (provider === "Google Places") {
            formattedPhone = data.formatted_phone_number || null;
        }
        return formattedPhone;
    }

    function parseRating(data, provider) {
        var rating = data.rating || null;

        if (rating) {
            rating = rating.toString()
            if (provider === "Four Square") {
                rating += " / 10";
            } else if (provider === "Google Places") {
                rating += " / 5";
            }
        }

        return rating;
    }

    function parseCategories(data, provider) {
        var categories;

        if (provider === "Four Square") {
            var categoryInfo = data.categories || null;
            categories = [];

            categoryInfo.forEach(function(c) {
                categories.push(c.shortName);
            });
        } else if (provider === "Google Places") {
            categories = data.types || null;
        }
        return categories;

    }
    function parseOfficialUrl(data, provider) {
        var officialUrl;

        if (provider === "Four Square") {
            officialUrl = data.url || null;
        } else if (provider === "Google Places") {
            officialUrl = data.website || null;
        }
        return officialUrl;
    }

    function parseProviderUrl(data, provider) {
        var providerUrl;

        if (provider === "Four Square") {
            providerUrl = data.url || null;
        } else if (provider === "Google Places") {
            providerUrl = data.url || null;
        }
        return providerUrl;
    }

    venueApiUtils.parseResults = function(data, provider) {
        return {
            formattedAddress: parseAddress(data, provider),
            formattedPhone: parsePhone(data, provider),
            name: data.name || null,
            rating: parseRating(data, provider),
            categories: parseCategories(data, provider),
            description: data.description || null,
            officialUrl: parseOfficialUrl(data, provider),
            providerUrl: parseProviderUrl(data, provider),
            provider: provider
        }
    };

    venueApiUtils.checkCurrentVenue = function(venueIndex) {
        return (self.currentVenue() === self.concertVenues()[venueIndex]);
    };

    venueApiUtils.showNotFoundStatusIfNeeded = function(foundVenue, venueDetails, errorMsg) {
        if (!foundVenue) {
            venueDetails({
                status: errorMsg,
                data: null
            });
        }

    };

    venueApiUtils.venueNotFound = function(venue, errorMsg) {
        venue().detailedInfo = {
            data: null,
            status: errorMsg
        };
        venue(venue());
    }

    return venueApiUtils;
});
