define('Home', function ()
{
	'use strict';

	var View = Backbone.View.extend({

		template: 'home'

	,	title: _('Welcome to the store').translate()

	,	page_header: _('Welcome to the store').translate()

	,	attributes: {
			'id': 'home-page'
		,	'class': 'home-page'
		}

	,	events: {}

	});

	var Router = Backbone.Router.extend({

		routes: {
			'': 'homePage'
		,	'?*params': 'homePage'
		}

	,	initialize: function (Application)
		{
			this.application = Application;
		}

	,	homePage: function ()
		{
			var view = new View({
				application: this.application
			});

			view.showContent();
			var view = new Backbone.View({
			    application: this.application
			});

			view.template = 'home_popup';
			view.page_header = 'ORDER DELIVERY NOTICE';

			view.showInModal({
			    className: ('home-popup-') +' iframe-modal'
			});
		}
	});

	return {
		View: View
	,	Router: Router
	,	mountToApp: function (Application)
		{
			return new Router(Application);
		}
	};
});
