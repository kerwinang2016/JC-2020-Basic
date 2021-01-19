//Fit Profile
define('Clients', ['ClientList.View','Client.Router', 'Client.Model'], function (ClientList, Router, Model)
{
	'use strict';

	return	{

		Views: [ClientList]
	,	Router: Router
	,	Model: Model
	,	MenuItems: [
			{
				id: 'tailorclients'
			,	name: _('Tailor Client').translate()
			,	url: 'clientlist'
			,	index: 5
			}
		]

	,	mountToApp: function (application)
		{
			return new Router(application);
		}
	};
});
