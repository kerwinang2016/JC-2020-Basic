define('Transferwise', ['Transferwise.View', 'Transferwise.Router'], function (View, Router)
{
	'use strict';
	var menuitems = function(application){

		return {
			 parent: 'billing'
		 ,	id: 'transferwise'
		 ,	name: _('Payments Guide').translate()
		 ,	url: 'transferwise'
		 ,	index: 5
		 }
	}
	return	{
		View: View
	,	Router: Router

	,	MenuItems: menuitems

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
