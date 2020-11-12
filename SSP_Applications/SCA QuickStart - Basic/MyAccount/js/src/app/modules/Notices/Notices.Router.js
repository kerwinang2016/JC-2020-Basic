define('Notices.Router', ['Notices.Model','Notices.Collection','NoticesList.View','NoticesDetails.View'], function (NoticesModel, NoticesCollection, NoticesListView, NoticesDetailsView)
{
	'use strict';

	return Backbone.Router.extend({

		routes:
		{
			'noticeslist': 'noticeslist',
			'noticeslist/:options': 'noticeslist',
			'noticedetails/:id': 'noticedetails'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
	,	noticeslist: function (options)
		{
			var params_options = _.parseUrlOptions(options);
			this.showNoticesListHelper(params_options)
		}
	,	showNoticesListHelper: function(params_options)
		{
			var	collection = new NoticesCollection()
			,	view = new this.application.NoticesModule.NoticesListView({
					application: this.application
				,	collection: collection
				,	options: params_options
				,	page: (params_options && params_options.page)?params_options.page:1
				});

			view.collection.on('reset', view.render, view);
			view.showContent();
		}
	,	noticedetails: function (id)
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
