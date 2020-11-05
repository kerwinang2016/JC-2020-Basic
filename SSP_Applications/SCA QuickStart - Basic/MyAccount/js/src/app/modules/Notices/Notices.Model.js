// Case.Model.js
// -----------------------
// Model for handling Support Cases (CRUD)
define('Notices.Model', function ()
{
	'use strict';

	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/notices.ss')
	});
});
