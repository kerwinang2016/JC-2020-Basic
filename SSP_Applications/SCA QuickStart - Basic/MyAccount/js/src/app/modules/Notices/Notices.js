define('Notices',
['NoticesList.View', 'Notices.Router'],
function (NoticesListView,NoticesRouter)
{
	'use strict';

	var notices_menuitems = function (application)
	{
		return {
			id: function ()
			{
				return 'noticeslist';
			}

		,	name: function ()
			{
				return _('Notices').translate();
			}
		,	url: 'noticeslist'
		,	index: 5
		};
	};

	var NoticesModule = function() {

		var app = {};
		var mountToApp = function (application)
		{
			// app = application;
			// application.NoticesModule = NoticesModule;

			// always start our router.
			return new NoticesRouter(application);
		};

		return {
			Views : NoticesListView
		,	Router: NoticesRouter
		,	mountToApp: mountToApp
		,	MenuItems: notices_menuitems
		};
	}();

	return NoticesModule;
});
