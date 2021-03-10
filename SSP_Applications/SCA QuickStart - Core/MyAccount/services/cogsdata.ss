/*exported service*/
// ----------------
function service (request)
{
	'use strict';
	// Application is defined in ssp library commons.js
	try
	{
		var method = request.getMethod();

		var PlacedOrder = Application.getModel('PlacedOrder');
		switch (method)
		{
			case 'POST':
				var data = JSON.parse(request.getBody());
				var strCogs = PlacedOrder.getCogs(data);
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
