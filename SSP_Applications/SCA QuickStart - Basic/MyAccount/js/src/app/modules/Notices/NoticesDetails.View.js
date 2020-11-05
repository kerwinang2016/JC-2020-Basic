define('NoticesDetails.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'notices_details'

	,	title: _('Notices Details').translate()

	,	page_header: _('Notices Details').translate()

	,	attributes: {
			'class': 'notices-details'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.model = options.model;
			this.model.set('custrecord_nba_read_notice','T');
			this.model.save();
		}


	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'noticesdetails', [{
				text: this.title
			,	href: '/noticesdetails'
			}]);
		}

	});
});
