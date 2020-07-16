define('Transferwise.Router', ['Transferwise.View'], function (View)
{
	'use strict';

	return Backbone.Router.extend({

		routes: {
			'transferwise': 'showInstructions'
		}

	,	initialize: function (application)
		{
			this.application = application;
		}

	,	showInstructions: function ()
		{
			new View({
				application: this.application
			}).showContent();
		}
	});
});
