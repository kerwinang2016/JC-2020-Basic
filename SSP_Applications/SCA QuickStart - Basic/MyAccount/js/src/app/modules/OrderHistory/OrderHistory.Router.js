// OrderHistory.Router.js
// -----------------------
// Router for handling orders
define('OrderHistory.Router',  ['OrderHistory.Views', 'PlacedOrder.Model','PlacedOrder.Collection'], function (Views, Model, Collection)
{

	'use strict';

	return Backbone.Router.extend({

		routes: {
			'ordershistory': 'ordersHistory'
		,	'savedorders': 'savedorders'
		,	'ordershistory?:options': 'ordersHistory'
		,	'ordershistory/view/:id': 'orderDetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	// list orders
	,	savedorders: function(options)
		{
			window.location = SC._applications.MyAccount.getConfig().siteSettings.touchpoints.home + "#cart";
		}
	,	ordersHistory: function (options)
		{
			options = (options) ? SC.Utils.parseUrlOptions(options) : {page: 1};

			options.page = options.page || 1;
			options.search = options.search || "";
			options.cmtdate = options.cmtdate || "";
			options.startdate = options.startdate || "";
			options.enddate = options.enddate || "";
			options.cmtstatus = options.cmtstatus || "";
			var collection = new Collection(options.search)
			,	view = new Views.List({
					application: this.application
				,	page: options.page
				,	search: options.search
				,	collection: collection
				, sort: options.sort
				, cmtdate: options.cmtdate
				, startdate: options.startdate
				, enddate: options.enddate
				, cmtstatus: options.cmtstatus
				});

			collection
				.on('reset', view.showContent, view)
				.fetch({
					killerId: this.application.killerId
				,	data: options
				,	reset: true
				, async: true
				});
			//collection.on('change:dateneeded',this.someAction, this);
		}

	// view order's detail
	,	orderDetails: function (id)
		{
			var customerid = SC.Application('MyAccount').getUser().get('parent');

			var model = new Model()
			,	view = new Views.Details({
					application: this.application
				,	id: id
				,	model: model
				});

			jQuery.ajax({
				url: _.getAbsoluteUrl('js/DesignOptions_Config.json'),
				async: false,
				success: function(data){
					window.design_options = data
				},
			});
			model
				.on('change', view.showContent, view)
				.fetch({data:jQuery.param({internalid: id,customerid:customerid})});
		}
	});
});
