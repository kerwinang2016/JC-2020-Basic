define('Notices.Router', ['Notices.Model','Notices.Collection','NoticesList.View','NoticesDetails.View'], function (NoticesModel, NoticesCollection, NoticesListView, NoticesDetailsView)
{
	'use strict';

	return Backbone.Router.extend({

		routes:
		{
			'noticeslist': 'noticeslist',
			'noticeslist/:id': 'noticesdetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
	,	noticeslist: function (options)
		{
			var collection = new NoticesCollection();
			var view = new NoticesListView({
					application: this.application,
					collection: collection.records,
					data: collection
			});
			view.collection.on('reset', view.render, view);
			// view.showContent();
			jQuery.when(collection.fetch()).then(jQuery.proxy(view, 'showContent'));
			// view.showContent();
		}
	,	noticesdetails: function (id, options)
		{
			var model = new NoticesModel({ internalid: id });
			var view = new NoticesDetailsView({
					application: this.application,
					model: model
			});
			jQuery.when(model.fetch()).then(jQuery.proxy(view, 'showContent'));
			// view.showContent();
		}
	});
});
