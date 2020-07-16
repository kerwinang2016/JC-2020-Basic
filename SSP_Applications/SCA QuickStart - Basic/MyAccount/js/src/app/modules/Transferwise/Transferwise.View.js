define('Transferwise.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'transferwise'

	,	attributes: {
			'class': 'Transferwise'
		}

	,	initialize: function (options)
		{
			this.application = options.application;
			this.model = this.application.getUser();
			this.title = _('Payment Instruction').translate();
		}

	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'transferwise', [{
				text: this.title
			,	href: '/transferwise'
			}]);
		}
	});
});
