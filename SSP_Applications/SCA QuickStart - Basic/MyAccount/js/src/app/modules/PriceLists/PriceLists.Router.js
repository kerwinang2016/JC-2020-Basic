// PriceLists.Router.js
// -----------------------

// Router for handling TrainngGuides
define('PriceLists.Router', ['PriceLists.View'], function (PriceListsView)
{
	'use strict';

	return Backbone.Router.extend({

		routes:
		{
			'pricelists': 'priceLists'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
		// Price Lists
	,	priceLists: function (id, options)
		{
			var view = new PriceListsView({
					application: this.application
			});

		view.showContent();
		}
	});
});
