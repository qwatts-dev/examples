// @module QWatts.QWB2BAdditionalCopy.Main
define('QWatts.QWB2BAdditionalCopy.Main.View'
,	[
	'qwatts_qwb2badditionalcopy_main.tpl'
	
	,	'QWatts.QWB2BAdditionalCopy.Main.SS2Model'
	
	,	'Backbone'
    ]
, function (
	qwatts_qwb2badditionalcopy_main_tpl
	
	,	MainSS2Model
	
	,	Backbone
)
{
    'use strict';

	// @class QWatts.QWB2BAdditionalCopy.Main.View @extends Backbone.View
	return Backbone.View.extend({

		template: qwatts_qwb2badditionalcopy_main_tpl

	,	initialize: function (options) {

		try {
			//get variables				
			var self = this;
			self.options = options;
			self.type = options.type;
			self.microname = options.microname;
			self.itemsku = options.itemsku;
			self.render();

			//run backend service (ss2)
			this.model = new MainSS2Model();
			var self = this;
			this.model.fetch({
				data:{
				microname: self.microname,
				itemsku: self.itemsku
				}
			}).done(function(result) {
				console.log("result of .fetch = ");
				console.log(result);
				self.message = result.message + result.error; //for errors
				self.additionalcopy = result.additionalcopy;
				self.render();
			});

		} catch (error) {
			console.log("Error in Main.View.Js")
			console.log(error)
		}
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {

		}

		//@method getContext @return QWatts.QWB2BAdditionalCopy.Main.View.Context
	,	getContext: function getContext()
		{
			//@class QWatts.QWB2BAdditionalCopy.Main.View.Context
			this.message = this.message || 'Hello World!!';			
			return {
				message: this.message,
				additionalcopy: this.additionalcopy
			};
		}
	});
});
