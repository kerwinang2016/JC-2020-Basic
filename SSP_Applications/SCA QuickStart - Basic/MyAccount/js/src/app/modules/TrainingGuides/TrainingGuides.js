// Case.js
// -----------------
// Defines the Case module. (Model, Views, Router)
define('TrainingGuides',
['TrainingGuides.View', 'TrainingGuides.Router'],
function (TrainingGuidesView,TrainingGuidesRouter) //JHD-30
{
	'use strict';

	var trainingguides_menuitems = function (application)
	{
		return {
			id: function ()
			{
				return 'trainingguides';
			}

		,	name: function ()
			{
				return _('Training and Guides').translate();
			}
		,	url: 'trainingguides'
		,	index: 5
		};
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var TrainingGuidesModule = function() {

		var app = {};
		var mountToApp = function (application)
		{
			// app = application;
			// application.TrainingGuidesModule = TrainingGuidesModule;

			// always start our router.
			return new TrainingGuidesRouter(application);
		};

		return {
			Views : TrainingGuidesView
		,	Router: TrainingGuidesRouter
		,	mountToApp: mountToApp
		,	MenuItems: trainingguides_menuitems
		};
	}();

	return TrainingGuidesModule;
});
