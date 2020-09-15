// @module DSC.CstmProfile.CstemProfile
define('DSC.CstmProfile.CstemProfile.View'
,	[
		'dsc_cstmprofile_cstemprofile.tpl'
	,	'Utils'
	,	'Backbone'
	,	'jQuery'
	,	'underscore'
	]
,	function (
		dsc_cstmprofile_cstemprofile_tpl
	,	Utils
	,	Backbone
	,	jQuery
	,	_
	)
{
	'use strict';

	// @class DSC.CstmProfile.CstemProfile.View @extends Backbone.View
	return Backbone.View.extend({

		template: dsc_cstmprofile_cstemprofile_tpl

	,	initialize: function (options) {

			/*  Uncomment to test backend communication with an example service 
				(you'll need to deploy and activate the extension first)
			*/
			this.message = '';
			// var service_url = Utils.getAbsoluteUrl(getExtensionAssetsPath('services/CstemProfile.Service.ss'));

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

		//@method getContext @return DSC.CstmProfile.CstemProfile.View.Context
	,	getContext: function getContext()
		{
			//@class DSC.CstmProfile.CstemProfile.View.Context
			this.message = this.message || ''
			return {
				message: this.message
			};
		}
	});
});