// Client.Model.js
// -----------------------
// Model for handling addresses (CRUD)
define('Alterations.Model', function ()
{
	'use strict';

	return Backbone.Model.extend(
	{
		urlRoot: _.getAbsoluteUrl('services/alterations.ss')
	});
});
