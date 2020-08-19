// Case.js
// -----------------
// Defines the Case module. (Model, Views, Router)
define('PriceLists',
['PriceLists.View', 'PriceLists.Router'],
function (PriceListsView,PriceListsRouter) //JHD-30
{
	'use strict';
	var pricelists_menuitems = function (application)
	{
		if(application.getUser().get('hidebillingandcogs') == 'F' ){
		return {
				parent: 'billing'
			,	id: 'pricelists'
			,	name: _('Price Lists').translate()
			,	url: 'pricelists'
			,	index: 5
			}
		}
		else{
			return null;
		}
	};

	// Encapsulate all Case elements into a single module to be mounted to the application
	// Update: Keep the application reference within the function once its mounted into the application
	var PriceListsModule = function() {

		var app = {};
		var mountToApp = function (application)
		{
			// app = application;
			// application.PriceListsModule = PriceListsModule;

			// always start our router.
			return new PriceListsRouter(application);
		};

		return {
			Views : PriceListsView
		,	Router: PriceListsRouter
		,	mountToApp: mountToApp
		,	MenuItems: pricelists_menuitems
		};
	}();

	return PriceListsModule;
});
