define('NoticesList.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'notices_list'

	,	title: _('Notices').translate()

	,	page_header: _('Notices').translate()

	,	attributes: {
			'class': 'notices-list'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.collection = options.collection;
			console.log(this.collection);
		}
	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}

	,	setLoading: function (is_loading)
		{
			this.isLoading = is_loading;
		}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'noticeslist', [{
				text: this.title
			,	href: '/noticeslist'
			}]);
		}

	});
});
