// current-artist.js
define(['knockout', 'text!../kotemplates/current-artist.html'],
       function (ko, htmlString) {

        var currentArtist = function(params) {
            var self = this;
            // TODO: uncommenting below breaks display, but not needed ATM
            //      perhaps due to with binding in template?
            //self.currentArtist = params.currentArtist;

            // TODO: add last.fm API request
        }

        return { viewModel: currentArtist, template: htmlString }
})