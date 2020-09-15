
function service(request, response)
{
	'use strict';
	try 
	{
		require('DSC.CstmProfile.CstemProfile.ServiceController').handle(request, response);
	} 
	catch(ex)
	{
		console.log('DSC.CstmProfile.CstemProfile.ServiceController ', ex);
		var controller = require('ServiceController');
		controller.response = response;
		controller.request = request;
		controller.sendError(ex);
	}
}