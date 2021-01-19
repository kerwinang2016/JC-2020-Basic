/*exported service*/
// ----------------
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod();

		var LiveOrder = Application.getModel('LiveOrder');
		switch (method)
		{
			case 'POST':
				var data = JSON.parse(request.getBody());
				var strCogs = LiveOrder.getCogs(data);
				Application.sendContent(strCogs);
			break;

			default:
				// methodNotAllowedError is defined in ssp library commons.js
				Application.sendError(methodNotAllowedError);
		}
	}
	catch (e)
	{
		Application.sendError(e);
	}
}
