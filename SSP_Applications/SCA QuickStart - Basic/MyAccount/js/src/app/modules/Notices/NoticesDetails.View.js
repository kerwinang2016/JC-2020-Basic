define('NoticesDetails.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'notices_details'

	,	title: _('Notice Details').translate()

	,	page_header: _('Notice Details').translate()

	,	attributes: {
			'class': 'notices-details'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
			this.model = options.model;
		}


	,	showContent: function ()
		{
			this.model.set('custrecord_nba_noticeboard_custrecord_nba_read_notice','T');
			this.model.save();
			this.application.getLayout().showContent(this, 'noticedetails', [{
				text: this.title
			,	href: '/noticedetails/'+this.model.get('internalid')
			}]);
		}

	});
});
