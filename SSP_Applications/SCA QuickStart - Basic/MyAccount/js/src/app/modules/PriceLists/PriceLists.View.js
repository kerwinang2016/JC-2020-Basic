// Price.View.js
// -----------------------
// Views for viewing Price list.
define('PriceLists.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'price_lists'

	,	title: _('Price Lists').translate()

	,	page_header: _('Price Lists').translate()

	,	attributes: {
			'class': 'priceLists'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
		}


	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'price_lists', [{
				text: this.title
			,	href: '/pricelists'
			}]);
		}

	});
});
