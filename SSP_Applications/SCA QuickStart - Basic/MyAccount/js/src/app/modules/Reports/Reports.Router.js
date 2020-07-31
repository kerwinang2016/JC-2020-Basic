// Reports.Router.js
// -----------------------

// Router for handling TrainngGuides
define('Reports.Router', ['Reports.View'], function (ReportsView)
{
	'use strict';

	return Backbone.Router.extend({

		routes:
		{
			'marginreport': 'marginreport'
			, 'ordertypereport': 'ordertypereport'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
	,	marginreport: function (id, options) //JHD-30
		{
			var view = new ReportsView.Margin({
					application: this.application
			});

			view.showContent();
		}
	,	ordertypereport: function (id, options) //JHD-30
		{
			var view = new ReportsView.OrderType({
					application: this.application
			});

			view.showContent();
		}
	});
});
