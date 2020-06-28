define('Balance', ['Balance.View', 'Balance.Router'], function (View, Router)
{
	'use strict';
	var menuitems = function(application){
		if(application.getUser().get('hidebillingandcogs') == 'F'){
			return {
					name: _('Billing').translate()
				,	id: 'billing'
				,	index: 3
				,	children: [{
						id: 'balance'
					,	name: _('Account Balance').translate()
					,	url: 'balance'
					,	index: 1
					}]
				}
	 }else{
		 return null;
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
