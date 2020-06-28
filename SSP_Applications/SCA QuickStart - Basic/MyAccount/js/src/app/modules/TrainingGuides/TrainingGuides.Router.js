// TrainingGuides.Router.js
// -----------------------

// Router for handling TrainngGuides
define('TrainingGuides.Router', ['TrainingGuides.View'], function (TrainingGuidesView)
{
	'use strict';

	return Backbone.Router.extend({

		routes:
		{
			'trainingguides': 'trainingGuides' //JHD-30
		}

	,	initialize: function (application)
		{
			this.application = application;
		}
		// Training Guide
	,	trainingGuides: function (id, options) //JHD-30
		{
			var view = new TrainingGuidesView({
					application: this.application
			});

		view.showContent();
		}
	});
});
