// TrainingGuides.View.js
// -----------------------
// Views for viewing Training Guides list.
define('TrainingGuides.View', function ()
{
	'use strict';

	return Backbone.View.extend({

		template: 'training_guide'

	,	title: _('Training and Guides').translate()

	,	page_header: _('Training and Guides').translate()

	,	attributes: {
			'class': 'trainingGuides'
		}

	,	initialize: function (options)
		{
			this.options = options;
			this.application = options.application;
		}


	,	showContent: function ()
		{
			this.application.getLayout().showContent(this, 'training_guide', [{
				text: this.title
			,	href: '/trainingguides'
			}]);
		}

	});
});
