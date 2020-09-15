// @module DSC.MyCoolExtension.MyCoolModule
define('DSC.MyCoolExtension.MyCoolModule.View'
,	[
		'dsc_mycoolextension_mycoolmodule.tpl'
	,	'Utils'
	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		dsc_mycoolextension_mycoolmodule_tpl
	,	Utils
	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class DSC.MyCoolExtension.MyCoolModule.View @extends Backbone.View
	return Backbone.View.extend({

		template: dsc_mycoolextension_mycoolmodule_tpl

	,	initialize: function (options) {

			/*  Uncomment to test backend communication with an example service 
				(you'll need to deploy and activate the extension first)
			*/
			this.message = '';
			// var service_url = Utils.getAbsoluteUrl(getExtensionAssetsPath('services/MyCoolModule.Service.ss'));

			// jQuery.get(service_url)
			// .then((result) => {

			// 	this.message = result;
			// 	this.render();
			// });
		}

	,	events: {
		}

	,	bindings: {
		}

	, 	childViews: {
			
		}

		//@method getContext @return DSC.MyCoolExtension.MyCoolModule.View.Context
	,	getContext: function getContext()
		{
			//@class DSC.MyCoolExtension.MyCoolModule.View.Context
			this.message = this.message || ''
			return {
				message: this.message
			};
		}
	});
});