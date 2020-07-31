// Reports.js
// -----------------
// Defines the Reports module. (Model, Views, Router)
define('Reports',
['Reports.View', 'Reports.Router'],
function (ReportsView,ReportsRouter)
{
	'use strict';

	var reports_menuitems = function (application)
	{
		if(application.getUser().get('enablecustomtailorpricing') == 'T' ){
		return {
				id: function ()
				{
					return 'reports';
				}

			,	name: function ()
				{
					return _('Reports').translate();
				}
			//,	url: 'reports'
			,	children:
				[
					{
						id: 'marginreport'
					,	name: _('Margin Dasboard').translate()
					,	url: 'marginreport'
					,	index: 1
					}
				,	{
						id: 'ordertypereport'
					,	name: _('Sale Type Dashboard').translate()
					,	url: 'ordertypereport'
					,	index: 2
					}
				]
			,	index: 6
			};
		}
		else{
			return null;
		}
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var ReportsModule = function() {

		var app = {};
		var mountToApp = function (application)
		{
			// app = application;
			// application.TrainingGuidesModule = TrainingGuidesModule;

			// always start our router.
			return new ReportsRouter(application);
		};

		return {
			Views : ReportsView
		,	Router: ReportsRouter
		,	mountToApp: mountToApp
		,	MenuItems: reports_menuitems
		};
	}();

	return ReportsModule;
});
