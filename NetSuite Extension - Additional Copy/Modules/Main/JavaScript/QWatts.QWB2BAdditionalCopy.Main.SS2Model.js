// Model.js
// -----------------------
// @module Case
define("QWatts.QWB2BAdditionalCopy.Main.SS2Model", ["Backbone", "Utils"], function(
    Backbone,
    Utils
) {
    "use strict";

    // @class Case.Fields.Model @extends Backbone.Model
    return Backbone.Model.extend({
        //@property {String} urlRoot
        urlRoot: Utils.getAbsoluteUrl(
            getExtensionAssetsPath(
                "Modules/Main/SuiteScript2/Main.Service.ss"
            ),
            true
        )
});
});
