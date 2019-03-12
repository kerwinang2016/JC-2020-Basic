// TrainingGuides.View.js
// -----------------------
/*
Change History   
-------------- 
Date: 06-03-2019
Changed by: Salman Khan
Change /Jira Ticket #: JHD-30
Change Description: Training Guides section to contain links to download the PDF
*/
// Views for viewing Training Guides list.
define('TrainingGuides.View', function ()
{
	'use strict';

	return Backbone.View.extend({
		
		template: 'training_guide'

	,	title: _('Training Guides').translate()

	,	page_header: _('Training Guides').translate()

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