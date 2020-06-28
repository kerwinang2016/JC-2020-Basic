// PrintStatement.js
// -----------------
// Defines the Print Statement module
define('PrintStatement', ['PrintStatement.Model','PrintStatement.Views','PrintStatement.Router'], function (Model, Views, Router)
{
	'use strict';
	var menuitems = function(application){
		if(application.getUser().get('hidebillingandcogs') == 'F'){
			return {
					parent: 'billing'
				,	id: 'printstatement'
				,	name: _('Print a Statement').translate()
				,	url: 'printstatement'
				,	index: 4
				,	permission: 'transactions.tranStatement.2'
				}
	 }else{
		 return null;
	 }
	}
	return	{
		Views: Views
	,	Router: Router
	,	Model: Model

	,	MenuItems: menuitems

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
